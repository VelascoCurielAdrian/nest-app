import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { FastifyReply, FastifyRequest } from 'fastify';

export interface Response<T> {
  id: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const ctx = context.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const id = this.getRequestId(request);
        const timestamp = new Date().toISOString();
        const path = request.url;
        const method = request.method;
        const statusCode = reply.statusCode || 200;

        reply.header('x-request-id', id);

        return {
          id,
          timestamp,
          path,
          method,
          statusCode,
          data,
        };
      })
    );
  }

  private getRequestId(req: FastifyRequest): string {
    const headerId = req.headers['x-request-id'];
    if (typeof headerId === 'string' && headerId.length > 0) {
      return headerId;
    }
    return randomUUID();
  }
}
