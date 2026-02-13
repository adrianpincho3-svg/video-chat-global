# 🔧 Desplegar Backend en Render MANUALMENTE

Si el Blueprint falla, usa este método manual:

## Paso 1: Crear Web Service

1. En Render, click **"New +"**
2. Selecciona **"Web Service"** (NO Blueprint)
3. Conecta tu repositorio: `video-chat-global`
4. Click **"Connect"**

## Paso 2: Configuración Básica

- **Name**: `video-chat-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `packages/backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## Paso 3: Variables de Entorno

Click en **"Advanced"** y agrega:

```
NODE_ENV=production
AI_PROVIDER=mock
```

## Paso 4: Conectar Bases de Datos

En la sección **"Environment Variables"**, agrega manualmente:

1. **DATABASE_URL**:
   - Ve a tu base de datos PostgreSQL en Render
   - Copia la "Internal Connection String"
   - Pégala como valor de `DATABASE_URL`

2. **REDIS_URL**:
   - Ve a tu base de datos Redis en Render
   - Copia la "Internal Connection String"  
   - Pégala como valor de `REDIS_URL`

## Paso 5: Crear Servicio

Click en **"Create Web Service"**

Render comenzará a desplegar. Espera 3-5 minutos.

## ✅ Verificar

Una vez que diga "Live":
1. Copia la URL del servicio
2. Abre: `https://tu-url.onrender.com/health`
3. Deberías ver: `{"status":"ok",...}`

## 🔄 Actualizar Vercel

1. Ve a Vercel
2. Settings → Environment Variables
3. Edita `VITE_BACKEND_URL` con la nueva URL de Render
4. Redeploy

---

Este método manual es más confiable que el Blueprint.
