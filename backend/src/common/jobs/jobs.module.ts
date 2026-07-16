import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProduitVeterinaire } from '../../stocks/produit-veterinaire.entity.js';
import { Cycle } from '../../cycles/cycle.entity.js';
import { Mortalite } from '../../sante/mortalite.entity.js';
import { Parametrage } from '../../parametrages/parametrage.entity.js';
import { AlertesModule } from '../../alertes/alertes.module.js';
import { VerificationsJob } from './verifications.job.js';
import { JobsController } from './jobs.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProduitVeterinaire,
      Cycle,
      Mortalite,
      Parametrage,
    ]),
    AlertesModule,
  ],
  controllers: [JobsController],
  providers: [VerificationsJob],
  exports: [VerificationsJob],
})
export class JobsModule {}
