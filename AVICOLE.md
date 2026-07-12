# AVICOLE — Guide de développement

> Système de Gestion Intégré — Exploitation Avicole de Poulets de Chair
> Porteur du projet : Dahlawi Ibrahim Salim (Lawi Ibrahim) · Union des Comores
> Basé sur le Cahier des Charges v1.0 (07-07-2026)

Ce document est un guide opérationnel : il traduit le cahier des charges en un
plan de développement concret, découpé en versions livrables. Coche les
cases au fur et à mesure. Chaque version doit être **utilisable en
production** avant de passer à la suivante — ne pas construire V0.2 sur une
V0.1 qui ne tourne pas encore réellement sur un cycle.

---

## 0. Principes directeurs

- **Un cycle réel avant tout.** L'objectif n°1 de la V0.1 est de remplacer le
  tableur pour un cycle complet, pas d'avoir une belle architecture.
- **Pas de sur-ingénierie.** Hébergement léger, stack simple, une seule
  personne doit pouvoir tout maintenir seule.
- **Français partout** (UI, messages d'erreur, documentation).
- **Penser multi-utilisateur et offline dès le modèle de données**, même si
  on ne les implémente pas tout de suite (cf. exigences non fonctionnelles).
- **Chaque version se termine par un test réel** : Lawi doit pouvoir faire
  tourner un cycle avec de vraies données avant de continuer.

---

## 1. Stack technique

Stack confirmée pour le projet :

| Couche | Choix | Pourquoi / notes |
|---|---|---|
| Frontend | React + Vite + TypeScript | Build rapide, typage fort utile vu le nombre d'entités liées (Cycle, Stock, Ventes...) |
| UI | Chakra UI | Composants accessibles prêts à l'emploi — idéal pour aller vite sur des écrans de saisie terrain |
| Backend | Node.js + NestJS + TypeScript | Architecture modulaire (module/controller/service par domaine métier) — s'aligne naturellement avec le découpage par version du cahier des charges et facilite le passage au multi-utilisateur (V1.0) |
| ORM | Sequelize (via `@nestjs/sequelize`) | Migrations + modèles, mapping direct avec le schéma `schema-avicole.sql` (section 2) |
| Base de données | PostgreSQL | Fiable, gère bien les historiques/cycles, prêt pour le multi-utilisateur (V1.0) |
| Génération PDF / factures | Python (script ou micro-service séparé, ex. `reportlab`/`weasyprint`) | Appelé uniquement pour les rapports de cycle (module 9) et les factures de vente — pas de logique métier côté Python |
| Auth | JWT ou session + bcrypt | Suffisant pour 1 à quelques utilisateurs (évolutif en V1.0) |
| Hébergement | VPS low-cost ou Railway/Render/Fly.io | Coût maîtrisé, auto-financement |
| Sauvegardes | Dump PostgreSQL quotidien (cron) vers stockage externe | Exigence de fiabilité — pas de perte de données |

**Frontière Node/Python :** tout le métier (cycles, stocks, calculs, alertes)
reste dans le backend NestJS/Sequelize. Le service Python n'est appelé que
pour transformer des données déjà calculées en PDF (rapport de cycle,
facture) — soit via un appel HTTP interne à un petit service Flask/FastAPI,
soit via un script invoqué en sous-processus depuis un `RapportsService`
Nest dédié. Ça évite de dupliquer la logique métier dans deux langages.

**Pourquoi NestJS plutôt qu'Express nu :** chaque module Nest (`cycles`,
`stocks`, `sante`, `finances`, `ventes`, `risques`) correspond à peu près à
un module du cahier des charges (section 3). Les `Guards` gèrent
l'authentification/les rôles (admin/employé/comptable) de façon centralisée,
ce qui colle directement à l'exigence de sécurité (section 6) et au
multi-utilisateur de la V1.0.

---

## 2. Modèle de données (vue d'ensemble)

Le schéma complet est défini dans **`schema-avicole.sql`** (PostgreSQL,
18 tables organisées par module, avec contraintes, index et deux vues
utilitaires `v_cycles_effectif_vivant` et `v_cycles_finances`). Ce fichier
est la référence à partir de laquelle les modèles Sequelize (`@nestjs/sequelize`,
`backend/src/**/entities/*.entity.ts`) doivent être écrits — ne pas
laisser le schéma dériver entre le `.sql` et les entités Nest.

