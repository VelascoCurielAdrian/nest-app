// ✅ Fastify adapter
import cookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

import type { LoggerService } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  // Configurar Winston como logger de la aplicación
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Pipes globales de validación
  app.useGlobalPipes(new ValidationPipe());
  const isDevelopment = process.env.NODE_ENV === 'development';
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
