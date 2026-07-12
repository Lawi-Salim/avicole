import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateCycleDto {
  @IsOptional()
  @IsDateString()
  date_reception?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  effectif_initial?: number;

  @IsOptional()
  @IsPositive()
  cout_achat_poussins?: number;
}

export class UpdatePhaseDto {
  @IsNotEmpty()
  @IsString()
  phase!: string;
}
