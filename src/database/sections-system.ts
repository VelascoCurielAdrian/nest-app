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

      // ==========================================
      // 1. CREAR TIPOS DE PERMISOS BASE
      // ==========================================
      console.info('📝 Creando tipos de permisos base...');

      const permissionCreate = manager.create(TypePermission, {
        key: 'create',
        name: 'Crear',
        description: 'Permiso para crear nuevos recursos',
        status: true,
        created_by: user.id,
      });
      const savedCreate = await manager.save(TypePermission, permissionCreate);

      const permissionDelete = manager.create(TypePermission, {
        key: 'delete',
        name: 'Eliminar',
        description: 'Permiso para eliminar recursos',
        status: true,
        created_by: user.id,
      });
      const savedDelete = await manager.save(TypePermission, permissionDelete);

      const permissionView = manager.create(TypePermission, {
        key: 'view',
        name: 'Ver',
        description: 'Permiso para visualizar detalles de recursos',
        status: true,
        created_by: user.id,
      });
      const savedView = await manager.save(TypePermission, permissionView);

      const permissionEdit = manager.create(TypePermission, {
        key: 'edit',
        name: 'Editar',
        description: 'Permiso para modificar recursos existentes',
        status: true,
        created_by: user.id,
      });
      const savedEdit = await manager.save(TypePermission, permissionEdit);

      const permissionList = manager.create(TypePermission, {
        key: 'list',
        name: 'Listar',
        description: 'Permiso para listar y buscar recursos',
        status: true,
        created_by: user.id,
      });
      const savedList = await manager.save(TypePermission, permissionList);

      const permissionExport = manager.create(TypePermission, {
        key: 'export',
        name: 'Exportar',
        description: 'Permiso para exportar datos',
        status: true,
        created_by: user.id,
      });
      const savedExport = await manager.save(TypePermission, permissionExport);

      const permissionImport = manager.create(TypePermission, {
        key: 'import',
        name: 'Importar',
        description: 'Permiso para importar datos',
        status: true,
        created_by: user.id,
      });
      const savedImport = await manager.save(TypePermission, permissionImport);

      const permissionApprove = manager.create(TypePermission, {
        key: 'approve',
        name: 'Aprobar',
        description: 'Permiso para aprobar solicitudes o recursos',
        status: true,
        created_by: user.id,
      });
      const savedApprove = await manager.save(TypePermission, permissionApprove);

      const permissionReject = manager.create(TypePermission, {
        key: 'reject',
        name: 'Rechazar',
        description: 'Permiso para rechazar solicitudes o recursos',
        status: true,
        created_by: user.id,
      });
      const savedReject = await manager.save(TypePermission, permissionReject);

      const permissionArchive = manager.create(TypePermission, {
        key: 'archive',
        name: 'Archivar',
        description: 'Permiso para archivar recursos',
        status: true,
        created_by: user.id,
      });
      const savedArchive = await manager.save(TypePermission, permissionArchive);

      const permissionRestore = manager.create(TypePermission, {
        key: 'restore',
        name: 'Restaurar',
        description: 'Permiso para restaurar recursos archivados',
        status: true,
        created_by: user.id,
      });
      const savedRestore = await manager.save(TypePermission, permissionRestore);

      console.info(`✅ 11 tipos de permisos creados exitosamente`);

      // ==========================================
      // 2. CREAR SECCIONES PRINCIPALES DEL SISTEMA
      // ==========================================
      console.info('📂 Creando secciones principales...');

      const sectionUsers = manager.create(SystemSection, {
        key: 'users',
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema',
        parent_id: null,
        status: true,
        sort_order: 1,
        created_by: user.id,
      });
      const savedUsers = await manager.save(SystemSection, sectionUsers);

      const sectionProfiles = manager.create(SystemSection, {
        key: 'profiles',
        name: 'Perfiles',
        description: 'Gestión de perfiles de usuario',
        parent_id: null,
        status: true,
        sort_order: 2,
        created_by: user.id,
      });
      const savedProfiles = await manager.save(SystemSection, sectionProfiles);

      const sectionProducts = manager.create(SystemSection, {
        key: 'products',
        name: 'Productos',
        description: 'Gestión de productos',
        parent_id: null,
        status: true,
        sort_order: 3,
        created_by: user.id,
      });
      const savedProducts = await manager.save(SystemSection, sectionProducts);

      const sectionSales = manager.create(SystemSection, {
        key: 'sales',
        name: 'Ventas',
        description: 'Gestión de ventas',
        parent_id: null,
        status: true,
        sort_order: 4,
        created_by: user.id,
      });
      const savedSales = await manager.save(SystemSection, sectionSales);

      const sectionReports = manager.create(SystemSection, {
        key: 'reports',
        name: 'Reportes',
        description: 'Generación de reportes',
        parent_id: null,
        status: true,
        sort_order: 5,
        created_by: user.id,
      });
      const savedReports = await manager.save(SystemSection, sectionReports);

      const sectionSettings = manager.create(SystemSection, {
        key: 'settings',
        name: 'Configuración',
        description: 'Configuración del sistema',
        parent_id: null,
        status: true,
        sort_order: 6,
        created_by: user.id,
      });
      const savedSettings = await manager.save(SystemSection, sectionSettings);

      console.info('✅ 6 secciones principales creadas');

      // ==========================================
      // 3. CREAR SUBSECCIONES (MÓDULOS ANIDADOS)
      // ==========================================
      console.info('📂 Creando subsecciones...');

      const subUserManagement = manager.create(SystemSection, {
        key: 'user-management',
        name: 'Gestión de Usuarios',
        description: 'Administración completa de usuarios',
        parent_id: savedUsers.id,
        status: true,
        sort_order: 1,
        created_by: user.id,
      });
      const savedUserManagement = await manager.save(SystemSection, subUserManagement);

      const subUserReports = manager.create(SystemSection, {
        key: 'user-reports',
        name: 'Reportes de Usuarios',
        description: 'Reportes relacionados con usuarios',
        parent_id: savedUsers.id,
        status: true,
        sort_order: 2,
        created_by: user.id,
      });
      const savedUserReports = await manager.save(SystemSection, subUserReports);

      console.info('✅ 2 subsecciones creadas');

      // ==========================================
      // 4. ASIGNAR PERMISOS ESPECÍFICOS A CADA SECCIÓN
      // ==========================================
      console.info('🔐 Asignando permisos específicos a cada sección...');

      const sectionPermissions: SectionPermission[] = [];

      // --------------------------------------------
      // SECCIÓN: USUARIOS (Módulo principal)
      // Permisos: create, delete, view, edit, list
      // --------------------------------------------
      console.info('  → Usuarios: create, delete, view, edit, list');
      const permUsersCreate = manager.create(SectionPermission, {
        section_id: savedUsers.id,
        permission_id: savedCreate.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUsersCreate));

      const permUsersDelete = manager.create(SectionPermission, {
        section_id: savedUsers.id,
        permission_id: savedDelete.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUsersDelete));

      const permUsersView = manager.create(SectionPermission, {
        section_id: savedUsers.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUsersView));

      const permUsersEdit = manager.create(SectionPermission, {
        section_id: savedUsers.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUsersEdit));

      const permUsersList = manager.create(SectionPermission, {
        section_id: savedUsers.id,
        permission_id: savedList.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUsersList));

      // --------------------------------------------
      // SUBSECCIÓN: GESTIÓN DE USUARIOS
      // Permisos: create, view, edit, list, export
      // inherit_from_parent: false (solo permisos propios)
      // --------------------------------------------
      console.info('  → Gestión de Usuarios: create, view, edit, list, export');
      const permUserMgmtCreate = manager.create(SectionPermission, {
        section_id: savedUserManagement.id,
        permission_id: savedCreate.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserMgmtCreate));

      const permUserMgmtView = manager.create(SectionPermission, {
        section_id: savedUserManagement.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserMgmtView));

      const permUserMgmtEdit = manager.create(SectionPermission, {
        section_id: savedUserManagement.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserMgmtEdit));

      const permUserMgmtList = manager.create(SectionPermission, {
        section_id: savedUserManagement.id,
        permission_id: savedList.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserMgmtList));

      const permUserMgmtExport = manager.create(SectionPermission, {
        section_id: savedUserManagement.id,
        permission_id: savedExport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserMgmtExport));

      // --------------------------------------------
      // SUBSECCIÓN: REPORTES DE USUARIOS
      // Permisos: view, export
      // inherit_from_parent: false (solo permisos propios)
      // --------------------------------------------
      console.info('  → Reportes de Usuarios: view, export');
      const permUserReportsView = manager.create(SectionPermission, {
        section_id: savedUserReports.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserReportsView));

      const permUserReportsExport = manager.create(SectionPermission, {
        section_id: savedUserReports.id,
        permission_id: savedExport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permUserReportsExport));

      // --------------------------------------------
      // SECCIÓN: PERFILES
      // Permisos: create, delete, view, edit, list
      // --------------------------------------------
      console.info('  → Perfiles: create, delete, view, edit, list');
      const permProfilesCreate = manager.create(SectionPermission, {
        section_id: savedProfiles.id,
        permission_id: savedCreate.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProfilesCreate));

      const permProfilesDelete = manager.create(SectionPermission, {
        section_id: savedProfiles.id,
        permission_id: savedDelete.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProfilesDelete));

      const permProfilesView = manager.create(SectionPermission, {
        section_id: savedProfiles.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProfilesView));

      const permProfilesEdit = manager.create(SectionPermission, {
        section_id: savedProfiles.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProfilesEdit));

      const permProfilesList = manager.create(SectionPermission, {
        section_id: savedProfiles.id,
        permission_id: savedList.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProfilesList));

      // --------------------------------------------
      // SECCIÓN: PRODUCTOS
      // Permisos: create, delete, view, edit, list, export, import, archive, restore
      // --------------------------------------------
      console.info('  → Productos: create, delete, view, edit, list, export, import, archive, restore');
      const permProductsCreate = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedCreate.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsCreate));

      const permProductsDelete = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedDelete.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsDelete));

      const permProductsView = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsView));

      const permProductsEdit = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsEdit));

      const permProductsList = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedList.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsList));

      const permProductsExport = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedExport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsExport));

      const permProductsImport = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedImport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsImport));

      const permProductsArchive = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedArchive.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsArchive));

      const permProductsRestore = manager.create(SectionPermission, {
        section_id: savedProducts.id,
        permission_id: savedRestore.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permProductsRestore));

      // --------------------------------------------
      // SECCIÓN: VENTAS
      // Permisos: create, view, edit, list, export, approve, reject
      // --------------------------------------------
      console.info('  → Ventas: create, view, edit, list, export, approve, reject');
      const permSalesCreate = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedCreate.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesCreate));

      const permSalesView = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesView));

      const permSalesEdit = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesEdit));

      const permSalesList = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedList.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesList));

      const permSalesExport = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedExport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesExport));

      const permSalesApprove = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedApprove.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesApprove));

      const permSalesReject = manager.create(SectionPermission, {
        section_id: savedSales.id,
        permission_id: savedReject.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSalesReject));

      // --------------------------------------------
      // SECCIÓN: REPORTES
      // Permisos: view, export
      // --------------------------------------------
      console.info('  → Reportes: view, export');
      const permReportsView = manager.create(SectionPermission, {
        section_id: savedReports.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permReportsView));

      const permReportsExport = manager.create(SectionPermission, {
        section_id: savedReports.id,
        permission_id: savedExport.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permReportsExport));

      // --------------------------------------------
      // SECCIÓN: CONFIGURACIÓN
      // Permisos: view, edit
      // --------------------------------------------
      console.info('  → Configuración: view, edit');
      const permSettingsView = manager.create(SectionPermission, {
        section_id: savedSettings.id,
        permission_id: savedView.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSettingsView));

      const permSettingsEdit = manager.create(SectionPermission, {
        section_id: savedSettings.id,
        permission_id: savedEdit.id,
        inherit_from_parent: false,
        status: true,
        created_by: user.id,
      });
      sectionPermissions.push(await manager.save(SectionPermission, permSettingsEdit));

      console.info(`✅ ${sectionPermissions.length} permisos específicos asignados`);

      // ==========================================
      // 5. ASIGNAR TODOS LOS PERMISOS AL PERFIL MASTER
      // ==========================================
      console.info('👤 Asignando permisos al perfil Master...');

      const permissionSystems: PermissionSystem[] = [];

      // Asignar cada permiso de sección al perfil Master
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

      console.info(`✅ ${permissionSystems.length} permisos asignados exitosamente al perfil Master`);

      console.info('');
      console.info('✅ ==========================================');
      console.info('✅ SEED COMPLETADO EXITOSAMENTE');
      console.info('✅ ==========================================');
      console.info(`   Total tipos de permisos: 11`);
      console.info(`   Total secciones: 8 (6 principales + 2 subsecciones)`);
      console.info(`   Total permisos asignados: ${sectionPermissions.length}`);
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
