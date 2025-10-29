# Sistema de Autenticación NestJS

Este sistema implementa autenticación JWT con cookies y protección de rutas mediante guards e interceptores.

## Componentes Principales

### 1. AuthGuard
Protege automáticamente todas las rutas exceptuando las marcadas como públicas.

### 2. SessionInterceptor
Renueva automáticamente las cookies de sesión para mantener las sesiones activas.

### 3. AuthLoggingMiddleware
Registra todas las requests indicando si están autenticadas o no.

## Decoradores

### @Public()
Marca una ruta como pública (sin autenticación requerida):

```typescript
@Public()
@Get('public-endpoint')
publicMethod() {
  return { message: 'Acceso público' };
}
```

### @CurrentUser()
Extrae el usuario autenticado de la request:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: { sub: string; username: string }) {
  return { user };
}
```

## Rutas de Autenticación

### POST /auth/login
Autentica un usuario y establece una cookie de sesión:

```json
{
  "username": "usuario",
  "password": "contraseña"
}
```

### POST /auth/logout
Cierra la sesión eliminando la cookie.

### GET /auth/verify
Verifica si la sesión actual es válida.

## Configuración de Cookies

Las cookies se configuran con:
- `httpOnly: true` - No accesibles desde JavaScript
- `secure: true` en producción - Solo HTTPS
- `sameSite: 'none'` en producción, `'lax'` en desarrollo
- Duración: 140 días por defecto

## Ejemplos de Uso

### Controlador con rutas protegidas y públicas:

```typescript
@Controller('example')
export class ExampleController {
  @Public()
  @Get('public')
  publicRoute() {
    return { message: 'Público' };
  }

  @Get('private')
  privateRoute(@CurrentUser() user: { sub: string; username: string }) {
    return { message: 'Privado', user };
  }
}
```

### Verificación manual de tokens:

```typescript
constructor(private authService: AuthService) {}

async validateToken(token: string) {
  try {
    const payload = await this.authService.verifyToken(token);
    return payload;
  } catch (error) {
    throw new UnauthorizedException('Token inválido');
  }
}
```

## Variables de Entorno

```env
JWT_SECRET=tu-clave-secreta-aqui
JWT_EXPIRES_IN=12096000  # 140 días en segundos
NODE_ENV=development     # o production
```

## Notas de Seguridad

1. Todas las rutas están protegidas por defecto
2. Las cookies son httpOnly y secure en producción
3. Los tokens se validan en cada request
4. Las sesiones se renuevan automáticamente
5. Se registran todas las requests para auditoría