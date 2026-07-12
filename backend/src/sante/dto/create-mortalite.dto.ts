import {
  IsDateString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMortaliteDto {
  @IsNotEmpty()
  @IsString()
  cycle_id!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  nombre!: number;

  @IsOptional()
  @IsString()
  cause?: string;
}
