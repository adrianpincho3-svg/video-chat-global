# 🚀 Desplegar en Fly.io - 5 MINUTOS

## Paso 1: Instalar Fly.io CLI (2 minutos)

Abre PowerShell y ejecuta:
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Cierra y abre PowerShell de nuevo.

## Paso 2: Crear cuenta y login (1 minuto)

```bash
fly auth signup
```

Esto abrirá tu navegador. Regístrate con tu email (es gratis, no pide tarjeta).

Luego haz login:
```bash
fly auth login
```

## Paso 3: Desplegar (2 minutos)

En la carpeta de tu proyecto:

```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
fly launch --name video-chat-backend
```

Cuando pregunte:
- "Would you like to set up a PostgreSQL database?" → **NO**
- "Would you like to set up a Redis database?" → **NO**  
- "Would you like to deploy now?" → **YES**

## Paso 4: Obtener la URL

Después del deploy, ejecuta:
```bash
fly info
```

Copia la URL que aparece (algo como `https://video-chat-backend.fly.dev`)

## Paso 5: Actualizar Vercel

1. Ve a Vercel → tu proyecto → Settings → Environment Variables
2. Edita `VITE_BACKEND_URL`
3. Pega la URL de Fly.io
4. Guarda y espera el redeploy

## ¡LISTO! 🎉

Tu app debería funcionar en 5 minutos.

---

## Si algo falla

Ejecuta:
```bash
fly logs
```

Y compárteme el error.

## Comandos útiles

- Ver logs: `fly logs`
- Ver estado: `fly status`
- Abrir dashboard: `fly dashboard`
- Redeploy: `fly deploy`

---

**NOTA:** Fly.io es 100% gratis para tu app. No necesitas tarjeta de crédito.
