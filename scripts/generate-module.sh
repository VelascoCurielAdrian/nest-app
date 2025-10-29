#!/bin/bash

# Script para generar un módulo completo de NestJS
# Uso: ./scripts/generate-module.sh nombre-del-modulo

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}📦 Generador de Módulos NestJS${NC}"
    echo -e "${YELLOW}Uso: ./scripts/generate-module.sh <nombre-del-modulo> [opciones]${NC}"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  --no-entity    No generar entity"
    echo "  --no-dto       No generar DTOs"
    echo "  --full         Generar estructura completa (por defecto)"
    echo ""
    echo "Ejemplos:"
    echo "  ./scripts/generate-module.sh products"
    echo "  ./scripts/generate-module.sh orders --no-entity"
}

# Verificar argumentos
if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

MODULE_NAME=$1
GENERATE_ENTITY=true
GENERATE_DTO=true

# Procesar argumentos adicionales
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-entity)
            GENERATE_ENTITY=false
            shift
            ;;
        --no-dto)
            GENERATE_DTO=false
            shift
            ;;
        --full)
            GENERATE_ENTITY=true
            GENERATE_DTO=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Opción desconocida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Convertir a formato adecuado
MODULE_PASCAL=$(echo $MODULE_NAME | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')
MODULE_CAMEL=$(echo $MODULE_NAME | sed 's/-\([a-z]\)/\U\1/g')

echo -e "${BLUE}🚀 Generando módulo: ${YELLOW}$MODULE_NAME${NC}"
echo -e "${BLUE}📁 Directorio: ${YELLOW}src/modules/$MODULE_NAME${NC}"

# Crear directorio del módulo
MODULE_DIR="src/modules/$MODULE_NAME"
mkdir -p "$MODULE_DIR"

# Crear subdirectorios
if [ "$GENERATE_DTO" = true ]; then
    mkdir -p "$MODULE_DIR/dto"
fi

if [ "$GENERATE_ENTITY" = true ]; then
    mkdir -p "$MODULE_DIR/entities"
fi

mkdir -p "$MODULE_DIR/interfaces"

echo -e "${GREEN}✅ Directorios creados${NC}"

# Generar archivos usando NestJS CLI
echo -e "${BLUE}📝 Generando archivos con NestJS CLI...${NC}"

# Generar módulo, controlador y servicio
nest g module modules/$MODULE_NAME --no-spec
nest g controller modules/$MODULE_NAME --no-spec
nest g service modules/$MODULE_NAME --no-spec

echo -e "${GREEN}✅ Archivos básicos generados${NC}"

# Generar DTOs si está habilitado
if [ "$GENERATE_DTO" = true ]; then
    echo -e "${BLUE}📝 Generando DTOs...${NC}"
    
    # Create DTO
    cat > "$MODULE_DIR/dto/create-$MODULE_NAME.dto.ts" << EOF
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class Create${MODULE_PASCAL}Dto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
EOF

    # Update DTO
    cat > "$MODULE_DIR/dto/update-$MODULE_NAME.dto.ts" << EOF
import { PartialType } from '@nestjs/mapped-types';

import { Create${MODULE_PASCAL}Dto } from './create-$MODULE_NAME.dto';

export class Update${MODULE_PASCAL}Dto extends PartialType(Create${MODULE_PASCAL}Dto) {}
EOF

    echo -e "${GREEN}✅ DTOs generados${NC}"
fi

# Generar Entity si está habilitado
if [ "$GENERATE_ENTITY" = true ]; then
    echo -e "${BLUE}📝 Generando Entity...${NC}"
    
    cat > "$MODULE_DIR/entities/$MODULE_NAME.entity.ts" << EOF
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('${MODULE_NAME}s')
export class ${MODULE_PASCAL} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
EOF

    echo -e "${GREEN}✅ Entity generado${NC}"
fi

# Generar Interface
echo -e "${BLUE}📝 Generando Interface...${NC}"

cat > "$MODULE_DIR/interfaces/$MODULE_NAME.interface.ts" << EOF
export interface I${MODULE_PASCAL} {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface I${MODULE_PASCAL}Service {
  findAll(): Promise<I${MODULE_PASCAL}[]>;
  findOne(id: string): Promise<I${MODULE_PASCAL}>;
  create(create${MODULE_PASCAL}Dto: any): Promise<I${MODULE_PASCAL}>;
  update(id: string, update${MODULE_PASCAL}Dto: any): Promise<I${MODULE_PASCAL}>;
  remove(id: string): Promise<void>;
}
EOF

echo -e "${GREEN}✅ Interface generado${NC}"

# Crear archivo de índice para exportaciones
cat > "$MODULE_DIR/index.ts" << EOF
// Módulo
export * from './$MODULE_NAME.module';
export * from './$MODULE_NAME.controller';
export * from './$MODULE_NAME.service';

// DTOs
$(if [ "$GENERATE_DTO" = true ]; then
echo "export * from './dto/create-$MODULE_NAME.dto';"
echo "export * from './dto/update-$MODULE_NAME.dto';"
fi)

// Entities
$(if [ "$GENERATE_ENTITY" = true ]; then
echo "export * from './entities/$MODULE_NAME.entity';"
fi)

// Interfaces
export * from './interfaces/$MODULE_NAME.interface';
EOF

echo -e "${GREEN}✅ Archivo index.ts generado${NC}"

# Mostrar resumen
echo ""
echo -e "${BLUE}📊 Resumen de archivos generados:${NC}"
echo -e "${GREEN}✅ Módulo: ${YELLOW}$MODULE_DIR/$MODULE_NAME.module.ts${NC}"
echo -e "${GREEN}✅ Controlador: ${YELLOW}$MODULE_DIR/$MODULE_NAME.controller.ts${NC}"
echo -e "${GREEN}✅ Servicio: ${YELLOW}$MODULE_DIR/$MODULE_NAME.service.ts${NC}"

if [ "$GENERATE_DTO" = true ]; then
    echo -e "${GREEN}✅ Create DTO: ${YELLOW}$MODULE_DIR/dto/create-$MODULE_NAME.dto.ts${NC}"
    echo -e "${GREEN}✅ Update DTO: ${YELLOW}$MODULE_DIR/dto/update-$MODULE_NAME.dto.ts${NC}"
fi

if [ "$GENERATE_ENTITY" = true ]; then
    echo -e "${GREEN}✅ Entity: ${YELLOW}$MODULE_DIR/entities/$MODULE_NAME.entity.ts${NC}"
fi

echo -e "${GREEN}✅ Interface: ${YELLOW}$MODULE_DIR/interfaces/$MODULE_NAME.interface.ts${NC}"
echo -e "${GREEN}✅ Index: ${YELLOW}$MODULE_DIR/index.ts${NC}"

echo ""
echo -e "${BLUE}🔧 Próximos pasos:${NC}"
echo -e "${YELLOW}1. Registra el módulo en app.module.ts${NC}"
echo -e "${YELLOW}2. Configura la entity en TypeORM (si aplica)${NC}"
echo -e "${YELLOW}3. Implementa la lógica de negocio en el servicio${NC}"
echo -e "${YELLOW}4. Define las rutas en el controlador${NC}"

echo ""
echo -e "${GREEN}🎉 ¡Módulo $MODULE_NAME generado exitosamente!${NC}"