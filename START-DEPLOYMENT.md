# 🚀 Iniciar Despliegue - Random Video Chat

## ¡Tu aplicación está lista para desplegarse!

Este documento te guiará para tener tu aplicación funcionando en internet en **15 minutos**.

## 📋 Antes de Empezar

Necesitas:
1. ✅ Cuenta en GitHub (gratis)
2. ✅ Cuenta en Railway (gratis - $5 de crédito)
3. ✅ Cuenta en Vercel (gratis - opcional pero recomendado)

## 🎯 Opción Recomendada: Railway + Vercel

Esta es la forma más rápida y fácil. Todo gratis para empezar.

### Paso 1: Subir a GitHub (5 minutos)

```bash
# 1. Inicializar git (si no lo has hecho)
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit
git commit -m "Ready for deployment"

# 4. Crear repositorio en GitHub
# Ve a https://github.com/new
# Crea un repositorio llamado "random-video-chat"
# NO inicialices con README

# 5. Conectar y subir
git remote add origin https://github.com/TU_USUARIO/random-video-chat.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar Backend en Railway (5 minutos)

1. **Ve a [railway.app](https://railway.app)**
2. Click en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway y selecciona tu repositorio
5. Railway comenzará a construir automáticamente

**Agregar PostgreSQL:**
1. En tu proyecto, click "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. ¡Listo! Railway lo conectará automáticamente

**Agregar Redis:**
1. Click "+ New" nuevamente
2. Selecciona "Database" → "Add Redis"
3. ¡Listo! Railway lo conectará automáticamente

**Configurar Variables de Entorno:**
1. Click en tu servicio principal (backend)
2. Ve a "Variables"
3. Agrega estas variables:

```
NODE_ENV=production
PORT=4000
AI_PROVIDER=mock
```

4. Railway agregará automáticamente `DATABASE_URL` y `REDIS_URL`

**Configurar Build:**
1. Ve a "Settings"
2. En "Start Command" pon:
   ```
   npm run start:prod --workspace=packages/backend
   ```
3. Guarda

**Obtener URL del Backend:**
1. Ve a "Settings" → "Networking"
2. Click en "Generate Domain"
3. Copia la URL (algo como: `https://tu-app.up.railway.app`)

### Paso 3: Desplegar Frontend en Vercel (3 minutos)

1. **Ve a [vercel.com](https://vercel.com)**
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Agregar Variable de Entorno:**
   - Click en "Environment Variables"
   - Nombre: `VITE_BACKEND_URL`
   - Valor: La URL de Railway que copiaste (ej: `https://tu-app.up.railway.app`)

6. Click en "Deploy"

### Paso 4: Crear Administrador (2 minutos)

1. En Railway, ve a tu servicio backend
2. Click en "Deployments" → deployment activo → "View Logs"
3. Busca en los logs si las migraciones se ejecutaron
4. Para crear admin, ve a "Settings" → "Deploy"
5. Temporalmente cambia "Start Command" a:
   ```
   npm run create-admin --workspace=packages/backend
   ```
6. Espera a que termine (verás usuario y contraseña en logs)
7. **GUARDA LAS CREDENCIALES**
8. Vuelve a cambiar "Start Command" a:
   ```
   npm run start:prod --workspace=packages/backend
   ```

### Paso 5: ¡Probar! (1 minuto)

1. Abre la URL de Vercel (algo como: `https://tu-app.vercel.app`)
2. Deberías ver la página de inicio
3. Click en "Iniciar Chat"
4. Prueba el chat (necesitarás 2 dispositivos o pestañas)
5. Accede al admin: `https://tu-app.vercel.app/admin/login`

## ✅ ¡Listo!

Tu aplicación está en línea. Ahora puedes:

- Compartir la URL con amigos
- Probar con usuarios reales
- Ver métricas en el panel de administrador
- Monitorear logs en Railway

## 📊 URLs de tu Aplicación

Anota tus URLs aquí:

- **Frontend**: ___________________________________
- **Backend**: ___________________________________
- **Admin**: ___________________________________/admin/login

## 🔐 Credenciales de Admin

- **Usuario**: ___________________________________
- **Contraseña**: ___________________________________

## 🐛 ¿Problemas?

### Backend no inicia
- Revisa logs en Railway
- Verifica que PostgreSQL y Redis estén corriendo
- Verifica variables de entorno

### Frontend no conecta
- Verifica que `VITE_BACKEND_URL` sea correcta
- Debe incluir `https://`
- Debe ser la URL de Railway, no localhost

### WebRTC no funciona
- Verifica que HTTPS esté habilitado (automático en Railway/Vercel)
- Prueba en Chrome o Firefox
- Acepta permisos de cámara/micrófono

### Necesitas ayuda
- Revisa [RAILWAY-DEPLOY.md](docs/RAILWAY-DEPLOY.md)
- Revisa [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- Revisa logs en Railway

## 💰 Costos

- **Railway**: $5 crédito gratis/mes (suficiente para empezar)
- **Vercel**: Gratis para proyectos personales
- **Total**: $0/mes con free tier

## 📚 Documentación Adicional

- [Guía completa de Railway](docs/RAILWAY-DEPLOY.md)
- [Guía completa de despliegue](docs/DEPLOYMENT.md)
- [Guía rápida](docs/QUICK-DEPLOY.md)
- [Resumen de opciones](docs/DEPLOYMENT-SUMMARY.md)
- [Checklist completo](DEPLOYMENT-CHECKLIST.md)

## 🎉 Siguiente Paso

Una vez desplegado, comparte la URL y prueba con amigos. Monitorea las métricas en el panel de administrador.

---

**¿Listo para empezar?** Sigue el Paso 1 arriba ⬆️

