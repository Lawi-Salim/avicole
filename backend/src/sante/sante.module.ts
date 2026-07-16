import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Mortalite } from './mortalite.entity.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { SanteService } from './sante.service.js';
import { SanteController } from './sante.controller.js';
import { VaccinationsModule } from './vaccinations.module.js';

@Module({
  imports: [SequelizeModule.forFeature([Mortalite, Cycle]), VaccinationsModule],
  controllers: [SanteController],
  providers: [SanteService],
  exports: [SanteService],
})
export class SanteModule {}
