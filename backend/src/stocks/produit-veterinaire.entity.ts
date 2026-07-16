import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'produits_veterinaires', timestamps: true })
export class ProduitVeterinaire extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare nom: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'vaccin',
  })
  declare type_produit: string;

  @Column({
    type: DataType.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0,
  })
  declare quantite_stock: number;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: 'dose' })
  declare unite: string;

  @Column({
    type: DataType.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0,
  })
  declare seuil_alerte: number;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare date_peremption: string | null;

  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare created_at: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare updated_at: Date;
}
