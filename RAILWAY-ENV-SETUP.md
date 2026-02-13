# 🔧 Configuración de Variables de Entorno en Railway

## Variables Requeridas

Después de desplegar tu backend en Railway, necesitas configurar estas variables de entorno:

### 1. Variables Básicas (Obligatorias)

```bash
NODE_ENV=production
AI_PROVIDER=mock
```

### 2. Variable de Frontend (Importante para CORS)

```bash
FRONTEND_URL=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE**: Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel.

## 📋 Pasos para Configurar

### En Railway:

1. Ve a tu proyecto en Railway
2. Click en tu servicio **backend**
3. Ve a la pestaña **"Variables"**
4. Click en **"+ New Variable"**
5. Agrega cada variable:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**
6. Repite para las otras variables

### Variables Opcionales (Avanzadas)

Si quieres usar servicios externos:

```bash
# Para AI Bot Service con OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=tu-api-key-aqui

# Para AI Bot Service con Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=tu-api-key-aqui

# Para GeoIP Service
GEOIP_API_KEY=tu-api-key-aqui
```

## 🔄 Después de Configurar

1. Railway redesplegará automáticamente tu backend
2. Espera 2-3 minutos
3. Verifica que funcione: `https://tu-backend.up.railway.app/health`

## ✅ Verificar CORS

Para verificar que CORS está configurado correctamente:

1. Abre la consola del navegador (F12) en tu app de Vercel
2. Intenta conectarte
3. Si ves errores de CORS, verifica que `FRONTEND_URL` sea correcta
4. Debe incluir `https://` y NO debe terminar con `/`

### Ejemplo Correcto:
```
FRONTEND_URL=https://video-chat-global.vercel.app
```

### Ejemplo Incorrecto:
```
FRONTEND_URL=video-chat-global.vercel.app  ❌ (falta https://)
FRONTEND_URL=https://video-chat-global.vercel.app/  ❌ (sobra /)
```

## 🎯 Configuración Completa Recomendada

```bash
# Obligatorias
NODE_ENV=production
AI_PROVIDER=mock
FRONTEND_URL=https://tu-app.vercel.app

# Railway configura automáticamente (NO las agregues manualmente):
# - DATABASE_URL (PostgreSQL)
# - REDIS_URL (Redis)
# - PORT (Puerto del servidor)
```

## 🔍 Troubleshooting

### "Conectando al servidor..." no desaparece

- Verifica que el backend esté desplegado y activo
- Verifica que `VITE_BACKEND_URL` en Vercel apunte a Railway
- Abre la consola del navegador y busca errores

### Error de CORS

- Verifica que `FRONTEND_URL` en Railway sea correcta
- Debe coincidir exactamente con tu dominio de Vercel
- Redespliega después de cambiar variables

### Cámara no se activa

- Verifica que estés usando HTTPS (automático en Vercel)
- Acepta los permisos de cámara/micrófono en el navegador
- Verifica que la cámara no esté en uso por otra app

## 📱 En Vercel

No olvides configurar en Vercel:

```bash
VITE_BACKEND_URL=https://tu-backend.up.railway.app
```

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega `VITE_BACKEND_URL` con la URL de Railway
4. Redeploy

---

**Nota**: Railway y Vercel automáticamente usan HTTPS, que es requerido para WebRTC.
