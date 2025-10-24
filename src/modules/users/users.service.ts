import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Busca un usuario por username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, status: true },
      select: ['id', 'username', 'password', 'status'],
    });
  }

  /**
   * Busca un usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Actualiza un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Merge los datos del DTO con el usuario existente
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  /**
   * Elimina un usuario (soft delete manteniendo el registro)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = false;
    return this.userRepository.save(user);
  }

  /**
   * Cuenta el total de usuarios
   */
  async count(): Promise<number> {
    return this.userRepository.count();
  }

  /**
   * Busca usuarios activos
   */
  async findActive(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: true },
      order: { created_at: 'DESC' },
    });
  }
}
