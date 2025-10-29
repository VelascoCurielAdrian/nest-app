#!/bin/bash

echo "🔐 Script de Prueba del Sistema de Autenticación"
echo "=============================================="

# URL base de la aplicación
BASE_URL="http://localhost:3000"

echo
echo "📋 Pruebas disponibles:"
echo "1. GET /public (ruta pública)"
echo "2. GET /protected (ruta protegida - debe fallar sin token)"
echo "3. POST /auth/login (obtener token)"
echo "4. GET /protected (ruta protegida - debe funcionar con token)"
echo "5. GET /products (ruta protegida con usuario)"
echo "6. POST /auth/logout (cerrar sesión)"

echo
echo "🚀 Para ejecutar las pruebas:"
echo "1. Inicia el servidor: npm run start:dev"
echo "2. Ejecuta este script: ./test-auth.sh"

echo
echo "📝 Ejemplos de comandos curl:"
echo

echo "# Ruta pública:"
echo "curl -X GET $BASE_URL/public"

echo
echo "# Ruta protegida (sin autenticación - debe fallar):"
echo "curl -X GET $BASE_URL/protected"

echo
echo "# Login:"
echo "curl -X POST $BASE_URL/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"admin\",\"password\":\"admin123\"}' \\"
echo "  -c cookies.txt"

echo
echo "# Ruta protegida (con cookies):"
echo "curl -X GET $BASE_URL/protected -b cookies.txt"

echo
echo "# Productos (con usuario autenticado):"
echo "curl -X GET $BASE_URL/products -b cookies.txt"

echo
echo "# Verificar sesión:"
echo "curl -X GET $BASE_URL/auth/verify -b cookies.txt"

echo
echo "# Logout:"
echo "curl -X POST $BASE_URL/auth/logout -b cookies.txt -c cookies.txt"

echo
echo "⚠️  Nota: Asegúrate de tener un usuario 'admin' con contraseña 'admin123' en tu base de datos"