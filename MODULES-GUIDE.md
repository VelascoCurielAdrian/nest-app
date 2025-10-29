# 🚀 Guía de Generación de Módulos NestJS

Esta guía te ayudará a generar módulos de manera rápida y eficiente en tu aplicación NestJS.

## 📋 Tabla de Contenidos

1. [Comandos NestJS CLI](#comandos-nestjs-cli)
2. [Scripts Personalizados](#scripts-personalizados)
3. [Comandos NPM](#comandos-npm)
4. [Ejemplos Prácticos](#ejemplos-prácticos)
5. [Estructura Generada](#estructura-generada)

## 🔧 Comandos NestJS CLI

### Generar Resource Completo (Recomendado)
```bash
# Genera módulo, controlador, servicio y DTOs básicos
nest generate resource modules/nombre-modulo
nest g res modules/nombre-modulo

# Ejemplos:
nest g res modules/products
nest g res modules/orders
nest g res modules/categories
```

### Comandos Individuales
```bash
# Solo módulo
nest g module modules/nombre-modulo

# Solo controlador
nest g controller modules/nombre-modulo

# Solo servicio
nest g service modules/nombre-modulo

# Clase/DTO
nest g class modules/nombre-modulo/dto/create-nombre-modulo.dto --no-spec

# Interface
nest g interface modules/nombre-modulo/interfaces/nombre-modulo.interface --no-spec
```

## 🛠️ Scripts Personalizados

### Script Completo (`generate-module.sh`)
Genera una estructura completa con entities, DTOs, interfaces y más.

```bash
# Uso básico
./scripts/generate-module.sh nombre-modulo

# Con opciones
./scripts/generate-module.sh products --no-entity
./scripts/generate-module.sh orders --no-dto
./scripts/generate-module.sh categories --full
```

**Opciones disponibles:**
- `--no-entity`: No genera entity de TypeORM
- `--no-dto`: No genera DTOs
- `--full`: Genera estructura completa (por defecto)
- `-h, --help`: Muestra ayuda

### Script Rápido (`quick-module.sh`)
Usa directamente el CLI de NestJS para generación rápida.

```bash
# Genera usando nest g resource
./scripts/quick-module.sh nombre-modulo
```

## 📦 Comandos NPM

Agregados al `package.json` para mayor comodidad:

```bash
# Script completo
npm run generate:module nombre-modulo
npm run g:module nombre-modulo

# Script rápido
npm run generate:quick nombre-modulo
npm run g:quick nombre-modulo
```

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Módulo de Productos
```bash
# Opción 1: NestJS CLI
nest g res modules/products

# Opción 2: Script personalizado
./scripts/generate-module.sh products

# Opción 3: NPM script
npm run g:module products
```

### Ejemplo 2: Módulo sin Entity
```bash
# Para módulos que no necesitan base de datos
./scripts/generate-module.sh notifications --no-entity
npm run g:module notifications -- --no-entity
```

### Ejemplo 3: Módulo mínimo
```bash
# Solo lo básico con NestJS CLI
./scripts/quick-module.sh settings
npm run g:quick settings
```

## 📁 Estructura Generada

### Con Script Completo (`generate-module.sh`)
```
src/modules/nombre-modulo/
├── nombre-modulo.module.ts
├── nombre-modulo.controller.ts
├── nombre-modulo.service.ts
├── index.ts
├── dto/
│   ├── create-nombre-modulo.dto.ts
│   └── update-nombre-modulo.dto.ts
├── entities/
│   └── nombre-modulo.entity.ts
└── interfaces/
    └── nombre-modulo.interface.ts
```

### Con NestJS CLI (`nest g res`)
```
src/modules/nombre-modulo/
├── nombre-modulo.module.ts
├── nombre-modulo.controller.ts
├── nombre-modulo.service.ts
├── dto/
│   ├── create-nombre-modulo.dto.ts
│   └── update-nombre-modulo.dto.ts
└── entities/
    └── nombre-modulo.entity.ts
```

## ⚡ Comandos Más Usados

```bash
# Los más rápidos y eficientes
npm run g:quick nombre-modulo        # Para generar rápido
npm run g:module nombre-modulo       # Para estructura completa
nest g res modules/nombre-modulo     # Usando CLI directamente
```

## 🔄 Flujo de Trabajo Recomendado

1. **Para módulos estándar con CRUD:**
   ```bash
   npm run g:module products
   ```

2. **Para módulos sin base de datos:**
   ```bash
   npm run g:module notifications -- --no-entity
   ```

3. **Para prototipado rápido:**
   ```bash
   npm run g:quick settings
   ```

4. **Después de generar:**
   - Registrar el módulo en `app.module.ts`
   - Configurar entities en TypeORM
   - Implementar lógica de negocio
   - Definir rutas y validaciones

## 🚨 Notas Importantes

- Los nombres de módulos se convierten automáticamente a formato kebab-case
- Los archivos de especificación (`.spec.ts`) no se generan por defecto
- El script completo incluye validaciones y interfaces adicionales
- Todos los archivos se generan en `src/modules/`
- Se incluye un archivo `index.ts` para exportaciones centralizadas

## 🆘 Resolución de Problemas

### Error: "nest command not found"
```bash
# Instalar NestJS CLI globalmente
npm install -g @nestjs/cli
```

### Error: "Permission denied"
```bash
# Dar permisos de ejecución a los scripts
chmod +x scripts/*.sh
```

### Error: "Module already exists"
```bash
# Eliminar el módulo existente primero
rm -rf src/modules/nombre-modulo
```

¡Con esta guía podrás generar módulos de manera super eficiente! 🎉