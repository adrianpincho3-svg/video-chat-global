# Random Video Chat

Una aplicación de video chat aleatorio similar a Omegle que permite a usuarios anónimos conectarse por video y texto en tiempo real.

## Características

- 🎥 Video chat en tiempo real usando WebRTC
- 💬 Chat de texto simultáneo
- 🎯 Filtros de emparejamiento (Masculino, Femenino, Parejas)
- 🌍 Soporte global con 6 regiones geográficas
- 🤖 Bots de IA cuando no hay usuarios disponibles
- 🔗 Enlaces compartibles para invitar usuarios específicos
- 👨‍💼 Panel de administrador con reportes y moderación
- 🔒 Privacidad y anonimato garantizados

## Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- WebRTC API

### Backend
- Node.js + Express + TypeScript
- Socket.io
- Redis (cola de espera y sesiones)
- PostgreSQL (reportes y administración)
- WebRTC (señalización)

## Estructura del Proyecto

```
random-video-chat/
├── packages/
│   ├── frontend/          # Aplicación React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── main.tsx
│   │   └── package.json
│   └── backend/           # Servidor Node.js
│       ├── src/
│       │   ├── services/
│       │   ├── routes/
│       │   └── server.ts
│       └── package.json
├── .kiro/specs/          # Especificaciones del proyecto
└── package.json          # Workspace root
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Redis >= 7.0
- PostgreSQL >= 14.0

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd random-video-chat
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Configurar base de datos:
```bash
# Crear base de datos PostgreSQL
createdb random_video_chat

# Ejecutar migraciones (cuando estén disponibles)
npm run migrate --workspace=packages/backend
```

5. Iniciar servicios de desarrollo:
```bash
# Iniciar Redis
redis-server

# En otra terminal, iniciar la aplicación
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Scripts Disponibles

### Root
- `npm run dev` - Inicia frontend y backend en modo desarrollo
- `npm run build` - Construye ambos proyectos
- `npm run test` - Ejecuta tests en ambos proyectos
- `npm run lint` - Ejecuta linter en ambos proyectos
- `npm run format` - Formatea código con Prettier

### Backend
- `npm run dev --workspace=packages/backend` - Modo desarrollo con hot reload
- `npm run build --workspace=packages/backend` - Compila TypeScript
- `npm run test --workspace=packages/backend` - Ejecuta tests con Jest

### Frontend
- `npm run dev --workspace=packages/frontend` - Modo desarrollo con Vite
- `npm run build --workspace=packages/frontend` - Build de producción
- `npm run test --workspace=packages/frontend` - Ejecuta tests con Vitest

## Testing

El proyecto incluye property-based testing usando fast-check:

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npm run test -- --coverage
```

## Despliegue

### Opción 1: Railway (Recomendado - Más Rápido) 🚂

Despliegue en 10-15 minutos con Railway:

1. **Sube el código a GitHub**
2. **Crea proyecto en [Railway.app](https://railway.app)**
3. **Agrega PostgreSQL y Redis** desde Railway
4. **Configura variables de entorno**
5. **Deploy automático**

📖 **[Guía completa de Railway](docs/RAILWAY-DEPLOY.md)**

### Opción 2: Docker Compose (Control Total) 🐳

Para desplegar en tu propio servidor VPS:

```bash
# 1. Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tus valores

# 2. Ejecutar script de despliegue
chmod +x deploy.sh
./deploy.sh

# 3. La aplicación estará disponible en http://tu-servidor
```

### Opción 3: Vercel + Render

- **Frontend** → Vercel (CDN global, gratis)
- **Backend** → Render (free tier disponible)

📖 **[Guía completa de despliegue](docs/DEPLOYMENT.md)**
📖 **[Guía rápida (10 minutos)](docs/QUICK-DEPLOY.md)**
📖 **[Resumen de opciones](docs/DEPLOYMENT-SUMMARY.md)**

### Después del Despliegue

1. **Ejecutar migraciones** (automático con Railway)
2. **Crear administrador**:
   ```bash
   npm run create-admin --workspace=packages/backend
   ```
3. **Acceder al panel de administrador**: `https://tu-app.com/admin/login`
4. **Probar con usuarios reales**

### URLs de Ejemplo

- **App**: https://random-video-chat.vercel.app
- **API**: https://random-video-chat.up.railway.app
- **Admin**: https://random-video-chat.vercel.app/admin/login

## Documentación

- [Requisitos](.kiro/specs/random-video-chat/requirements.md)
- [Diseño de Arquitectura](.kiro/specs/random-video-chat/design.md)
- [Plan de Implementación](.kiro/specs/random-video-chat/tasks.md)

## Licencia

MIT

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.
