import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRisqueDto {
  @IsNotEmpty()
  @IsString()
  categorie!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  mesure_preventive?: string;

  @IsOptional()
  @IsString()
  seuil_alerte?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
