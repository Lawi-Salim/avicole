import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare nom: string;

  @Column({ type: DataType.TEXT, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare password_hash: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'admin',
  })
  declare role: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare actif: boolean;

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
