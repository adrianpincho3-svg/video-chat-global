import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

/**
 * Configuración de PostgreSQL
 * Soporta tanto DATABASE_URL (Render, Heroku) como variables separadas (desarrollo local)
 */
function getDatabaseConfig() {
  // Si existe DATABASE_URL, usarla (formato: postgresql://user:pass@host:port/dbname)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
  
  // Fallback a configuración por partes (desarrollo local)
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'random_video_chat',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const dbConfig = getDatabaseConfig();

/**
 * Conecta a PostgreSQL y crea el pool de conexiones
 */
export async function connectDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool(dbConfig);

    // Manejo de errores
    pool.on('error', (err) => {
      console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
    });

    pool.on('connect', () => {
      console.log('🔄 Nueva conexión a PostgreSQL establecida');
    });

    pool.on('remove', () => {
      console.log('⚠️ Conexión a PostgreSQL removida del pool');
    });

    // Verificar conexión
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    console.log('✅ PostgreSQL conectado y listo');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    throw error;
  }
}

/**
 * Obtiene el pool de PostgreSQL (debe estar conectado)
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('PostgreSQL pool no está inicializado. Llama a connectDatabase() primero.');
  }
  return pool;
}

/**
 * Ejecuta una query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

/**
 * Ejecuta una transacción
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cierra el pool de conexiones
 */
export async function disconnectDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ PostgreSQL desconectado');
  }
}

/**
 * Verifica si la base de datos está conectada
 */
export function isDatabaseConnected(): boolean {
  return pool !== null;
}

/**
 * Ping a PostgreSQL para verificar conectividad
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    if (!pool) {
      return false;
    }
    const result = await query('SELECT 1 as ping');
    return result.rows[0].ping === 1;
  } catch (error) {
    console.error('Error al hacer ping a PostgreSQL:', error);
    return false;
  }
}
