# Guía de Despliegue - Random Video Chat

Esta guía cubre el despliegue completo de la aplicación en producción.

## 📋 Requisitos Previos

- Servidor con Docker y Docker Compose instalados
- Dominio configurado (ej: `yourdomain.com`)
- Certificado SSL (Let's Encrypt recomendado)
- Mínimo 2GB RAM, 2 CPU cores, 20GB disco

## 🚀 Opción 1: Despliegue con Docker Compose (Recomendado)

### Paso 1: Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Paso 2: Clonar el Repositorio

```bash
# Clonar proyecto
git clone <your-repo-url> random-video-chat
cd random-video-chat
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Variables importantes a configurar:**

```env
# URLs (cambiar por tu dominio)
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Base de Datos (usar contraseña segura)
DB_PASSWORD=$(openssl rand -base64 32)

# AI Provider (opcional)
AI_PROVIDER=mock  # o 'openai' / 'anthropic' con API keys
```

### Paso 4: Construir y Ejecutar

```bash
# Construir imágenes
docker compose -f docker-compose.prod.yml build

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Paso 5: Ejecutar Migraciones

```bash
# Ejecutar migraciones de base de datos
docker compose -f docker-compose.prod.yml exec backend node packages/backend/dist/migrations/migrate.js

# Crear administrador
docker compose -f docker-compose.prod.yml exec backend node packages/backend/dist/utils/create-admin.js
```

### Paso 6: Configurar Nginx Reverse Proxy (Opcional pero Recomendado)

Si quieres usar un dominio con HTTPS:

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/random-video-chat
```

**Configuración de Nginx:**

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/random-video-chat /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 7: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## 🌐 Opción 2: Despliegue en Servicios Cloud

### Vercel (Frontend)

1. **Conectar repositorio:**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   - Seleccionar carpeta `packages/frontend`

2. **Configurar variables de entorno:**
   ```
   VITE_BACKEND_URL=https://your-backend-url.com
   ```

3. **Configurar build:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Desplegar:**
   - Click en "Deploy"
   - Vercel asignará un dominio automáticamente

### Railway / Render (Backend)

1. **Crear nuevo proyecto:**
   - Conectar repositorio GitHub
   - Seleccionar carpeta `packages/backend`

2. **Configurar servicios:**
   - Agregar PostgreSQL
   - Agregar Redis
   - Configurar variables de entorno

3. **Variables de entorno:**
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<provided-by-service>
   REDIS_URL=<provided-by-service>
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Desplegar:**
   - El servicio desplegará automáticamente

### DigitalOcean App Platform

1. **Crear nueva app:**
   - Conectar repositorio
   - Seleccionar monorepo

2. **Configurar componentes:**
   - **Frontend:** Static Site
     - Build: `npm run build --workspace=packages/frontend`
     - Output: `packages/frontend/dist`
   
   - **Backend:** Web Service
     - Build: `npm run build --workspace=packages/backend`
     - Run: `node packages/backend/dist/server.js`

3. **Agregar bases de datos:**
   - PostgreSQL (Managed Database)
   - Redis (Managed Database)

4. **Configurar variables de entorno**

5. **Desplegar**

## 🔧 Configuración Post-Despliegue

### 1. Verificar Servicios

```bash
# Verificar que todos los contenedores estén corriendo
docker compose -f docker-compose.prod.yml ps

# Verificar logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Verificar salud de servicios
curl http://localhost:4000/health
curl http://localhost/health
```

### 2. Crear Administrador

```bash
# Ejecutar script de creación
docker compose -f docker-compose.prod.yml exec backend \
  node packages/backend/dist/utils/create-admin.js
```

### 3. Configurar Monitoreo (Opcional)

**Instalar Prometheus + Grafana:**

```bash
# Agregar a docker-compose.prod.yml
# Ver ejemplo en docs/monitoring-setup.md
```

### 4. Configurar Backups

```bash
# Backup de PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres random_video_chat > backup_$(date +%Y%m%d).sql

# Backup de Redis
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli SAVE
```

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar firewall (UFW)
- [ ] Habilitar HTTPS con certificados válidos
- [ ] Configurar rate limiting en Nginx
- [ ] Actualizar sistema operativo regularmente
- [ ] Configurar backups automáticos
- [ ] Habilitar logs de auditoría
- [ ] Configurar fail2ban

### Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar estado
sudo ufw status
```

## 📊 Monitoreo

### Logs

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend

# Ver últimas 100 líneas
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Métricas

```bash
# Ver uso de recursos
docker stats

# Ver estado de contenedores
docker compose -f docker-compose.prod.yml ps
```

## 🔄 Actualización

### Actualizar la Aplicación

```bash
# 1. Hacer pull de cambios
git pull origin main

# 2. Reconstruir imágenes
docker compose -f docker-compose.prod.yml build

# 3. Reiniciar servicios
docker compose -f docker-compose.prod.yml up -d

# 4. Ejecutar migraciones si hay
docker compose -f docker-compose.prod.yml exec backend \
  node packages/backend/dist/migrations/migrate.js
```

### Rollback

```bash
# Volver a versión anterior
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs backend

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml exec backend env

# Verificar conexión a base de datos
docker compose -f docker-compose.prod.yml exec backend \
  node -e "require('./packages/backend/dist/config/database').pingDatabase()"
```

### Frontend no carga

```bash
# Verificar que Nginx esté corriendo
docker compose -f docker-compose.prod.yml ps frontend

# Ver logs de Nginx
docker compose -f docker-compose.prod.yml logs frontend

# Verificar archivos estáticos
docker compose -f docker-compose.prod.yml exec frontend ls -la /usr/share/nginx/html
```

### WebRTC no funciona

- Verificar que HTTPS esté habilitado (requerido para WebRTC)
- Verificar que los puertos estén abiertos en el firewall
- Verificar configuración de STUN/TURN servers
- Verificar que Socket.io esté conectado

### Base de datos no conecta

```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.prod.yml ps postgres

# Probar conexión
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d random_video_chat -c "SELECT 1"

# Ver logs
docker compose -f docker-compose.prod.yml logs postgres
```

## 📈 Escalado

### Escalado Horizontal

```bash
# Escalar backend a 3 instancias
docker compose -f docker-compose.prod.yml up -d --scale backend=3

# Configurar load balancer (Nginx)
# Ver docs/load-balancing.md
```

### Optimización de Performance

1. **Habilitar Redis persistence:**
   ```yaml
   # En docker-compose.prod.yml
   command: redis-server --appendonly yes --save 60 1000
   ```

2. **Configurar pool de conexiones PostgreSQL:**
   ```env
   DB_POOL_MIN=2
   DB_POOL_MAX=10
   ```

3. **Habilitar compresión en Nginx:**
   - Ya configurado en `nginx.conf`

## 🎯 Checklist de Despliegue

- [ ] Servidor configurado con Docker
- [ ] Dominio apuntando al servidor
- [ ] Variables de entorno configuradas
- [ ] Servicios iniciados con Docker Compose
- [ ] Migraciones ejecutadas
- [ ] Administrador creado
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Backups configurados
- [ ] Monitoreo configurado
- [ ] Pruebas de funcionalidad realizadas
- [ ] Documentación actualizada

## 📞 Soporte

Para problemas o preguntas:
- Revisar logs: `docker compose logs`
- Verificar health checks: `/health` endpoints
- Consultar documentación en `docs/`

---

**Última actualización:** 2026-02-13
