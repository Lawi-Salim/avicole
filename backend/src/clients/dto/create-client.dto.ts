import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsNotEmpty()
  @IsEnum(['menage', 'restaurant', 'hotel', 'boucherie', 'revendeur'])
  type_client!: 'menage' | 'restaurant' | 'hotel' | 'boucherie' | 'revendeur';

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
