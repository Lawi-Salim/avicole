import { Body, Controller, Get, Inject, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('inscription')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('connexion')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profil')
  getProfile(@Req() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profil/mot-de-passe')
  changePassword(
    @Req() req: { user: { id: string } },
    @Body() dto: { mot_de_passe_actuel: string; nouveau_mot_de_passe: string }
  ) {
    return this.authService.changePassword(req.user.id, dto.mot_de_passe_actuel, dto.nouveau_mot_de_passe);
  }
}
