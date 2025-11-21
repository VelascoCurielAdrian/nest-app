# Comparación: SQL vs Repositories

## ❌ Antes (Con SQL directo)

```typescript
// Queries SQL directas - propensas a errores
const profileResult = await queryRunner.query(
  `INSERT INTO profile (name, description, status, created_at) 
   VALUES ($1, $2, $3, NOW()) 
   RETURNING *`,
  ['Master', 'Perfil master con todos los permisos', true]
);
const profile = profileResult[0]; // any type, sin validación
```

**Problemas:**
- ❌ No type-safe
- ❌ SQL propenso a errores de sintaxis
- ❌ Difícil de mantener
- ❌ No aprovecha validaciones de entidades
- ❌ Cambios en la DB requieren actualizar SQL

## ✅ Después (Con Repositories)

```typescript
// Usa las entidades y repositorios - robusto y type-safe
const profileRepository = queryRunner.manager.getRepository(Profile);

const profile = profileRepository.create({
  name: 'Master',
  description: 'Perfil master con todos los permisos',
  status: true,
});

await profileRepository.save(profile);
```

**Ventajas:**
- ✅ Completamente tipado
- ✅ Autocompletado en el IDE
- ✅ Usa las mismas entidades que el resto de la app
- ✅ Validaciones automáticas con decoradores
- ✅ Si cambias la entidad, TypeScript te avisa
- ✅ Menos código, más legible

## 🎯 Ejemplo Real de Beneficios

### Cambio en la Entidad

Si agregas un campo requerido en la entidad:

```typescript
@Entity('profile')
export class Profile {
  // ... campos existentes

  @Column({ nullable: false })
  department: string; // Nuevo campo requerido
}
```

**Con SQL:**
```typescript
// ❌ No sabrás que falta el campo hasta runtime
const result = await queryRunner.query(
  `INSERT INTO profile (name, description, status, created_at) 
   VALUES ($1, $2, $3, NOW()) RETURNING *`,
  ['Master', 'Perfil master', true]
);
// Error en runtime: null value in column "department"
```

**Con Repositories:**
```typescript
// ✅ Error de compilación inmediato
const profile = profileRepository.create({
  name: 'Master',
  description: 'Perfil master',
  status: true,
  // TypeScript error: Property 'department' is missing
});
```

## 🚀 Rendimiento

Ambos enfoques tienen rendimiento similar, pero:
- **Repositories**: TypeORM optimiza las queries
- **Repositories**: Aprovecharán features futuras de TypeORM
- **Repositories**: Mejor para transacciones complejas

## 📊 Casos de Uso

### Usa Repositories cuando:
- ✅ Operaciones CRUD estándar
- ✅ Quieres aprovechar decoradores de validación
- ✅ Necesitas consistencia con el resto de la app
- ✅ El equipo no es experto en SQL

### Usa SQL directo cuando:
- ⚠️ Operaciones muy complejas (JOINs múltiples)
- ⚠️ Necesitas optimización extrema
- ⚠️ Operaciones bulk masivas (>10k registros)
- ⚠️ Queries específicas del motor de DB

## 🎓 Conclusión

Para seeds y operaciones estándar, **usa Repositories**. Es más mantenible, seguro y consistente con tu aplicación NestJS.
