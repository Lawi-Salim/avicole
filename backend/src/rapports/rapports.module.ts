import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RapportsController } from './rapports.controller.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { Mortalite } from '../sante/mortalite.entity.js';
import { MouvementStock } from '../stocks/mouvement-stock.entity.js';
import { Depense } from '../finances/depense.entity.js';
import { Vente } from '../ventes/vente.entity.js';
import { Client } from '../clients/client.entity.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Cycle, Mortalite, MouvementStock, Depense, Vente, Client]),
  ],
  controllers: [RapportsController],
})
export class RapportsModule {}
