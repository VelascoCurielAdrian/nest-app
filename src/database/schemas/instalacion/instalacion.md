# ORDEN DE LAS MIGRACIONES Y TABLAS SQL

A continuación se presenta el orden de las migraciones y los nombres de las tablas asociadas a cada archivo en el proceso de instalación:

1. **PROFILE**
   - Tabla: `profile.sql`

2. **USERS**
   - Tabla: `users.sql`

3. **USERS PROFILE**
   - Tabla: `user_profile.sql`

4. **PERMISSION**
   - Tabla: `permissions.sql`
      npx knex seed:run --specific carga_inicial.ts
      npx knex seed:run --specific=secciones.ts

