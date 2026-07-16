import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProduitVeterinaire } from './produit-veterinaire.entity.js';
import { ProduitsVeterinairesService } from './produits-veterinaires.service.js';
import { ProduitsVeterinairesController } from './produits-veterinaires.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([ProduitVeterinaire])],
  controllers: [ProduitsVeterinairesController],
  providers: [ProduitsVeterinairesService],
  exports: [ProduitsVeterinairesService, SequelizeModule],
})
export class ProduitsVeterinairesModule {}
