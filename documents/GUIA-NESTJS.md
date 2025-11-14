# 🚀 Guía Técnica Completa de NestJS - Paso a Paso

## 📋 Índice de Conceptos Fundamentales

### 1. **Módulos (@Module)**
```typescript
// filepath: src/app.module.ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],      // Módulos que este módulo necesita
  controllers: [],  // Controladores HTTP de este módulo
  providers: [],    // Servicios/Repositorios inyectables
  exports: []       // Servicios disponibles para otros módulos
})
export class AppModule {}
```
**Propósito técnico**: Organización modular de la aplicación. Encapsula componentes relacionados y gestiona el árbol de dependencias.

**Características clave**:
- **imports**: Importa funcionalidad de otros módulos
- **controllers**: Define los controladores que manejan las rutas
- **providers**: Servicios que pueden ser inyectados
- **exports**: Hace disponibles los providers para otros módulos

---

### 2. **Controladores (@Controller)**
```typescript
// filepath: src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';

@Controller('users') // Ruta base: /users
export class UsersController {
  
  @Get() // GET /users
  findAll() {
    return 'Obtener todos los usuarios';
  }

  @Get(':id') // GET /users/:id
  findOne(@Param('id') id: string) {
    return `Usuario #${id}`;
  }

  @Post() // POST /users
  create(@Body() createUserDto: any) {
    return 'Usuario creado';
  }

  @Put(':id') // PUT /users/:id
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return `Usuario #${id} actualizado`;
  }

  @Delete(':id') // DELETE /users/:id
  remove(@Param('id') id: string) {
    return `Usuario #${id} eliminado`;
  }
}
```
**Propósito técnico**: Capa de manejo de peticiones HTTP. Mapea rutas a métodos y extrae datos de la request.

**Decoradores principales**:
- `@Controller(prefix)`: Define el prefijo de ruta
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`: Métodos HTTP
- `@Param(key)`: Extrae parámetros de ruta
- `@Body()`: Extrae el cuerpo de la petición
- `@Query(key)`: Extrae query parameters
- `@Headers(name)`: Extrae headers

---

### 3. **Servicios (@Injectable)**
```typescript
// filepath: src/users/users.service.ts
import { Injectable } from '@nestjs/common';

@Injectable() // Marca la clase como inyectable
export class UsersService {
  private users = [];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }

  create(user: any) {
    this.users.push(user);
    return user;
  }

  update(id: number, user: any) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...user };
      return this.users[index];
    }
    return null;
  }

  remove(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
    return null;
  }
}
```
**Propósito técnico**: Lógica de negocio. Servicios reutilizables inyectables mediante Dependency Injection.

**Ventajas**:
- Separación de responsabilidades
- Reutilización de código
- Facilita testing (mocking)
- Inyección de dependencias automática

---

### 4. **DTOs (Data Transfer Objects)**
```typescript
// filepath: src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;
}
```
**Propósito técnico**: Validación de datos entrantes y tipado seguro. Define el schema de datos esperados.

**Validadores comunes**:
- `@IsString()`, `@IsNumber()`, `@IsBoolean()`: Tipo de dato
- `@IsEmail()`, `@IsUrl()`: Formatos específicos
- `@MinLength()`, `@MaxLength()`: Longitud de string
- `@Min()`, `@Max()`: Rango numérico
- `@IsOptional()`: Campo opcional
- `@IsArray()`, `@ArrayMinSize()`: Arrays

---

### 5. **Pipes (Transformación y Validación)**
```typescript
// filepath: src/common/pipes/parse-int.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Debe ser un número válido');
    }
    return val;
  }
}

// Uso en controlador:
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```

**Pipes built-in de NestJS**:
- `ValidationPipe`: Valida DTOs con class-validator
- `ParseIntPipe`: Convierte a entero
- `ParseBoolPipe`: Convierte a booleano
- `ParseArrayPipe`: Convierte a array
- `ParseUUIDPipe`: Valida UUID

**Propósito técnico**: Transformar/validar datos antes de llegar al handler. Pipeline de procesamiento de datos.

---

### 6. **Guards (Autenticación/Autorización)**
```typescript
// filepath: src/common/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    const token = request.headers.authorization;
    if (!token) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }
    // Lógica de validación del token
    return true;
  }
}

// Uso:
@UseGuards(AuthGuard)
@Get('profile')
getProfile() {
  return 'Perfil protegido';
}
```
**Propósito técnico**: Control de acceso pre-ejecución. Determina si una request puede proceder.

**Casos de uso**:
- Autenticación (verificar identidad)
- Autorización (verificar permisos)
- Rate limiting
- Validación de roles

---

### 7. **Interceptors (Manejo de Respuestas)**
```typescript
// filepath: src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString()
      }))
    );
  }
}

// Uso global:
app.useGlobalInterceptors(new TransformInterceptor());
```
**Propósito técnico**: Transformación de respuestas, logging, cache. Actúa antes/después del handler.

**Casos de uso**:
- Transformar estructura de respuesta
- Logging de requests/responses
- Caché de respuestas
- Medir tiempo de ejecución
- Manejo de errores

---

### 8. **Middleware**
```typescript
// filepath: src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      console.log(`[${method}] ${originalUrl} - ${statusCode} - ${responseTime}ms`);
    });

    next();
  }
}

// Registro en módulo:
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Aplica a todas las rutas
  }
}
```
**Propósito técnico**: Procesamiento pre-routing. Similar a Express middleware.

