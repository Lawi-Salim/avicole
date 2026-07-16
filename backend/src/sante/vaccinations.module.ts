import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vaccination } from './vaccination.entity.js';
import { VaccinationsService } from './vaccinations.service.js';
import { VaccinationsController } from './vaccinations.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Vaccination])],
  controllers: [VaccinationsController],
  providers: [VaccinationsService],
  exports: [VaccinationsService],
})
export class VaccinationsModule {}
