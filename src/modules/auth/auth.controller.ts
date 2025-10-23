//
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  setAuthCookie,
  clearAuthCookie,
  getCookie,
} from '@common/utils/cookies';
// Tipos de Fastify se usan vía import inline cuando es necesario

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: import('fastify').FastifyReply,
  ) {
    const result = await this.authService.login(loginDto);

    const { access_token, ...userData } = result;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Establecer cookie de sesión
    setAuthCookie(res, access_token, { isDevelopment });

    return userData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: import('fastify').FastifyReply) {
    clearAuthCookie(res);
    return { message: 'User has been logged out successfully' };
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifySession(@Req() req: import('fastify').FastifyRequest) {
    const token = getCookie(req, 'access_token');
    if (!token) {
      return undefined;
    }
    const payload = await this.authService.verifyToken(token);
    return { session: payload };
  }
}
