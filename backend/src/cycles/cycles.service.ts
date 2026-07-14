import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Cycle } from './cycle.entity.js';
import { Mortalite } from '../sante/mortalite.entity.js';
import { MouvementStock } from '../stocks/mouvement-stock.entity.js';
import { Depense } from '../finances/depense.entity.js';
import { Vente } from '../ventes/vente.entity.js';
import { Parametrage } from '../parametrages/parametrage.entity.js';
import { CreateCycleDto } from './dto/create-cycle.dto.js';
import { UpdateCycleDto } from './dto/update-cycle.dto.js';

const VALID_PHASES = [
  'preparation',
  'demarrage',
  'croissance',
  'finition',
  'commercialisation',
  'nettoyage',
];

@Injectable()
export class CyclesService {
  constructor(
    @InjectModel(Cycle)
    private readonly cycleModel: typeof Cycle,
    @InjectModel(Mortalite)
    private readonly mortaliteModel: typeof Mortalite,
    @InjectModel(MouvementStock)
    private readonly mouvementStockModel: typeof MouvementStock,
    @InjectModel(Depense)
    private readonly depenseModel: typeof Depense,
    @InjectModel(Vente)
    private readonly venteModel: typeof Vente,
    @InjectModel(Parametrage)
    private readonly parametrageModel: typeof Parametrage,
  ) {}

  async findAll(statut?: string) {
    const where: Record<string, unknown> = {};
    if (statut) {
      where.statut = statut;
    }
    return this.cycleModel.findAll({
      where,
      order: [['date_reception', 'DESC']],
    });
  }

  async findOne(id: string) {
    const cycle = await this.cycleModel.findByPk(id, {
      include: [
        { model: this.mortaliteModel, order: [['date', 'DESC']] },
        { model: this.mouvementStockModel, order: [['date', 'DESC']] },
      ],
    });
    if (!cycle) {
      throw new NotFoundException(`Cycle #${id} non trouvé`);
    }
    return cycle;
  }

  async create(dto: CreateCycleDto) {
    const lastCycle = await this.cycleModel.findOne({
      order: [['numero_cycle', 'DESC']],
    });
    const nextNumero = lastCycle ? lastCycle.numero_cycle + 1 : 1;

    return this.cycleModel.create({
      numero_cycle: nextNumero,
      date_reception: dto.date_reception,
      effectif_initial: dto.effectif_initial,
      cout_achat_poussins: dto.cout_achat_poussins,
      created_by: dto.created_by || null,
    });
  }

  async update(id: string, dto: UpdateCycleDto) {
    const cycle = await this.findOne(id);
    if (cycle.statut === 'cloture') {
      throw new BadRequestException(
        'Impossible de modifier un cycle clôturé',
      );
    }
    await cycle.update(dto);
    return cycle;
  }

  async updatePhase(id: string, phase: string) {
    if (!VALID_PHASES.includes(phase)) {
      throw new BadRequestException(
        `Phase invalide. Valeurs autorisées : ${VALID_PHASES.join(', ')}`,
      );
    }
    const cycle = await this.findOne(id);
    if (cycle.statut === 'cloture') {
      throw new BadRequestException(
        'Impossible de changer la phase d\'un cycle clôturé',
      );
    }
    await cycle.update({ phase_courante: phase });
    return cycle;
  }

  async cloturer(id: string) {
    const cycle = await this.findOne(id);
    if (cycle.statut === 'cloture') {
      throw new BadRequestException('Ce cycle est déjà clôturé');
    }

    const mortaliteCumulee = await this.mortaliteModel.sum('nombre', {
      where: { cycle_id: id },
    });

    const coutTotal = await this.calculerCoutTotal(id);
    const totalVentes = await this.calculerTotalVentes(id);
    const effectifVivant = await this.calculerEffectifVivant(id);
    const coutRevientParPoulet = await this.calculerCoutRevientParPoulet(id);
    const marge = await this.calculerMarge(id);
    const seuilRentabilite = await this.calculerSeuilRentabilite(id);

    const today = new Date().toISOString().split('T')[0]!;

    await cycle.update({
      statut: 'cloture',
      date_cloture: today,
      bilan_cout_total: coutTotal,
      bilan_recettes: totalVentes,
      bilan_marge: marge,
      bilan_mortalite_cumulee: mortaliteCumulee || 0,
      bilan_cout_revient_par_poulet: coutRevientParPoulet,
      bilan_seuil_rentabilite: seuilRentabilite,
    });

    return cycle;
  }

