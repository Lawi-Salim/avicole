import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Depense } from './depense.entity.js';
import { CreateDepenseDto } from './dto/create-depense.dto.js';

@Injectable()
export class FinancesService {
  constructor(
    @InjectModel(Depense)
    private readonly depenseModel: typeof Depense,
  ) {}

  async findByCycle(cycleId: string) {
    return this.depenseModel.findAll({
      where: { cycle_id: cycleId },
      order: [['date', 'DESC']],
    });
  }

  async create(dto: CreateDepenseDto) {
    return this.depenseModel.create({
      cycle_id: dto.cycle_id,
      categorie: dto.categorie,
      montant: dto.montant,
      date: dto.date,
      description: dto.description || null,
    });
  }

  async update(id: string, dto: Partial<CreateDepenseDto>) {
    const depense = await this.depenseModel.findByPk(id);
    if (!depense) {
      throw new NotFoundException(`Dépense #${id} non trouvée`);
    }
    await depense.update(dto);
    return depense;
  }

  async remove(id: string) {
    const depense = await this.depenseModel.findByPk(id);
    if (!depense) {
      throw new NotFoundException(`Dépense #${id} non trouvée`);
    }
    await depense.destroy();
    return { message: 'Dépense supprimée' };
  }
}
