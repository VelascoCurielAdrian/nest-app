// ✅ Fastify adapter
import cookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

import type { LoggerService } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  // Crear FastifyAdapter con configuración CORS
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bufferLogs: true,
  });

  // Configurar Winston como logger de la aplicación
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Obtener configuración
  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins') || [];

  // Configurar CORS con Fastify - ANTES de cualquier otra configuración

  await app.register(fastifyCors, {
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
      // Permitir peticiones sin origen (como Postman, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Verificar si el origen está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (isDevelopment) {
        // En desarrollo, permitir cualquier localhost
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        }
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 horas de caché para preflight
  });

  // Pipes globales de validación
  app.useGlobalPipes(new ValidationPipe());

  await app.register(cookie, {
    parseOptions: {
      sameSite: isDevelopment ? 'lax' : 'none',
      secure: !isDevelopment,
      path: '/',
    },
  });
  // Filtro global de excepciones con respuesta estructurada + logs
  // Usamos el proveedor de Nest-Winston como LoggerService
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  await app.listen(4001, '0.0.0.0');
}
void bootstrap();
