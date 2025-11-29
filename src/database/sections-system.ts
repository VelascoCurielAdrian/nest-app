import { AppDataSource } from './data-source';
import { PermissionSystem } from '../modules/users/entities/permission-system.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { SectionPermission } from '../modules/users/entities/section-permission.entity';
import { SystemSection } from '../modules/users/entities/system-section.entity';
import { TypePermission } from '../modules/users/entities/type-permission.entity';
import { User } from '../modules/users/entities/user.entity';

async function seedSectionsSystem() {
  const dataSource = AppDataSource;

  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    try {
      // Limpiar tablas en el orden correcto para evitar errores de FK
      await manager.createQueryBuilder().delete().from(PermissionSystem).execute();
      await manager.createQueryBuilder().delete().from(SectionPermission).execute();
      await manager.createQueryBuilder().delete().from(SystemSection).execute();
      await manager.createQueryBuilder().delete().from(TypePermission).execute();

      // Obtener usuario 'master'
      const user = await manager.findOne(User, { where: { username: 'master' } });
      if (!user) {
        throw new Error("El usuario 'master' no fue encontrado.");
      }

      // Obtener perfil 'Master'
      const profile = await manager.findOne(Profile, { where: { name: 'Master' } });
      if (!profile) {
        throw new Error("El perfil 'Master' no fue encontrado.");
      }

      // Crear tipos de permisos usando entidades
      const permissionsData = [
        { key: 'create', name: 'Create', description: 'Permission to create resources' },
        { key: 'delete', name: 'Delete', description: 'Permission to delete resources' },
        { key: 'view', name: 'View', description: 'Permission to view resources' },
        { key: 'edit', name: 'Edit', description: 'Permission to edit resources' },
        { key: 'list', name: 'List', description: 'Permission to list resources' },
        { key: 'export', name: 'Export', description: 'Permission to export resources' },
        { key: 'import', name: 'Import', description: 'Permission to import resources' },
        { key: 'approve', name: 'Approve', description: 'Permission to approve resources' },
        { key: 'reject', name: 'Reject', description: 'Permission to reject resources' },
        { key: 'archive', name: 'Archive', description: 'Permission to archive resources' },
        { key: 'restore', name: 'Restore', description: 'Permission to restore resources' },
      ];

      const permissions: TypePermission[] = [];
      for (const permData of permissionsData) {
        const permission = manager.create(TypePermission, {
          ...permData,
          status: true,
          created_by: user.id,
        });
        const savedPermission = await manager.save(TypePermission, permission);
        permissions.push(savedPermission);
      }

      console.info(`✅ ${permissions.length} tipos de permisos creados`);

      // Crear secciones del sistema usando entidades
      const sectionsData = [
        { key: 'users', name: 'Usuarios', description: 'Gestión de usuarios del sistema', parent_id: null },
        { key: 'profiles', name: 'Perfiles', description: 'Gestión de perfiles de usuario', parent_id: null },
        { key: 'products', name: 'Productos', description: 'Gestión de productos', parent_id: null },
        { key: 'sales', name: 'Ventas', description: 'Gestión de ventas', parent_id: null },
        { key: 'reports', name: 'Reportes', description: 'Generación de reportes', parent_id: null },
        { key: 'settings', name: 'Configuración', description: 'Configuración del sistema', parent_id: null },
      ];

      const sections: SystemSection[] = [];
      for (const sectionData of sectionsData) {
        const section = manager.create(SystemSection, {
          ...sectionData,
          status: true,
          sort_order: 0,
          created_by: user.id,
        });
        const savedSection = await manager.save(SystemSection, section);
        sections.push(savedSection);
      }

      // Crear submódulos bajo "users"
      const usersSection = sections.find((s) => s.key === 'users');
      if (usersSection) {
        const submodulesData = [
          {
            key: 'user-management',
            name: 'Gestión de Usuarios',
            description: 'Administración de usuarios',
            parent_id: usersSection.id,
          },
          {
            key: 'user-reports',
            name: 'Reportes de Usuarios',
            description: 'Reportes relacionados con usuarios',
            parent_id: usersSection.id,
          },
        ];

        for (const submoduleData of submodulesData) {
          const submodule = manager.create(SystemSection, {
            ...submoduleData,
            status: true,
            sort_order: 0,
            created_by: user.id,
          });
          const savedSubmodule = await manager.save(SystemSection, submodule);
          sections.push(savedSubmodule);
        }
      }

      // Crear permisos específicos por sección
      const sectionPermissions: SectionPermission[] = [];
      // Obtener secciones específicas
      const userManagementSection = sections.find((s) => s.key === 'user-management');
      const userReportsSection = sections.find((s) => s.key === 'user-reports');
      // Permisos para user-management: create, view, edit, list, export
      if (userManagementSection) {
        const managementPermissionKeys = ['create', 'view', 'edit', 'list', 'export'];
        const managementPermissions = permissions.filter((p) => managementPermissionKeys.includes(p.key));
        for (const permission of managementPermissions) {
          const sectionPermission = manager.create(SectionPermission, {
            section_id: userManagementSection.id,
            permission_id: permission.id,
            inherit_from_parent: true,
            status: true,
            created_by: user.id,
          });
          const savedSectionPermission = await manager.save(SectionPermission, sectionPermission);
          sectionPermissions.push(savedSectionPermission);
        }
      }

      // Permisos para user-reports: view
      if (userReportsSection) {
        const viewPermission = permissions.find((p) => p.key === 'view');
        if (viewPermission) {
          const sectionPermission = manager.create(SectionPermission, {
            section_id: userReportsSection.id,
            permission_id: viewPermission.id,
            inherit_from_parent: true,
            status: true,
            created_by: user.id,
          });
          const savedSectionPermission = await manager.save(SectionPermission, sectionPermission);
          sectionPermissions.push(savedSectionPermission);
        }
      }
      // Asignar todos los permisos a las secciones principales (no submódulos)
      const mainSections = sections.filter((s) => s.parent_id === null);
      for (const section of mainSections) {
        for (const permission of permissions) {
          const sectionPermission = manager.create(SectionPermission, {
            section_id: section.id,
            permission_id: permission.id,
            inherit_from_parent: true,
            status: true,
            created_by: user.id,
          });
          const savedSectionPermission = await manager.save(SectionPermission, sectionPermission);
          sectionPermissions.push(savedSectionPermission);
        }
      }

      console.info(`✅ ${sectionPermissions.length} permisos de sección creados`);

      // Asignar todos los permisos al perfil Master usando entidades
      const permissionSystems: PermissionSystem[] = [];
      for (const sectionPermission of sectionPermissions) {
        const permissionSystem = manager.create(PermissionSystem, {
          profile_id: profile.id,
          section_permission_id: sectionPermission.id,
          status: true,
          created_by: user.id,
        });
        const savedPermissionSystem = await manager.save(PermissionSystem, permissionSystem);
        permissionSystems.push(savedPermissionSystem);
      }

      console.info(`✅ ${permissionSystems.length} permisos asignados al perfil Master`);

      console.info('✅ Secciones y permisos del sistema insertados correctamente.');
    } catch (error) {
      console.error('❌ Error al insertar secciones y permisos del sistema:', error);
      throw error;
    }
  });

  await dataSource.destroy();
}

seedSectionsSystem().catch(console.error);
// npx ts-node src/database/sections-system.ts
