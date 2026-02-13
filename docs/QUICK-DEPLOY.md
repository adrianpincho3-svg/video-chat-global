# 🚀 Despliegue Rápido - Random Video Chat

Guía rápida para desplegar la aplicación en menos de 10 minutos.

## Opción 1: Despliegue Local con Docker (Más Rápido)

### Requisitos
- Docker y Docker Compose instalados
- 2GB RAM disponible

### Pasos

```bash
# 1. Clonar repositorio
git clone <your-repo> random-video-chat
cd random-video-chat

# 2. Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tu editor favorito

# 3. Ejecutar script de despliegue
chmod +x deploy.sh
./deploy.sh

# 4. Crear administrador (opcional)
docker compose -f docker-compose.prod.yml exec backend \
  node packages/backend/dist/utils/create-admin.js
```

**¡Listo!** La aplicación estará disponible en:
- Frontend: http://localhost
- Backend: http://localhost:4000

## Opción 2: Despliegue en Servidor VPS

### Requisitos
- Servidor Ubuntu 20.04+ con IP pública
- Dominio apuntando al servidor
- Acceso SSH

### Pasos

```bash
# 1. Conectar al servidor
ssh user@your-server-ip

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Clonar y configurar
git clone <your-repo> random-video-chat
cd random-video-chat
cp .env.production.example .env.production
nano .env.production  # Editar con tus valores

# 4. Desplegar
chmod +x deploy.sh
./deploy.sh

# 5. Configurar SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Opción 3: Despliegue en Railway (Gratis)

### Frontend + Backend en Railway

1. **Ir a [railway.app](https://railway.app)**

2. **Crear nuevo proyecto:**
   - Click en "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Conectar tu repositorio

3. **Configurar servicios:**

   **Backend:**
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
   - Variables de entorno:
     ```
     NODE_ENV=production
     PORT=4000
     ```

   **Frontend:**
   - Root Directory: `packages/frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   - Variables de entorno:
     ```
     VITE_BACKEND_URL=https://your-backend.railway.app
     ```

4. **Agregar bases de datos:**
   - Click en "New" → "Database" → "Add PostgreSQL"
   - Click en "New" → "Database" → "Add Redis"

5. **Conectar variables:**
   - Railway auto-conectará las bases de datos
   - Copiar URLs y agregarlas al backend

6. **Desplegar:**
   - Railway desplegará automáticamente
   - Obtendrás URLs públicas para frontend y backend

## Opción 4: Despliegue en Vercel + Render

### Frontend en Vercel

1. **Ir a [vercel.com](https://vercel.com)**
2. **Importar proyecto:**
   - Click en "New Project"
   - Importar desde GitHub
   - Root Directory: `packages/frontend`
3. **Configurar:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_BACKEND_URL=https://your-backend.onrender.com
     ```
4. **Deploy**

### Backend en Render

1. **Ir a [render.com](https://render.com)**
2. **Crear Web Service:**
   - Connect repository
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
3. **Agregar bases de datos:**
   - PostgreSQL (gratis)
   - Redis (gratis)
4. **Variables de entorno:**
   ```
   NODE_ENV=production
   DATABASE_URL=<auto-filled>
   REDIS_URL=<auto-filled>
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. **Deploy**

## Variables de Entorno Mínimas

```env
# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Base de Datos
DB_PASSWORD=your-secure-password

# AI Provider (opcional)
AI_PROVIDER=mock
```

## Verificación Post-Despliegue

### 1. Verificar Backend
```bash
curl https://api.yourdomain.com/health
# Debe retornar: {"status":"ok",...}
```

### 2. Verificar Frontend
```bash
curl https://yourdomain.com/health
# Debe retornar: healthy
```

### 3. Probar WebSocket
```bash
# Abrir navegador en https://yourdomain.com
# Abrir DevTools → Network → WS
# Debe ver conexión Socket.io establecida
```

## Troubleshooting Rápido

### Backend no inicia
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs backend

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml exec backend env | grep DB
```

### Frontend muestra error de conexión
```bash
# Verificar que VITE_BACKEND_URL esté correcto
# Debe apuntar a la URL pública del backend
```

### WebRTC no funciona
- ✅ Verificar que HTTPS esté habilitado (requerido)
- ✅ Verificar que Socket.io esté conectado
- ✅ Verificar permisos de cámara/micrófono en navegador

## Comandos Útiles

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Detener todo
docker compose -f docker-compose.prod.yml down

# Ver uso de recursos
docker stats

# Backup de base de datos
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres random_video_chat > backup.sql
```

## Costos Estimados

### Opción Gratuita (Railway/Render Free Tier)
- **Costo:** $0/mes
- **Límites:** 500 horas/mes, 512MB RAM
- **Ideal para:** Pruebas y demos

### VPS Básico (DigitalOcean/Linode)
- **Costo:** $5-10/mes
- **Recursos:** 1GB RAM, 1 CPU, 25GB SSD
- **Ideal para:** Producción pequeña (10-50 usuarios concurrentes)

### VPS Medio
- **Costo:** $20-40/mes
- **Recursos:** 4GB RAM, 2 CPU, 80GB SSD
- **Ideal para:** Producción media (100-500 usuarios concurrentes)

## Próximos Pasos

1. ✅ Configurar dominio personalizado
2. ✅ Habilitar SSL/HTTPS
3. ✅ Configurar backups automáticos
4. ✅ Configurar monitoreo (opcional)
5. ✅ Crear administrador
6. ✅ Probar funcionalidad completa

## Soporte

- 📚 Documentación completa: `docs/DEPLOYMENT.md`
- 🐛 Troubleshooting: `docs/DEPLOYMENT.md#troubleshooting`
- 📊 Monitoreo: `docs/DEPLOYMENT.md#monitoreo`

---

**¿Necesitas ayuda?** Revisa los logs con:
```bash
docker compose -f docker-compose.prod.yml logs -f
```
