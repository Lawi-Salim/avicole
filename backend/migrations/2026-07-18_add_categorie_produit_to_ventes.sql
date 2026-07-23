-- Migration: Ajout de la colonne categorie_produit à la table ventes

ALTER TABLE ventes
ADD COLUMN categorie_produit text NOT NULL DEFAULT 'poulet_vif';

ALTER TABLE ventes
ADD CONSTRAINT ventes_categorie_produit_check
CHECK (categorie_produit IN (
  'poulet_vif',
  'poulet_abattu',
  'poulet_entier',
  'poulet_fermier',
  'poulet_morceaux',
  'poulet_cuisse',
  'poulet_ailes'
));

CREATE INDEX IF NOT EXISTS ventes_categorie_produit_idx
ON ventes(categorie_produit);

UPDATE ventes SET categorie_produit = 'poulet_vif'
WHERE categorie_produit IS NULL;
