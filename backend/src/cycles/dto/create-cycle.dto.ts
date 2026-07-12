import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateCycleDto {
  @IsNotEmpty()
  @IsDateString()
  date_reception!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  effectif_initial!: number;

  @IsNotEmpty()
  @IsPositive()
  cout_achat_poussins!: number;

  @IsOptional()
  @IsString()
  created_by?: string;
}