Entités centrales à créer dès la V0.1, même si certains champs restent vides
jusqu'à des versions ultérieures. Les mettre en place tôt évite une refonte.

```
User
 ├─ id, nom, email, mot_de_passe_hash, role (admin | employe | comptable)

Cycle
 ├─ id, date_reception, effectif_initial, cout_achat_poussins
 ├─ phase_courante (preparation | demarrage | croissance | finition | commercialisation | nettoyage)
 ├─ statut (en_cours | cloture)
 ├─ date_cloture, bilan_cout_total, bilan_recettes, bilan_marge, bilan_mortalite_cumulee

MouvementStock
 ├─ id, cycle_id, type (aliment | vaccin | litiere), sens (entree | sortie)
 ├─ quantite, cout, date, fournisseur

Mortalite
 ├─ id, cycle_id, date, nombre, cause (nullable)

Vaccination
 ├─ id, cycle_id, produit, date_prevue, date_realisee (nullable), rappel

Depense
 ├─ id, cycle_id, categorie (poussins | aliments | veterinaire | infrastructure | imprevu)
 ├─ montant, date, description

Vente
 ├─ id, cycle_id, client_id (nullable en V0.1/V0.2), quantite, prix_unitaire, date, mode_paiement, statut_paiement

Client
 ├─ id, nom, type (menage | restaurant | hotel | boucherie | revendeur), contact

Risque
 ├─ id, categorie (sanitaire | financier | marche | approvisionnement)
 ├─ description, mesure_preventive, seuil_alerte, actif

ParametrageGlobal
 ├─ cout_standard_par_poussin, prix_vente_standard, seuil_mortalite_critique, seuil_stock_bas
```

**Relation clé** : tout (`MouvementStock`, `Mortalite`, `Depense`, `Vente`)
est rattaché à un `Cycle`. C'est le pivot de tout le système — le cahier des
charges le dit explicitement : sans cycle, rien d'autre n'a de sens.

---

## 3. Feuille de route par version

### V0.1 — MVP : « faire tourner un cycle complet »
**Objectif :** gérer un cycle d'élevage de bout en bout, même basique.

- [ ] Squelette repo : backend (Nest CLI + TS + `@nestjs/sequelize`), frontend (Vite + React + TS + Chakra), connexion PostgreSQL
- [ ] Exécuter `schema-avicole.sql` sur la base PostgreSQL locale (bootstrap du schéma)
- [ ] Authentification simple (1 utilisateur admin) via module `auth` (Guard + stratégie JWT)
- [ ] Modules Nest + entités Sequelize (`users`, `cycles`, `mouvements_stock`, `mortalites`, `parametrages`)
- [ ] Écran Paramétrage minimal : coûts standards, prix de vente
- [ ] Création d'un cycle (date réception, effectif initial, coût d'achat)
- [ ] Suivi des phases du cycle (changement manuel de statut)
- [ ] Clôture de cycle avec bilan basique (coût total, mortalité cumulée)
- [ ] Stocks aliments : entrées/sorties (quantité, coût, date, fournisseur)
- [ ] Saisie mortalité quotidienne + calcul automatique du taux
- [ ] **Test de validation :** faire tourner un cycle réel de A à Z avec de vraies données

### V0.2 — Rentabilité réelle
**Objectif :** savoir si un cycle est rentable.

- [ ] Modèle `Depense` + écran d'enregistrement par catégorie
- [ ] Modèle `Vente` basique (quantité, prix, date — sans fiche client détaillée)
- [ ] Calcul automatique : coût de revient/poulet
- [ ] Calcul automatique : marge bénéficiaire
- [ ] Calcul automatique : seuil de rentabilité
- [ ] Bilan de clôture de cycle enrichi (coût total, recettes, marge)
- [ ] **Test de validation :** clôturer un cycle et vérifier manuellement que les calculs correspondent à un calcul tableur de contrôle

### V0.3 — Clients et vision globale
**Objectif :** structurer la relation commerciale et avoir une vue d'ensemble.

