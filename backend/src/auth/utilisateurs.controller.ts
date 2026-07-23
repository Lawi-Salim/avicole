import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { Roles } from './roles.decorator.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('utilisateurs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UtilisateursController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Post()
  create(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<{ nom: string; email: string; role: string; actif: boolean }>) {
    return this.authService.update(id, dto);
  }

  @Patch(':id/toggle-actif')
  toggleActif(@Param('id') id: string) {
    return this.authService.toggleActif(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}
