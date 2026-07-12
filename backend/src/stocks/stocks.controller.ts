import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { StocksService } from './stocks.service.js';
import { CreateMouvementDto } from './dto/create-mouvement.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class StocksController {
  constructor(@Inject(StocksService) private readonly stocksService: StocksService) {}

  @Get('cycles/:cycleId/stocks')
  findByCycle(@Param('cycleId') cycleId: string) {
    return this.stocksService.findByCycle(cycleId);
  }

  @Post('stocks')
  create(
    @Body() dto: CreateMouvementDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.stocksService.create(dto, req.user.id);
  }

  @Delete('stocks/:id')
  remove(@Param('id') id: string) {
    return this.stocksService.remove(id);
  }
}
