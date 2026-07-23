import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RemiseConfiguration } from './remise.entity.js';

@Injectable()
export class RemisesService {
  constructor(
    @InjectModel(RemiseConfiguration)
    private readonly remiseModel: typeof RemiseConfiguration,
  ) {}

  async getRemiseMode(): Promise<'type_client' | 'volume' | 'aucun'> {
    const row = await this.remiseModel.findOne({
      where: { type_client: null, seuil_min_quantite: null },
      attributes: ['mode_remise'],
    });
    return (row?.mode_remise as 'type_client' | 'volume' | 'aucun') || 'aucun';
  }

  async setRemiseMode(mode: 'type_client' | 'volume' | 'aucun') {
    const row = await this.remiseModel.findOne({
      where: { type_client: null, seuil_min_quantite: null },
    });
    if (row) {
      await row.update({ mode_remise: mode });
    } else {
      await this.remiseModel.create({
        type_client: null,
        seuil_min_quantite: null,
        seuil_max_quantite: null,
        remise_pct: 0,
        actif: true,
        mode_remise: mode,
      } as any);
    }
  }

  async getRemisesByTypeClient() {
    const rows = await this.remiseModel.findAll({
      where: { type_client: { [Op.ne]: null }, actif: true },
      attributes: ['type_client', 'remise_pct'],
    });
    return rows.reduce((acc, row) => {
      if (row.type_client) acc[row.type_client] = Number(row.remise_pct);
      return acc;
    }, {} as Record<string, number>);
  }

  async getRemisesByVolume() {
    const rows = await this.remiseModel.findAll({
      where: { seuil_min_quantite: { [Op.ne]: null }, actif: true },
      attributes: ['seuil_min_quantite', 'seuil_max_quantite', 'remise_pct'],
      order: [['seuil_min_quantite', 'ASC']],
    });
    return rows.map((row) => ({
      seuil_min: Number(row.seuil_min_quantite),
      seuil_max: row.seuil_max_quantite && Number(row.seuil_max_quantite) < 999999 ? Number(row.seuil_max_quantite) : null,
      remise_pct: Number(row.remise_pct),
    }));
  }

  async updateRemiseTypeClient(typeClient: string, remisePct: number) {
    await this.remiseModel.update(
      { remise_pct: remisePct },
      { where: { type_client: typeClient } },
    );
  }

  async updateRemiseVolume(seuilMin: number, seuilMax: number | null, remisePct: number) {
    const effectiveMax = seuilMax ?? 999999;
    await this.remiseModel.update(
      { remise_pct: remisePct },
      { where: { seuil_min_quantite: seuilMin, seuil_max_quantite: effectiveMax } },
    );
  }

  async calculateRemise(typeClient: string, quantite: number): Promise<number> {
    const mode = await this.getRemiseMode();

    if (mode === 'aucun') return 0;

    if (mode === 'type_client') {
      const typeRemiseRow = await this.remiseModel.findOne({
        where: { type_client: typeClient, actif: true },
        attributes: ['remise_pct'],
      });
      return Number(typeRemiseRow?.remise_pct || 0);
    }

    if (mode === 'volume') {
      const volumeRemiseRow = await this.remiseModel.findOne({
        where: {
          [Op.and]: [
            { seuil_min_quantite: { [Op.lte]: quantite } },
            {
              [Op.or]: [
                { seuil_max_quantite: null },
                { seuil_max_quantite: { [Op.gte]: quantite } },
              ],
            },
            { seuil_min_quantite: { [Op.ne]: null } },
            { actif: true },
          ],
        },
        attributes: ['remise_pct'],
        order: [['seuil_min_quantite', 'DESC']],
      });
      return Number(volumeRemiseRow?.remise_pct || 0);
    }

    return 0;
  }
}
