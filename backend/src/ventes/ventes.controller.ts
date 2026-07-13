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
import { VentesService } from './ventes.service.js';
import { CreateVenteDto } from './dto/create-vente.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class VentesController {
  constructor(@Inject(VentesService) private readonly ventesService: VentesService) {}

  @Get('cycles/:cycleId/ventes')
  findByCycle(@Param('cycleId') cycleId: string) {
    return this.ventesService.findByCycle(cycleId);
  }

  @Post('ventes')
  create(@Body() dto: CreateVenteDto) {
    return this.ventesService.create(dto);
  }

  @Put('ventes/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateVenteDto>) {
    return this.ventesService.update(id, dto);
  }

  @Delete('ventes/:id')
  remove(@Param('id') id: string) {
    return this.ventesService.remove(id);
  }
}
