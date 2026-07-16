import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vaccination } from './vaccination.entity.js';
import { CreateVaccinationDto } from './dto/create-vaccination.dto.js';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectModel(Vaccination)
    private readonly vaccinationModel: typeof Vaccination,
  ) {}

  async findByCycle(cycleId: string) {
    return this.vaccinationModel.findAll({
      where: { cycle_id: cycleId },
      order: [['date_prevue', 'ASC']],
    });
  }

  async findOne(id: string) {
    const vaccination = await this.vaccinationModel.findByPk(id);
    if (!vaccination) {
      throw new NotFoundException(`Vaccination #${id} non trouvée`);
    }
    return vaccination;
  }

  async create(dto: CreateVaccinationDto) {
    return this.vaccinationModel.create({
      cycle_id: dto.cycle_id,
      produit_id: dto.produit_id || null,
      produit: dto.produit,
      date_prevue: dto.date_prevue,
      date_realisee: dto.date_realisee || null,
      rappel: dto.rappel ?? false,
      notes: dto.notes || null,
    });
  }

  async update(id: string, dto: Partial<CreateVaccinationDto>) {
    const vaccination = await this.findOne(id);
    await vaccination.update(dto);
    return vaccination;
  }

  async remove(id: string) {
    const vaccination = await this.findOne(id);
    await vaccination.destroy();
    return { message: 'Vaccination supprimée' };
  }
}
