# 🛠️ Comandos Útiles para Despliegue

## Comandos Rápidos

### Subir a GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/TU_USUARIO/random-video-chat.git
git branch -M main
git push -u origin main
```

### Actualizar Código
```bash
git add .
git commit -m "Update: descripción del cambio"
git push
```

## Comandos de Desarrollo Local

### Iniciar Todo
```bash
# Iniciar servicios (Redis + PostgreSQL)
docker-compose -f docker-compose.dev.yml up -d

# Iniciar aplicación
npm run dev
```

### Detener Todo
```bash
# Detener aplicación (Ctrl+C)

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

### Ejecutar Migraciones
```bash
npm run migrate --workspace=packages/backend
```

### Crear Administrador
```bash
npm run create-admin --workspace=packages/backend
```

### Verificar Servicios
```bash
npm run verify --workspace=packages/backend
```

## Comandos de Docker

### Build Local
```bash
# Backend
docker build -f packages/backend/Dockerfile -t random-video-chat-backend .

# Frontend
docker build -f packages/frontend/Dockerfile -t random-video-chat-frontend .
```

### Ejecutar con Docker Compose
```bash
# Iniciar todo
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart backend
```

### Ejecutar Comandos en Contenedor
```bash
# Ejecutar migraciones
docker-compose -f docker-compose.prod.yml exec backend npm run migrate --workspace=packages/backend

# Crear administrador
docker-compose -f docker-compose.prod.yml exec backend npm run create-admin --workspace=packages/backend

# Ver logs de un servicio
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Comandos de Base de Datos

### PostgreSQL

#### Conectar a la Base de Datos
```bash
# Local
psql -U postgres -d random_video_chat

# Docker
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d random_video_chat
```

#### Backup
```bash
# Local
pg_dump -U postgres random_video_chat > backup_$(date +%Y%m%d).sql

# Docker
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres random_video_chat > backup_$(date +%Y%m%d).sql
```

#### Restore
```bash
# Local
psql -U postgres -d random_video_chat < backup.sql

# Docker
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d random_video_chat < backup.sql
```

### Redis

#### Conectar a Redis
```bash
# Local
redis-cli

# Docker
docker-compose -f docker-compose.prod.yml exec redis redis-cli
```

#### Ver Todas las Keys
```bash
redis-cli KEYS "*"
```

#### Limpiar Redis
```bash
redis-cli FLUSHALL
```

## Comandos de Railway

### Railway CLI (Opcional)

#### Instalar
```bash
npm install -g @railway/cli
```

#### Login
```bash
railway login
```

#### Ver Logs
```bash
railway logs
```

#### Ejecutar Comando
```bash
railway run npm run create-admin --workspace=packages/backend
```

#### Variables de Entorno
```bash
# Ver variables
railway variables

# Agregar variable
railway variables set KEY=value
```

## Comandos de Vercel

### Vercel CLI (Opcional)

#### Instalar
```bash
npm install -g vercel
```

#### Login
```bash
vercel login
```

#### Deploy
```bash
cd packages/frontend
vercel
```

#### Ver Logs
```bash
vercel logs
```

#### Variables de Entorno
```bash
# Agregar variable
vercel env add VITE_BACKEND_URL
```

## Comandos de Monitoreo

### Ver Estado de Servicios
```bash
# Docker
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats
```

### Health Check
```bash
# Backend
curl http://localhost:4000/health

# Producción
curl https://tu-backend.up.railway.app/health
```

### Ver Logs en Tiempo Real
```bash
# Docker - todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Docker - un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Railway (en el dashboard)
# Ve a Deployments → View Logs
```

## Comandos de Limpieza

### Limpiar Docker
```bash
# Detener y eliminar contenedores
docker-compose -f docker-compose.prod.yml down

# Eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose -f docker-compose.prod.yml down -v

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

### Limpiar Node Modules
```bash
# Root
rm -rf node_modules

# Backend
rm -rf packages/backend/node_modules

# Frontend
rm -rf packages/frontend/node_modules

# Reinstalar
npm install
```

## Comandos de Testing

### Ejecutar Tests
```bash
# Todos los tests
npm run test

# Solo backend
npm run test --workspace=packages/backend

# Solo frontend
npm run test --workspace=packages/frontend

# Con cobertura
npm run test -- --coverage
```

### Linting
```bash
# Lint todo
npm run lint

# Lint backend
npm run lint --workspace=packages/backend

# Lint frontend
npm run lint --workspace=packages/frontend
```

## Comandos de Build

### Build Local
```bash
# Build todo
npm run build

# Build backend
npm run build --workspace=packages/backend

# Build frontend
npm run build --workspace=packages/frontend
```

### Verificar Build
```bash
# Backend
cd packages/backend
npm run build
node dist/server.js

# Frontend
cd packages/frontend
npm run build
npm run preview
```

## Comandos de Seguridad

### Generar Contraseñas Seguras
```bash
# Contraseña de base de datos
openssl rand -base64 32

# Secret key
openssl rand -hex 32
```

### Verificar Vulnerabilidades
```bash
npm audit

# Arreglar automáticamente
npm audit fix
```

## Comandos de Git

### Crear Branch
```bash
git checkout -b feature/nueva-funcionalidad
```

### Merge a Main
```bash
git checkout main
git merge feature/nueva-funcionalidad
git push
```

### Ver Estado
```bash
git status
git log --oneline
```

### Deshacer Cambios
```bash
# Deshacer cambios no commiteados
git checkout .

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1
```

## Comandos de Troubleshooting

### Verificar Puertos
```bash
# Ver qué está usando el puerto 4000
lsof -i :4000

# Windows
netstat -ano | findstr :4000
```

### Matar Proceso
```bash
# Linux/Mac
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### Verificar Conexión a Base de Datos
```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

## Comandos Útiles de Railway

### Ver Información del Proyecto
```bash
railway status
```

### Abrir Dashboard
```bash
railway open
```

### Conectar a Base de Datos
```bash
# PostgreSQL
railway connect postgres

# Redis
railway connect redis
```

## Resumen de Comandos Más Usados

```bash
# Desarrollo
npm run dev                                    # Iniciar desarrollo
npm run migrate --workspace=packages/backend   # Ejecutar migraciones
npm run create-admin --workspace=packages/backend  # Crear admin

# Git
git add .                                      # Agregar cambios
git commit -m "mensaje"                        # Commit
git push                                       # Subir a GitHub

# Docker
docker-compose -f docker-compose.prod.yml up -d    # Iniciar
docker-compose -f docker-compose.prod.yml logs -f  # Ver logs
docker-compose -f docker-compose.prod.yml down     # Detener

# Health Check
curl http://localhost:4000/health              # Local
curl https://tu-backend.up.railway.app/health  # Producción
```

---

**Tip**: Guarda este archivo como referencia rápida durante el desarrollo y despliegue.

