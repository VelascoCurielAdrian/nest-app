# Guía de Uso - TypeORM con PostgreSQL en NestJS

## 📋 Configuración Implementada

Se ha configurado **TypeORM** con **PostgreSQL** en tu proyecto NestJS. Esta es la configuración más recomendada y ampliamente usada en el ecosistema NestJS.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos de PostgreSQL:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=nest_app
```

### 2. Crear la Base de Datos

Ejecuta el siguiente comando en PostgreSQL:

```sql
CREATE DATABASE nest_app;
```

O usando psql:

```bash
psql -U postgres -c "CREATE DATABASE nest_app;"
```

### 3. Ejecutar Migraciones (Opcional)

Si quieres crear la tabla manualmente, ejecuta el script SQL:

```bash
psql -U postgres -d nest_app -f migrations/001_create_users_table.sql
```

**Nota:** TypeORM con `synchronize: true` creará las tablas automáticamente en desarrollo.

## 📚 Ejemplos de Uso

### 1. Consultas Básicas

El servicio `UsersService` ya está configurado con estos métodos:

```typescript
// Crear un usuario
const user = await this.usersService.create({
  email: 'usuario@example.com',
  password: 'password123',
  firstName: 'Juan',
  lastName: 'Pérez',
});

// Obtener todos los usuarios
const users = await this.usersService.findAll();

// Buscar por email
const user = await this.usersService.findByEmail('usuario@example.com');

// Buscar por ID
const user = await this.usersService.findOne('uuid-del-usuario');

// Actualizar usuario
const updated = await this.usersService.update('uuid-del-usuario', {
  firstName: 'Carlos',
});

// Desactivar usuario (soft delete)
const deactivated = await this.usersService.deactivate('uuid-del-usuario');

// Eliminar usuario
await this.usersService.remove('uuid-del-usuario');

// Contar usuarios
const count = await this.usersService.count();

// Usuarios activos
const activeUsers = await this.usersService.findActive();
```

### 2. Crear Nuevas Entidades

Para crear una nueva entidad, por ejemplo `Product`:

**1. Crear la entidad:**

```typescript
// src/modules/products/entities/product.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**2. Registrar en el módulo:**

```typescript
// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**3. Usar en el servicio:**

```typescript
// src/modules/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({ where: { id } });
  }

  // ... más métodos
}
```

### 3. Relaciones entre Entidades

Ejemplo de relación One-to-Many:

```typescript
// Usuario tiene muchos posts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}

// Post pertenece a un usuario
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
```

Consultar con relaciones:

```typescript
// Incluir posts al buscar usuario
const user = await this.userRepository.findOne({
  where: { id },
  relations: ['posts'],
});
```

### 4. Query Builder Avanzado

Para consultas más complejas:

```typescript
// Búsqueda con filtros múltiples
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.isActive = :isActive', { isActive: true })
  .andWhere('user.email LIKE :email', { email: '%@example.com' })
  .orderBy('user.createdAt', 'DESC')
  .take(10)
  .getMany();

// Join con otras tablas
const users = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('post.published = :published', { published: true })
  .getMany();

// Agregaciones
const count = await this.userRepository
  .createQueryBuilder('user')
  .where('user.isActive = :isActive', { isActive: true })
  .getCount();
```

### 5. Transacciones

Para operaciones que requieren múltiples cambios:

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createUserWithProfile(userData: any, profileData: any) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear usuario
      const user = queryRunner.manager.create(User, userData);
      await queryRunner.manager.save(user);

      // Crear perfil
      const profile = queryRunner.manager.create(Profile, {
        ...profileData,
        userId: user.id,
      });
      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## 🧪 Probar la Conexión

### 1. Iniciar el servidor

```bash
pnpm start:dev
```

### 2. Probar endpoints con curl

```bash
# Crear un usuario
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Obtener todos los usuarios
curl http://localhost:3000/users

# Obtener un usuario específico
curl http://localhost:3000/users/{id}
```

## 📖 Recursos Adicionales

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM Entity Decorators](https://typeorm.io/entities)
- [TypeORM Relations](https://typeorm.io/relations)

## ⚠️ Notas Importantes

1. **Synchronize en Producción**: La opción `synchronize: true` está configurada solo para desarrollo. En producción, usa migraciones.

2. **Migraciones**: Para crear migraciones automáticas:
   ```bash
   npm run typeorm migration:generate -- -n MigrationName
   npm run typeorm migration:run
   ```

3. **Validación**: Los DTOs usan `class-validator` para validar datos de entrada.

4. **Seguridad**: Nunca guardes contraseñas en texto plano. Usa bcrypt (ya incluido en tu proyecto).

## 🎯 Siguiente Pasos

1. ✅ Configura las variables de entorno en `.env`
2. ✅ Asegúrate de tener PostgreSQL corriendo
3. ✅ Inicia la aplicación con `pnpm start:dev`
4. ✅ Prueba los endpoints con Postman o curl
5. 🔄 Crea más entidades según necesites

¡La configuración está lista para usar! 🚀
