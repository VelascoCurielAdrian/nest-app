# Estructura del Proyecto - NestJS

Esta es una arquitectura modular, escalable y robusta para aplicaciones NestJS empresariales.

## 📁 Estructura de Carpetas

```
src/
├── common/                    # Código compartido en toda la aplicación
│   ├── decorators/           # Decoradores personalizados
│   ├── filters/              # Exception filters (manejo de errores)
│   ├── guards/               # Guards (protección de rutas)
│   ├── interceptors/         # Interceptores (logging, transformación)
│   ├── pipes/                # Pipes de validación
│   ├── middlewares/          # Middlewares personalizados
│   ├── dto/                  # DTOs compartidos
│   ├── interfaces/           # Interfaces compartidas
│   ├── constants/            # Constantes de la aplicación
│   └── utils/                # Funciones de utilidad
│
├── config/                    # Configuración de la aplicación
│   └── configuration.ts      # Variables de entorno y configuración
│
├── core/                      # Capa de infraestructura y datos
│   ├── database/             # Configuración de base de datos
│   ├── entities/             # Entidades de base de datos
│   └── repositories/         # Repositorios personalizados
│
├── modules/                   # Módulos de la aplicación
│   ├── auth/                 # Módulo de autenticación
│   │   ├── dto/             # DTOs específicos del módulo
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   └── users/                # Módulo de usuarios
│       ├── dto/             # DTOs específicos del módulo
│       ├── entities/        # Entidades del módulo
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
│
├── app.controller.ts
├── app.service.ts
├── app.module.ts             # Módulo raíz
└── main.ts                   # Punto de entrada de la aplicación
```

## 🎯 Características Principales

### 1. **Separación de Responsabilidades**
- `common/`: Código reutilizable en toda la aplicación
- `core/`: Lógica de infraestructura y acceso a datos
- `modules/`: Lógica de negocio organizada por dominios

### 2. **Módulos Independientes**
Cada módulo contiene:
- **Controllers**: Manejo de peticiones HTTP
- **Services**: Lógica de negocio
- **DTOs**: Validación de datos de entrada
- **Entities**: Modelos de datos
- **Module**: Configuración del módulo

### 3. **Common Utilities**
- **Filters**: Manejo global de excepciones
- **Interceptors**: Logging y transformación de respuestas
- **Pipes**: Validación de datos
- **Guards**: Protección de rutas
- **DTOs**: Paginación y otros DTOs compartidos

## 🚀 Cómo Agregar un Nuevo Módulo

### Opción 1: Usando NestJS CLI (Recomendado)
```bash
nest g module modules/products
nest g controller modules/products
nest g service modules/products
```

### Opción 2: Estructura Manual
```
modules/
└── products/
    ├── dto/
    │   ├── create-product.dto.ts
    │   └── update-product.dto.ts
    ├── entities/
    │   └── product.entity.ts
    ├── products.controller.ts
    ├── products.service.ts
    └── products.module.ts
```

## 📝 Ejemplos de Uso

### Crear un nuevo controlador
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  findAll() {
    return [];
  }
}
```

### Crear un nuevo servicio
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    return [];
  }
}
```

### Crear un nuevo módulo
```typescript
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=myapp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## 🏃 Comandos

```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod

# Tests
pnpm test
pnpm test:e2e

# Linting
pnpm lint
```

## 📚 Próximos Pasos

1. **Agregar validación**: Instalar `class-validator` y `class-transformer`
2. **Configurar base de datos**: Instalar TypeORM o Prisma
3. **Implementar autenticación**: JWT, Passport
4. **Agregar documentación API**: Swagger
5. **Configurar logging**: Winston o Pino
6. **Agregar testing**: Jest con cobertura completa

## 🔐 Seguridad

- Implementar rate limiting
- Validar todas las entradas
- Usar helmet para headers de seguridad
- Implementar CORS apropiadamente
- Hash de contraseñas con bcrypt

## 📖 Recursos

- [Documentación NestJS](https://docs.nestjs.com)
- [Best Practices](https://docs.nestjs.com/techniques/configuration)
- [TypeORM](https://typeorm.io)
- [Prisma](https://www.prisma.io)