**Diferencia con Interceptors**:
- Middleware: Se ejecuta antes del routing
- Interceptors: Se ejecutan después del routing y guards

---

### 9. **Exception Filters**
```typescript
// filepath: src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// Uso global:
app.useGlobalFilters(new HttpExceptionFilter());
```

**Filter para todas las excepciones**:
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception instanceof Error ? exception.message : 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```
**Propósito técnico**: Manejo centralizado de excepciones. Formateo consistente de errores.

---

## 🔄 Ciclo de Vida de una Request

```
┌─────────────────────────────────────────────────────────────────┐
│                     REQUEST ENTRANTE                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                      ┌───────────────┐
                      │  Middleware   │
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │    Guards     │ ← Autenticación/Autorización
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │  Interceptor  │ ← Before
                      │   (before)    │
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │     Pipes     │ ← Validación/Transformación
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │  Controller   │ ← Handler del endpoint
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │    Service    │ ← Lógica de negocio
                      └───────────────┘
                              ↓
                      ┌───────────────┐
                      │  Interceptor  │ ← After (transform response)
                      │   (after)     │
                      └───────────────┘
                              ↓
                ┌─────────────────────────┐
                │  Exception Filter       │ ← Si hay error
                │  (si ocurre excepción)  │
                └─────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     RESPONSE SALIENTE                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura Recomendada de Proyecto

```
src/
├── common/                    # Código compartido entre módulos
│   ├── decorators/           # Decoradores personalizados
│   │   └── roles.decorator.ts
│   ├── dto/                  # DTOs comunes
│   │   └── pagination.dto.ts
│   ├── filters/              # Exception filters
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── guards/               # Guards de autenticación/autorización
│   │   ├── auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/         # Interceptors globales
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── interfaces/           # Interfaces compartidas
│   │   └── paginated-result.interface.ts
│   ├── middleware/           # Middleware personalizado
│   │   └── logger.middleware.ts
│   ├── pipes/                # Pipes de validación
│   │   └── validation.pipe.ts
│   └── utils/                # Utilidades
│       └── helpers.ts
├── config/                   # Configuración de la app
│   ├── configuration.ts      # Variables de entorno
│   └── database.config.ts    # Configuración de BD
├── modules/                  # Módulos de dominio/negocio
│   ├── auth/                # Módulo de autenticación
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/               # Módulo de usuarios
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   └── products/            # Módulo de productos
│       ├── dto/
│       ├── entities/
│       ├── products.controller.ts
│       ├── products.service.ts
│       └── products.module.ts
├── app.module.ts            # Módulo raíz
└── main.ts                  # Bootstrap de la aplicación
```

---

## 🛠️ Configuración del main.ts

```typescript
// filepath: src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api/v1');

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Pipes globales - Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true,            // Transforma payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Conversión automática de tipos
      },
    }),
  );

  // Filters globales
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors globales
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3000);
  console.log(`🚀 Application is running on: http://localhost:3000`);
}
bootstrap();
```

---

## 🔐 Ejemplo Completo: Módulo de Autenticación

### 1. Crear el módulo
```bash
nest g module auth
nest g controller auth
nest g service auth
```

### 2. DTOs
```typescript
// login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### 3. Service
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }
}
```

### 4. Controller
```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### 5. JWT Strategy
```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

---

## 🎯 Mejores Prácticas

### 1. **Separación de Responsabilidades**
- Controllers: Solo manejan HTTP
- Services: Lógica de negocio
- Repositories: Acceso a datos

### 2. **Validación de Datos**
- Siempre usa DTOs con class-validator
- Habilita ValidationPipe globalmente
- Usa whitelist para seguridad

### 3. **Manejo de Errores**
- Usa HttpException y sus subclases
- Implementa Exception Filters personalizados
- Retorna respuestas consistentes

### 4. **Configuración**
- Usa @nestjs/config para variables de entorno
- No hardcodees valores sensibles
- Valida configuración al inicio

### 5. **Testing**
- Escribe tests unitarios para services
- Tests e2e para flujos completos
- Usa mocks para dependencias

### 6. **Seguridad**
- Implementa rate limiting
- Valida y sanitiza inputs
- Usa helmet para headers seguros
- Implementa CORS correctamente

---

## 📚 Recursos Adicionales

- [Documentación Oficial de NestJS](https://docs.nestjs.com)
- [NestJS Fundamentals](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Techniques](https://docs.nestjs.com/techniques/database)
- [NestJS Recipes](https://docs.nestjs.com/recipes/sql-typeorm)

---

## 🎓 Comandos CLI Útiles

```bash
# Generar recursos
nest g module users          # Genera un módulo
nest g controller users      # Genera un controlador
nest g service users         # Genera un servicio
nest g resource users        # Genera módulo completo (CRUD)

# Generar componentes
nest g guard auth            # Genera un guard
nest g interceptor logging   # Genera un interceptor
nest g pipe validation       # Genera un pipe
nest g filter http-exception # Genera un filter
nest g middleware logger     # Genera un middleware

# Desarrollo
npm run start:dev            # Modo desarrollo con watch
npm run build                # Compilar
npm run start:prod           # Producción

# Testing
npm run test                 # Tests unitarios
npm run test:e2e            # Tests end-to-end
npm run test:cov            # Cobertura de tests
```

---

**Creado para el proyecto nest-app** 🚀
