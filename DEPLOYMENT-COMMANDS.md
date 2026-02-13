# 🚀 COMANDOS RÁPIDOS DE DESPLIEGUE

## Opción 1: Railway (MÁS FÁCIL)

### Paso 1: Instalar Railway CLI
```powershell
npm install -g @railway/cli
```

### Paso 2: Login
```bash
railway login
```

### Paso 3: Desplegar
```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
railway init
railway up
```

### Paso 4: Agregar variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=8080
railway variables set AI_PROVIDER=mock
```

### Paso 5: Obtener URL
```bash
railway domain
```

---

## Opción 2: Render (SIN CLI, SOLO WEB)

No hay comandos. Todo se hace en el navegador:
1. https://render.com
2. Seguir guía en `DESPLEGAR-AHORA.md`

---

## Opción 3: Fly.io

### Paso 1: Instalar Fly CLI
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Cierra y abre PowerShell de nuevo.

### Paso 2: Login
```bash
fly auth login
```

### Paso 3: Desplegar
```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
fly launch --name video-chat-backend-adrian
```

Responde:
- PostgreSQL: NO
- Redis: NO
- Deploy now: YES

### Paso 4: Obtener URL
```bash
fly info
```

---

## Opción 4: Local (PARA PROBAR)

```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
npm install
npm start
```

URL: `http://localhost:8080`

Para probar:
```bash
curl http://localhost:8080/health
```

---

## Después de desplegar

### Actualizar Vercel con la nueva URL

1. Ve a: https://vercel.com/dashboard
2. Proyecto: `video-chat-global-final`
3. Settings → Environment Variables
4. Edita `VITE_BACKEND_URL`
5. Pega la URL del backend
6. Guarda
7. Deployments → Redeploy

---

## Verificar que funciona

```bash
# Reemplaza con tu URL
curl https://tu-backend.onrender.com/health
```

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "services": {
    "redis": { "connected": false, "ping": false },
    "database": { "connected": false, "ping": false }
  }
}
```

---

## Troubleshooting

### Ver logs en Railway
```bash
railway logs
```

### Ver logs en Fly.io
```bash
fly logs
```

### Ver logs en Render
Ve a tu servicio → pestaña "Logs"

---

## Mi recomendación

1. **Para producción:** Render (gratis, fácil, sin CLI)
2. **Para desarrollo:** Local (inmediato)
3. **Si tienes tarjeta:** Railway (más rápido)

---

## ¿Cuál elegir?

- ¿Quieres la app en internet YA? → **Render**
- ¿Solo quieres probar? → **Local**
- ¿Tienes tarjeta de crédito? → **Railway**
- ¿Te gusta la terminal? → **Fly.io**
