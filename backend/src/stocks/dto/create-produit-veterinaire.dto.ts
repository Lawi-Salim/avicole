import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsIn } from 'class-validator';

export class CreateProduitVeterinaireDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['vaccin', 'antibiotique', 'vitamine', 'autre'])
  type_produit!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantite_stock!: number;

  @IsOptional()
  @IsString()
  unite?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seuil_alerte?: number;

  @IsOptional()
  @IsString()
  date_peremption?: string;
}
