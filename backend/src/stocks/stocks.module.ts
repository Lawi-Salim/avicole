import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MouvementStock } from './mouvement-stock.entity.js';
import { StocksService } from './stocks.service.js';
import { StocksController } from './stocks.controller.js';
import { ProduitsVeterinairesModule } from './produits-veterinaires.module.js';

@Module({
  imports: [SequelizeModule.forFeature([MouvementStock]), ProduitsVeterinairesModule],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
