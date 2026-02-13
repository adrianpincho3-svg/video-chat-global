# 🔧 Configurar Vercel AHORA (2 Minutos)

## 📋 URL de tu Backend

Tu backend en Railway está en:
```
https://web-production-4415.up.railway.app
```

## ✅ PASOS EXACTOS

### PASO 1: Ir a Vercel (30 segundos)

1. Abre tu navegador
2. Ve a: **https://vercel.com**
3. Inicia sesión
4. Abre tu proyecto **"video-chat-global"**

### PASO 2: Agregar Variable de Entorno (1 minuto)

1. Click en **"Settings"** (arriba)
2. Click en **"Environment Variables"** (menú izquierdo)
3. Click en **"Add New"** o **"Edit"** si ya existe

4. **Agrega o edita**:
   ```
   Name: VITE_BACKEND_URL
   Value: https://web-production-4415.up.railway.app
   ```

5. **Marca las 3 casillas**:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

6. Click **"Save"**

### PASO 3: Redeploy (30 segundos)

1. Ve a **"Deployments"** (arriba)
2. Click en los **tres puntos (...)** del último deployment
3. Click en **"Redeploy"**
4. Espera 2-3 minutos

---

## ✅ VERIFICAR QUE FUNCIONA

Después del redeploy:

1. Abre tu app: `https://video-chat-global-final.vercel.app/chat`
2. El mensaje **"Conectando al servidor..."** debería desaparecer
3. El mensaje **"Backend No Disponible"** debería desaparecer
4. Deberías poder hacer click en "Iniciar Chat"

---

## ⚠️ SI EL BACKEND NO FUNCIONA

Si después de configurar Vercel sigues viendo "Backend No Disponible":

1. Ve a Railway
2. Ve a "Deployments"
3. Verifica que el último deployment diga **"Success"** (verde)
4. Si dice **"Failed"** (rojo):
   - Click en "View Logs"
   - Copia el error
   - Compártelo conmigo

---

## 🎯 ESTADO ACTUAL

✅ **Frontend**: Desplegado en Vercel  
✅ **Cámara**: Funcionando  
⏳ **Backend**: Desplegando en Railway  
❌ **Conexión**: Falta configurar variable en Vercel

Una vez que configures la variable y redeployes, todo debería funcionar.

---

**URL del Backend**: `https://web-production-4415.up.railway.app`  
**Variable en Vercel**: `VITE_BACKEND_URL`
