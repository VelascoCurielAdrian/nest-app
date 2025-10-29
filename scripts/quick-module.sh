#!/bin/bash

# Script rápido para generar módulos con NestJS CLI
# Uso: ./scripts/quick-module.sh nombre-del-modulo

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -eq 0 ]; then
    echo -e "${BLUE}Uso: ./scripts/quick-module.sh <nombre-del-modulo>${NC}"
    echo -e "${YELLOW}Ejemplo: ./scripts/quick-module.sh products${NC}"
    exit 1
fi

MODULE_NAME=$1

echo -e "${BLUE}🚀 Generando módulo rápido: ${YELLOW}$MODULE_NAME${NC}"

# Generar resource completo con NestJS CLI
nest generate resource modules/$MODULE_NAME --no-spec

echo -e "${GREEN}✅ Módulo $MODULE_NAME generado con NestJS CLI${NC}"
echo -e "${YELLOW}📁 Ubicación: src/modules/$MODULE_NAME${NC}"