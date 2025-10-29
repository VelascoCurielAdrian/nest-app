import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getCookie, setAuthCookie } from '@common/utils/cookies';

import { AuthService } from '../auth.service';

import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    // Obtener token de la cookie
    const token = getCookie(request, 'access_token');

    if (token) {
      // Validar el token y renovar la cookie si es válido
      return next.handle().pipe(
        tap(() => {
          // Ejecutar la validación de forma asíncrona sin bloquear
          void this.validateAndRenewToken(token, response);
        })
      );
    }

    return next.handle();
  }

  private async validateAndRenewToken(token: string, response: FastifyReply): Promise<void> {
    try {
      await this.authService.verifyToken(token);
      // Renovar la cookie extendiendo su expiración
      const isDevelopment = process.env.NODE_ENV === 'development';
      setAuthCookie(response, token, { isDevelopment });
    } catch {
      // Token inválido, no hacer nada (el guard se encargará de la autenticación)
    }
  }
}
