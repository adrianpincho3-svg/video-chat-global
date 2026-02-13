# 🚂 Guía de Despliegue en Railway

Esta guía te llevará paso a paso para desplegar Random Video Chat en Railway en menos de 15 minutos.

## ¿Por qué Railway?

- ✅ Despliegue en 10-15 minutos
- ✅ Free tier generoso ($5 de crédito gratis)
- ✅ Bases de datos incluidas (PostgreSQL y Redis)
- ✅ SSL/HTTPS automático
- ✅ Auto-scaling
- ✅ CI/CD automático desde GitHub

## Requisitos Previos

1. Cuenta en [Railway.app](https://railway.app) (gratis)
2. Cuenta en GitHub
3. Este repositorio subido a GitHub

## Paso 1: Preparar el Repositorio

Si aún no has subido el código a GitHub:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Random Video Chat"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/random-video-chat.git
git branch -M main
git push -u origin main
```

## Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Click en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio `random-video-chat`

## Paso 3: Agregar PostgreSQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Anota las credenciales (o déjalas, Railway las conectará automáticamente)

## Paso 4: Agregar Redis

1. Click en "+ New" nuevamente
2. Selecciona "Database" → "Add Redis"
3. Railway creará automáticamente Redis
4. Las variables de entorno se configurarán automáticamente

## Paso 5: Configurar Variables de Entorno del Backend

1. Click en el servicio "backend" (o el servicio principal)
2. Ve a la pestaña "Variables"
3. Agrega las siguientes variables:

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-app.up.railway.app
AI_PROVIDER=mock
```

Railway automáticamente configurará:
- `DATABASE_URL` (desde PostgreSQL)
- `REDIS_URL` (desde Redis)

Si quieres usar OpenAI o Anthropic, agrega:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=tu-api-key
```

## Paso 6: Configurar el Build

1. En el servicio backend, ve a "Settings"
2. En "Build Command", asegúrate que sea:
   ```
   npm ci && npm run build --workspace=packages/backend
   ```
3. En "Start Command", configura:
   ```
   npm run start:prod --workspace=packages/backend
   ```

## Paso 7: Desplegar Frontend (Opcional - Vercel)

Railway puede servir el frontend, pero Vercel es mejor para esto:

1. Ve a [vercel.com](https://vercel.com)
2. Importa el mismo repositorio de GitHub
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Agrega variable de entorno:
   ```
   VITE_BACKEND_URL=https://tu-backend.up.railway.app
   ```
5. Deploy

## Paso 8: Ejecutar Migraciones

Las migraciones se ejecutan automáticamente con el script `start:prod`, pero si necesitas ejecutarlas manualmente:

1. En Railway, ve al servicio backend
2. Click en la pestaña "Deployments"
3. Click en el deployment activo
4. Click en "View Logs"
5. Deberías ver: "✅ Migraciones completadas"

Si necesitas ejecutarlas manualmente:
1. Ve a "Settings" → "Deploy"
2. En "Custom Start Command" temporalmente pon:
   ```
   npm run migrate --workspace=packages/backend
   ```
3. Después de que termine, vuelve a poner el comando original

## Paso 9: Crear Administrador

Para crear un usuario administrador:

1. En Railway, ve al servicio backend
2. Click en "Settings" → "Deploy"
3. Temporalmente cambia el "Start Command" a:
   ```
   npm run create-admin --workspace=packages/backend
   ```
4. Espera a que termine (verás las credenciales en los logs)
5. **IMPORTANTE**: Guarda las credenciales
6. Vuelve a cambiar el "Start Command" al original:
   ```
   npm run start:prod --workspace=packages/backend
   ```

## Paso 10: Verificar Despliegue

1. Abre la URL de tu aplicación (Railway te la proporciona)
2. Deberías ver la página de inicio
3. Prueba iniciar un chat
4. Prueba acceder al panel de administrador en `/admin/login`

## URLs Finales

Después del despliegue tendrás:

- **Frontend**: `https://tu-app.vercel.app` (si usaste Vercel)
- **Backend**: `https://tu-backend.up.railway.app`
- **Admin Panel**: `https://tu-app.vercel.app/admin/login`

## Configuración de Dominio Personalizado (Opcional)

### En Railway (Backend):

1. Ve a "Settings" → "Networking"
2. Click en "Generate Domain" o "Custom Domain"
3. Agrega tu dominio (ej: `api.tudominio.com`)
4. Configura el DNS según las instrucciones

### En Vercel (Frontend):

1. Ve a "Settings" → "Domains"
2. Agrega tu dominio (ej: `tudominio.com`)
3. Configura el DNS según las instrucciones

## Monitoreo

Railway proporciona:
- **Logs en tiempo real**: Pestaña "Deployments" → "View Logs"
- **Métricas**: CPU, RAM, Network
- **Health checks**: Automáticos

## Costos

**Free Tier de Railway:**
- $5 de crédito gratis al mes
- Suficiente para ~500 horas de ejecución
- Ideal para demos y proyectos pequeños

**Si necesitas más:**
- Hobby Plan: $5/mes por servicio
- Pro Plan: $20/mes (incluye más recursos)

## Troubleshooting

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo
2. Verifica las variables de entorno
3. Revisa los logs: `View Logs` en Railway

### Error: "Redis connection failed"

1. Verifica que Redis esté corriendo
2. Railway debería configurar `REDIS_URL` automáticamente
3. Si no, agrégala manualmente desde las credenciales de Redis

### Error: "Build failed"

1. Verifica que el Build Command sea correcto
2. Asegúrate de que todas las dependencias estén en `package.json`
3. Revisa los logs de build

### Frontend no conecta con Backend

1. Verifica que `VITE_BACKEND_URL` apunte a la URL correcta del backend
2. Asegúrate de incluir `https://` en la URL
3. Verifica que CORS esté configurado correctamente en el backend

## Actualizar la Aplicación

Railway tiene CI/CD automático:

1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. Railway detectará el cambio y desplegará automáticamente

## Backup de Base de Datos

Para hacer backup de PostgreSQL:

1. En Railway, ve al servicio PostgreSQL
2. Click en "Connect"
3. Copia el comando de conexión
4. Ejecuta localmente:
   ```bash
   pg_dump -h hostname -U username -d database > backup.sql
   ```

## Siguiente Paso: Probar con Usuarios Reales

Una vez desplegado:

1. Comparte la URL con amigos
2. Pídeles que prueben el chat
3. Monitorea las métricas en el panel de administrador
4. Revisa los logs para detectar errores

## Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Vercel](https://vercel.com/docs)
- [Guía completa de despliegue](./DEPLOYMENT.md)

---

**¿Necesitas ayuda?** Revisa los logs en Railway o consulta la documentación completa.

