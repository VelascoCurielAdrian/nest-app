import { PermissionSystem } from '../../modules/users/entities/permission-system.entity';
import { SectionPermission } from '../../modules/users/entities/section-permission.entity';
import { SystemSection } from '../../modules/users/entities/system-section.entity';
import { TypePermission } from '../../modules/users/entities/type-permission.entity';

import type { DataSource } from 'typeorm';

/**
 * Seed para el sistema de permisos
 * Crea las secciones del sistema, tipos de permisos y las relaciones necesarias
 */
export async function seedPermissionsSystem(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.info('🔐 Starting permissions system seed...');

    const systemSectionRepository = queryRunner.manager.getRepository(SystemSection);
    const typePermissionRepository = queryRunner.manager.getRepository(TypePermission);
    const sectionPermissionRepository = queryRunner.manager.getRepository(SectionPermission);
    const permissionSystemRepository = queryRunner.manager.getRepository(PermissionSystem);

    // 1. Crear tipos de permisos básicos
    const permissionTypes = typePermissionRepository.create([
      { key: 'read', name: 'Lectura', description: 'Permiso para leer/visualizar', status: true },
      { key: 'write', name: 'Escritura', description: 'Permiso para crear/editar', status: true },
      { key: 'delete', name: 'Eliminación', description: 'Permiso para eliminar', status: true },
      { key: 'export', name: 'Exportar', description: 'Permiso para exportar datos', status: true },
    ]);
    await typePermissionRepository.save(permissionTypes);
    console.info(`✅ ${permissionTypes.length} permission types created`);

    // 2. Crear secciones del sistema
    const systemSections = systemSectionRepository.create([
      { key: 'users', name: 'Usuarios', description: 'Gestión de usuarios', status: true },
      { key: 'products', name: 'Productos', description: 'Gestión de productos', status: true },
      { key: 'sales', name: 'Ventas', description: 'Gestión de ventas', status: true },
      { key: 'reports', name: 'Reportes', description: 'Visualización de reportes', status: true },
      { key: 'settings', name: 'Configuración', description: 'Configuración del sistema', status: true },
    ]);
    await systemSectionRepository.save(systemSections);
    console.info(`✅ ${systemSections.length} system sections created`);

    // 3. Crear relaciones entre secciones y permisos (todos los permisos para todas las secciones)
    const sectionPermissions: SectionPermission[] = [];
    for (const section of systemSections) {
      for (const permission of permissionTypes) {
        const sectionPermission = sectionPermissionRepository.create({
          section_id: section.id,
          permission_id: permission.id,
          status: true,
        });
        sectionPermissions.push(sectionPermission);
      }
    }
    await sectionPermissionRepository.save(sectionPermissions);
    console.info(`✅ ${sectionPermissions.length} section-permission relations created`);

    // 4. Asignar TODOS los permisos al perfil Master (si existe)
    // Nota: Esto requiere que el seed de master-user se ejecute primero
    const masterProfile: Array<{ id: string }> = await queryRunner.manager.query(`SELECT id FROM profile WHERE name = 'Master' LIMIT 1`);

    if (masterProfile && masterProfile.length > 0) {
      const profileId = masterProfile[0].id;
      const permissionSystems: PermissionSystem[] = [];

      for (const sectionPermission of sectionPermissions) {
        const permissionSystem = permissionSystemRepository.create({
          profile_id: profileId,
          section_permission_id: sectionPermission.id,
          status: true,
        });
        permissionSystems.push(permissionSystem);
      }

      await permissionSystemRepository.save(permissionSystems);
      console.info(`✅ ${permissionSystems.length} permissions assigned to Master profile`);
    } else {
      console.warn('⚠️  Master profile not found. Skipping permission assignment.');
    }

    await queryRunner.commitTransaction();
    console.info('✅ Permissions system seed completed');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding permissions system:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
