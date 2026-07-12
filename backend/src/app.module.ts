import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './auth/user.entity.js';
import { Cycle } from './cycles/cycle.entity.js';
import { MouvementStock } from './stocks/mouvement-stock.entity.js';
import { Mortalite } from './sante/mortalite.entity.js';
import { Parametrage } from './parametrages/parametrage.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { CyclesModule } from './cycles/cycles.module.js';
import { StocksModule } from './stocks/stocks.module.js';
import { SanteModule } from './sante/sante.module.js';
import { ParametragesModule } from './parametrages/parametrages.module.js';

@Module({
  imports: [
    SequelizeModule.forRoot({
      uri: process.env.DATABASE_URL,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      models: [User, Cycle, MouvementStock, Mortalite, Parametrage],
      synchronize: false,
    }),
    AuthModule,
    CyclesModule,
    StocksModule,
    SanteModule,
    ParametragesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
