import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MouvementStock } from './mouvement-stock.entity.js';
import { StocksService } from './stocks.service.js';
import { StocksController } from './stocks.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([MouvementStock])],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
