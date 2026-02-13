#!/bin/bash

# Script de despliegue automatizado para Random Video Chat
# Uso: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Iniciando despliegue en modo: $ENV"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_message "Docker y Docker Compose están instalados"

# Verificar que existe el archivo .env.production
if [ ! -f .env.production ]; then
    print_warning "Archivo .env.production no encontrado"
    echo "Creando desde .env.production.example..."
    cp .env.production.example .env.production
    print_warning "Por favor, edita .env.production con tus valores antes de continuar"
    exit 1
fi

print_message "Archivo de configuración encontrado"

# Hacer pull de últimos cambios (si es un repositorio git)
if [ -d .git ]; then
    print_message "Actualizando código desde repositorio..."
    git pull origin main || print_warning "No se pudo hacer pull del repositorio"
fi

# Detener servicios existentes
print_message "Deteniendo servicios existentes..."
docker compose -f $COMPOSE_FILE down || true

# Construir imágenes
print_message "Construyendo imágenes Docker..."
docker compose -f $COMPOSE_FILE build --no-cache

# Iniciar servicios
print_message "Iniciando servicios..."
docker compose -f $COMPOSE_FILE up -d

# Esperar a que los servicios estén listos
print_message "Esperando a que los servicios estén listos..."
sleep 10

# Verificar que los servicios estén corriendo
print_message "Verificando servicios..."
docker compose -f $COMPOSE_FILE ps

# Ejecutar migraciones
print_message "Ejecutando migraciones de base de datos..."
docker compose -f $COMPOSE_FILE exec -T backend node packages/backend/dist/migrations/migrate.js || print_warning "Las migraciones fallaron o ya están aplicadas"

# Verificar health checks
print_message "Verificando health checks..."
sleep 5

# Backend health check
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_message "Backend está saludable"
else
    print_error "Backend no responde al health check"
fi

# Frontend health check
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_message "Frontend está saludable"
else
    print_error "Frontend no responde al health check"
fi

# Mostrar logs
print_message "Mostrando logs recientes..."
docker compose -f $COMPOSE_FILE logs --tail=50

echo ""
print_message "¡Despliegue completado!"
echo ""
echo "📊 Comandos útiles:"
echo "  Ver logs:        docker compose -f $COMPOSE_FILE logs -f"
echo "  Ver estado:      docker compose -f $COMPOSE_FILE ps"
echo "  Detener:         docker compose -f $COMPOSE_FILE down"
echo "  Reiniciar:       docker compose -f $COMPOSE_FILE restart"
echo ""
echo "🌐 URLs:"
echo "  Frontend:        http://localhost"
echo "  Backend:         http://localhost:4000"
echo "  Backend Health:  http://localhost:4000/health"
echo ""
