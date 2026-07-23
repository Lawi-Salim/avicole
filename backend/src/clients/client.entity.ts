import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Vente } from '../ventes/vente.entity.js';

@Table({ tableName: 'clients', timestamps: true, paranoid: true })
export class Client extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare nom: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'menage',
  })
  declare type_client: 'menage' | 'restaurant' | 'hotel' | 'boucherie' | 'revendeur';

  @Column({ type: DataType.TEXT, allowNull: true })
  declare contact: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare adresse: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @HasMany(() => Vente)
  ventes!: Vente[];

  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare created_at: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare updated_at: Date;

  @DeletedAt
  @Column({ type: DataType.DATE, allowNull: true })
  declare deleted_at: Date | null;
}
