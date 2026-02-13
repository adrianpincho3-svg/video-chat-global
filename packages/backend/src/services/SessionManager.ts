import { v4 as uuidv4 } from 'uuid';
import { SessionData, Region } from '../types';
import { LIMITS } from '../constants';
import {
  setHash,
  getHashParsed,
  deleteKey,
  setString,
  getString,
  addToSortedSet,
  incrementCounter,
  decrementCounter,
} from '../utils/redis-helpers';

/**
 * Gestor de sesiones de chat
 * Maneja la creación, obtención y finalización de sesiones
 */
export class SessionManager {
  /**
   * Crea una nueva sesión entre dos usuarios
   */
  async createSession(
    user1Id: string,
    user2Id: string,
    isBot: boolean,
    user1Region?: Region,
    user2Region?: Region,
    linkId?: string
  ): Promise<SessionData> {
    const sessionId = uuidv4();
    const now = Date.now();

    const sessionData: SessionData = {
      sessionId,
      user1Id,
      user2Id,
      user1Region: user1Region || 'any',
      user2Region: user2Region || 'any',
      isUser2Bot: isBot,
      createdAt: now,
      linkId,
    };

    // Guardar datos de la sesión
    await setHash(
      `session:${sessionId}`,
      sessionData,
      LIMITS.SESSION_TTL
    );

    // Mapear usuarios a sesión
    await setString(
      `user_session:${user1Id}`,
      sessionId,
      LIMITS.SESSION_TTL
    );
    await setString(
      `user_session:${user2Id}`,
      sessionId,
      LIMITS.SESSION_TTL
    );

    // Incrementar contadores de métricas
    await incrementCounter('metrics:realtime:activeSessions');
    await incrementCounter('metrics:realtime:activeUsers', 2);

    // Si es sesión con bot, incrementar contador
    if (isBot) {
      await incrementCounter('metrics:realtime:botSessions');
    }

    console.log(`✅ Sesión creada: ${sessionId} (${user1Id} <-> ${user2Id}${isBot ? ' [BOT]' : ''})`);

    return sessionData;
  }

  /**
   * Obtiene los datos de una sesión
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    return await getHashParsed<SessionData>(`session:${sessionId}`);
  }

  /**
   * Obtiene la sesión de un usuario
   */
  async getSessionByUser(userId: string): Promise<SessionData | null> {
    const sessionId = await getString(`user_session:${userId}`);
    
    if (!sessionId) {
      return null;
    }

    return await this.getSession(sessionId);
  }

  /**
   * Termina una sesión y limpia recursos
   */
  async endSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      console.log(`⚠️ Sesión ${sessionId} no encontrada`);
      return;
    }

    // Calcular duración de la sesión
    const duration = Date.now() - session.createdAt;
    const durationSeconds = Math.floor(duration / 1000);

    // Registrar métricas de la sesión
    await this.recordSessionMetrics(sessionId, durationSeconds);

    // Eliminar mapeos de usuarios
    await deleteKey(`user_session:${session.user1Id}`);
    await deleteKey(`user_session:${session.user2Id}`);

    // Eliminar datos de la sesión
    await deleteKey(`session:${sessionId}`);

    // Decrementar contadores de métricas
    await decrementCounter('metrics:realtime:activeSessions');
    await decrementCounter('metrics:realtime:activeUsers', 2);

    // Si era sesión con bot, decrementar contador
    if (session.isUser2Bot) {
      await decrementCounter('metrics:realtime:botSessions');
    }

    console.log(`✅ Sesión terminada: ${sessionId} (duración: ${durationSeconds}s)`);
  }

  /**
   * Registra métricas de una sesión finalizada
   */
  async recordSessionMetrics(sessionId: string, durationSeconds: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Agregar duración al sorted set del día
    await addToSortedSet(
      `metrics:sessions:daily:${today}`,
      durationSeconds,
      sessionId
    );

    // Incrementar contador de sesiones totales del día
    await incrementCounter(`metrics:sessions:count:${today}`);

    // Incrementar contador de sesiones totales (histórico)
    await incrementCounter('metrics:realtime:totalSessionsToday');

    console.log(`📊 Métricas registradas para sesión ${sessionId}: ${durationSeconds}s`);
  }

  /**
   * Obtiene todas las sesiones activas
   */
  async getActiveSessions(): Promise<SessionData[]> {
    // Esta es una operación costosa, usar con precaución
    // En producción, considerar mantener un índice de sesiones activas
    console.warn('⚠️ getActiveSessions es una operación costosa');
    return [];
  }

  /**
   * Verifica si un usuario está en una sesión activa
   */
  async isUserInSession(userId: string): Promise<boolean> {
    const sessionId = await getString(`user_session:${userId}`);
    return sessionId !== null;
  }

  /**
   * Obtiene el compañero de un usuario en su sesión actual
   */
  async getPartner(userId: string): Promise<string | null> {
    const session = await this.getSessionByUser(userId);
    
    if (!session) {
      return null;
    }

    // Retornar el ID del otro usuario
    return session.user1Id === userId ? session.user2Id : session.user1Id;
  }

  /**
   * Termina todas las sesiones de un usuario (útil para moderación)
   */
  async terminateUserSessions(userId: string): Promise<void> {
    const session = await this.getSessionByUser(userId);
    
    if (session) {
      await this.endSession(session.sessionId);
      console.log(`✅ Sesiones de usuario ${userId} terminadas`);
    }
  }

  /**
   * Limpia sesiones expiradas (mantenimiento)
   * Redis maneja esto automáticamente con TTL, pero esta función
   * puede usarse para limpieza manual si es necesario
   */
  async cleanupExpiredSessions(): Promise<number> {
    console.log('🧹 Limpieza de sesiones expiradas (manejado por Redis TTL)');
    return 0;
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  async getSessionStats(): Promise<{
    activeSessions: number;
    activeUsers: number;
    botSessions: number;
    totalSessionsToday: number;
  }> {
    const [activeSessions, activeUsers, botSessions, totalSessionsToday] = await Promise.all([
      getString('metrics:realtime:activeSessions'),
      getString('metrics:realtime:activeUsers'),
      getString('metrics:realtime:botSessions'),
      getString('metrics:realtime:totalSessionsToday'),
    ]);

    return {
      activeSessions: parseInt(activeSessions || '0', 10),
      activeUsers: parseInt(activeUsers || '0', 10),
      botSessions: parseInt(botSessions || '0', 10),
      totalSessionsToday: parseInt(totalSessionsToday || '0', 10),
    };
  }
}

// Exportar instancia singleton
export const sessionManager = new SessionManager();
