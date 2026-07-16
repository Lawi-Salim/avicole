import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateVaccinationDto {
  @IsNotEmpty()
  @IsUUID()
  cycle_id!: string;

  @IsOptional()
  @IsUUID()
  produit_id?: string;

  @IsNotEmpty()
  @IsString()
  produit!: string;

  @IsNotEmpty()
  @IsString()
  date_prevue!: string;

  @IsOptional()
  @IsString()
  date_realisee?: string;

  @IsOptional()
  @IsBoolean()
  rappel?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
