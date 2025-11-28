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

      // Insertar tipos de permisos
      await manager
        .createQueryBuilder()
        .insert()
        .into(TypePermission)
        .values([
          { id: 1, key: 'create', name: 'Create', description: 'Permission to create resources', created_by: user.id },
          { id: 2, key: 'delete', name: 'Delete', description: 'Permission to delete resources', created_by: user.id },
          { id: 3, key: 'view', name: 'View', description: 'Permission to view resources', created_by: user.id },
        ])
        .execute();

      const permissions = await manager.find(TypePermission);

      // Insertar secciones del sistema
      await manager
        .createQueryBuilder()
        .insert()
        .into(SystemSection)
        .values([
          // Configuración de Sistema y Usuarios
          { id: 1, key: 'users', name: 'Usuarios', status: true, created_by: user.id },
          { id: 2, key: 'profiles', name: 'Perfiles', status: true, created_by: user.id },

          // Catálogo e Inventario
          { id: 3, key: 'products', name: 'Productos', status: true, created_by: user.id },
          { id: 4, key: 'subproducts', name: 'Productos Variantes', status: true, created_by: user.id },
          { id: 5, key: 'seller-product-prices', name: 'Tarifas y Precios', status: true, created_by: user.id },

          // Operaciones de Venta
          { id: 6, key: 'sellers', name: 'Vendedores', status: true, created_by: user.id },
          { id: 7, key: 'sale', name: 'Venta', status: true, created_by: user.id },
          { id: 8, key: 'saleDetails', name: 'Detalle Ventas', status: true, created_by: user.id },
          { id: 9, key: 'orders', name: 'Ordenes', status: true, created_by: user.id },

          // Cierre y Contabilidad
          { id: 10, key: 'deductions', name: 'Deducciones', status: true, created_by: user.id },
          { id: 11, key: 'periods', name: 'Periodos', status: true, created_by: user.id },
          { id: 12, key: 'cashCuts', name: 'Corte de caja', status: true, created_by: user.id },

          // Reportes y Análisis
          { id: 13, key: 'reports', name: 'Reportes', status: true, created_by: user.id },
        ])
        .execute();

      const sections = await manager.find(SystemSection);

      // Insertar permisos por sección
      const sectionPermissionValues: { section_id: number; permission_id: number; status: boolean; created_by: string }[] = [];
      sections.forEach((section) => {
        permissions.forEach((permission) => {
          sectionPermissionValues.push({
            section_id: section.id,
            permission_id: permission.id,
            status: true,
            created_by: user.id,
          });
        });
      });

      await manager.createQueryBuilder().insert().into(SectionPermission).values(sectionPermissionValues).execute();

      const insertedSectionPermissions = await manager.find(SectionPermission);

      // Asignar todos los permisos al perfil Master
      const permissionSystemValues = insertedSectionPermissions.map((sp) => ({
        profile_id: profile.id,
        section_permission_id: sp.id,
        status: true,
        created_by: user.id,
      }));

      await manager.createQueryBuilder().insert().into(PermissionSystem).values(permissionSystemValues).execute();

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
