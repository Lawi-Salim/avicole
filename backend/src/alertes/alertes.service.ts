import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Alerte } from './alerte.entity.js';

@Injectable()
export class AlertesService {
  constructor(
    @InjectModel(Alerte)
    private readonly alerteModel: typeof Alerte,
  ) {}

  async createAlerte(
    type_alerte: string,
    niveau: string,
    message: string,
    cycle_id?: string | null,
    risque_id?: string | null,
    produit_veterinaire_id?: string | null,
  ) {
    return this.alerteModel.create({
      type_alerte,
      niveau,
      message,
      cycle_id: cycle_id || null,
      risque_id: risque_id || null,
      produit_veterinaire_id: produit_veterinaire_id || null,
    });
  }

  async findExistingAlert(
    type_alerte: string,
    produit_veterinaire_id?: string,
    cycle_id?: string,
  ) {
    const where: Record<string, unknown> = {
      type_alerte,
      resolue: false,
    };
    if (produit_veterinaire_id) where.produit_veterinaire_id = produit_veterinaire_id;
    if (cycle_id) where.cycle_id = cycle_id;
    return this.alerteModel.findOne({ where });
  }

  async getAlertesNonResolues() {
    return this.alerteModel.findAll({
      where: { resolue: false },
      order: [['created_at', 'DESC']],
    });
  }

  async findAll() {
    return this.alerteModel.findAll({
      order: [['created_at', 'DESC']],
    });
  }

  async findAllWithResolved() {
    return this.alerteModel.findAll({
      order: [['resolue', 'ASC'], ['created_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const alerte = await this.alerteModel.findByPk(id);
    if (!alerte) throw new Error(`Alerte #${id} non trouvée`);
    return alerte;
  }

  async markAsResolue(id: string) {
    const alerte = await this.findOne(id);
    await alerte.update({ resolue: true, resolue_at: new Date() });
    return alerte;
  }

  async remove(id: string) {
    const alerte = await this.findOne(id);
    await alerte.destroy();
    return { message: 'Alerte supprimée' };
  }
}
