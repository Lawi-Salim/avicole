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
import { VaccinationsService } from './vaccinations.service.js';
import { CreateVaccinationDto } from './dto/create-vaccination.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class VaccinationsController {
  constructor(
    @Inject(VaccinationsService)
    private readonly vaccinationsService: VaccinationsService,
  ) {}

  @Get('cycles/:cycleId/vaccinations')
  findByCycle(@Param('cycleId') cycleId: string) {
    return this.vaccinationsService.findByCycle(cycleId);
  }

  @Get('vaccinations/:id')
  findOne(@Param('id') id: string) {
    return this.vaccinationsService.findOne(id);
  }

  @Post('vaccinations')
  create(@Body() dto: CreateVaccinationDto) {
    return this.vaccinationsService.create(dto);
  }

  @Put('vaccinations/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateVaccinationDto>) {
    return this.vaccinationsService.update(id, dto);
  }

  @Delete('vaccinations/:id')
  remove(@Param('id') id: string) {
    return this.vaccinationsService.remove(id);
  }
}
