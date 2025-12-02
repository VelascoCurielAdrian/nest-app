import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionSystem } from './entities/permission-system.entity';
import { Profile } from './entities/profile.entity';
import { SectionPermission } from './entities/section-permission.entity';
import { SystemSection } from './entities/system-section.entity';
import { TypePermission } from './entities/type-permission.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { PermissionNode, SessionData, UserWithProfile } from './interfaces/session.interface';

@Injectable()
export class UsersService {
  constructor(
    // Repositorios inyectados para las entidades User, UserProfile y Profile
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    // Repositorios para el sistema de permisos
    @InjectRepository(PermissionSystem)
    private readonly permissionSystemRepository: Repository<PermissionSystem>,
    @InjectRepository(SectionPermission)
    private readonly sectionPermissionRepository: Repository<SectionPermission>,
    @InjectRepository(SystemSection)
    private readonly systemSectionRepository: Repository<SystemSection>,
    @InjectRepository(TypePermission)
    private readonly typePermissionRepository: Repository<TypePermission>
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
        return { ...sessionData, permissions: [] };
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
   * Obtiene los permisos para un perfil específico con soporte para herencia jerárquica
   * Retorna una estructura jerárquica con las secciones y sus hijos
   * Implementa la lógica de herencia basada en parent_id e inherit_from_parent
   */
  private async getPermissionsForProfile(profile_id: string): Promise<PermissionNode[]> {
    try {
      const directPermissions = await this.fetchDirectPermissions(profile_id);
      if (directPermissions.length === 0) {
        return [];
      }

      // Obtener todos los tipos de permisos para mapear ID a detalle
      const allPermissionTypes = await this.typePermissionRepository.find({ where: { status: true } });
      const permissionTypeMap = new Map(allPermissionTypes.map((p) => [p.id, { id: p.id, key: p.key, name: p.name }]));

      const allSections = await this.systemSectionRepository.find({ where: { status: true }, order: { id: 'ASC' } });
      const sectionMap = new Map<number, SystemSection>(allSections.map((s) => [s.id, s]));
      const permissionsBySection = this.groupPermissionsBySection(directPermissions);
      const finalPermissions = this.buildFinalPermissions(permissionsBySection, sectionMap, directPermissions, allSections);

      return this.buildHierarchicalPermissions(allSections, finalPermissions, permissionTypeMap);
    } catch (error) {
      console.error('Error getting permissions for profile:', error);
      return [];
    }
  }

  /**
   * Obtiene los permisos directos del perfil desde la base de datos
   */
  private async fetchDirectPermissions(profile_id: string) {
    return this.permissionSystemRepository
      .createQueryBuilder('ps')
      .select('ss.id', 'section_id')
      .addSelect('ss.key', 'section_key')
      .addSelect('ss.parent_id', 'parent_id')
      .addSelect('ss.path', 'path')
      .addSelect('tp.id', 'permission_id')
      .addSelect('sp.inherit_from_parent', 'inherit_from_parent')
      .innerJoin('ps.sectionPermission', 'sp')
      .innerJoin('sp.section', 'ss')
      .innerJoin('sp.permission', 'tp')
      .where('ps.profile_id = :profile_id', { profile_id })
      .andWhere('ps.status = :status', { status: true })
      .andWhere('sp.status = :status', { status: true })
      .andWhere('tp.status = :status', { status: true })
      .andWhere('ss.status = :status', { status: true })
      .getRawMany<{
        section_id: number;
        section_key: string;
        parent_id: number | null;
        path: string;
        permission_id: number;
        inherit_from_parent: boolean;
      }>();
  }

  /**
   * Agrupa los permisos por ID de sección
   */
  private groupPermissionsBySection(directPermissions: Array<{ section_id: number; permission_id: number }>): Map<number, Set<number>> {
    const permissionsBySection = new Map<number, Set<number>>();
    for (const perm of directPermissions) {
      if (!permissionsBySection.has(perm.section_id)) {
        permissionsBySection.set(perm.section_id, new Set());
      }
      permissionsBySection.get(perm.section_id)!.add(perm.permission_id);
    }
    return permissionsBySection;
  }

  /**
   * Construye los permisos finales aplicando herencia
   */
  private buildFinalPermissions(
    permissionsBySection: Map<number, Set<number>>,
    sectionMap: Map<number, SystemSection>,
    directPermissions: Array<{ section_id: number; inherit_from_parent: boolean }>,
    allSections: SystemSection[]
  ): Map<string, Set<number>> {
    const finalPermissions = new Map<string, Set<number>>();

    for (const [sectionId, permissions] of permissionsBySection.entries()) {
      const section = sectionMap.get(sectionId);
      if (!section) {
        continue;
      }

      this.addSectionPermissions(finalPermissions, section.key, permissions);
      this.inheritParentPermissions(finalPermissions, section, sectionId, directPermissions, sectionMap, permissionsBySection);
      this.propagateToChildSections(finalPermissions, sectionId, permissions, directPermissions, allSections);
    }

    return finalPermissions;
  }

  /**
   * Agrega permisos directos a una sección
   */
  private addSectionPermissions(finalPermissions: Map<string, Set<number>>, sectionKey: string, permissions: Set<number>): void {
    if (!finalPermissions.has(sectionKey)) {
      finalPermissions.set(sectionKey, new Set());
    }
    permissions.forEach((p) => finalPermissions.get(sectionKey)!.add(p));
  }

  /**
   * Hereda permisos del padre si está habilitado inherit_from_parent
   */
  private inheritParentPermissions(
    finalPermissions: Map<string, Set<number>>,
    section: SystemSection,
    sectionId: number,
    directPermissions: Array<{ section_id: number; inherit_from_parent: boolean }>,
    sectionMap: Map<number, SystemSection>,
    permissionsBySection: Map<number, Set<number>>
  ): void {
    const hasInheritance = directPermissions.some((dp) => dp.section_id === sectionId && dp.inherit_from_parent);
    if (!hasInheritance || section.parent_id === null) {
      return;
    }

    const parentId: number = section.parent_id;
    const parentPermissions = permissionsBySection.get(parentId);
    if (parentPermissions) {
      parentPermissions.forEach((p) => finalPermissions.get(section.key)!.add(p));
    }
  }

  /**
   * Propaga permisos a secciones hijas si tienen herencia habilitada
   */
  private propagateToChildSections(
    finalPermissions: Map<string, Set<number>>,
    sectionId: number,
    permissions: Set<number>,
    directPermissions: Array<{ section_id: number; inherit_from_parent: boolean }>,
    allSections: SystemSection[]
  ): void {
    for (const childSection of allSections) {
      if (childSection.parent_id !== sectionId) {
        continue;
      }

      const hasChildInheritance = directPermissions.some((dp) => dp.section_id === childSection.id && dp.inherit_from_parent);
      if (!hasChildInheritance) {
        continue;
      }

      if (!finalPermissions.has(childSection.key)) {
        finalPermissions.set(childSection.key, new Set());
      }
      permissions.forEach((p) => finalPermissions.get(childSection.key)!.add(p));
    }
  }

  /**
   * Convierte el Map de permisos a un Record con arrays ordenados
   */
  private convertPermissionsToRecord(finalPermissions: Map<string, Set<number>>): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    for (const [key, permissions] of finalPermissions.entries()) {
      result[key] = Array.from(permissions).sort((a, b) => a - b);
    }
    return result;
  }

