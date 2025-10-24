//
import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Req } from '@nestjs/common';

import { setAuthCookie, clearAuthCookie, getCookie } from '@common/utils/cookies';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import type { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.login(loginDto);

    const { access_token, ...userData } = result;
    const isDevelopment = process.env.NODE_ENV === 'development';

    setAuthCookie(res, access_token, { isDevelopment });
    return userData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    clearAuthCookie(res);
    return { message: 'User has been logged out successfully' };
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Req() req: FastifyRequest) {
    const token = getCookie(req, 'access_token');
    if (!token) {
      return undefined;
    }
    const payload = await this.authService.verifyToken(token);
    return { session: payload };
  }
}
