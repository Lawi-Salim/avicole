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
import { FinancesService } from './finances.service.js';
import { CreateDepenseDto } from './dto/create-depense.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class FinancesController {
  constructor(@Inject(FinancesService) private readonly financesService: FinancesService) {}

  @Get('cycles/:cycleId/depenses')
  findByCycle(@Param('cycleId') cycleId: string) {
    return this.financesService.findByCycle(cycleId);
  }

  @Post('depenses')
  create(@Body() dto: CreateDepenseDto) {
    return this.financesService.create(dto);
  }

  @Put('depenses/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDepenseDto>) {
    return this.financesService.update(id, dto);
  }

  @Delete('depenses/:id')
  remove(@Param('id') id: string) {
    return this.financesService.remove(id);
  }
}
