# 🚀 Desplegar en Render.com (5 Minutos)

## ✅ Por Qué Render en Lugar de Railway

- Mejor soporte para monorepos
- Configuración más simple
- Free tier más generoso
- Menos problemas con builds

## 📋 Pasos para Desplegar

### Paso 1: Ir a Render (30 segundos)

1. Abre tu navegador
2. Ve a: **https://render.com**
3. Click en **"Get Started"** o **"Sign In"**
4. Inicia sesión con GitHub

### Paso 2: Crear Nuevo Servicio (1 minuto)

1. Click en **"New +"** (arriba a la derecha)
2. Selecciona **"Blueprint"**
3. Click en **"Connect a repository"**
4. Busca y selecciona: **`video-chat-global`**
5. Click en **"Connect"**

### Paso 3: Render Detectará render.yaml (Automático)

Render leerá el archivo `render.yaml` y configurará automáticamente:
- ✅ Web Service (backend)
- ✅ PostgreSQL database
- ✅ Redis database
- ✅ Variables de entorno
- ✅ Health checks

### Paso 4: Aprobar y Desplegar (30 segundos)

1. Render mostrará un preview de los servicios
2. Verás:
   - **video-chat-backend** (Web Service)
   - **video-chat-postgres** (PostgreSQL)
   - **video-chat-redis** (Redis)
3. Click en **"Apply"**
4. Render comenzará a desplegar automáticamente

### Paso 5: Esperar el Deploy (3-5 minutos)

1. Verás el progreso en tiempo real
2. Render instalará dependencias
3. Iniciará el servidor
4. Conectará las bases de datos automáticamente

### Paso 6: Obtener la URL (30 segundos)

1. Una vez que el deploy diga **"Live"** (verde)
2. Click en el servicio **"video-chat-backend"**
3. Copia la URL (será algo como: `https://video-chat-backend.onrender.com`)

### Paso 7: Configurar Vercel (1 minuto)

1. Ve a https://vercel.com
2. Abre tu proyecto
3. Settings → Environment Variables
4. Edita `VITE_BACKEND_URL`:
   ```
   VITE_BACKEND_URL=https://video-chat-backend.onrender.com
   ```
5. Save
6. Deployments → Redeploy

## ✅ Verificar que Funciona

1. Abre: `https://video-chat-backend.onrender.com/health`
2. Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "services": {...}
   }
   ```

3. Abre tu app: `https://video-chat-global-final.vercel.app/chat`
4. El mensaje "Backend No Disponible" debería desaparecer
5. Podrás iniciar chat

## 🎯 Ventajas de Render

- ✅ Detecta monorepos automáticamente
- ✅ Configura bases de datos automáticamente
- ✅ Variables de entorno automáticas
- ✅ Health checks integrados
- ✅ Logs en tiempo real
- ✅ Auto-deploy desde GitHub

## 📊 URLs Finales

Después del despliegue:
- **Backend**: `https://video-chat-backend.onrender.com`
- **Frontend**: `https://video-chat-global-final.vercel.app`
- **Health Check**: `https://video-chat-backend.onrender.com/health`

## ⚠️ Nota Importante

El free tier de Render:
- Se "duerme" después de 15 minutos de inactividad
- Tarda ~30 segundos en "despertar" en la primera petición
- Esto es normal y no afecta la funcionalidad

## 🔧 Variables de Entorno Automáticas

Render configurará automáticamente:
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL` (Redis)
- `PORT` (Puerto del servidor)
- `NODE_ENV=production`
- `AI_PROVIDER=mock`

No necesitas configurar nada manualmente.

## 🎉 ¡Listo!

Tu aplicación estará completamente funcional en Render.

---

**Repositorio**: https://github.com/adrianpincho3-svg/video-chat-global
**Archivo de configuración**: `render.yaml`
