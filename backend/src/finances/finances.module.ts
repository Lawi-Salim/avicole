import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Depense } from './depense.entity.js';
import { FinancesService } from './finances.service.js';
import { FinancesController } from './finances.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Depense])],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}
