import { AppDataSource } from './data-source';
import { PermissionSystem } from '../modules/users/entities/permission-system.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { SectionPermission } from '../modules/users/entities/section-permission.entity';
import { SystemSection } from '../modules/users/entities/system-section.entity';
import { TypePermission } from '../modules/users/entities/type-permission.entity';
import { User } from '../modules/users/entities/user.entity';

// Definición de datos base
const PERMISSION_TYPES = [
  { key: 'create', name: 'Crear', description: 'Permiso para crear nuevos recursos' },
  { key: 'delete', name: 'Eliminar', description: 'Permiso para eliminar recursos' },
  { key: 'view', name: 'Ver', description: 'Permiso para visualizar detalles de recursos' },
  { key: 'edit', name: 'Editar', description: 'Permiso para modificar recursos existentes' },
  { key: 'list', name: 'Listar', description: 'Permiso para listar y buscar recursos' },
  { key: 'export', name: 'Exportar', description: 'Permiso para exportar datos' },
  { key: 'import', name: 'Importar', description: 'Permiso para importar datos' },
  { key: 'approve', name: 'Aprobar', description: 'Permiso para aprobar solicitudes o recursos' },
  { key: 'reject', name: 'Rechazar', description: 'Permiso para rechazar solicitudes o recursos' },
  { key: 'archive', name: 'Archivar', description: 'Permiso para archivar recursos' },
  { key: 'restore', name: 'Restaurar', description: 'Permiso para restaurar recursos archivados' },
];

const SYSTEM_SECTIONS = [
  { key: 'users', name: 'Usuarios', description: 'Gestión de usuarios del sistema', order: 1 },
  { key: 'profiles', name: 'Perfiles', description: 'Gestión de perfiles de usuario', order: 2 },
  { key: 'reports', name: 'Reportes', description: 'Generación de reportes', order: 5 },
  { key: 'settings', name: 'Configuración', description: 'Configuración del sistema', order: 6 },
];

const SUBSECTIONS = [
  { key: 'user-management', name: 'Gestión de Usuarios', description: 'Administración completa de usuarios', parent: 'users', order: 1 },
  { key: 'user-reports', name: 'Reportes de Usuarios', description: 'Reportes relacionados con usuarios', parent: 'users', order: 2 },
];

// Mapa de permisos por sección (usando keys de permisos)
const SECTION_PERMISSIONS_MAP = {
  users: ['view'],
  'user-management': ['create', 'view', 'edit', 'list', 'export'],
  'user-reports': ['view', 'export'],
  profiles: ['create', 'delete', 'view', 'edit', 'list'],
  reports: ['view', 'export'],
  settings: ['view', 'edit'],
};

