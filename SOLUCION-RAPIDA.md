# 🔧 SOLUCIÓN RÁPIDA - Backend Desplegado pero No Funciona

## 🎯 Problema
El backend está desplegado en Fly.io, pero el frontend en Vercel sigue intentando conectarse a `localhost:4000`.

## ✅ Solución en 3 Pasos (5 minutos)

### Paso 1: Obtener la URL de Fly.io

Abre PowerShell y ejecuta:
```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
fly info
```

Busca la línea que dice **Hostname** o **URL**. Debería ser algo como:
```
https://video-chat-backend-adrian.fly.dev
```

**Copia esa URL completa** (con https://)

---

### Paso 2: Actualizar Vercel

1. Ve a: https://vercel.com/dashboard
2. Haz clic en tu proyecto: `video-chat-global-final`
3. Ve a la pestaña **Settings**
4. En el menú lateral, haz clic en **Environment Variables**
5. Busca `VITE_BACKEND_URL` (si existe, edítala; si no, créala)
6. Pega la URL de Fly.io que copiaste
7. Marca las 3 casillas: Production, Preview, Development
8. Haz clic en **Save**

---

### Paso 3: Redeploy en Vercel

Después de guardar la variable:

**Opción A: Redeploy automático**
1. Ve a la pestaña **Deployments**
2. Haz clic en los 3 puntos (...) del último deployment
3. Haz clic en **Redeploy**
4. Confirma

**Opción B: Forzar redeploy desde Git**
```bash
cd C:\Users\adria\Desktop\omegles
git commit --allow-empty -m "Force redeploy"
git push
```

---

## ⏱️ Tiempo de Espera

- Vercel tarda 1-2 minutos en hacer el redeploy
- Refresca tu app: https://video-chat-global-final.vercel.app
- El mensaje de error debería desaparecer

---

## 🔍 Verificar que Funcionó

1. Abre: https://video-chat-global-final.vercel.app
2. Abre la consola del navegador (F12)
3. Busca mensajes de conexión
4. El banner rojo de "Backend No Disponible" debería desaparecer

---

## 🆘 Si Sigue Sin Funcionar

### Verificar que el backend está corriendo:

```bash
fly status
```

Debería decir: `Status: running`

### Ver logs del backend:

```bash
fly logs
```

Busca errores en rojo.

### Probar la URL del backend directamente:

Abre en tu navegador:
```
https://video-chat-backend-adrian.fly.dev/health
```

Debería responder:
```json
{"status":"ok","timestamp":"..."}
```

---

## 📋 Checklist Rápido

- [ ] Obtuve la URL de Fly.io con `fly info`
- [ ] Actualicé `VITE_BACKEND_URL` en Vercel
- [ ] Hice redeploy en Vercel
- [ ] Esperé 2 minutos
- [ ] Refresqué la app
- [ ] El error desapareció

---

## 💡 Nota Importante

La variable `VITE_BACKEND_URL` debe tener:
- ✅ `https://` al inicio (no `http://`)
- ✅ Sin `/` al final
- ✅ El dominio completo de Fly.io

**Ejemplo correcto:**
```
https://video-chat-backend-adrian.fly.dev
```

**Ejemplos incorrectos:**
```
http://video-chat-backend-adrian.fly.dev  ❌ (http en vez de https)
https://video-chat-backend-adrian.fly.dev/  ❌ (tiene / al final)
video-chat-backend-adrian.fly.dev  ❌ (falta https://)
```

---

## 🎉 Después de que Funcione

Tu app estará 100% funcional. Podrás:
- Conectarte con otros usuarios
- Hacer videollamadas
- Usar el chat de texto
- Compartir links

---

**¿Necesitas ayuda?** Compárteme:
1. La URL que te dio `fly info`
2. Captura de pantalla de las variables en Vercel
3. Cualquier error que veas en la consola
