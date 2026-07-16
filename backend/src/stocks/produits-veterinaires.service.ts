import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProduitVeterinaire } from './produit-veterinaire.entity.js';
import { CreateProduitVeterinaireDto } from './dto/create-produit-veterinaire.dto.js';

@Injectable()
export class ProduitsVeterinairesService {
  constructor(
    @InjectModel(ProduitVeterinaire)
    private readonly produitModel: typeof ProduitVeterinaire,
  ) {}

  async findAll() {
    const produits = await this.produitModel.findAll({ order: [['nom', 'ASC']] });
    return produits.map((p) => p.toJSON());
  }

  async findOne(id: string) {
    const produit = await this.produitModel.findByPk(id);
    if (!produit) {
      throw new NotFoundException(`Produit vétérinaire #${id} non trouvé`);
    }
    return produit;
  }

  async create(dto: CreateProduitVeterinaireDto) {
    return this.produitModel.create({
      nom: dto.nom,
      type_produit: dto.type_produit,
      quantite_stock: dto.quantite_stock,
      unite: dto.unite || 'dose',
      seuil_alerte: dto.seuil_alerte ?? 0,
      date_peremption: dto.date_peremption || null,
    });
  }

  async update(id: string, dto: Partial<CreateProduitVeterinaireDto>) {
    const produit = await this.findOne(id);
    await produit.update(dto);
    return produit;
  }

  async remove(id: string) {
    const produit = await this.findOne(id);
    await produit.destroy();
    return { message: 'Produit vétérinaire supprimé' };
  }
}
