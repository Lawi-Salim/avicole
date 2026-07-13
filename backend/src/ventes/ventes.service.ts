import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vente } from './vente.entity.js';
import { CreateVenteDto } from './dto/create-vente.dto.js';

@Injectable()
export class VentesService {
  constructor(
    @InjectModel(Vente)
    private readonly venteModel: typeof Vente,
  ) {}

  async findByCycle(cycleId: string) {
    return this.venteModel.findAll({
      where: { cycle_id: cycleId },
      order: [['date', 'DESC']],
    });
  }

  async create(dto: CreateVenteDto) {
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
