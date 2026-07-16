import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateRisqueDto {
  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
