import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/redis';
import { getPool } from '../config/database';

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminSession {
  sessionId: string;
  adminId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

const SESSION_TTL = 30 * 60; // 30 minutos en segundos

class AuthService {
  /**
   * Autentica administrador con credenciales
   */
  async authenticate(credentials: AdminCredentials): Promise<AdminSession | null> {
    try {
      const pool = getPool();
      
      // Buscar administrador en la base de datos
      const result = await pool.query(
        'SELECT id, username, password_hash FROM admins WHERE username = $1',
        [credentials.username]
      );

      if (result.rows.length === 0) {
        console.log(`⚠️ Administrador no encontrado: ${credentials.username}`);
        return null;
      }

      const admin = result.rows[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash);

      if (!isPasswordValid) {
        console.log(`⚠️ Contraseña incorrecta para: ${credentials.username}`);
        return null;
      }

      // Crear sesión
      const sessionId = uuidv4();
      const now = Date.now();
      const session: AdminSession = {
        sessionId,
        adminId: admin.id,
        username: admin.username,
        createdAt: now,
        expiresAt: now + SESSION_TTL * 1000,
        lastActivity: now,
      };

      // Guardar sesión en Redis
      const redisClient = getRedisClient();
      
      await redisClient.hSet(`admin_session:${sessionId}`, {
        sessionId: session.sessionId,
        adminId: session.adminId,
        username: session.username,
        createdAt: session.createdAt.toString(),
        lastActivity: session.lastActivity.toString(),
      });

      // Establecer TTL
      await redisClient.expire(`admin_session:${sessionId}`, SESSION_TTL);

      // Actualizar último login en la base de datos
      await pool.query(
        'UPDATE admins SET last_login = NOW() WHERE id = $1',
        [admin.id]
      );

      console.log(`✅ Administrador autenticado: ${admin.username}`);

      return session;
    } catch (error) {
      console.error('Error en authenticate:', error);
      return null;
    }
  }

  /**
   * Valida sesión de administrador
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      const session = await redisClient.hGetAll(`admin_session:${sessionId}`);

      if (!session || Object.keys(session).length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en validateSession:', error);
      return false;
    }
  }

  /**
   * Actualiza última actividad de sesión
   */
  async updateActivity(sessionId: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const session = await redisClient.hGetAll(`admin_session:${sessionId}`);

      if (!session || Object.keys(session).length === 0) {
        return;
      }

      const now = Date.now();

      // Actualizar última actividad
      await redisClient.hSet(`admin_session:${sessionId}`, {
        lastActivity: now.toString(),
      });

      // Renovar TTL
      await redisClient.expire(`admin_session:${sessionId}`, SESSION_TTL);
    } catch (error) {
      console.error('Error en updateActivity:', error);
    }
  }

  /**
   * Cierra sesión de administrador
   */
  async logout(sessionId: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`admin_session:${sessionId}`);
      console.log(`✅ Sesión cerrada: ${sessionId}`);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  /**
   * Limpia sesiones expiradas (>30 minutos inactivas)
   * Redis maneja esto automáticamente con TTL, pero esta función
   * puede usarse para limpieza manual si es necesario
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Redis maneja la expiración automáticamente con TTL
      // Esta función está aquí por completitud de la interfaz
      console.log('✅ Limpieza de sesiones expiradas (manejado por Redis TTL)');
    } catch (error) {
      console.error('Error en cleanupExpiredSessions:', error);
    }
  }

  /**
   * Registra intento de acceso no autorizado
   */
  async logUnauthorizedAccess(ipAddress: string, username?: string): Promise<void> {
    try {
      const pool = getPool();
      
      await pool.query(
        'INSERT INTO unauthorized_access_attempts (ip_address, username) VALUES ($1, $2)',
        [ipAddress, username || null]
      );

      console.log(`⚠️ Intento de acceso no autorizado: IP=${ipAddress}, username=${username || 'N/A'}`);
    } catch (error) {
      console.error('Error en logUnauthorizedAccess:', error);
    }
  }

  /**
   * Obtiene información de sesión
   */
  async getSession(sessionId: string): Promise<AdminSession | null> {
    try {
      const redisClient = getRedisClient();
      const session = await redisClient.hGetAll(`admin_session:${sessionId}`);

      if (!session || Object.keys(session).length === 0) {
        return null;
      }

      return {
        sessionId: session.sessionId,
        adminId: session.adminId,
        username: session.username,
        createdAt: parseInt(session.createdAt),
        expiresAt: parseInt(session.createdAt) + SESSION_TTL * 1000,
        lastActivity: parseInt(session.lastActivity),
      };
    } catch (error) {
      console.error('Error en getSession:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export type { AdminCredentials, AdminSession };
