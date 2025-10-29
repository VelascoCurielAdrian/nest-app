import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { getCookie } from '@common/utils/cookies';

import { JwtValidationService } from '../services/jwt-validation.service';

import type { FastifyRequest } from 'fastify';

export const IS_PUBLIC_KEY = 'isPublic';

interface AuthenticatedRequest extends FastifyRequest {
  user?: { sub: string; username: string; iat: number; exp: number };
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtValidationService: JwtValidationService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Obtener token de la cookie
    const token = getCookie(request, 'access_token');

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      // Usar el JwtValidationService para verificar el token
      const payload = await this.jwtValidationService.verifyToken(token);

      // Log para debug
      this.logger.debug(`AuthGuard - Token verified successfully for user: ${payload.username} (${payload.sub})`);

      // Agregar el payload al request para usarlo en los controladores
      request.user = payload;

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`AuthGuard - Token verification failed: ${errorMessage}`);
      // Re-lanzar la excepción original que viene del JwtValidationService
      throw error instanceof UnauthorizedException ? error : new UnauthorizedException('Invalid or expired token');
    }
  }
}
