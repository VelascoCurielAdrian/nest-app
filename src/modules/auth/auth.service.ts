import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto | undefined) {
    if (!loginDto) {
      throw new BadRequestException('Request body is required');
    }
    const { email, password, isMobile } = loginDto;

    // Buscar usuario por email
    const user: User | undefined = this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validar contraseña (soporta hash bcrypt o texto plano en dev)
    const hashed =
      typeof user.password === 'string' && user.password.startsWith('$2');
    const isValid = hashed
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Construir payload y firmar token
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    // Simular permisos/perfil (adaptar a tu dominio real)
    const permissions = { sale: [1, 2, 3] } as Record<string, number[]>;

    if (isMobile) {
      const salePerms = permissions.sale || [];
      if (!salePerms.includes(1)) {
        throw new UnauthorizedException(
          'Profile permissions not allowed for mobile',
        );
      }
    }

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      permissions,
    };
  }

  async verifyToken(token: string): Promise<{ sub: string; email: string }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: string; email: string }>(
        token,
      );
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
