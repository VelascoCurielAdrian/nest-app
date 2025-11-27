# Database Seeder

Este directorio contiene los seeds para inicializar la base de datos con datos predeterminados.

## Uso

Para ejecutar el seed que crea el usuario maestro:

```bash
npm run seed
```

o con pnpm:

```bash
pnpm seed
```

## Seeds Disponibles

### 1. Master User (`master-user.seed.ts`)

Crea el usuario administrador principal:

- **Perfil Master**
  - Nombre: Master
  - Descripción: Perfil master con todos los permisos
  - Estado: Activo

- **Usuario Master**
  - Username: `master`
  - Password: `321`
  - Estado: Activo

- **User Profile**
  - Email: adrian_velascocuriel@hotmail.com
  - Nombre: Adrian Velasco Curiel
  - Género: male
  - Teléfono: +52 6672466130

### 2. Permissions System (`permissions-system.seed.ts`)

Crea el sistema completo de permisos:

- **4 Tipos de Permisos**
  - `read` - Lectura
  - `write` - Escritura
  - `delete` - Eliminación
  - `export` - Exportar

- **5 Secciones del Sistema**
  - `users` - Gestión de usuarios
  - `products` - Gestión de productos
  - `sales` - Gestión de ventas
  - `reports` - Visualización de reportes
  - `settings` - Configuración del sistema

- **20 Relaciones Sección-Permiso** (todas las combinaciones posibles)

- **Asignación Completa** de todos los permisos al perfil Master

Para más información sobre el sistema de permisos, ver [`/documents/PERMISSIONS-SYSTEM.md`](../../documents/PERMISSIONS-SYSTEM.md)

## Notas Importantes

⚠️ **ADVERTENCIA**: El seed elimina todos los registros existentes de las siguientes tablas antes de insertar datos:
- `user_profile`
- `users`
- `profile`

Solo ejecuta el seed en entornos de desarrollo o cuando necesites reiniciar la base de datos con datos limpios.

## Estructura del Seed

El seed utiliza:
- **TypeORM Repositories**: Para operaciones CRUD seguras y tipadas
- **Transacciones**: Para garantizar que todos los datos se inserten o se revierten en caso de error
- **bcryptjs**: Para hashear la contraseña del usuario
- **Entities**: Usa las entidades de TypeORM para mantener consistencia con el resto de la aplicación

### Ventajas de usar Repositories

✅ **Type-safe**: Completamente tipado con TypeScript  
✅ **Validaciones**: Aprovecha los decoradores de las entidades  
✅ **Mantenible**: Si cambias las entidades, el seed se adapta automáticamente  
✅ **Consistente**: Usa la misma lógica que el resto de la aplicación  
✅ **Robusto**: Menos propenso a errores de SQL

## Agregar Nuevos Seeds

Para crear un nuevo seed:

1. Crea un archivo en `src/database/seeds/` con el nombre `nombre-seed.seed.ts`
2. Exporta una función asíncrona que reciba `DataSource` como parámetro
3. Importa la función en `src/database/seed.ts`
4. Llama a tu función después de `seedMasterUser`

Ejemplo con **Repositories** (Recomendado):

```typescript
import { Product } from '../../modules/products/entities/products.entity';

import type { DataSource } from 'typeorm';

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const productRepository = queryRunner.manager.getRepository(Product);

    // Limpiar productos existentes
    await productRepository.delete({});

    // Crear productos
    const products = productRepository.create([
      {
        name: 'Producto 1',
        description: 'Descripción del producto 1',
        price: 100,
        stock: 50,
      },
      {
        name: 'Producto 2',
        description: 'Descripción del producto 2',
        price: 200,
        stock: 30,
      },
    ]);

    await productRepository.save(products);
    console.info(`✅ ${products.length} products created`);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### Ejemplo con Query Builder (Para casos complejos):

```typescript
import type { DataSource } from 'typeorm';

export async function seedComplexData(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('mi_tabla')
      .values([
        { campo1: 'valor1', campo2: 'valor2' },
        { campo1: 'valor3', campo2: 'valor4' },
      ])
      .execute();

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```
