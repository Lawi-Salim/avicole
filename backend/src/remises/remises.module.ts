import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RemisesController } from './remises.controller.js';
import { RemisesService } from './remises.service.js';
import { RemiseConfiguration } from './remise.entity.js';

@Module({
  imports: [SequelizeModule.forFeature([RemiseConfiguration])],
  controllers: [RemisesController],
  providers: [RemisesService],
  exports: [RemisesService],
})
export class RemisesModule {}
