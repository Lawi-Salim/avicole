import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateVenteDto {
  @IsNotEmpty()
  @IsString()
  cycle_id!: string;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantite!: number;

  @IsNotEmpty()
  @IsPositive()
  prix_unitaire!: number;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsEnum(['especes', 'cheque', 'virement', 'credit'])
  mode_paiement!: 'especes' | 'cheque' | 'virement' | 'credit';

  @IsNotEmpty()
  @IsEnum(['paye', 'partiel', 'impaye'])
  statut_paiement!: 'paye' | 'partiel' | 'impaye';
}
