import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMouvementDto {
  @IsNotEmpty()
  @IsString()
  cycle_id!: string;

  @IsNotEmpty()
  @IsString()
  type_stock!: string;

  @IsNotEmpty()
  @IsString()
  sens!: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantite!: number;

  @IsOptional()
  @IsString()
  unite?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cout?: number;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
