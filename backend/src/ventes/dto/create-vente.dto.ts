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
  @IsEnum(['especes', 'mobile_money', 'cheque', 'virement', 'credit'])
  mode_paiement!: 'especes' | 'mobile_money' | 'cheque' | 'virement' | 'credit';

  @IsNotEmpty()
  @IsEnum(['paye', 'partiel', 'impaye'])
  statut_paiement!: 'paye' | 'partiel' | 'impaye';

  @IsOptional()
  @IsEnum(['poulet_vif', 'poulet_abattu', 'poulet_entier', 'poulet_fermier', 'poulet_morceaux', 'poulet_cuisse', 'poulet_ailes'])
  categorie_produit?: 'poulet_vif' | 'poulet_abattu' | 'poulet_entier' | 'poulet_fermier' | 'poulet_morceaux' | 'poulet_cuisse' | 'poulet_ailes';

  @IsOptional()
  remise?: number;
}
