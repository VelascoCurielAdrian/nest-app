#!/bin/bash

echo "🔧 Test para verificar el problema del token"
echo "=========================================="

BASE_URL="http://localhost:3000"

echo "1. Probando login para obtener un token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"master","password":"123456"}' \
  -c test_cookies.txt)

echo "Login response: $LOGIN_RESPONSE"

echo ""
echo "2. Verificando el token con /auth/verify..."
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/verify" -b test_cookies.txt)
echo "Verify response: $VERIFY_RESPONSE"

echo ""
echo "3. Probando ruta protegida /users/ (esto fallaba antes)..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/" -b test_cookies.txt)
echo "Users response: $USERS_RESPONSE"

echo ""
echo "4. Probando ruta protegida /protected..."
PROTECTED_RESPONSE=$(curl -s -X GET "$BASE_URL/protected" -b test_cookies.txt)
echo "Protected response: $PROTECTED_RESPONSE"

# Limpiar archivos temporales
rm -f test_cookies.txt

echo ""
echo "✅ Test completado. Si no ves errores 401 en las rutas protegidas, el problema está resuelto."