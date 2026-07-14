import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './auth/user.entity.js';
import { Cycle } from './cycles/cycle.entity.js';
import { MouvementStock } from './stocks/mouvement-stock.entity.js';
import { Mortalite } from './sante/mortalite.entity.js';
import { Parametrage } from './parametrages/parametrage.entity.js';
import { Depense } from './finances/depense.entity.js';
import { Vente } from './ventes/vente.entity.js';
import { Client } from './clients/client.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { CyclesModule } from './cycles/cycles.module.js';
import { StocksModule } from './stocks/stocks.module.js';
import { SanteModule } from './sante/sante.module.js';
import { ParametragesModule } from './parametrages/parametrages.module.js';
import { FinancesModule } from './finances/finances.module.js';
import { VentesModule } from './ventes/ventes.module.js';
import { ClientsModule } from './clients/clients.module.js';

@Module({
  imports: [
    SequelizeModule.forRoot({
      uri: process.env.DATABASE_URL,
      dialect: 'postgres',
      logging: false,
      models: [User, Cycle, MouvementStock, Mortalite, Parametrage, Depense, Vente, Client],
      synchronize: false,
    }),
    AuthModule,
    CyclesModule,
    StocksModule,
    SanteModule,
    ParametragesModule,
    FinancesModule,
    VentesModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
