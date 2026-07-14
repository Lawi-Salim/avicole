import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Vente } from './vente.entity.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { Mortalite } from '../sante/mortalite.entity.js';
import { CreateVenteDto } from './dto/create-vente.dto.js';

@Injectable()
export class VentesService {
  constructor(
    @InjectModel(Vente)
    private readonly venteModel: typeof Vente,
    @InjectModel(Cycle)
    private readonly cycleModel: typeof Cycle,
    @InjectModel(Mortalite)
    private readonly mortaliteModel: typeof Mortalite,
  ) {}

  async findByCycle(cycleId: string) {
    return this.venteModel.findAll({
      where: { cycle_id: cycleId },
      order: [['date', 'DESC']],
    });
  }

  private async calculerDisponibleVente(cycleId: string): Promise<number> {
    const cycle = await this.cycleModel.findByPk(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle #${cycleId} non trouvé`);
    }

    const mortaliteCumulee = (await this.mortaliteModel.sum('nombre', {
      where: { cycle_id: cycleId },
    })) || 0;

    const effectifVivant = cycle.effectif_initial - mortaliteCumulee;

    const totalDejaVendu = (await this.venteModel.sum('quantite', {
      where: {
        cycle_id: cycleId,
        statut_paiement: { [Op.ne]: 'annule' },
      },
    })) || 0;

    return effectifVivant - totalDejaVendu;
  }

  private async getDetailsDisponibilite(cycleId: string) {
    const cycle = await this.cycleModel.findByPk(cycleId);
    if (!cycle) {
      throw new NotFoundException(`Cycle #${cycleId} non trouvé`);
    }

    const mortaliteCumulee = (await this.mortaliteModel.sum('nombre', {
      where: { cycle_id: cycleId },
    })) || 0;

    const effectifVivant = cycle.effectif_initial - mortaliteCumulee;

    const totalDejaVendu = (await this.venteModel.sum('quantite', {
      where: {
        cycle_id: cycleId,
        statut_paiement: { [Op.ne]: 'annule' },
      },
    })) || 0;

    return { effectifVivant, totalDejaVendu, resteDisponible: effectifVivant - totalDejaVendu };
  }

  async create(dto: CreateVenteDto) {
    const disponible = await this.calculerDisponibleVente(dto.cycle_id);

    if (dto.quantite > disponible) {
      const { effectifVivant, totalDejaVendu } = await this.getDetailsDisponibilite(dto.cycle_id);
      throw new BadRequestException(
        `Quantité invalide : Il ne reste que ${disponible} poulets vivants disponibles à la vente. ` +
        `Effectif vivant : ${effectifVivant}, Déjà vendu : ${totalDejaVendu}.`
      );
    }

    return this.venteModel.create({
      cycle_id: dto.cycle_id,
      quantite: dto.quantite,
      prix_unitaire: dto.prix_unitaire,
      date: dto.date,
      mode_paiement: dto.mode_paiement,
      statut_paiement: dto.statut_paiement,
    });
  }

  async update(id: string, dto: Partial<CreateVenteDto>) {
    const vente = await this.venteModel.findByPk(id);
    if (!vente) {
      throw new NotFoundException(`Vente #${id} non trouvée`);
    }

    if (dto.quantite !== undefined) {
      const cycleId = dto.cycle_id || vente.cycle_id;
      const nouvelleQuantite = dto.quantite;

      const { effectifVivant, totalDejaVendu } = await this.getDetailsDisponibilite(cycleId);
      const resteSansCetteVente = effectifVivant - (totalDejaVendu - vente.quantite);

      if (nouvelleQuantite > resteSansCetteVente) {
        throw new BadRequestException(
          `Quantité invalide : Il ne reste que ${resteSansCetteVente} poulets vivants disponibles à la vente. ` +
          `Effectif vivant : ${effectifVivant}, Déjà vendu : ${totalDejaVendu}.`
        );
      }
    }

    await vente.update(dto);
    return vente;
  }

  async remove(id: string) {
    const vente = await this.venteModel.findByPk(id);
    if (!vente) {
      throw new NotFoundException(`Vente #${id} non trouvée`);
    }
    await vente.destroy();
    return { message: 'Vente supprimée' };
  }
}
