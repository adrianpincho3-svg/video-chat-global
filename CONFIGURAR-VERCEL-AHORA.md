# ⚡ ACTUALIZAR VERCEL - 2 MINUTOS

## Cuando tengas la URL del backend

Después de desplegar en Render o Railway, tendrás una URL como:
- `https://video-chat-backend.onrender.com` (Render)
- `https://video-chat-backend-production.up.railway.app` (Railway)

## Pasos para actualizar Vercel:

### 1. Ir a Vercel
Abre: https://vercel.com/dashboard

### 2. Seleccionar tu proyecto
Haz clic en: `video-chat-global-final`

### 3. Ir a Settings
En el menú lateral, haz clic en "Settings"

### 4. Ir a Environment Variables
En el menú de Settings, haz clic en "Environment Variables"

### 5. Editar VITE_BACKEND_URL
1. Busca la variable `VITE_BACKEND_URL`
2. Haz clic en el botón de 3 puntos (⋯) a la derecha
3. Haz clic en "Edit"
4. Pega la URL de tu backend (SIN barra al final)
   - ✅ Correcto: `https://video-chat-backend.onrender.com`
   - ❌ Incorrecto: `https://video-chat-backend.onrender.com/`
5. Haz clic en "Save"

### 6. Redeploy
1. Ve a la pestaña "Deployments"
2. Haz clic en el botón de 3 puntos (⋯) del último deployment
3. Haz clic en "Redeploy"
4. Confirma

### 7. Esperar
Espera 1-2 minutos mientras Vercel redespliega.

## ¡LISTO! 🎉

Tu app debería funcionar ahora en:
https://video-chat-global-final.vercel.app

---

## Verificar que funciona

1. Abre: https://video-chat-global-final.vercel.app
2. Deberías ver "Backend Conectado ✓" en verde
3. Si ves "Backend No Disponible", espera 30-60 segundos (Render tarda en despertar)
4. Recarga la página

---

## Si sigue sin funcionar

Compárteme:
1. La URL de tu backend
2. Captura de pantalla de la app
3. Abre la consola del navegador (F12) y compárteme los errores
