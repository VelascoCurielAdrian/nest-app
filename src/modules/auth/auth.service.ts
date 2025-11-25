import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

// Servicio para manejar la autenticación
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
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que el usuario esté activo
    if (!user.status) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Validar contraseña (soporta hash bcrypt o texto plano en dev)
    if (!user.password) {
      throw new UnauthorizedException('Usuario no tiene contraseña establecida');
    }

    const hashed = typeof user.password === 'string' && user.password.startsWith('$2');
    const isValid = hashed ? await bcrypt.compare(password, user.password) : user.password === password;

    if (!isValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Construir payload y firmar token
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    // Obtener datos completos del usuario con perfil y permisos
    const userWithProfile = await this.usersService.getUserWithProfileAndPermissions(user.id);

    if (userWithProfile) {
      return {
        access_token,
        user: userWithProfile,
      };
    }

    // Fallback si no tiene perfil
    return {
      access_token,
      user: {
        user_id: user.id,
        username: user.username,
        status: user.status,
      },
    };
  }

  async verifyToken(token: string): Promise<{ sub: string; username: string; iat: number; exp: number }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: string; username: string; iat: number; exp: number }>(token);
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
