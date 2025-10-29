import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './entities/profile.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { SessionData, UserWithProfile } from './interfaces/session.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>
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

  /**
   * Obtiene un usuario con su perfil y permisos
   * Equivalente a getUserWithProfileAndPermissions de Express
   */
  async getUserWithProfileAndPermissions(user_id: string | undefined): Promise<SessionData | undefined> {
    if (!user_id) {
      return undefined;
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id: user_id },
        relations: ['userProfile'],
      });

      if (!user || !user.userProfile) {
        return undefined;
      }

      const userProfile = user.userProfile;
      const sessionData: UserWithProfile = {
        user_id: user.id,
        username: user.username,
        status: user.status,
        id: userProfile.id,
        profile_id: userProfile.profile_id,
        first_name: userProfile.first_name,
        email: userProfile.email,
        last_name: userProfile.last_name,
        gender: userProfile.gender,
        local_number: userProfile.local_number,
        phone_number: userProfile.phone_number,
        avatar_url: userProfile.avatar_url,
      };

      if (!sessionData.profile_id) {
        return { ...sessionData, permissions: {} };
      }

      const permissions = await this.getPermissionsForProfile(sessionData.profile_id);
      return { ...sessionData, permissions };
    } catch (error) {
      console.error('Error getting user with profile and permissions:', error);
      throw error;
    }
  }

  /**
   * Busca un usuario por ID con su perfil
   */
  async findUserWithProfile(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userProfile'],
    });
  }

  /**
   * Crea un perfil de usuario
   */
  async createUserProfile(user_id: string, profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const userProfile = this.userProfileRepository.create({
      user_id,
      ...profileData,
    });
    return this.userProfileRepository.save(userProfile);
  }

  /**
   * Actualiza un perfil de usuario
   */
  async updateUserProfile(user_id: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    const userProfile = await this.userProfileRepository.findOne({
      where: { user_id },
    });

    if (!userProfile) {
      return null;
    }

    Object.assign(userProfile, profileData);
    return this.userProfileRepository.save(userProfile);
  }

  /**
   * Obtiene los permisos para un perfil específico
   */
  private async getPermissionsForProfile(profile_id: string): Promise<Record<string, any>> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: profile_id },
      });

      if (!profile) {
        return {};
      }

      // Implementación básica - personalizar según tu sistema de permisos
      return {
        [profile.name]: {
          read: true,
          write: profile.status,
          delete: profile.status,
        },
      };
    } catch (error) {
      console.error('Error getting permissions for profile:', error);
      return {};
    }
  }
}
