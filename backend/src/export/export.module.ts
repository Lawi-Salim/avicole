import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExportController } from './export.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([])],
  controllers: [ExportController],
})
export class ExportModule {}
