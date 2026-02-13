# 🚀 Redeploy en Fly.io - AHORA

## Problema Detectado
El backend no está corriendo correctamente en Fly.io. Acabo de actualizar:
- ✅ Dockerfile (optimizado)
- ✅ fly.toml (configuración corregida)

## Solución en 3 Pasos (3 minutos)

### Paso 1: Hacer commit de los cambios

Abre PowerShell en la carpeta del proyecto:

```bash
cd C:\Users\adria\Desktop\omegles
git add packages/backend/Dockerfile packages/backend/fly.toml
git commit -m "Fix Fly.io deployment configuration"
```

### Paso 2: Redeploy en Fly.io

```bash
cd packages\backend
fly deploy
```

Esto tomará 2-3 minutos. Verás algo como:
```
==> Building image
==> Pushing image to fly
==> Deploying
 ✓ Machine created
 ✓ Machine started
 ✓ Health checks passing
```

### Paso 3: Verificar que funciona

```bash
fly status
```

Debería decir: `Status: running`

Luego prueba el health check:
```bash
curl https://video-chat-backend-adrian.fly.dev/health
```

Debería responder:
```json
{"status":"ok","timestamp":"..."}
```

---

## Después del Deploy

### Actualizar Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: `video-chat-global-final`
3. Settings → Environment Variables
4. Busca o crea `VITE_BACKEND_URL`
5. Valor: `https://video-chat-backend-adrian.fly.dev`
6. Marca: Production, Preview, Development
7. Save
8. Ve a Deployments → Redeploy el último

---

## Si el Deploy Falla

### Ver logs en tiempo real:
```bash
fly logs
```

### Ver estado detallado:
```bash
fly status --all
```

### Reintentar deploy:
```bash
fly deploy --force
```

---

## Cambios Realizados

### Dockerfile
- ✅ Usa `npm ci` en vez de `npm install` (más rápido)
- ✅ Agrega health check
- ✅ Configura HOST=0.0.0.0

### fly.toml
- ✅ Simplifica configuración
- ✅ Mantiene al menos 1 máquina corriendo
- ✅ Configura memoria y CPU

---

## ¿Listo?

Ejecuta estos 3 comandos:

```bash
cd C:\Users\adria\Desktop\omegles
git add packages/backend/Dockerfile packages/backend/fly.toml
git commit -m "Fix Fly.io deployment"
cd packages\backend
fly deploy
```

Espera 3 minutos y tu backend estará funcionando.
