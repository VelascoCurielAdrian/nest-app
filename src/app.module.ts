import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { winstonOptions } from './common/logger/winston.config';
import configuration from './config/configuration';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthGuard, SessionInterceptor } from './modules/auth';
import { AuthModule } from './modules/auth/auth.module';
import { AuthLoggingMiddleware } from './modules/auth/middleware/auth-logging.middleware';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
    // Configuración de base de datos con TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    // Logger
    WinstonModule.forRoot(winstonOptions),
    // Módulos de la aplicación
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global para autenticación
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Interceptor global para manejo de sesiones
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthLoggingMiddleware).forRoutes('*'); // Aplicar a todas las rutas
  }
}