async function seedSectionsSystem() {
  const dataSource = AppDataSource;
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    try {
      // Limpiar tablas
      await manager.createQueryBuilder().delete().from(PermissionSystem).execute();
      await manager.createQueryBuilder().delete().from(SectionPermission).execute();
      await manager.createQueryBuilder().delete().from(SystemSection).execute();
      await manager.createQueryBuilder().delete().from(TypePermission).execute();

      // Obtener referencias base
      const user = await manager.findOne(User, { where: { username: 'master' } });
      if (!user) {
        throw new Error("El usuario 'master' no fue encontrado.");
      }

      const profile = await manager.findOne(Profile, { where: { name: 'Master' } });
      if (!profile) {
        throw new Error("El perfil 'Master' no fue encontrado.");
      }
      console.info('📝 Creando tipos de permisos base...');
      const permissionsMap = new Map<string, TypePermission>();

      for (const permType of PERMISSION_TYPES) {
        const permission = await manager.save(
          TypePermission,
          manager.create(TypePermission, {
            ...permType,
            status: true,
            created_by: user.id,
          })
        );
        permissionsMap.set(permType.key, permission);
      }
      console.info(`✅ ${permissionsMap.size} tipos de permisos creados`);

      // ==========================================
      // 2. CREAR SECCIONES PRINCIPALES
      // ==========================================
      console.info('📂 Creando secciones principales...');
      const sectionsMap = new Map<string, SystemSection>();

      for (const section of SYSTEM_SECTIONS) {
        const savedSection = await manager.save(
          SystemSection,
          manager.create(SystemSection, {
            key: section.key,
            name: section.name,
            description: section.description,
            parent_id: null,
            status: true,
            sort_order: section.order,
            created_by: user.id,
          })
        );
        sectionsMap.set(section.key, savedSection);
      }
      console.info(`✅ ${sectionsMap.size} secciones principales creadas`);

      // ==========================================
      // 3. CREAR SUBSECCIONES
      // ==========================================
      console.info('📂 Creando subsecciones...');
      for (const subsection of SUBSECTIONS) {
        const parentSection = sectionsMap.get(subsection.parent);
        if (!parentSection) {
          continue;
        }

        const savedSubsection = await manager.save(
          SystemSection,
          manager.create(SystemSection, {
            key: subsection.key,
            name: subsection.name,
            description: subsection.description,
            parent_id: parentSection.id,
            status: true,
            sort_order: subsection.order,
            created_by: user.id,
          })
        );
        sectionsMap.set(subsection.key, savedSubsection);
      }
      console.info(`✅ ${SUBSECTIONS.length} subsecciones creadas`);

      // ==========================================
      // 4. ASIGNAR PERMISOS A SECCIONES
      // ==========================================
      console.info('🔐 Asignando permisos a secciones...');
      const sectionPermissions: SectionPermission[] = [];

      for (const [sectionKey, permissionKeys] of Object.entries(SECTION_PERMISSIONS_MAP)) {
        const section = sectionsMap.get(sectionKey);
        if (!section) {
          continue;
        }

        console.info(`  → ${section.name}: ${permissionKeys.join(', ')}`);

        for (const permKey of permissionKeys) {
          const permission = permissionsMap.get(permKey);
          if (!permission) {
            continue;
          }

          const sectionPerm = await manager.save(
            SectionPermission,
            manager.create(SectionPermission, {
              section_id: section.id,
              permission_id: permission.id,
              inherit_from_parent: false,
              status: true,
              created_by: user.id,
            })
          );
          sectionPermissions.push(sectionPerm);
        }
      }
      console.info(`✅ ${sectionPermissions.length} permisos asignados a secciones`);

      // ==========================================
      // 5. ASIGNAR PERMISOS AL PERFIL MASTER
      // ==========================================
      console.info('👤 Asignando permisos al perfil Master...');
      const permissionSystems = await Promise.all(
        sectionPermissions.map((sp) =>
          manager.save(
            PermissionSystem,
            manager.create(PermissionSystem, {
              profile_id: profile.id,
              section_permission_id: sp.id,
              status: true,
              created_by: user.id,
            })
          )
        )
      );
      console.info(`✅ ${permissionSystems.length} permisos asignados al perfil Master`);

      console.info('');
      console.info('✅ ==========================================');
      console.info('✅ SEED COMPLETADO EXITOSAMENTE');
      console.info('✅ ==========================================');
      console.info(`   Tipos de permisos: ${permissionsMap.size}`);
      console.info(`   Secciones totales: ${sectionsMap.size}`);
      console.info(`   Permisos asignados: ${sectionPermissions.length}`);
      console.info(`   Permisos del perfil Master: ${permissionSystems.length}`);
      console.info('✅ ==========================================');
    } catch (error) {
      console.error('');
      console.error('❌ ==========================================');
      console.error('❌ ERROR AL EJECUTAR EL SEED');
      console.error('❌ ==========================================');
      console.error(error);
      console.error('❌ ==========================================');
      throw error;
    }
  });

  await dataSource.destroy();
}

seedSectionsSystem().catch(console.error);
// npx ts-node src/database/sections-system.ts
