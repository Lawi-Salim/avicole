import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ParametragesService } from './parametrages.service.js';
import { UpdateParametrageDto } from './dto/update-parametrage.dto.js';

@Controller('parametrages')
@UseGuards(JwtAuthGuard)
export class ParametragesController {
  constructor(@Inject(ParametragesService) private readonly parametragesService: ParametragesService) {}

  @Get()
  getActif() {
    return this.parametragesService.getActif();
  }

  @Post()
  create(@Req() req: { user: { id: string } }) {
    return this.parametragesService.create(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParametrageDto) {
    return this.parametragesService.update(id, dto);
  }
}
