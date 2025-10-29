import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { getCookie } from '@common/utils/cookies';

import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class AuthLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthLoggingMiddleware.name);

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const token = getCookie(req, 'access_token');
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (token) {
      this.logger.log(`Authenticated request: ${method} ${url} - User Agent: ${userAgent}`);
    } else {
      this.logger.log(`Unauthenticated request: ${method} ${url} - User Agent: ${userAgent}`);
    }

    next();
  }
}
