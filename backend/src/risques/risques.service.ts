import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Risque } from './risque.entity.js';
import { CreateRisqueDto } from './dto/create-risque.dto.js';
import { UpdateRisqueDto } from './dto/update-risque.dto.js';

@Injectable()
export class RisquesService {
  constructor(
    @InjectModel(Risque)
    private readonly risqueModel: typeof Risque,
  ) {}

  async findAll() {
    return this.risqueModel.findAll({ order: [['created_at', 'DESC']] });
  }

  async findActifs() {
    return this.risqueModel.findAll({
      where: { actif: true },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const risque = await this.risqueModel.findByPk(id);
    if (!risque) throw new NotFoundException(`Risque #${id} non trouvé`);
    return risque;
  }

  async create(dto: CreateRisqueDto) {
    return this.risqueModel.create({ ...dto });
  }

  async update(id: string, dto: UpdateRisqueDto) {
    const risque = await this.findOne(id);
    await risque.update(dto);
    return risque;
  }

  async remove(id: string) {
    const risque = await this.findOne(id);
    await risque.destroy();
    return { message: 'Risque supprimé' };
  }
}
