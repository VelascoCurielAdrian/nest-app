import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    // TODO: Implementar lógica de autenticación
    return {
      access_token: 'token-placeholder',
      user: {
        email: loginDto.email,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateUser(_email: string, _password: string) {
    // TODO: Implementar validación de usuario
    return null;
  }
}
