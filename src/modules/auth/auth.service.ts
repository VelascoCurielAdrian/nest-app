import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto | undefined) {
    if (!loginDto) {
      throw new BadRequestException('Request body is required');
    }
    const { username, password } = loginDto;

    // Buscar usuario por username
    const user: User | null = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validar que el usuario esté activo
    if (!user.status) {
      throw new UnauthorizedException('User is inactive');
    }

    // Validar contraseña (soporta hash bcrypt o texto plano en dev)
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashed = typeof user.password === 'string' && user.password.startsWith('$2');
    const isValid = hashed ? await bcrypt.compare(password, user.password) : user.password === password;

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Construir payload y firmar token
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    // Simular permisos/perfil (adaptar a tu dominio real)
    const permissions = { sale: [1, 2, 3] } as Record<string, number[]>;

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        status: user.status,
      },
      permissions,
    };
  }

  async verifyToken(token: string): Promise<{ sub: string; username: string }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: string; username: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
