# 🔍 Diagnóstico Rápido - Video Chat

## Problema: "Conectando al servidor..." no desaparece

### ✅ Solución Implementada

He corregido dos problemas importantes:

1. **CORS mejorado**: El backend ahora acepta automáticamente:
   - Todos los dominios `*.vercel.app`
   - `localhost` en desarrollo
   - El dominio configurado en `FRONTEND_URL`

2. **Mejor manejo de errores de cámara**: Ahora verás mensajes claros si hay problemas con permisos de cámara/micrófono.

### 📋 Checklist de Verificación

Marca cada paso que completes:

- [ ] **Backend desplegado en Railway**
  - Ve a https://railway.app
  - Verifica que tu proyecto esté "Active" (verde)
  - Copia la URL pública (ej: `https://web-production-xxxx.up.railway.app`)

- [ ] **Variables de entorno en Railway**
  - `NODE_ENV=production` ✓
  - `AI_PROVIDER=mock` ✓
  - `FRONTEND_URL=https://tu-app.vercel.app` ⚠️ (usa tu dominio real)

- [ ] **Backend funcionando**
  - Abre: `https://tu-backend.up.railway.app/health`
  - Deberías ver: `{"status":"ok",...}`

- [ ] **Variable en Vercel**
  - Ve a Vercel → Settings → Environment Variables
  - `VITE_BACKEND_URL=https://tu-backend.up.railway.app`
  - Redeploy después de agregar

- [ ] **Redeploy en Vercel**
  - Deployments → ... → Redeploy
  - Espera 2-3 minutos

### 🧪 Pruebas

1. **Abrir tu app en Vercel**
   ```
   https://tu-app.vercel.app
   ```

2. **Abrir consola del navegador** (F12)

3. **Buscar estos mensajes**:
   ```
   ✅ Conectado al servidor de señalización
   🎥 Solicitando acceso a cámara y micrófono...
   ✅ Acceso a media concedido
   ```

4. **Si ves errores**:
   - Error de CORS → Verifica `FRONTEND_URL` en Railway
   - Error de conexión → Verifica que backend esté activo
   - Error de cámara → Acepta permisos en el navegador

### 🔧 Comandos de Verificación

```bash
# Verificar backend
curl https://tu-backend.up.railway.app/health

# Debería responder:
# {"status":"ok","timestamp":"...","services":{...}}
```

### 📊 Estados Esperados

| Componente | Estado | URL |
|------------|--------|-----|
| Backend (Railway) | Active | `https://web-production-xxxx.up.railway.app` |
| Frontend (Vercel) | Ready | `https://tu-app.vercel.app` |
| PostgreSQL | Connected | (automático) |
| Redis | Connected | (automático) |

### ⚠️ Errores Comunes

#### 1. "Conectando al servidor..." permanente

**Causa**: Backend no desplegado o URL incorrecta

**Solución**:
1. Verifica que Railway esté activo
2. Verifica `VITE_BACKEND_URL` en Vercel
3. Redeploy en Vercel

#### 2. Error de CORS en consola

**Causa**: `FRONTEND_URL` no configurada o incorrecta

**Solución**:
1. En Railway, agrega `FRONTEND_URL=https://tu-app.vercel.app`
2. Espera el redeploy automático
3. Recarga tu app

#### 3. Cámara no se activa

**Causa**: Permisos no otorgados o HTTPS no habilitado

**Solución**:
1. Verifica que uses HTTPS (automático en Vercel)
2. Click en el ícono de candado en la barra de direcciones
3. Permite cámara y micrófono
4. Recarga la página

#### 4. "No permitido por CORS" en logs de Railway

**Causa**: El código anterior tenía CORS muy restrictivo

**Solución**: Ya está corregido en el último commit. Solo necesitas:
1. Railway redesplegará automáticamente
2. O fuerza un redeploy en Railway

### 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Prueba el matching**:
   - Abre dos ventanas de incógnito
   - Inicia chat en ambas
   - Deberían conectarse

2. **Prueba el bot**:
   - Inicia chat
   - Espera 10 segundos
   - Click en "Chatear con Bot"

3. **Prueba Jitsi**:
   - Ve a `/chat/jitsi`
   - Inicia chat
   - Usa Jitsi Meet en lugar de WebRTC nativo

### 📞 Soporte

Si sigues teniendo problemas:

1. Abre la consola del navegador (F12)
2. Copia todos los mensajes de error
3. Revisa los logs de Railway (Deployments → View Logs)
4. Comparte los errores para ayuda específica

---

**Última actualización**: Código corregido y subido a GitHub
**Commit**: "Fix CORS for Vercel domains and improve media error handling"
