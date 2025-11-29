# Sistema de Permisos

Sistema completo de gestión de permisos basado en roles y secciones del sistema.

## 📊 Estructura de la Base de Datos

### Entidades

```
┌─────────────────┐
│  Profile        │
│  - id (uuid)    │
│  - name         │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼──────────────┐      ┌──────────────────────┐
│  PermissionSystem     │  N:1 │  SectionPermission   │
│  - id                 ├──────►  - id                │
│  - profile_id         │      │  - section_id        │
│  - section_perm_id    │      │  - permission_id     │
│  - status             │      │  - status            │
└───────────────────────┘      └──────┬───────┬───────┘
                                      │       │
                                   N:1│       │N:1
                                      │       │
                         ┌────────────▼───┐  ┌▼───────────────┐
                         │ SystemSection  │  │ TypePermission │
                         │ - id           │  │ - id           │
                         │ - key          │  │ - key          │
                         │ - name         │  │ - name         │
                         └────────────────┘  └────────────────┘
```

## 🔐 Entidades del Sistema

### 1. **SystemSection** (Secciones del Sistema)
Representa los módulos o áreas funcionales del sistema, ahora con soporte para jerarquía.

```typescript
{
  id: number,
  key: string,        // 'users', 'products', 'sales', etc.
  name: string,       // 'Usuarios', 'Productos', 'Ventas'
  description: string,
  parent_id: number | null,  // ID del padre (null para raíces)
  type: string,       // 'section' para raíz, 'submodule' para hijos
  status: boolean
}
```

**Ejemplos jerárquicos:**
- `users` (section) - Gestión de usuarios
  - `user-management` (submodule) - Gestión específica
  - `user-reports` (submodule) - Reportes de usuarios
- `products` (section) - Gestión de productos
- `sales` (section) - Gestión de ventas

### 2. **TypePermission** (Tipos de Permisos)
Define las acciones que se pueden realizar.

```typescript
{
  id: number,
  key: string,        // 'read', 'write', 'delete', 'export'
  name: string,       // 'Lectura', 'Escritura', 'Eliminación'
  description: string,
  status: boolean
}
```

**Ejemplos:**
- `read` - Visualizar/Leer
- `write` - Crear/Editar
- `delete` - Eliminar
- `export` - Exportar datos

### 3. **SectionPermission** (Relación Sección-Permiso)
Conecta las secciones con los tipos de permisos disponibles.

```typescript
{
  id: number,
  section_id: number,     // FK a SystemSection
  permission_id: number,  // FK a TypePermission
  status: boolean
}
```

### 4. **PermissionSystem** (Asignación de Permisos)
Asigna permisos específicos a perfiles de usuario.

```typescript
{
  id: number,
  profile_id: string,            // FK a Profile (UUID)
  section_permission_id: number, // FK a SectionPermission
  status: boolean
}
```

## 🚀 Uso en el Código

### Obtener Permisos de un Usuario

El método `getPermissionsForProfile` en `UsersService` obtiene todos los permisos:

```typescript
// Ejemplo de uso interno (ya integrado en getUserWithProfileAndPermissions)
const permissions = await this.getPermissionsForProfile(profile_id);

// Resultado:
{
  "users": [1, 2, 3, 4],      // read, write, delete, export
  "products": [1, 2],         // read, write
  "sales": [1],               // read
  "reports": [1, 4],          // read, export
  "settings": [1, 2, 3, 4]    // all permissions
}
```

### Verificar Permisos en un Controlador

```typescript
@Get('users')
async getUsers(@CurrentUser() session: SessionData) {
  // session.permissions contiene los permisos del usuario
  
  if (!session.permissions?.users?.includes(1)) { // 1 = read
    throw new ForbiddenException('No tienes permiso para ver usuarios');
  }
  
  return this.usersService.findAll();
}
```

### Guard de Permisos (Ejemplo)

