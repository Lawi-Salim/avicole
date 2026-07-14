import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Client } from './client.entity.js';
import { Vente } from '../ventes/vente.entity.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { ClientsService } from './clients.service.js';
import { ClientsController } from './clients.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Client, Vente, Cycle])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
