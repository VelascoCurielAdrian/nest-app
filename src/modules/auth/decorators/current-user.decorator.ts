import { createParamDecorator } from '@nestjs/common';

import type { ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user?: { sub: string; username: string };
}

/**
 * Decorador para extraer el usuario autenticado de la request
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: { sub: string; username: string }) {
 *   return user;
 * }
 */
// Decorador para extraer el usuario autenticado de la request
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
