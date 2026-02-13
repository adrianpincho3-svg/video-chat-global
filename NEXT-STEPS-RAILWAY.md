# 🚀 Próximos Pasos - Desplegar en Railway

## ✅ Completado

- ✅ Código subido a GitHub: https://github.com/adrianpincho3-svg/video-chat-global
- ✅ Repositorio configurado correctamente
- ✅ Listo para desplegar en Railway

## 📋 Pasos para Desplegar (5 minutos)

### Paso 1: Ir a Railway (1 minuto)

1. Abre tu navegador
2. Ve a: **https://railway.app**
3. Click en **"Login"** o **"Start a New Project"**
4. Inicia sesión con GitHub (si no tienes cuenta, créala - es gratis)

### Paso 2: Crear Proyecto desde GitHub (1 minuto)

1. Click en **"Start a New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona: **`video-chat-global`**
4. Railway comenzará a construir automáticamente

### Paso 3: Agregar PostgreSQL (30 segundos)

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway lo configurará automáticamente

### Paso 4: Agregar Redis (30 segundos)

1. Click en **"+ New"** otra vez
2. Selecciona **"Database"** → **"Add Redis"**
3. Railway lo configurará automáticamente

### Paso 5: Configurar Variables de Entorno (1 minuto)

1. Click en tu servicio **backend** (el servicio principal)
2. Ve a la pestaña **"Variables"**
3. Click en **"+ New Variable"**
4. Agrega estas variables:

```
NODE_ENV=production
AI_PROVIDER=mock
```

5. Click en **"Add"** para cada una

### Paso 6: Generar Dominio Público (30 segundos)

1. En tu servicio backend, ve a **"Settings"**
2. Scroll hasta **"Networking"**
3. Click en **"Generate Domain"**
4. Railway generará una URL como: `https://video-chat-global-production.up.railway.app`
5. **¡COPIA ESTA URL!** La necesitarás

### Paso 7: Esperar el Deploy (2-3 minutos)

1. Ve a la pestaña **"Deployments"**
2. Verás el progreso del build
3. Espera a que diga **"Success"** o **"Active"**
4. Si hay errores, ve a **"View Logs"** para ver qué pasó

### Paso 8: Verificar que Funciona (30 segundos)

1. Abre una nueva pestaña
2. Ve a: `https://TU-DOMINIO.up.railway.app/health`
3. Deberías ver algo como:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "services": {...}
   }
   ```

## 🎉 ¡Tu Backend Está Listo!

Tu backend ahora está en línea en:
- **URL**: `https://TU-DOMINIO.up.railway.app`
- **Health Check**: `https://TU-DOMINIO.up.railway.app/health`
- **API Admin**: `https://TU-DOMINIO.up.railway.app/api/admin`
- **API Jitsi**: `https://TU-DOMINIO.up.railway.app/api/jitsi`

## 📱 Desplegar Frontend en Vercel (Opcional - 3 minutos)

Si quieres una interfaz web completa:

### Paso 1: Ir a Vercel

1. Ve a: **https://vercel.com**
2. Inicia sesión con GitHub

### Paso 2: Importar Proyecto

1. Click en **"Add New..."** → **"Project"**
2. Selecciona **`video-chat-global`**
3. Click en **"Import"**

### Paso 3: Configurar

1. **Framework Preset**: Selecciona **"Vite"**
2. **Root Directory**: Escribe `packages/frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Paso 4: Variables de Entorno

1. Click en **"Environment Variables"**
2. Agrega:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://TU-DOMINIO-RAILWAY.up.railway.app` (la URL de Railway)
3. Click en **"Add"**

### Paso 5: Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. Vercel te dará una URL como: `https://video-chat-global.vercel.app`

## 🔗 URLs Finales

Después de completar todo, tendrás:

- **Backend (Railway)**: `https://_____________________.up.railway.app`
- **Frontend (Vercel)**: `https://_____________________.vercel.app`
- **Admin Panel**: `https://_____________________.vercel.app/admin/login`
- **Chat con Jitsi**: `https://_____________________.vercel.app/chat/jitsi`

## 🎯 Compartir con Usuarios

Una vez desplegado, comparte:
- **URL del Frontend** (Vercel) con tus usuarios
- Ellos podrán entrar y usar el chat inmediatamente

## 🔧 Crear Administrador (Opcional)

Para acceder al panel de administrador:

1. En Railway, ve a tu servicio backend
2. Click en **"Deployments"** → deployment activo → **"View Logs"**
3. En la parte superior, click en **"..."** → **"Run Command"**
4. Ejecuta: `npm run create-admin --workspace=packages/backend`
5. Verás las credenciales en los logs
6. **¡GUÁRDALAS!**

## 📊 Monitorear

- **Logs de Railway**: Deployments → View Logs
- **Métricas**: Railway muestra CPU, RAM, Network
- **Panel Admin**: Accede con las credenciales creadas

## ❓ Problemas Comunes

### "The train has not arrived at the station"

- Espera 2-3 minutos más
- Verifica que PostgreSQL y Redis estén agregados
- Ve a "View Logs" para ver errores

### Frontend no conecta con Backend

- Verifica que `VITE_BACKEND_URL` en Vercel sea correcta
- Debe incluir `https://`
- Debe ser la URL de Railway

### WebRTC no funciona

- Verifica que HTTPS esté habilitado (automático en Railway/Vercel)
- Acepta permisos de cámara/micrófono
- Prueba en Chrome o Firefox

## 🎉 ¡Listo!

Tu aplicación de video chat está lista para recibir usuarios reales.

**Comparte la URL del frontend y empieza a probar con amigos.**

---

**Repositorio**: https://github.com/adrianpincho3-svg/video-chat-global
**Documentación**: Ver carpeta `docs/`
**Soporte**: Revisa `docs/RAILWAY-TROUBLESHOOTING.md`

