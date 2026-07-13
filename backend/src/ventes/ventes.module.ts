import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vente } from './vente.entity.js';
import { VentesService } from './ventes.service.js';
import { VentesController } from './ventes.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Vente])],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}
