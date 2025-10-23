// ✅ Fastify adapter
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const isDevelopment = process.env.NODE_ENV === 'development';
  await app.register(cookie, {
    parseOptions: {
      sameSite: isDevelopment ? 'lax' : 'none',
      secure: !isDevelopment,
      path: '/',
    },
  });
  await app.listen(3000, '0.0.0.0');
}
void bootstrap();
