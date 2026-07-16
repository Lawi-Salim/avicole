import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
} from 'sequelize-typescript';
import { Cycle } from '../cycles/cycle.entity.js';
import { Risque } from '../risques/risque.entity.js';
import { ProduitVeterinaire } from '../stocks/produit-veterinaire.entity.js';

@Table({ tableName: 'alertes', timestamps: false })
export class Alerte extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare type_alerte: string;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: 'warning' })
  declare niveau: string;

  @ForeignKey(() => Cycle)
  @Column({ type: DataType.UUID, allowNull: true, onDelete: 'CASCADE' })
  declare cycle_id: string | null;

  @ForeignKey(() => Risque)
  @Column({ type: DataType.UUID, allowNull: true, onDelete: 'SET NULL' })
  declare risque_id: string | null;

  @ForeignKey(() => ProduitVeterinaire)
  @Column({ type: DataType.UUID, allowNull: true, onDelete: 'SET NULL' })
  declare produit_veterinaire_id: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare resolue: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare resolue_at: Date | null;

  @BelongsTo(() => Cycle)
  cycle!: Cycle;

  @BelongsTo(() => Risque)
  risque!: Risque;

  @BelongsTo(() => ProduitVeterinaire)
  produit_veterinaire!: ProduitVeterinaire;

  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare created_at: Date;
}
