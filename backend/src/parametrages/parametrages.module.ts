import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Parametrage } from './parametrage.entity.js';
import { ParametragesService } from './parametrages.service.js';
import { ParametragesController } from './parametrages.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Parametrage])],
  controllers: [ParametragesController],
  providers: [ParametragesService],
  exports: [ParametragesService],
})
export class ParametragesModule {}
