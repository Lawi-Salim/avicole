import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Parametrage } from './parametrage.entity.js';
import { UpdateParametrageDto } from './dto/update-parametrage.dto.js';

@Injectable()
export class ParametragesService {
  constructor(
    @InjectModel(Parametrage)
    private readonly parametrageModel: typeof Parametrage,
  ) {}

  async getActif() {
    const param = await this.parametrageModel.findOne({
      where: { actif: true },
      order: [['created_at', 'DESC']],
    });
    if (!param) {
      throw new NotFoundException(
        'Aucun paramétrage actif trouvé. Créez-en un.',
      );
    }
    return param;
  }

  async create(userId?: string) {
    const currentActif = await this.parametrageModel.findOne({
      where: { actif: true },
    });
    if (currentActif) {
      await currentActif.update({ actif: false });
    }

    return this.parametrageModel.create({
      actif: true,
      created_by: userId || null,
    });
  }

  async update(id: string, dto: UpdateParametrageDto) {
    const param = await this.parametrageModel.findByPk(id);
    if (!param) {
      throw new NotFoundException(`Paramétrage #${id} non trouvé`);
    }
    await param.update(dto);
    return param;
  }
}
