import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SanteService } from './sante.service.js';
import { CreateMortaliteDto } from './dto/create-mortalite.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class SanteController {
  constructor(@Inject(SanteService) private readonly santeService: SanteService) {}

  @Get('cycles/:cycleId/mortalites')
  findByCycle(@Param('cycleId') cycleId: string) {
    return this.santeService.findByCycle(cycleId);
  }

  @Post('mortalites')
  create(
    @Body() dto: CreateMortaliteDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.santeService.create(dto, req.user.id);
  }

  @Delete('mortalites/:id')
  remove(@Param('id') id: string) {
    return this.santeService.remove(id);
  }
}
