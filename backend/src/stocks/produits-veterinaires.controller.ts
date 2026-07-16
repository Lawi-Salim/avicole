import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProduitsVeterinairesService } from './produits-veterinaires.service.js';
import { CreateProduitVeterinaireDto } from './dto/create-produit-veterinaire.dto.js';

@Controller('produits-veterinaires')
@UseGuards(JwtAuthGuard)
export class ProduitsVeterinairesController {
  constructor(
    @Inject(ProduitsVeterinairesService)
    private readonly produitsService: ProduitsVeterinairesService,
  ) {}

  @Get()
  findAll() {
    return this.produitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produitsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProduitVeterinaireDto) {
    return this.produitsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProduitVeterinaireDto>) {
    return this.produitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produitsService.remove(id);
  }
}
