import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as cron from 'node-cron';
import { ProduitVeterinaire } from '../../stocks/produit-veterinaire.entity.js';
import { Cycle } from '../../cycles/cycle.entity.js';
import { Mortalite } from '../../sante/mortalite.entity.js';
import { Parametrage } from '../../parametrages/parametrage.entity.js';
import { AlertesService } from '../../alertes/alertes.service.js';

export interface VerificationResult {
  stock_bas: { verifies: number; alertes_creees: number };
  mortalite_anormale: { cycle_verifie: string | null; seuil_pct: number; taux_7j: number; alerte_creee: boolean };
  peremption: { produits_verifies: number; alertes_creees: number };
}

@Injectable()
export class VerificationsJob {
  private readonly logger = new Logger(VerificationsJob.name);
  private task: cron.ScheduledTask | null = null;

  constructor(
    @InjectModel(ProduitVeterinaire)
    private readonly produitModel: typeof ProduitVeterinaire,
    @InjectModel(Cycle)
    private readonly cycleModel: typeof Cycle,
    @InjectModel(Mortalite)
    private readonly mortaliteModel: typeof Mortalite,
    @InjectModel(Parametrage)
    private readonly parametrageModel: typeof Parametrage,
    @Inject(AlertesService)
    private readonly alertesService: AlertesService,
  ) {}

  onModuleInit() {
    this.task = cron.schedule('0 6 * * *', () => {
      this.logger.log('Exécution automatique des vérifications (cron 06:00)...');
      this.runAllChecks();
    });
    this.logger.log('Job cron de vérifications planifié à 06:00 chaque jour');
  }

  onModuleDestroy() {
    if (this.task) this.task.stop();
  }

  async runAllChecks(): Promise<VerificationResult> {
    this.logger.log('=== Début des vérifications ===');

    const stockResult = await this.verifierStockBas();
    const mortaliteResult = await this.verifierMortaliteAnormale();
    const peremptionResult = await this.verifierPeremptionProduits();

    const totalAlertes =
      stockResult.alertes_creees +
      (mortaliteResult.alerte_creee ? 1 : 0) +
      peremptionResult.alertes_creees;

    this.logger.log(
      `=== Vérifications terminées : ${totalAlertes} alerte(s) créée(s) ` +
      `(stock: ${stockResult.alertes_creees}, mortalité: ${mortaliteResult.alerte_creee ? 1 : 0}, péremption: ${peremptionResult.alertes_creees}) ===`,
    );

    return {
      stock_bas: stockResult,
      mortalite_anormale: mortaliteResult,
      peremption: peremptionResult,
    };
  }

  private async verifierStockBas(): Promise<VerificationResult['stock_bas']> {
    this.logger.log('[Stock] Vérification du stock bas...');
    const produits = await this.produitModel.findAll();
    this.logger.log(`[Stock] ${produits.length} produit(s) vérifié(s)`);

    let alertesCreees = 0;

    for (const produit of produits) {
      const stockNum = Number(produit.quantite_stock);
      const seuilNum = Number(produit.seuil_alerte);

      if (stockNum <= seuilNum && seuilNum > 0) {
        this.logger.warn(
          `[Stock] ${produit.nom} : stock ${stockNum} <= seuil ${seuilNum}`,
        );

        const existe = await this.alertesService.findExistingAlert(
          'stock_bas',
          produit.id,
        );
        if (!existe) {
          await this.alertesService.createAlerte(
            'stock_bas',
            'warning',
            `Stock bas : ${produit.nom} (${produit.quantite_stock} ${produit.unite} restant)`,
            null,
            null,
            produit.id,
          );
          alertesCreees++;
          this.logger.warn(`[Stock] Alerte créée pour ${produit.nom}`);
        } else {
          this.logger.log(`[Stock] Alerte existante ignorée pour ${produit.nom}`);
        }
      }
    }

    this.logger.log(`[Stock] Terminé : ${alertesCreees} alerte(s) créée(s)`);
    return { verifies: produits.length, alertes_creees: alertesCreees };
  }

