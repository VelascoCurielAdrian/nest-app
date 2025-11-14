# Migración de Express con Knex a NestJS con TypeORM

## Funcionalidad Migrada

Se ha migrado exitosamente la funcionalidad `getUserWithProfileAndPermissions` de Express/Knex a NestJS/TypeORM.

### Entidades Creadas

1. **UserProfile** (`src/modules/users/entities/user-profile.entity.ts`)
   - Tabla: `user_profile`
   - Relación: OneToOne con User

2. **Profile** (`src/modules/users/entities/profile.entity.ts`)
   - Tabla: `profile`
   - Información de perfiles/roles

### Interfaces

- **SessionData** y **UserWithProfile** en `src/modules/users/interfaces/session.interface.ts`

### Servicios Actualizados

1. **UsersService**: 
   - Método `getUserWithProfileAndPermissions()` que replica la funcionalidad original
   - Método privado `getPermissionsForProfile()` para obtener permisos

2. **AuthService**:
   - Actualizado el método `login()` para usar los datos completos del perfil

### Endpoints

- `GET /users/:id/profile-permissions` - Obtiene usuario con perfil y permisos

## Migraciones de Base de Datos Requeridas

Para completar la migración, necesitas crear las siguientes tablas en tu base de datos PostgreSQL:

### 1. Tabla user_profile

```sql
CREATE TABLE user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profile(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(10),
    local_number VARCHAR(20),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX idx_user_profile_profile_id ON user_profile(profile_id);
CREATE INDEX idx_user_profile_email ON user_profile(email);
```

### 2. Tabla profile

```sql
CREATE TABLE profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_profile_name ON profile(name);
CREATE INDEX idx_profile_status ON profile(status);
```

### 3. Tabla de permisos (opcional)

Si necesitas un sistema de permisos más robusto:

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, permission_id)
);
```

## Uso

### En el servicio de autenticación

```typescript
// En AuthService.login()
const userWithProfile = await this.usersService.getUserWithProfileAndPermissions(user.id);
```

### Como endpoint independiente

```typescript
// GET /users/:id/profile-permissions
const userData = await this.usersService.getUserWithProfileAndPermissions(userId);
```

## Diferencias con la versión Express

1. **TypeORM vs Knex**: Se usan relaciones TypeORM en lugar de JOINs manuales
2. **Tipado fuerte**: Interfaces TypeScript para todos los datos
3. **Manejo de errores**: Exceptions de NestJS en lugar de manejo manual
4. **Inyección de dependencias**: Constructor injection en lugar de imports directos

## Sistema de Permisos

El método `getPermissionsForProfile()` actualmente devuelve permisos básicos. Puedes expandirlo para:

1. Consultar una tabla `profile_permissions`
2. Implementar roles jerárquicos
3. Cachear permisos para mejor rendimiento
4. Agregar permisos específicos por usuario

## Ejemplo de respuesta

```json
{
  "user_id": "uuid",
  "username": "usuario123",
  "status": true,
  "id": "profile_uuid",
  "profile_id": "profile_type_uuid",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "gender": "M",
  "local_number": "123456",
  "phone_number": "555-1234",
  "avatar_url": "https://example.com/avatar.jpg",
  "permissions": {
    "AdminProfile": {
      "read": true,
      "write": true,
      "delete": true
    }
  }
}
```