```typescript
// decorators/require-permission.decorator.ts
export const RequirePermission = (section: string, permissionId: number) =>
  SetMetadata('permission', { section, permissionId });

// guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const session: SessionData = request.session?.user;
    const permission = this.reflector.get('permission', context.getHandler());
    
    if (!permission) return true;
    
    const { section, permissionId } = permission;
    return session?.permissions?.[section]?.includes(permissionId) ?? false;
  }
}

// Uso en controlador:
@Get('users')
@RequirePermission('users', 1) // Requiere permiso de lectura en users
async getUsers() {
  return this.usersService.findAll();
}
```

## 📝 Query Optimizada

La consulta replica exactamente la funcionalidad de Knex pero usando TypeORM:

```typescript
const permissions = await this.permissionSystemRepository
  .createQueryBuilder('permission_system')
  .select('system_section.id', 'id')
  .addSelect('system_section.key', 'key')
  .addSelect('system_section.parent_id', 'parent_id')  // Nuevo: incluir padre
  .addSelect(`json_agg(type_permission.id ORDER BY type_permission.id ASC)`, 'permissions')
  .innerJoin('section_permission', 'section_permission', 'permission_system.section_permission_id = section_permission.id')
  .innerJoin('system_section', 'system_section', 'section_permission.section_id = system_section.id')
  .innerJoin('type_permission', 'type_permission', 'section_permission.permission_id = type_permission.id')
  .where('permission_system.profile_id = :profile_id', { profile_id })
  .andWhere('permission_system.status = :status', { status: true })
  .andWhere('type_permission.status = :status', { status: true })
  .andWhere('section_permission.status = :status', { status: true })
  .groupBy('system_section.id')
  .addGroupBy('system_section.key')
  .addGroupBy('system_section.parent_id')  // Nuevo: agrupar por parent_id
  .orderBy('system_section.id', 'ASC')
  .getRawMany();
```

### Ventajas de esta implementación:

✅ **Jerarquía escalable**: Soporte para secciones y submódulos anidados  
✅ **Herencia de permisos**: Los submódulos heredan permisos de su sección padre  
✅ **Type-safe**: Totalmente tipado con TypeScript  
✅ **Eficiente**: Una sola consulta con joins optimizados  
✅ **Flexible**: Fácil agregar nuevas secciones y permisos  
✅ **Granular**: Control fino sobre qué puede hacer cada perfil en cada sección  

## 🌱 Seeds

El sistema incluye seeds para datos iniciales:

```bash
npm run seed
```

Esto creará:
1. **Usuario Master** con perfil Master
2. **5 Secciones del sistema** (users, products, sales, reports, settings)
3. **4 Tipos de permisos** (read, write, delete, export)
4. **20 Relaciones sección-permiso** (todas las combinaciones)
5. **Asignación completa** de permisos al perfil Master

## 🔧 Agregar Nuevas Secciones

Para agregar una nueva sección al sistema:

```typescript
const newSection = systemSectionRepository.create({
  key: 'inventory',
  name: 'Inventario',
  description: 'Gestión de inventario',
  status: true,
});
await systemSectionRepository.save(newSection);

// Crear relaciones con todos los permisos
for (const permission of allPermissions) {
  const sectionPermission = sectionPermissionRepository.create({
    section_id: newSection.id,
    permission_id: permission.id,
    status: true,
  });
  await sectionPermissionRepository.save(sectionPermission);
}
```

## 🎯 Ejemplo Completo de Flujo

1. **Usuario hace login** → `AuthService.login()`
2. **Se obtiene el perfil y permisos** → `UsersService.getUserWithProfileAndPermissions()`
3. **Permisos se guardan en sesión** → `SessionData.permissions`
4. **Guards verifican permisos** → Antes de ejecutar cada endpoint
5. **Controlador usa los permisos** → Para lógica de negocio específica

```typescript
// En el frontend, puedes usar los permisos para:
if (session.permissions.users?.includes(2)) { // 2 = write
  showCreateUserButton();
}

if (session.permissions.reports?.includes(4)) { // 4 = export
  showExportButton();
}
```

## 🔒 Seguridad

- ✅ Todos los permisos verificados en backend
- ✅ Status flags permiten desactivar sin eliminar
- ✅ Control granular por perfil y sección
- ✅ Fácil auditoría de quién tiene qué permisos
