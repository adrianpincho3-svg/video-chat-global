# 🚀 Despliegue Automatizado en Vercel

## ✅ Configuración Completada

El proyecto ya está configurado para despliegue automático en Vercel con:
- ✅ `vercel.json` configurado para monorepo
- ✅ Root directory: `packages/frontend`
- ✅ Build automático con Vite
- ✅ Rewrites para SPA (Single Page Application)
- ✅ Headers de seguridad
- ✅ Cache optimizado para assets

## 🚀 Despliegue en 3 Pasos (2 minutos)

### Paso 1: Ir a Vercel

1. Abre tu navegador
2. Ve a: **https://vercel.com**
3. Click en **"Login"** o **"Sign Up"**
4. Inicia sesión con GitHub

### Paso 2: Importar Proyecto

1. Click en **"Add New..."** → **"Project"**
2. Busca y selecciona: **`video-chat-global`**
3. Click en **"Import"**

### Paso 3: Configurar Variable de Entorno

Vercel detectará automáticamente la configuración de `vercel.json`, pero necesitas agregar la URL del backend:

1. En la pantalla de configuración, busca **"Environment Variables"**
2. Agrega:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://TU-DOMINIO-RAILWAY.up.railway.app`
   - (Usa la URL que obtuviste de Railway)
3. Click en **"Add"**

4. Click en **"Deploy"**

## ⏱️ Tiempo de Deploy

- **Primera vez**: 2-3 minutos
- **Actualizaciones**: 1-2 minutos

## 🎉 Resultado

Después del deploy, Vercel te dará una URL como:
- `https://video-chat-global.vercel.app`
- `https://video-chat-global-adrianpincho3-svg.vercel.app`

## 🔗 URLs Disponibles

Tu aplicación tendrá estas rutas:

- **Inicio**: `https://tu-app.vercel.app/`
- **Chat WebRTC**: `https://tu-app.vercel.app/chat`
- **Chat Jitsi**: `https://tu-app.vercel.app/chat/jitsi`
- **Compartir Enlace**: `https://tu-app.vercel.app/share`
- **Admin Login**: `https://tu-app.vercel.app/admin/login`
- **Admin Dashboard**: `https://tu-app.vercel.app/admin/dashboard`
- **Acerca de**: `https://tu-app.vercel.app/about`

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a GitHub:
1. Vercel detectará el cambio automáticamente
2. Construirá y desplegará la nueva versión
3. Te notificará cuando esté listo

## 🌐 Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Domains"**
3. Agrega tu dominio (ej: `videochat.tudominio.com`)
4. Configura el DNS según las instrucciones de Vercel
5. Vercel configurará SSL automáticamente

## 📊 Monitoreo

Vercel proporciona:
- **Analytics**: Visitas, performance, etc.
- **Logs**: Ver errores y requests
- **Deployments**: Historial de todos los deploys
- **Preview Deployments**: Cada branch tiene su propia URL

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales

Si necesitas agregar más variables:

1. Ve a **"Settings"** → **"Environment Variables"**
2. Agrega las que necesites
3. Redeploy para que tomen efecto

### Múltiples Entornos

Vercel soporta:
- **Production**: Branch `main`
- **Preview**: Otras branches
- **Development**: Local

## ✅ Verificar Despliegue

1. Abre la URL de Vercel
2. Deberías ver la página de inicio
3. Prueba navegar a `/chat`
4. Verifica que se conecte al backend de Railway

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"

**Solución:**
1. Verifica que `VITE_BACKEND_URL` esté configurada
2. Debe incluir `https://`
3. Debe ser la URL de Railway (no localhost)
4. Redeploy después de cambiar variables

### Error: "404 Not Found" en rutas

**Solución:**
- El archivo `vercel.json` ya tiene los rewrites configurados
- Si persiste, verifica que el archivo esté en la raíz del proyecto

### Error: "Build failed"

**Solución:**
1. Ve a "Deployments" → deployment fallido → "View Logs"
2. Busca el error específico
3. Usualmente es por dependencias faltantes o errores de TypeScript

### Frontend carga pero no conecta con backend

**Solución:**
1. Abre DevTools (F12) → Console
2. Busca errores de CORS o conexión
3. Verifica que el backend en Railway esté corriendo
4. Verifica que `FRONTEND_URL` en Railway incluya tu dominio de Vercel

## 🔐 Seguridad

El `vercel.json` ya incluye:
- ✅ Headers de seguridad (XSS, Frame, Content-Type)
- ✅ Referrer Policy
- ✅ Cache optimizado para assets
- ✅ HTTPS automático

## 📈 Performance

Vercel proporciona:
- **CDN Global**: Tu app se sirve desde el servidor más cercano
- **Edge Network**: Baja latencia en todo el mundo
- **Automatic Compression**: Gzip/Brotli automático
- **Image Optimization**: Si usas imágenes

## 🎯 Próximos Pasos

Después de desplegar en Vercel:

1. **Comparte la URL** con amigos para probar
2. **Configura el backend** en Railway (si no lo has hecho)
3. **Crea un administrador** para acceder al panel
4. **Monitorea** el uso en Vercel Analytics

## 📱 Compartir con Usuarios

Una vez desplegado, comparte:
```
🎥 Video Chat Global
Conecta con personas de todo el mundo

🔗 https://tu-app.vercel.app

Características:
✅ Video chat aleatorio
✅ Filtros de emparejamiento
✅ Soporte global (6 regiones)
✅ Chat con Jitsi Meet
✅ 100% anónimo
```

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación**: https://vercel.com/docs
- **Status**: https://vercel-status.com
- **Soporte**: https://vercel.com/support

## 💰 Costos

**Vercel Free Tier:**
- ✅ 100 GB bandwidth/mes
- ✅ Deployments ilimitados
- ✅ Preview deployments
- ✅ SSL automático
- ✅ CDN global
- ✅ Analytics básico

**Suficiente para:**
- Miles de usuarios al mes
- Proyectos personales
- Demos y prototipos

## 🎉 ¡Listo!

Tu frontend está configurado para despliegue automático en Vercel.

**Solo necesitas**:
1. Ir a vercel.com
2. Importar el repositorio
3. Agregar `VITE_BACKEND_URL`
4. Deploy

**En 2 minutos tendrás tu app en línea.**

---

**Repositorio**: https://github.com/adrianpincho3-svg/video-chat-global
**Backend**: Railway
**Frontend**: Vercel
**Última actualización**: 2026-02-13

