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
import { RisquesService } from './risques.service.js';
import { CreateRisqueDto } from './dto/create-risque.dto.js';
import { UpdateRisqueDto } from './dto/update-risque.dto.js';

@Controller('risques')
@UseGuards(JwtAuthGuard)
export class RisquesController {
  constructor(@Inject(RisquesService) private readonly risquesService: RisquesService) {}

  @Get()
  findAll() {
    return this.risquesService.findAll();
  }

  @Get('actifs')
  findActifs() {
    return this.risquesService.findActifs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.risquesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRisqueDto) {
    return this.risquesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRisqueDto) {
    return this.risquesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.risquesService.remove(id);
  }
}
