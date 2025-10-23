# 🚀 Inicio Rápido - Base de Datos con TypeORM

## ⚡ Pasos para Empezar (5 minutos)

### 1️⃣ Configurar Variables de Entorno

Edita el archivo `.env` (ya existe):

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=TU_PASSWORD_AQUI    # ⬅️ Cambia esto
DATABASE_NAME=nest_app
```

### 2️⃣ Crear la Base de Datos

Abre tu terminal y ejecuta:

```bash
# Opción 1: Usando psql
psql -U postgres -c "CREATE DATABASE nest_app;"

# Opción 2: Usando pgAdmin o DBeaver
# Crea una base de datos llamada "nest_app"
```

### 3️⃣ Iniciar la Aplicación

```bash
pnpm start:dev
```

TypeORM creará automáticamente la tabla `users` al iniciar (gracias a `synchronize: true`).

### 4️⃣ Probar que Funciona

Abre otra terminal y ejecuta:

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

# Ver todos los usuarios
curl http://localhost:3000/users
```

## ✅ ¿Qué Cambia?

### Antes (Sin Base de Datos)
```typescript
// Los usuarios se guardaban en memoria (se perdían al reiniciar)
private users: User[] = [];
```

### Después (Con TypeORM y PostgreSQL)
```typescript
// Los usuarios se guardan en PostgreSQL (permanentes)
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
) {}
```

## 📚 Métodos Disponibles

Tu `UsersService` ahora tiene estos métodos listos:

```typescript
await usersService.create(userData);      // Crear usuario
await usersService.findAll();            // Listar todos
await usersService.findByEmail(email);   // Buscar por email
await usersService.findOne(id);          // Buscar por ID
await usersService.update(id, data);     // Actualizar
await usersService.remove(id);           // Eliminar
await usersService.deactivate(id);       // Desactivar
await usersService.count();              // Contar total
await usersService.findActive();         // Solo activos
```

## 📖 Documentación Completa

- **[DB_SETUP_SUMMARY.md](./DB_SETUP_SUMMARY.md)** - Resumen de todos los cambios
- **[TYPEORM_GUIDE.md](./TYPEORM_GUIDE.md)** - Guía completa con ejemplos avanzados

## 🆘 Problemas Comunes

### Error: "password authentication failed"
```bash
# Solución: Verifica tu contraseña en .env
DATABASE_PASSWORD=tu_password_correcta
```

### Error: "database 'nest_app' does not exist"
```bash
# Solución: Crea la base de datos
psql -U postgres -c "CREATE DATABASE nest_app;"
```

### Error: "connect ECONNREFUSED"
```bash
# Solución: Asegúrate de que PostgreSQL esté corriendo
sudo service postgresql start  # Linux
brew services start postgresql # macOS
```

## 🎯 Siguiente Paso

¡Ahora puedes crear más entidades! Sigue el patrón de `User`:

1. Crear entity con decoradores de TypeORM
2. Registrar en el módulo con `TypeOrmModule.forFeature([Entity])`
3. Inyectar el repositorio en el servicio
4. ¡Listo para consultar!

---

**¿Todo funciona?** ✅ Continúa con [TYPEORM_GUIDE.md](./TYPEORM_GUIDE.md) para ejemplos avanzados.
