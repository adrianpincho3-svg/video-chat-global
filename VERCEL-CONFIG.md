# 🔧 Configuración de Vercel - Instrucciones Exactas

## ⚠️ Configuración Correcta para Monorepo

El proyecto usa un monorepo, así que la configuración debe ser específica.

## 📋 Configuración en Vercel Dashboard

Cuando importes el proyecto en Vercel, configura EXACTAMENTE así:

### 1. Framework Preset
```
Vite
```

### 2. Root Directory
```
packages/frontend
```
**IMPORTANTE**: Esto hace que Vercel se posicione dentro de `packages/frontend`

### 3. Build Command
```
npm run build
```
**NO uses**: `cd packages/frontend && npm run build` (ya estás ahí)

### 4. Output Directory
```
dist
```
**NO uses**: `packages/frontend/dist` (ya estás en packages/frontend)

### 5. Install Command
```
npm install
```
**O déjalo en blanco** para que Vercel use el automático

### 6. Environment Variables
Agrega:
- **Name**: `VITE_BACKEND_URL`
- **Value**: `https://tu-backend-railway.up.railway.app`

## ✅ Configuración Automática

El archivo `vercel.json` en la raíz ya está configurado para:
- ✅ Detectar Vite automáticamente
- ✅ Usar comandos estándar de npm
- ✅ Output en `dist` (relativo al Root Directory)

## 🚀 Pasos Exactos

1. **Ir a Vercel**: https://vercel.com
2. **Importar Proyecto**: Click "Add New..." → "Project"
3. **Seleccionar Repo**: `video-chat-global`
4. **Configurar**:
   - Framework: `Vite`
   - Root Directory: `packages/frontend` ⚠️ IMPORTANTE
   - Build Command: `npm run build` (o déjalo automático)
   - Output Directory: `dist` (o déjalo automático)
5. **Variables de Entorno**:
   - `VITE_BACKEND_URL` = URL de Railway
6. **Deploy**: Click "Deploy"

## 🐛 Errores Comunes

### Error: "ENOENT: no such file or directory"
**Causa**: Intentas hacer `cd packages/frontend` cuando ya estás ahí

**Solución**: 
- Root Directory debe ser: `packages/frontend`
- Build Command debe ser: `npm run build` (sin cd)

### Error: "Cannot find module"
**Causa**: Dependencias no instaladas

**Solución**:
- Vercel instala automáticamente con `npm install`
- Si persiste, verifica que `package.json` esté en `packages/frontend`

### Error: "Build failed"
**Causa**: Errores de TypeScript o dependencias

**Solución**:
- Ve a "Deployments" → "View Logs"
- Busca el error específico
- Verifica que el código compile localmente: `npm run build`

## 📁 Estructura del Proyecto

```
video-chat-global/
├── vercel.json              ← Configuración en raíz
├── packages/
│   ├── frontend/            ← Root Directory en Vercel
│   │   ├── package.json     ← Vercel usa este
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   └── dist/            ← Output después del build
│   └── backend/
└── ...
```

## ✅ Verificar Configuración

Después del deploy, verifica:

1. **URL funciona**: `https://tu-app.vercel.app`
2. **Rutas funcionan**: `/chat`, `/about`, etc.
3. **Conecta con backend**: Abre DevTools → Console (no debe haber errores de CORS)

## 🎯 Configuración Final Correcta

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

Con Root Directory: `packages/frontend`

## 📞 Si Sigue Fallando

1. **Borra el proyecto** en Vercel
2. **Importa de nuevo**
3. **Configura Root Directory PRIMERO**: `packages/frontend`
4. **Deja los demás campos en automático** (Vercel los detectará)
5. **Solo agrega** la variable `VITE_BACKEND_URL`
6. **Deploy**

---

**Última actualización**: 2026-02-13
**Configuración probada**: ✅ Funciona con monorepos

