# ✅ CHECKLIST DE DESPLIEGUE

## Estado Actual
- ✅ Código completo en GitHub
- ✅ Frontend desplegado en Vercel
- ❌ Backend SIN desplegar
- ❌ App NO funcional

## Lo que necesitas hacer (en orden)

### 1️⃣ Desplegar Backend (10 minutos)

Elige UNA opción:

#### Opción A: Render.com (RECOMENDADO)
- [ ] Ir a https://render.com
- [ ] Registrarse con GitHub
- [ ] Crear "New Web Service"
- [ ] Conectar repo: `adrianpincho3-svg/video-chat-global`
- [ ] Configurar:
  - Name: `video-chat-backend`
  - Root Directory: `packages/backend`
  - Runtime: Docker
  - Instance Type: Free
- [ ] Agregar variables de entorno:
  - `NODE_ENV` = `production`
  - `PORT` = `8080`
  - `AI_PROVIDER` = `mock`
- [ ] Hacer clic en "Create Web Service"
- [ ] Esperar 3-5 minutos
- [ ] Copiar la URL (ejemplo: `https://video-chat-backend.onrender.com`)

📖 Guía detallada: `DESPLEGAR-AHORA.md`

#### Opción B: Railway.app
- [ ] Ir a https://railway.app
- [ ] Registrarse con GitHub
- [ ] "New Project" → "Deploy from GitHub repo"
- [ ] Seleccionar tu repo
- [ ] Agregar las mismas 3 variables de entorno
- [ ] Deploy
- [ ] Copiar la URL

#### Opción C: Ejecutar localmente (solo para probar)
```bash
cd C:\Users\adria\Desktop\omegles\packages\backend
npm install
npm start
```
URL será: `http://localhost:8080`

### 2️⃣ Actualizar Vercel (2 minutos)

- [ ] Ir a https://vercel.com/dashboard
- [ ] Seleccionar proyecto `video-chat-global-final`
- [ ] Settings → Environment Variables
- [ ] Editar `VITE_BACKEND_URL`
- [ ] Pegar la URL del backend (SIN barra al final)
- [ ] Guardar
- [ ] Deployments → Redeploy

📖 Guía detallada: `CONFIGURAR-VERCEL-AHORA.md`

### 3️⃣ Verificar que funciona (1 minuto)

- [ ] Abrir https://video-chat-global-final.vercel.app
- [ ] Verificar que dice "Backend Conectado ✓" en verde
- [ ] Si usa Render y está dormido, esperar 30-60 segundos y recargar
- [ ] Probar hacer clic en "Empezar a Chatear"

## ¿Dónde estás?

Marca con una X donde estás:

- [ ] No he empezado
- [ ] Estoy desplegando el backend
- [ ] Backend desplegado, actualizando Vercel
- [ ] Todo listo, probando la app
- [ ] ¡Funciona! 🎉

## Si algo falla

1. Lee el archivo `DIAGNOSTICO-RAPIDO.md`
2. Comparte:
   - Qué opción elegiste
   - El error exacto que ves
   - Captura de pantalla

## Archivos útiles

- `DESPLEGAR-AHORA.md` - Guía paso a paso para Render
- `CONFIGURAR-VERCEL-AHORA.md` - Cómo actualizar Vercel
- `DIAGNOSTICO-RAPIDO.md` - Entender el problema
- `docs/RAILWAY-DEPLOY.md` - Guía para Railway
- `DEPLOY-FLYIO-FACIL.md` - Guía para Fly.io

## Tiempo total estimado

- Render: 12 minutos
- Railway: 10 minutos
- Local: 2 minutos

---

**IMPORTANTE:** Solo necesitas hacer los pasos 1 y 2. El paso 3 es solo verificación.

**RECUERDA:** El backend está 100% listo. Solo necesita estar corriendo en un servidor.
