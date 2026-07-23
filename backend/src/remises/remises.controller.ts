import { Controller, Get, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { RemisesService } from './remises.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('remises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'comptable')
export class RemisesController {
  constructor(@Inject(RemisesService) private readonly remisesService: RemisesService) {}

  @Get('type-client')
  async getRemisesByTypeClient() {
    return this.remisesService.getRemisesByTypeClient();
  }

  @Get('volume')
  async getRemisesByVolume() {
    return this.remisesService.getRemisesByVolume();
  }

  @Put('type-client')
  async updateRemiseTypeClient(@Body() body: { type_client: string; remise_pct: number }) {
    await this.remisesService.updateRemiseTypeClient(body.type_client, body.remise_pct);
    return { success: true };
  }

  @Put('volume')
  async updateRemiseVolume(@Body() body: { seuil_min: number; seuil_max: number | null; remise_pct: number }) {
    await this.remisesService.updateRemiseVolume(body.seuil_min, body.seuil_max, body.remise_pct);
    return { success: true };
  }

  @Get('mode')
  async getRemiseMode() {
    return this.remisesService.getRemiseMode();
  }

  @Put('mode')
  async setRemiseMode(@Body() body: { mode: 'type_client' | 'volume' | 'aucun' }) {
    await this.remisesService.setRemiseMode(body.mode);
    return { success: true };
  }

  @Get('calculate')
  async calculateRemise(@Body() body: { type_client: string; quantite: number }) {
    const remise = await this.remisesService.calculateRemise(body.type_client, body.quantite);
    return { remise_pct: remise };
  }
}
