//
import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Req } from '@nestjs/common';

import { setAuthCookie, clearAuthCookie, getCookie } from '@common/utils/cookies';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

import type { FastifyReply, FastifyRequest } from 'fastify';

// Controlador para manejar la autenticación
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint para el inicio de sesión
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.login(loginDto);

    const { access_token, ...userData } = result;
    const isDevelopment = process.env.NODE_ENV === 'development';

    setAuthCookie(res, access_token, { isDevelopment });
    return userData;
  }

  // Endpoint para el cierre de sesión
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    clearAuthCookie(res);
    return { message: 'User has been logged out successfully' };
  }

  // Endpoint para verificar la sesión
  @Public()
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Req() req: FastifyRequest) {
    const token = getCookie(req, 'access_token');
    const payload = await this.authService.verifyToken(token);
    return { session: payload };
  }

  // Endpoint para depurar el token
  @Public()
  @Get('debug-token')
  @HttpCode(HttpStatus.OK)
  async debugToken(@Req() req: FastifyRequest) {
    const token = getCookie(req, 'access_token');
    if (!token) {
      return { error: 'No token found' };
    }

    try {
      const payload = await this.authService.verifyToken(token);
      return {
        success: true,
        token: token.substring(0, 20) + '...',
        payload,
        currentTime: new Date().toISOString(),
        tokenExpiresAt: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() >= payload.exp * 1000,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 20) + '...',
        currentTime: new Date().toISOString(),
      };
    }
  }
}
