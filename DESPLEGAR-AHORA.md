# 🚀 DESPLEGAR BACKEND EN RENDER - 3 PASOS

## Paso 1: Ir a Render
1. Abre: https://render.com
2. Haz clic en "Get Started for Free"
3. Regístrate con GitHub (es más rápido)

## Paso 2: Crear Web Service
1. En el dashboard, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio: `adrianpincho3-svg/video-chat-global`
4. Haz clic en "Connect"

## Paso 3: Configurar el servicio

Llena estos campos:

- **Name:** `video-chat-backend`
- **Region:** Oregon (US West)
- **Branch:** main
- **Root Directory:** `packages/backend`
- **Runtime:** Docker
- **Instance Type:** Free

### Variables de entorno (Environment Variables):
Haz clic en "Add Environment Variable" y agrega estas 3:

1. `NODE_ENV` = `production`
2. `PORT` = `8080`
3. `AI_PROVIDER` = `mock`

### Configuración avanzada (Advanced):
- **Docker Build Context Directory:** `packages/backend`
- **Dockerfile Path:** `./Dockerfile`
- **Health Check Path:** `/health`

## Paso 4: Deploy
1. Haz clic en "Create Web Service"
2. Espera 3-5 minutos mientras se despliega
3. Cuando termine, verás una URL como: `https://video-chat-backend.onrender.com`

## Paso 5: Actualizar Vercel
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `video-chat-global-final`
3. Ve a Settings → Environment Variables
4. Edita `VITE_BACKEND_URL`
5. Pega la URL de Render (ejemplo: `https://video-chat-backend.onrender.com`)
6. Guarda y espera el redeploy automático (1-2 minutos)

## ¡LISTO! 🎉

Tu app debería funcionar en 10 minutos.

---

## Si hay error en Render

1. Ve a la pestaña "Logs" en Render
2. Copia el error
3. Compártelo conmigo

## Alternativa rápida: Railway

Si Render falla, prueba Railway:

1. Ve a: https://railway.app
2. Regístrate con GitHub
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repo
6. Railway detectará automáticamente el Dockerfile
7. Agrega las mismas 3 variables de entorno
8. Deploy

---

**IMPORTANTE:** El plan Free de Render tiene estas limitaciones:
- Se duerme después de 15 minutos sin uso
- Tarda 30-60 segundos en despertar
- 750 horas gratis al mes (suficiente para tu app)

Si quieres que esté siempre activo, necesitas el plan Starter ($7/mes).
