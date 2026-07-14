import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Client } from './client.entity.js';
import { Vente } from '../ventes/vente.entity.js';
import { Cycle } from '../cycles/cycle.entity.js';
import { CreateClientDto } from './dto/create-client.dto.js';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client)
    private readonly clientModel: typeof Client,
    @InjectModel(Vente)
    private readonly venteModel: typeof Vente,
    @InjectModel(Cycle)
    private readonly cycleModel: typeof Cycle,
  ) {}

  async findAll() {
    return this.clientModel.findAll({
      order: [['nom', 'ASC']],
    });
  }

  async findOne(id: string) {
    const client = await this.clientModel.findByPk(id);
    if (!client) {
      throw new NotFoundException(`Client #${id} non trouvé`);
    }
    return client;
  }

  async create(dto: CreateClientDto) {
    return this.clientModel.create({
      nom: dto.nom,
      type_client: dto.type_client,
      contact: dto.contact || null,
      adresse: dto.adresse || null,
      notes: dto.notes || null,
    });
  }

  async update(id: string, dto: Partial<CreateClientDto>) {
    const client = await this.findOne(id);
    await client.update(dto);
    return client;
  }

  async remove(id: string) {
    const client = await this.findOne(id);

    const nbVentes = await this.venteModel.count({
      where: { client_id: id },
    });

    if (nbVentes > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce client : ${nbVentes} vente(s) liée(s). ` +
        `Veuillez d'abord supprimer ou modifier les ventes associées.`
      );
    }

    await client.destroy();
    return { message: 'Client supprimé' };
  }

  async getVentesByClient(id: string) {
    await this.findOne(id);
    return this.venteModel.findAll({
      where: { client_id: id },
      include: [
        {
          model: this.cycleModel,
          attributes: ['id', 'numero_cycle', 'date_reception', 'statut'],
        },
      ],
      order: [['date', 'DESC']],
    });
  }
}
