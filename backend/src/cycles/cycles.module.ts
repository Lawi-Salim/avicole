import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cycle } from './cycle.entity.js';
import { Mortalite } from '../sante/mortalite.entity.js';
import { MouvementStock } from '../stocks/mouvement-stock.entity.js';
import { CyclesService } from './cycles.service.js';
import { CyclesController } from './cycles.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Cycle, Mortalite, MouvementStock])],
  controllers: [CyclesController],
  providers: [CyclesService],
  exports: [CyclesService],
})
export class CyclesModule {}