  private async verifierMortaliteAnormale(): Promise<VerificationResult['mortalite_anormale']> {
    this.logger.log('[Mortalité] Vérification de la mortalité anormale...');

    const param = await this.parametrageModel.findOne({
      where: { actif: true },
    });
    if (!param) {
      this.logger.log('[Mortalité] Aucun paramétrage actif trouvé, ignoré');
      return { cycle_verifie: null, seuil_pct: 0, taux_7j: 0, alerte_creee: false };
    }

    const seuil = Number(param.seuil_mortalite_critique_pct);
    this.logger.log(`[Mortalité] Seuil critique : ${seuil}%`);

    const cycleEnCours = await this.cycleModel.findOne({
      where: { statut: 'en_cours' },
    });
    if (!cycleEnCours) {
      this.logger.log('[Mortalité] Aucun cycle en cours, ignoré');
      return { cycle_verifie: null, seuil_pct: seuil, taux_7j: 0, alerte_creee: false };
    }

    this.logger.log(
      `[Mortalité] Cycle #${cycleEnCours.numero_cycle} vérifié (effectif: ${cycleEnCours.effectif_initial})`,
    );

    const septJoursAvant = new Date();
    septJoursAvant.setDate(septJoursAvant.getDate() - 7);

    const mortalites = await this.mortaliteModel.findAll({
      where: {
        cycle_id: cycleEnCours.id,
        date: { [Op.gte]: septJoursAvant },
      },
    });

    const totalMortalite7j = mortalites.reduce(
      (sum, m) => sum + Number(m.nombre),
      0,
    );
    const tauxMortalite7j =
      cycleEnCours.effectif_initial > 0
        ? (totalMortalite7j / cycleEnCours.effectif_initial) * 100
        : 0;

    this.logger.log(
      `[Mortalité] Total 7j: ${totalMortalite7j}, Taux: ${tauxMortalite7j.toFixed(1)}% (seuil: ${seuil}%)`,
    );

    let alerteCreee = false;

    if (tauxMortalite7j > seuil) {
      const existe = await this.alertesService.findExistingAlert(
        'mortalite_anormale',
        undefined,
        cycleEnCours.id,
      );
      if (!existe) {
        await this.alertesService.createAlerte(
          'mortalite_anormale',
          'critical',
          `Mortalité anormale sur 7 jours : ${tauxMortalite7j.toFixed(1)}% (seuil : ${seuil}%) - Cycle #${cycleEnCours.numero_cycle}`,
          cycleEnCours.id,
        );
        alerteCreee = true;
        this.logger.warn(
          `[Mortalité] Alerte créée pour le cycle #${cycleEnCours.numero_cycle}`,
        );
      } else {
        this.logger.log('[Mortalité] Alerte existante ignorée');
      }
    } else {
      this.logger.log('[Mortalité] Taux normal, aucune alerte nécessaire');
    }

    this.logger.log(`[Mortalité] Terminé : alerte créée = ${alerteCreee}`);
    return {
      cycle_verifie: `#${cycleEnCours.numero_cycle}`,
      seuil_pct: seuil,
      taux_7j: tauxMortalite7j,
      alerte_creee: alerteCreee,
    };
  }

  private async verifierPeremptionProduits(): Promise<VerificationResult['peremption']> {
    this.logger.log('[Péremption] Vérification des produits proches de la péremption...');

    const dans30Jours = new Date();
    dans30Jours.setDate(dans30Jours.getDate() + 30);

    const produits = await this.produitModel.findAll({
      where: {
        date_peremption: {
          [Op.and]: [
            { [Op.not]: null },
            { [Op.lte]: dans30Jours },
          ],
        },
      },
    });

    this.logger.log(`[Péremption] ${produits.length} produit(s) proche(s) de la péremption`);

    let alertesCreees = 0;

    for (const produit of produits) {
      const existe = await this.alertesService.findExistingAlert(
        'peremption_produit',
        produit.id,
      );
      if (!existe) {
        await this.alertesService.createAlerte(
          'peremption_produit',
          'warning',
          `Produit proche de la péremption : ${produit.nom} (expire le ${produit.date_peremption})`,
          null,
          null,
          produit.id,
        );
        alertesCreees++;
        this.logger.warn(
          `[Péremption] Alerte créée pour ${produit.nom} (expire le ${produit.date_peremption})`,
        );
      } else {
        this.logger.log(`[Péremption] Alerte existante ignorée pour ${produit.nom}`);
      }
    }

    this.logger.log(`[Péremption] Terminé : ${alertesCreees} alerte(s) créée(s)`);
    return { produits_verifies: produits.length, alertes_creees: alertesCreees };
  }
}