  async getStats(id: string) {
    const cycle = await this.findOne(id);
    const mortaliteCumulee = await this.mortaliteModel.sum('nombre', {
      where: { cycle_id: id },
    });
    const effectifVivant =
      cycle.effectif_initial - (mortaliteCumulee || 0);
    const tauxMortalite =
      cycle.effectif_initial > 0
        ? parseFloat(
            (((mortaliteCumulee || 0) / cycle.effectif_initial) * 100).toFixed(2),
          )
        : 0;

    return {
      cycle_id: cycle.id,
      numero_cycle: cycle.numero_cycle,
      effectif_initial: cycle.effectif_initial,
      effectif_vivant: effectifVivant,
      mortalite_cumulee: mortaliteCumulee || 0,
      taux_mortalite_pct: tauxMortalite,
      phase_courante: cycle.phase_courante,
      statut: cycle.statut,
    };
  }

  async calculerCoutTotal(cycleId: string): Promise<number> {
    const cycle = await this.findOne(cycleId);

    const depenses = await this.depenseModel.findAll({
      where: { cycle_id: cycleId },
      attributes: ['montant'],
      raw: true,
    });

    const totalDepenses = depenses.reduce((sum, d) => sum + parseFloat(d.montant as unknown as string || '0'), 0);

    const coutPoussins = (Number(cycle.cout_achat_poussins) || 0) * (Number(cycle.effectif_initial) || 0);
    const coutTotal = coutPoussins + totalDepenses;

    console.log('=== DEBUG calculerCoutTotal ===');
    console.log('cycleId:', cycleId);
    console.log('cout_achat_poussins:', cycle.cout_achat_poussins, 'x effectif_initial:', cycle.effectif_initial, '= coutPoussins:', coutPoussins);
    console.log('depenses brutes:', depenses.map(d => d.montant));
    console.log('totalDepenses:', totalDepenses);
    console.log('coutTotal final:', coutTotal);

    return parseFloat(coutTotal.toFixed(2));
  }

  async calculerTotalVentes(cycleId: string): Promise<number> {
    const ventes = await this.venteModel.findAll({
      where: { cycle_id: cycleId, statut_paiement: { [Op.ne]: 'annule' } },
    });

    const total = ventes.reduce((sum, v) => {
      const qte = Number(v.quantite) || 0;
      const prix = Number(v.prix_unitaire) || 0;
      return sum + qte * prix;
    }, 0);

    return parseFloat(total.toFixed(2));
  }

  async calculerEffectifVivant(cycleId: string): Promise<number> {
    const cycle = await this.findOne(cycleId);
    const mortaliteCumulee = await this.mortaliteModel.sum('nombre', {
      where: { cycle_id: cycleId },
    });
    return cycle.effectif_initial - (mortaliteCumulee || 0);
  }

  async calculerCoutRevientParPoulet(cycleId: string): Promise<number> {
    const coutTotal = await this.calculerCoutTotal(cycleId);
    const effectifVivant = await this.calculerEffectifVivant(cycleId);
    if (effectifVivant <= 0) return 0;
    return parseFloat((coutTotal / effectifVivant).toFixed(2));
  }

  async calculerMarge(cycleId: string): Promise<number> {
    const coutTotal = await this.calculerCoutTotal(cycleId);
    const totalVentes = await this.calculerTotalVentes(cycleId);
    return parseFloat((totalVentes - coutTotal).toFixed(2));
  }

  async calculerSeuilRentabilite(cycleId: string): Promise<number> {
    try {
      const coutTotal = await this.calculerCoutTotal(cycleId);
      const parametrage = await this.parametrageModel.findOne({ where: { actif: true } });
      const prixVenteStandard = parametrage?.prix_vente_standard;

      if (!prixVenteStandard || prixVenteStandard <= 0) {
        return 0;
      }

      return Math.ceil(coutTotal / prixVenteStandard);
    } catch (error) {
      return 0;
    }
  }

  async getFinances(id: string) {
    const cycle = await this.findOne(id);
    const effectifVivant = await this.calculerEffectifVivant(id);

    let coutTotal = 0;
    let totalVentes = 0;
    let marge = 0;
    let coutRevientParPoulet = 0;
    let seuilRentabilite = 0;

    try { coutTotal = await this.calculerCoutTotal(id); } catch { coutTotal = 0; }
    try { totalVentes = await this.calculerTotalVentes(id); } catch { totalVentes = 0; }
    try { marge = await this.calculerMarge(id); } catch { marge = 0; }
    try { coutRevientParPoulet = await this.calculerCoutRevientParPoulet(id); } catch { coutRevientParPoulet = 0; }
    try { seuilRentabilite = await this.calculerSeuilRentabilite(id); } catch { seuilRentabilite = 0; }

    return {
      cycle_id: cycle.id,
      numero_cycle: cycle.numero_cycle,
      cout_total: coutTotal,
      total_ventes: totalVentes,
      marge,
      cout_revient_par_poulet: coutRevientParPoulet,
      seuil_rentabilite: seuilRentabilite,
      effectif_vivant: effectifVivant,
    };
  }
}
