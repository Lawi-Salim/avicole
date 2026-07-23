import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vente } from './vente.entity.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { Mortalite } from '../sante/mortalite.entity.js';
import { Client } from '../clients/client.entity.js';
import { RemisesModule } from '../remises/remises.module.js';
import { VentesService } from './ventes.service.js';
import { VentesController } from './ventes.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Vente, Cycle, Mortalite, Client]), RemisesModule],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}
