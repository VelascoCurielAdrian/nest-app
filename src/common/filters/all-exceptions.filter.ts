import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import type { LoggerService } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

type ErrorBody = {
  id: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
  error: string;
  message?: unknown;
  errors?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const id = this.getRequestId(request);
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    const { statusCode, error, message, errors } =
      this.getHttpErrorParts(exception);

    const body: ErrorBody = {
      id,
      timestamp,
      path,
      method,
      statusCode,
      error,
      message,
    };

    if (errors !== undefined) {
      body.errors = errors;
    }

    // Log estructurado
    this.logger.error(
      `${method} ${path} -> ${statusCode} [${id}] ${this.stringifyMsg(message)}`,
      (exception as Error)?.stack,
      'AllExceptionsFilter',
    );

    reply
      .status(statusCode)
      .header('x-request-id', id)
      .type('application/json')
      .send(body);
  }

  private getRequestId(req: FastifyRequest): string {
    const headerId = req.headers['x-request-id'];
    if (typeof headerId === 'string' && headerId.length > 0) {
      return headerId;
    }
    return randomUUID();
  }

  private getHttpErrorParts(exception: unknown): {
    statusCode: number;
    error: string;
    message?: unknown;
    errors?: unknown;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      let message: unknown = response;
      let errors: unknown = undefined;

      if (response && typeof response === 'object') {
        if ('message' in response) {
          message = (response as { message?: unknown }).message;
        }
        if ('errors' in response) {
          errors = (response as { errors?: unknown }).errors;
        }
      }

      return {
        statusCode: exception.getStatus(),
        error: exception.name,
        message,
        errors,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: (exception as Error)?.name ?? 'Error',
      message: (exception as Error)?.message ?? 'Internal Server Error',
    };
  }

  private stringifyMsg(message: unknown): string {
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
