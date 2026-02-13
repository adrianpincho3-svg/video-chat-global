import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis, pingRedis, isRedisConnected } from './config/redis';
import { connectDatabase, pingDatabase, isDatabaseConnected } from './config/database';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';
import { setupSocketHandlers } from './handlers/socketHandlers';
import adminRouter from './routes/admin';
import linksRouter from './routes/links';
import jitsiRouter from './routes/jitsi';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configurar CORS - Permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_URL,
].filter(Boolean); // Remover valores undefined

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como Postman, curl, o apps móviles)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir cualquier dominio de Vercel (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Permitir orígenes en la lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir cualquier localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    console.warn('⚠️ Origen bloqueado por CORS:', origin);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar rutas de API
app.use('/api/admin', adminRouter);
app.use('/api/links', linksRouter);
app.use('/api/jitsi', jitsiRouter);

// Configurar Socket.io con tipos
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
  cors: corsOptions,
});

// Configurar handlers de Socket.io
setupSocketHandlers(io);

// Health check endpoint
app.get('/health', async (_req, res) => {
  const redisConnected = isRedisConnected();
  const redisPing = redisConnected ? await pingRedis() : false;
  const dbConnected = isDatabaseConnected();
  const dbPing = dbConnected ? await pingDatabase() : false;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      redis: {
        connected: redisConnected,
        ping: redisPing,
      },
      database: {
        connected: dbConnected,
        ping: dbPing,
      },
    },
  });
});

// Socket.io ya está configurado con setupSocketHandlers

// Inicializar servicios y servidor
async function startServer() {
  // Iniciar servidor HTTP primero (IMPORTANTE: Railway necesita esto rápido)
  const PORT = process.env.PORT || 4000;
  const HOST = '0.0.0.0'; // Escuchar en todas las interfaces (necesario para Railway)
  
  httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
    console.log(`📡 Socket.io listo para conexiones`);
    console.log(`✅ Listo para recibir conexiones externas`);
  });

  // Conectar a bases de datos de forma asíncrona (no bloquea el inicio)
  connectDatabases();
}

// Función para conectar a bases de datos sin bloquear el inicio
async function connectDatabases() {
  // Intentar conectar a Redis (con reintentos)
  try {
    console.log('📡 Conectando a Redis...');
    await connectRedis();
    console.log('✅ Redis conectado');
  } catch (error) {
    console.error('⚠️ No se pudo conectar a Redis:', error);
    console.log('⚠️ El servidor continuará sin Redis. Algunas funcionalidades estarán limitadas.');
  }

  // Intentar conectar a PostgreSQL (con reintentos)
  try {
    console.log('📡 Conectando a PostgreSQL...');
    await connectDatabase();
    console.log('✅ PostgreSQL conectado');
    
    // Ejecutar migraciones si estamos en producción
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('🔄 Ejecutando migraciones...');
        const { runMigrations } = await import('./migrations/migrate');
        await runMigrations();
        console.log('✅ Migraciones completadas');
      } catch (migrationError) {
        console.error('⚠️ Error ejecutando migraciones:', migrationError);
        console.log('⚠️ El servidor continuará. Ejecuta migraciones manualmente si es necesario.');
      }
    }
  } catch (error) {
    console.error('⚠️ No se pudo conectar a PostgreSQL:', error);
    console.log('⚠️ El servidor continuará sin PostgreSQL. Algunas funcionalidades estarán limitadas.');
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⚠️ Cerrando servidor...');
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Cerrando servidor...');
  httpServer.close();
  process.exit(0);
});

// Iniciar servidor
startServer();

export { app, io, httpServer };
