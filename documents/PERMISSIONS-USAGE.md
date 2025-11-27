# Sistema de Permisos - Guía de Uso

## 📚 Contenido

1. [Estructura Actual vs Mejorada](#estructura-actual-vs-mejorada)
2. [Uso Básico](#uso-básico)
3. [Uso en Controladores](#uso-en-controladores)
4. [Uso en Services](#uso-en-services)
5. [Ejemplos Avanzados](#ejemplos-avanzados)

---

## Estructura Actual vs Mejorada

### ❌ Estructura Actual (Funcional pero básica)

```json
{
  "permissions": {
    "users": [1, 2, 3],
    "products": [1, 2],
    "reports": [1, 4]
  }
}
```

**Problemas:**
- ❌ No es evidente qué significa cada número
- ❌ Verificación manual propensa a errores
- ❌ Sin autocompletado en el IDE
- ❌ Difícil de mantener

### ✅ Estructura Mejorada (Misma data, mejor experiencia)

```typescript
// Misma estructura de datos, pero con helpers y tipos
import { PermissionType, SystemSection, Permissions } from './types/permissions.types';

// Los números siguen siendo los mismos, pero ahora tienes:
const permissions = new Permissions({
  users: [1, 2, 3],  // READ, WRITE, DELETE
  products: [1, 2],  // READ, WRITE
  reports: [1, 4]    // READ, EXPORT
});

// Verificación limpia y type-safe
if (permissions.canWrite(SystemSection.USERS)) {
  // Usuario puede escribir en users
}
```

---

## Uso Básico

### 1️⃣ Verificar Permisos con Enums

```typescript
import { PermissionType, SystemSection } from '@/modules/users/types/permissions.types';

// En lugar de números mágicos
if (session.permissions.users?.includes(1)) { } // ❌ ¿Qué es 1?

// Usa enums descriptivos
if (session.permissions.users?.includes(PermissionType.READ)) { } // ✅ Claro!
```

### 2️⃣ Usar la Clase Permissions

```typescript
import { Permissions } from '@/modules/users/types/permissions.types';

const permissions = new Permissions(session.permissions);

// Verificaciones limpias
if (permissions.canRead(SystemSection.USERS)) {
  console.log('Puede leer usuarios');
}

if (permissions.canWrite(SystemSection.PRODUCTS)) {
  console.log('Puede crear/editar productos');
}

if (permissions.hasFullAccess(SystemSection.REPORTS)) {
  console.log('Tiene acceso completo a reportes');
}
```

### 3️⃣ Helpers Estáticos

```typescript
import { PermissionsHelper, PermissionType } from '@/modules/users/types/permissions.types';

// Sin instanciar la clase
if (PermissionsHelper.canRead(session.permissions, 'users')) {
  // Lógica aquí
}
```

---

## Uso en Controladores

### Método 1: Guards con Decorators (Recomendado)

```typescript
import { Controller, Get, Post, Delete } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { PermissionsGuard } from '@/modules/users/guards/permissions.guard';
import { RequireRead, RequireWrite, RequireDelete } from '@/modules/users/decorators/require-permissions.decorator';
import { SystemSection } from '@/modules/users/types/permissions.types';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard) // Aplicar guards a todo el controlador
export class UsersController {
  
  // Solo usuarios con permiso de LECTURA en 'users'
  @Get()
  @RequireRead(SystemSection.USERS)
  async findAll() {
    return this.usersService.findAll();
  }

  // Solo usuarios con permiso de ESCRITURA en 'users'
  @Post()
  @RequireWrite(SystemSection.USERS)
  async create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  // Solo usuarios con permiso de ELIMINACIÓN en 'users'
  @Delete(':id')
  @RequireDelete(SystemSection.USERS)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

### Método 2: Verificación Manual en el Controlador

```typescript
import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { SessionData } from '@/modules/users/interfaces/session.interface';
import { Permissions, PermissionType, SystemSection } from '@/modules/users/types/permissions.types';

@Controller('products')
export class ProductsController {
  
  @Get('export')
  async exportProducts(@CurrentUser() session: SessionData) {
    const permissions = new Permissions(session.permissions);
    
    // Verificación manual
    if (!permissions.canExport(SystemSection.PRODUCTS)) {
      throw new ForbiddenException('No tienes permiso para exportar productos');
    }

    return this.productsService.export();
  }

  @Get('special')
  async getSpecialProducts(@CurrentUser() session: SessionData) {
    const permissions = new Permissions(session.permissions);
    
    // Requiere READ o EXPORT (al menos uno)
    if (!permissions.hasAnyPermission(SystemSection.PRODUCTS, [PermissionType.READ, PermissionType.EXPORT])) {
      throw new ForbiddenException('Sin acceso a productos especiales');
    }

    return this.productsService.findSpecial();
  }
}
```

---

## Uso en Services

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Permissions, SystemSection } from '@/modules/users/types/permissions.types';
import { SessionData } from '@/modules/users/interfaces/session.interface';

@Injectable()
export class ReportsService {
  
  async generateReport(type: string, session: SessionData) {
    const permissions = new Permissions(session.permissions);

    // Verificar permisos antes de procesar
    if (!permissions.canRead(SystemSection.REPORTS)) {
      throw new ForbiddenException('No puedes ver reportes');
    }

    // Lógica condicional basada en permisos
    const report = await this.createBasicReport(type);

    if (permissions.canExport(SystemSection.REPORTS)) {
      // Agregar opciones de exportación
      report.exportOptions = ['PDF', 'Excel', 'CSV'];
    }

    return report;
  }

  async deleteReport(id: string, session: SessionData) {
    const permissions = new Permissions(session.permissions);

    if (!permissions.canDelete(SystemSection.REPORTS)) {
      throw new ForbiddenException('No puedes eliminar reportes');
    }

    return this.reportRepository.delete(id);
  }
}
```

---

## Ejemplos Avanzados

### 1️⃣ Múltiples Permisos (Require ALL)

```typescript
import { RequirePermissions } from '@/modules/users/decorators/require-permissions.decorator';
import { PermissionType, SystemSection } from '@/modules/users/types/permissions.types';

@Controller('admin')
export class AdminController {
  
  // Requiere READ Y WRITE Y DELETE (todos)
  @Post('danger-action')
  @RequirePermissions({
    section: SystemSection.USERS,
    permissions: [PermissionType.READ, PermissionType.WRITE, PermissionType.DELETE],
    requireAll: true // Por defecto es true
  })
  async dangerousAction() {
    return { message: 'Acción peligrosa ejecutada' };
  }
}
```

### 2️⃣ Múltiples Permisos (Require ANY)

```typescript
@Controller('reports')
export class ReportsController {
  
  // Requiere READ O EXPORT (al menos uno)
  @Get('view-or-export')
  @RequirePermissions({
    section: SystemSection.REPORTS,
    permissions: [PermissionType.READ, PermissionType.EXPORT],
    requireAll: false // Requiere al menos uno
  })
  async viewOrExport() {
    return { message: 'Puedes ver o exportar' };
  }
}
```

### 3️⃣ Lógica Condicional Compleja

```typescript
async processOrder(orderId: string, session: SessionData) {
  const permissions = new Permissions(session.permissions);

  // Verificar acceso básico
  if (!permissions.canRead(SystemSection.ORDERS)) {
    throw new ForbiddenException('No puedes ver órdenes');
  }

  const order = await this.findOrder(orderId);

  // Determinar qué puede hacer el usuario con la orden
  const actions = {
    canView: true, // Ya verificamos READ
    canEdit: permissions.canWrite(SystemSection.ORDERS),
    canCancel: permissions.canDelete(SystemSection.ORDERS),
    canExport: permissions.canExport(SystemSection.ORDERS),
    isAdmin: permissions.hasFullAccess(SystemSection.ORDERS)
  };

  return {
    order,
    availableActions: actions
  };
}
```

### 4️⃣ Debugging de Permisos

```typescript
@Get('debug-permissions')
async debugPermissions(@CurrentUser() session: SessionData) {
  const permissions = new Permissions(session.permissions);

  return {
    raw: permissions.raw, // Estructura original
    readable: permissions.toReadable(), // Nombres legibles
    checks: {
      canReadUsers: permissions.canRead(SystemSection.USERS),
      canWriteProducts: permissions.canWrite(SystemSection.PRODUCTS),
      fullAccessReports: permissions.hasFullAccess(SystemSection.REPORTS)
    }
  };
}

// Respuesta:
{
  "raw": {
    "users": [1, 2, 3],
    "products": [1, 2]
  },
  "readable": {
    "users": ["read", "write", "delete"],
    "products": ["read", "write"]
  },
  "checks": {
    "canReadUsers": true,
    "canWriteProducts": true,
    "fullAccessReports": false
  }
}
```

---

## 🎯 Recomendaciones

### ✅ DO (Hacer)

```typescript
// ✅ Usa enums en lugar de números mágicos
if (permissions.can(SystemSection.USERS, PermissionType.READ)) { }

// ✅ Usa decorators para endpoints
@RequireRead(SystemSection.USERS)

// ✅ Usa la clase Permissions para lógica compleja
const permissions = new Permissions(session.permissions);

// ✅ Verifica permisos en guards y services
@UseGuards(AuthGuard, PermissionsGuard)
```

### ❌ DON'T (No hacer)

```typescript
// ❌ No uses números mágicos
if (permissions.users.includes(1)) { }

// ❌ No dupliques lógica de permisos
// Centralízala en guards o helpers

// ❌ No confíes solo en el frontend
// Siempre verifica en backend
```

---

## 🚀 Migración Gradual

Puedes migrar gradualmente sin romper código existente:

```typescript
// Código actual (sigue funcionando)
if (session.permissions.users?.includes(1)) {
  // lógica
}

// Nuevo código (recomendado)
import { PermissionType } from '@/modules/users/types/permissions.types';
if (session.permissions.users?.includes(PermissionType.READ)) {
  // lógica
}
```

La estructura de datos NO cambia, solo agregas helpers y tipos para mejor DX! 🎉
