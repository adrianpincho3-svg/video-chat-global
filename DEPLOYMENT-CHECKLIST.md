# ✅ Checklist de Despliegue - Random Video Chat

## Pre-Despliegue

- [ ] Código subido a GitHub
- [ ] Variables de entorno preparadas
- [ ] Contraseñas seguras generadas
- [ ] Plataforma de despliegue seleccionada

## Despliegue en Railway (Opción Recomendada)

### 1. Configuración Inicial
- [ ] Cuenta creada en [Railway.app](https://railway.app)
- [ ] Repositorio conectado desde GitHub
- [ ] Proyecto creado en Railway

### 2. Bases de Datos
- [ ] PostgreSQL agregado al proyecto
- [ ] Redis agregado al proyecto
- [ ] Credenciales verificadas (Railway las configura automáticamente)

### 3. Variables de Entorno
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `FRONTEND_URL` configurada
- [ ] `AI_PROVIDER=mock` (o con API key si usas OpenAI/Anthropic)
- [ ] `DATABASE_URL` (automático desde Railway)
- [ ] `REDIS_URL` (automático desde Railway)

### 4. Configuración de Build
- [ ] Build Command: `npm ci && npm run build --workspace=packages/backend`
- [ ] Start Command: `npm run start:prod --workspace=packages/backend`
- [ ] Root Directory: `/` (raíz del proyecto)

### 5. Despliegue
- [ ] Primer deploy ejecutado
- [ ] Logs revisados (sin errores)
- [ ] Health check pasando
- [ ] Migraciones ejecutadas automáticamente

### 6. Frontend en Vercel
- [ ] Cuenta creada en [Vercel.com](https://vercel.com)
- [ ] Repositorio importado
- [ ] Framework: Vite
- [ ] Root Directory: `packages/frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Variable `VITE_BACKEND_URL` configurada con URL de Railway
- [ ] Deploy ejecutado

### 7. Crear Administrador
- [ ] Comando ejecutado: `npm run create-admin --workspace=packages/backend`
- [ ] Credenciales guardadas en lugar seguro
- [ ] Login probado en `/admin/login`

## Post-Despliegue

### Verificación Funcional
- [ ] Página de inicio carga correctamente
- [ ] Botón "Iniciar Chat" funciona
- [ ] Filtros de selección funcionan
- [ ] Sala de espera muestra correctamente
- [ ] Video chat se conecta (probar con 2 dispositivos)
- [ ] Chat de texto funciona
- [ ] Botón "Siguiente" funciona
- [ ] Enlaces compartibles funcionan
- [ ] Panel de administrador accesible
- [ ] Métricas se muestran correctamente

### Verificación Técnica
- [ ] HTTPS habilitado (automático en Railway/Vercel)
- [ ] WebSocket conecta correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor
- [ ] Health check endpoint responde: `/health`
- [ ] CORS configurado correctamente

### Seguridad
- [ ] Contraseñas seguras (min 32 caracteres)
- [ ] Variables de entorno no expuestas en frontend
- [ ] HTTPS forzado
- [ ] Headers de seguridad configurados
- [ ] Rate limiting habilitado (si aplica)

### Monitoreo
- [ ] Logs accesibles en Railway
- [ ] Métricas visibles en panel de admin
- [ ] Alertas configuradas (opcional)

## Pruebas con Usuarios Reales

- [ ] Probar con 2 usuarios simultáneos
- [ ] Probar en diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Probar en móvil (iOS y Android)
- [ ] Probar permisos de cámara/micrófono
- [ ] Probar reconexión después de desconexión
- [ ] Probar función "siguiente"
- [ ] Probar enlaces compartibles
- [ ] Probar reportar usuario
- [ ] Probar bloqueo de usuario desde admin

## Optimización (Opcional)

- [ ] Configurar CDN para assets estáticos
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL personalizado
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo avanzado (Sentry, etc.)
- [ ] Configurar analytics (opcional)

## Troubleshooting Común

### ❌ Backend no inicia
- Revisar logs en Railway
- Verificar variables de entorno
- Verificar conexión a bases de datos

### ❌ Frontend no conecta con backend
- Verificar `VITE_BACKEND_URL` en Vercel
- Verificar CORS en backend
- Verificar que backend esté corriendo

### ❌ WebRTC no funciona
- Verificar que HTTPS esté habilitado
- Verificar permisos de cámara/micrófono
- Verificar que Socket.io esté conectado

### ❌ Base de datos no conecta
- Verificar que PostgreSQL esté corriendo en Railway
- Verificar `DATABASE_URL` en variables de entorno
- Revisar logs de conexión

## URLs Finales

Después del despliegue, anota tus URLs:

- **Frontend**: ___________________________________
- **Backend**: ___________________________________
- **Admin Panel**: ___________________________________
- **GitHub Repo**: ___________________________________

## Credenciales de Administrador

- **Usuario**: ___________________________________
- **Contraseña**: ___________________________________

⚠️ **IMPORTANTE**: Guarda estas credenciales en un lugar seguro (1Password, LastPass, etc.)

## Costos Estimados

- **Railway Free Tier**: $5 crédito gratis/mes
- **Vercel Free Tier**: Gratis para proyectos personales
- **Total**: $0/mes (con límites de free tier)

Si necesitas más recursos:
- **Railway Hobby**: $5/mes
- **Vercel Pro**: $20/mes

## Siguiente Paso

✅ **¡Despliegue completado!**

Comparte la URL con amigos y prueba la aplicación con usuarios reales.

---

**Fecha de despliegue**: _______________
**Desplegado por**: _______________
**Versión**: 1.0.0

