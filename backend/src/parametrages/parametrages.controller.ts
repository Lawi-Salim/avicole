import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ParametragesService } from './parametrages.service.js';
import { UpdateParametrageDto } from './dto/update-parametrage.dto.js';

@Controller('parametrages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParametragesController {
  constructor(@Inject(ParametragesService) private readonly parametragesService: ParametragesService) {}

  @Get('current')
  getCurrent() {
    return this.parametragesService.getActif();
  }

  @Get()
  getActif() {
    return this.parametragesService.getActif();
  }

  @Roles('admin')
  @Put('current')
  updateCurrent(@Body() dto: UpdateParametrageDto) {
    return this.parametragesService.updateCurrent(dto);
  }

  @Roles('admin')
  @Post()
  create(@Req() req: { user: { id: string } }) {
    return this.parametragesService.create(req.user.id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParametrageDto) {
    return this.parametragesService.update(id, dto);
  }
}
