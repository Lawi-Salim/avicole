import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDepenseDto {
  @IsNotEmpty()
  @IsString()
  cycle_id!: string;

  @IsNotEmpty()
  @IsEnum(['poussins', 'aliments', 'veterinaire', 'infrastructure', 'imprevu'])
  categorie!: 'poussins' | 'aliments' | 'veterinaire' | 'infrastructure' | 'imprevu';

  @IsNotEmpty()
  @IsDecimal()
  montant!: number;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
