import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Risque } from './risque.entity.js';
import { RisquesService } from './risques.service.js';
import { RisquesController } from './risques.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Risque])],
  controllers: [RisquesController],
  providers: [RisquesService],
  exports: [RisquesService],
})
export class RisquesModule {}
