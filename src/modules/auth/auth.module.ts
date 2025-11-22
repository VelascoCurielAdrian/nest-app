import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { SessionInterceptor } from './interceptors/session.interceptor';
import { JwtValidationService } from './services/jwt-validation.service';
import { UsersModule } from '../users/users.module';

// Módulo de autenticación
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : 60 * 60 * 24 * 140,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, SessionInterceptor, JwtValidationService],
  exports: [AuthService, AuthGuard, SessionInterceptor, JwtValidationService],
})
export class AuthModule {}
