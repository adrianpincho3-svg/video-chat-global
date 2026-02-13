import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType | null = null;

/**
 * Configuración de Redis
 */
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * Conecta al servidor Redis
 */
export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient(redisConfig);

    // Manejo de errores
    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Conectando a Redis...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis conectado y listo');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Reconectando a Redis...');
    });

    redisClient.on('end', () => {
      console.log('⚠️ Conexión a Redis cerrada');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Error al conectar a Redis:', error);
    throw error;
  }
}

/**
 * Obtiene el cliente Redis (debe estar conectado)
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client no está conectado. Llama a connectRedis() primero.');
  }
  return redisClient;
}

/**
 * Cierra la conexión a Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis desconectado');
  }
}

/**
 * Verifica si Redis está conectado
 */
export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.isOpen;
}

/**
 * Ping a Redis para verificar conectividad
 */
export async function pingRedis(): Promise<boolean> {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    const response = await redisClient.ping();
    return response === 'PONG';
  } catch (error) {
    console.error('Error al hacer ping a Redis:', error);
    return false;
  }
}
