# 🔧 Troubleshooting Railway - Random Video Chat

## Error: "The train has not arrived at the station"

Este error significa que Railway no puede conectarse a tu aplicación. Aquí están las soluciones:

### ✅ Solución 1: Verificar Puerto y Host (IMPLEMENTADO)

El servidor ahora está configurado para:
- ✅ Escuchar en `0.0.0.0` (todas las interfaces)
- ✅ Usar `process.env.PORT` (puerto dinámico de Railway)
- ✅ Health check en `/health`

### ✅ Solución 2: Inicio Rápido del Servidor (IMPLEMENTADO)

El servidor ahora:
- ✅ Inicia inmediatamente (sin esperar migraciones)
- ✅ Conecta a bases de datos de forma asíncrona
- ✅ Ejecuta migraciones en background

### 📋 Pasos para Verificar en Railway

1. **Verificar Variables de Entorno**
   - Ve a tu servicio en Railway
   - Click en "Variables"
   - Asegúrate de tener:
     ```
     NODE_ENV=production
     PORT=(Railway lo configura automáticamente)
     ```

2. **Verificar Logs**
   - Ve a "Deployments"
   - Click en el deployment activo
   - Click en "View Logs"
   - Deberías ver:
     ```
     🚀 Servidor ejecutándose en http://0.0.0.0:XXXX
     📡 Socket.io listo para conexiones
     ✅ Listo para recibir conexiones externas
     ```

3. **Generar Dominio Público**
   - Ve a "Settings" → "Networking"
   - Click en "Generate Domain"
   - Railway generará una URL como: `https://tu-app.up.railway.app`
   - Espera 1-2 minutos para que el DNS se propague

4. **Verificar Health Check**
   - Una vez que tengas el dominio, prueba:
     ```
     curl https://tu-app.up.railway.app/health
     ```
   - Deberías ver:
     ```json
     {
       "status": "ok",
       "timestamp": "...",
       "services": {...}
     }
     ```

### 🔄 Si Aún Falla

#### Opción A: Redeploy

1. Ve a "Deployments"
2. Click en los tres puntos del deployment
3. Click en "Redeploy"
4. Espera 2-3 minutos

#### Opción B: Verificar Build

1. Ve a "Deployments" → "View Logs"
2. Busca errores en el build:
   ```
   npm run build --workspace=packages/backend
   ```
3. Si hay errores, revisa que todas las dependencias estén en `package.json`

#### Opción C: Verificar Start Command

1. Ve a "Settings" → "Deploy"
2. Verifica que "Start Command" sea:
   ```
   npm run start --workspace=packages/backend
   ```
3. Si no está, agrégalo y redeploy

### 🗄️ Configurar Bases de Datos

#### PostgreSQL

1. En Railway, click "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway configurará automáticamente `DATABASE_URL`
4. Las migraciones se ejecutarán automáticamente

#### Redis

1. Click "+ New"
2. Selecciona "Database" → "Add Redis"
3. Railway configurará automáticamente `REDIS_URL`

### 🌐 Configurar CORS

Si el frontend no puede conectarse al backend:

1. Ve a "Variables" en Railway
2. Agrega:
   ```
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```
3. Redeploy

### 📊 Monitoreo

#### Ver Logs en Tiempo Real

```bash
# Opción 1: En Railway Dashboard
Deployments → View Logs

# Opción 2: Railway CLI
railway logs
```

#### Ver Métricas

En Railway Dashboard:
- CPU usage
- Memory usage
- Network traffic

### 🚨 Errores Comunes

#### Error: "Cannot find module"

**Causa**: Dependencia faltante en `package.json`

**Solución**:
```bash
# Local
npm install <paquete-faltante>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

#### Error: "ECONNREFUSED" (Redis/PostgreSQL)

**Causa**: Bases de datos no configuradas

**Solución**:
1. Verifica que PostgreSQL y Redis estén agregados en Railway
2. Verifica que las variables `DATABASE_URL` y `REDIS_URL` existan
3. Redeploy

#### Error: "Port already in use"

**Causa**: Conflicto de puertos (no debería pasar en Railway)

**Solución**:
- Railway asigna puertos automáticamente
- Verifica que uses `process.env.PORT`

### ✅ Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Repositorio conectado en Railway
- [ ] PostgreSQL agregado
- [ ] Redis agregado
- [ ] Variables de entorno configuradas
- [ ] Dominio generado en Networking
- [ ] Health check responde en `/health`
- [ ] Logs muestran "Servidor ejecutándose"
- [ ] No hay errores en logs

### 🎯 Próximos Pasos

Una vez que el backend esté funcionando:

1. **Probar Health Check**
   ```bash
   curl https://tu-backend.up.railway.app/health
   ```

2. **Desplegar Frontend en Vercel**
   - Configura `VITE_BACKEND_URL` con la URL de Railway
   - Deploy

3. **Crear Administrador**
   ```bash
   railway run npm run create-admin --workspace=packages/backend
   ```

4. **Probar la Aplicación**
   - Abre la URL del frontend
   - Inicia un chat
   - Verifica que todo funcione

### 📞 Soporte

Si sigues teniendo problemas:

1. Revisa los logs completos en Railway
2. Verifica que todas las variables de entorno estén configuradas
3. Prueba hacer un redeploy limpio
4. Verifica que el dominio esté correctamente generado

### 🔗 Enlaces Útiles

- [Railway Docs](https://docs.railway.app)
- [Railway Status](https://status.railway.app)
- [Railway Discord](https://discord.gg/railway)

---

**Última actualización**: 2026-02-13
**Versión**: 1.0.1 (Corregido para Railway)

