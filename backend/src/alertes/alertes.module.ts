import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Alerte } from './alerte.entity.js';
import { AlertesService } from './alertes.service.js';
import { AlertesController } from './alertes.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Alerte])],
  controllers: [AlertesController],
  providers: [AlertesService],
  exports: [AlertesService],
})
export class AlertesModule {}
