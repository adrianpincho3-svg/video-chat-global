# 🚀 DESPLEGAR BACKEND AHORA (5 Minutos)

## ⚠️ PROBLEMA ACTUAL

Tu app en Vercel NO puede funcionar porque **el backend NO está desplegado**.

El código está listo, solo necesitas desplegarlo en Railway.

---

## 📋 PASOS EXACTOS (Copia y Pega)

### PASO 1: Ir a Railway (30 segundos)

1. Abre tu navegador
2. Ve a: **https://railway.app**
3. Click en **"Login"**
4. Inicia sesión con tu cuenta de GitHub

### PASO 2: Crear Proyecto (1 minuto)

1. Click en **"Start a New Project"** (botón morado)
2. Selecciona **"Deploy from GitHub repo"**
3. Busca: **`video-chat-global`**
4. Click en el repositorio
5. Railway comenzará a construir automáticamente

### PASO 3: Agregar PostgreSQL (30 segundos)

1. En tu proyecto, click en **"+ New"** (arriba a la derecha)
2. Selecciona **"Database"**
3. Click en **"Add PostgreSQL"**
4. Espera 10 segundos (se configura solo)

### PASO 4: Agregar Redis (30 segundos)

1. Click en **"+ New"** otra vez
2. Selecciona **"Database"**
3. Click en **"Add Redis"**
4. Espera 10 segundos (se configura solo)

### PASO 5: Configurar Variables (1 minuto)

1. Click en tu servicio **"video-chat-global"** (el cuadro principal)
2. Ve a la pestaña **"Variables"** (arriba)
3. Click en **"+ New Variable"**
4. Agrega estas DOS variables:

```
Name: NODE_ENV
Value: production
```

```
Name: AI_PROVIDER
Value: mock
```

5. Click **"Add"** para cada una

### PASO 6: Generar Dominio Público (30 segundos)

1. En tu servicio, ve a **"Settings"** (arriba)
2. Scroll hasta **"Networking"**
3. Click en **"Generate Domain"**
4. Railway generará una URL como: `https://web-production-xxxx.up.railway.app`
5. **¡COPIA ESTA URL!** (la necesitarás)

### PASO 7: Esperar Deploy (2 minutos)

1. Ve a la pestaña **"Deployments"**
2. Verás el progreso del build
3. Espera a que diga **"Success"** o **"Active"** (verde)

### PASO 8: Verificar Backend (30 segundos)

1. Abre una nueva pestaña
2. Ve a: `https://TU-DOMINIO-RAILWAY.up.railway.app/health`
3. Deberías ver algo como:
   ```json
   {"status":"ok","timestamp":"..."}
   ```

---

## 🎯 AHORA CONFIGURAR VERCEL

### PASO 9: Ir a Vercel (30 segundos)

1. Ve a: **https://vercel.com**
2. Abre tu proyecto **"video-chat-global"**

### PASO 10: Agregar Variable (1 minuto)

1. Ve a **"Settings"** (arriba)
2. Click en **"Environment Variables"** (menú izquierdo)
3. Click en **"Add New"**
4. Agrega:

```
Name: VITE_BACKEND_URL
Value: https://TU-DOMINIO-RAILWAY.up.railway.app
```

(Pega la URL que copiaste de Railway)

5. Marca las 3 casillas: Production, Preview, Development
6. Click **"Save"**

### PASO 11: Redeploy (1 minuto)

1. Ve a **"Deployments"** (arriba)
2. Click en los **tres puntos (...)** del último deployment
3. Click en **"Redeploy"**
4. Espera 2-3 minutos

---

## ✅ VERIFICAR QUE FUNCIONA

1. Abre tu app: `https://tu-app.vercel.app/chat`
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   ✅ Conectado al servidor de señalización
   ```
4. El mensaje "Conectando al servidor..." debería desaparecer
5. Cuando hagas click en "Iniciar Chat", la cámara se activará

---

## 🆘 SI ALGO FALLA

### Error: "The train has not arrived at the station"

- Espera 2-3 minutos más
- Ve a Railway → Deployments → View Logs
- Busca errores en rojo

### Error: "Conectando al servidor..." no desaparece

- Verifica que `VITE_BACKEND_URL` en Vercel sea correcta
- Debe incluir `https://`
- NO debe terminar con `/`
- Redeploy en Vercel

### Error: Cámara no se activa

- Acepta los permisos en el navegador
- Verifica que estés usando HTTPS (automático)
- Cierra otras apps que usen la cámara

---

## 📞 NECESITAS AYUDA?

1. Abre la consola del navegador (F12)
2. Copia todos los mensajes
3. Ve a Railway → View Logs
4. Copia los logs
5. Compártelos conmigo

---

## 🎉 CUANDO FUNCIONE

Tu app estará 100% operativa:
- ✅ Backend en Railway
- ✅ Frontend en Vercel
- ✅ Cámara activándose al inicio
- ✅ Matching funcionando
- ✅ Bot de IA disponible

**Tiempo total: 5-10 minutos**

---

**IMPORTANTE**: No puedo hacer esto por ti porque no tengo acceso a tu cuenta de Railway o Vercel. Pero estos pasos son muy simples y funcionarán.
