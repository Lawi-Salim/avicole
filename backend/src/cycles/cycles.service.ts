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

    const coutsStock = await this.mouvementStockModel.sum('cout', {
      where: { cycle_id: id, sens: 'sortie' },
    });

    const coutTotal =
      cycle.cout_achat_poussins + (coutsStock || 0);

    const effectifVivant =
      cycle.effectif_initial - (mortaliteCumulee || 0);

    const coutRevientParPoulet =
      effectifVivant > 0
        ? parseFloat((coutTotal / effectifVivant).toFixed(2))
        : 0;

    const today = new Date().toISOString().split('T')[0]!;

    await cycle.update({
      statut: 'cloture',
      date_cloture: today,
      bilan_cout_total: coutTotal,
      bilan_recettes: 0,
      bilan_marge: 0 - coutTotal,
      bilan_mortalite_cumulee: mortaliteCumulee || 0,
      bilan_cout_revient_par_poulet: coutRevientParPoulet,
      bilan_seuil_rentabilite: coutTotal,
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
}
