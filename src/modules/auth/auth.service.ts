import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    // TODO: Implementar lógica de autenticación
    return {
      access_token: 'token-placeholder',
      user: {
        email: loginDto.email,
      },
    };
  }

  async validateUser(email: string, password: string) {
    // TODO: Implementar validación de usuario
    return null;
  }
}
