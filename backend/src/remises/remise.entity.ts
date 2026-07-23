import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'remises_configuration', timestamps: true })
export class RemiseConfiguration extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare type_client: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare seuil_min_quantite: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare seuil_max_quantite: number | null;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, defaultValue: 0 })
  declare remise_pct: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare actif: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare mode_remise: string | null;

  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare created_at: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  declare updated_at: Date;
}