  /**
   * Construye una estructura jerárquica de permisos con detalles completos
   */
  private buildHierarchicalPermissions(
    allSections: SystemSection[],
    finalPermissions: Map<string, Set<number>>,
    permissionTypeMap: Map<number, { id: number; key: string; name: string }>
  ): PermissionNode[] {
    const sectionMap = new Map<number, PermissionNode>();
    const rootSections: PermissionNode[] = [];

    // Crear nodos para cada sección con detalles de permisos
    for (const section of allSections) {
      const permissionIds = finalPermissions.get(section.key);
      if (!permissionIds) {
        continue;
      }

      // Convertir IDs a detalles completos de permisos
      const permissionDetails = Array.from(permissionIds)
        .map((id) => permissionTypeMap.get(id))
        .filter((p): p is { id: number; key: string; name: string } => p !== undefined)
        .sort((a, b) => a.id - b.id);

      const node: PermissionNode = {
        id: section.id,
        key: section.key,
        name: section.name,
        permissions: permissionDetails,
        children: [],
      };

      sectionMap.set(section.id, node);
    }

    // Construir jerarquía
    for (const section of allSections) {
      const node = sectionMap.get(section.id);
      if (!node) {
        continue;
      }

      if (section.parent_id === null) {
        rootSections.push(node);
      } else {
        const parentId: number = section.parent_id;
        const parent = sectionMap.get(parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    }

    // Limpiar nodos sin hijos (eliminar array vacío)
    const cleanNode = (node: PermissionNode): void => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        node.children.forEach(cleanNode);
      }
    };

    rootSections.forEach(cleanNode);
    return rootSections;
  }
}