- [ ] Modèle `Client` complet (type, contact)
- [ ] Historique des ventes par client
- [ ] Lier `Vente` à `Client`
- [ ] Tableau de bord : vue synthétique du cycle en cours (effectif vivant, mortalité cumulée, trésorerie, marge estimée)
- [ ] Tableau de bord : comparatif entre cycles précédents
- [ ] **Test de validation :** avec 2 cycles clôturés en base, le dashboard affiche un comparatif cohérent

### V0.4 — Anticipation et fiabilité
**Objectif :** passer d'un outil réactif à un outil qui alerte.

- [ ] Alerte automatique stock bas (aliment/vaccin) selon seuil paramétrable
- [ ] Alerte automatique mortalité anormale selon seuil paramétrable
- [ ] Modèle `Risque` + écran journal des risques + mesures préventives
- [ ] Modèle `Vaccination` complet (calendrier, rappels, dates de péremption des produits)
- [ ] **Test de validation :** simuler un stock sous le seuil et une mortalité excessive, vérifier le déclenchement des alertes

### V1.0 — Consolidation
**Objectif :** rendre le système prêt pour la durée et pour plusieurs personnes.

- [ ] Rôles multi-utilisateurs (admin / employé / comptable) avec permissions
- [ ] Service Python (`pdf-service`) branché : génération PDF rapport de cycle
- [ ] Service Python : génération PDF facture de vente
- [ ] Export de rapports comparatifs multi-cycles
- [ ] Export CSV des données brutes
- [ ] Amélioration ergonomie mobile (saisie rapide terrain)
- [ ] Étude/prototype d'un mode dégradé/offline (mise en cache locale + synchronisation différée)
- [ ] Sauvegardes automatiques régulières en place et testées (restauration vérifiée)
- [ ] **Test de validation :** test de montée en charge — le système reste cohérent après plusieurs cycles enregistrés, avec 2 utilisateurs actifs

---

## 4. Critères d'acceptation globaux (à revalider à chaque version)

- [ ] Un cycle complet peut être créé, suivi de bout en bout, et clôturé avec un bilan financier exact
- [ ] Les calculs (coût de revient, marge, seuil de rentabilité, taux de mortalité) sont vérifiés et corrects
- [ ] Les alertes se déclenchent correctement selon les seuils définis
- [ ] Le tableau de bord reflète en temps réel l'état du cycle en cours
- [ ] Le système reste utilisable et cohérent après plusieurs cycles enregistrés

---

## 5. Suggestion d'organisation du dépôt

```
avicole/
├── AVICOLE.md                 ← ce fichier
├── backend/                   (NestJS + TypeScript + Sequelize)
│   ├── src/
│   │   ├── cycles/              (module/controller/service/entity — V0.1)
│   │   ├── stocks/               (mouvements_stock, produits_veterinaires — V0.1/V0.4)
│   │   ├── sante/                 (mortalites, vaccinations — V0.1/V0.4)
│   │   ├── finances/               (depenses, mouvements_tresorerie — V0.2)
│   │   ├── ventes/                  (ventes, clients, paiements — V0.2/V0.3)
│   │   ├── risques/                  (risques, alertes — V0.4)
│   │   ├── rapports/                  (rapports, factures — V1.0, appelle pdf-service)
│   │   ├── auth/                       (guards, stratégie JWT, rôles)
│   │   ├── common/                      (jobs cron : alertes auto, sauvegardes)
│   │   └── app.module.ts
│   ├── migrations/              (sequelize-cli, dérivées de schema-avicole.sql)
│   └── .sequelizerc
├── frontend/                  (React + Vite + TypeScript + Chakra UI)
│   └── src/
│       ├── pages/               (Cycles, Stocks, Ventes, Dashboard...)
│       ├── components/
│       └── theme/                (personnalisation Chakra)
├── pdf-service/                (Python — rapports de cycle + factures uniquement)
│   ├── main.py                  (Flask/FastAPI minimal ou script CLI)
│   └── templates/
└── docs/
    ├── Cahier_des_charges_systeme_gestion_avicole.pdf
    ├── schema-avicole.sql
    └── guide-utilisateur.md
```

---

## 6. Prochaine étape immédiate

1. Choisir/valider la stack (section 1).
2. Initialiser le dépôt + le schéma de base de données (section 2).
3. Cocher les cases de la **V0.1** une par une, dans l'ordre.
4. Ne pas passer à la V0.2 avant d'avoir fait tourner un vrai cycle en V0.1.