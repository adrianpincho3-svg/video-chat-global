import { getRedisClient } from '../config/redis';
import { getPool } from '../config/database';
import { Region, UserCategory } from '../types';

interface RealtimeMetrics {
  activeUsers: number;
  activeSessions: number;
  waitingUsers: number;
  averageSessionDuration: number;
  totalSessionsToday: number;
  usersByRegion: Record<Region, number>;
  usersByCategory: Record<UserCategory, number>;
  botSessionsPercentage: number;
}

interface HistoricalMetrics {
  date: string;
  totalSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  regionDistribution: Record<Region, number>;
}

interface MatchingStats {
  averageWaitTime: number;
  matchSuccessRate: number;
  botOfferRate: number;
}

interface SystemLog {
  id: string;
  timestamp: number;
  eventType: string;
  message: string;
  metadata?: any;
}

class MetricsService {
  /**
   * Obtiene métricas en tiempo real desde Redis
   */
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    try {
      const redisClient = getRedisClient();
      
      // Obtener contadores básicos
      const [
        activeUsers,
        activeSessions,
        waitingUsers,
        totalSessionsToday,
        totalSessionDurationToday,
        botSessionsToday,
      ] = await Promise.all([
        redisClient.get('metrics:active_users').then(v => parseInt(v || '0')),
        redisClient.get('metrics:active_sessions').then(v => parseInt(v || '0')),
        redisClient.get('metrics:waiting_users').then(v => parseInt(v || '0')),
        redisClient.get('metrics:total_sessions_today').then(v => parseInt(v || '0')),
        redisClient.get('metrics:total_duration_today').then(v => parseInt(v || '0')),
        redisClient.get('metrics:bot_sessions_today').then(v => parseInt(v || '0')),
      ]);

      // Calcular duración promedio
      const averageSessionDuration = totalSessionsToday > 0 
        ? Math.floor(totalSessionDurationToday / totalSessionsToday)
        : 0;

      // Calcular porcentaje de sesiones con bot
      const botSessionsPercentage = totalSessionsToday > 0
        ? Math.round((botSessionsToday / totalSessionsToday) * 100)
        : 0;

      // Obtener distribución por región
      const regionKeys = await redisClient.keys('metrics:region:*');
      const usersByRegion: Record<Region, number> = {
        'north-america': 0,
        'south-america': 0,
        'europe': 0,
        'asia': 0,
        'oceania': 0,
        'africa': 0,
        'any': 0,
      };

      for (const key of regionKeys) {
        const region = key.replace('metrics:region:', '') as Region;
        const count = await redisClient.get(key);
        if (count && region in usersByRegion) {
          usersByRegion[region] = parseInt(count);
        }
      }

      // Obtener distribución por categoría
      const categoryKeys = await redisClient.keys('metrics:category:*');
      const usersByCategory: Record<UserCategory, number> = {
        'male': 0,
        'female': 0,
        'couple': 0,
      };

      for (const key of categoryKeys) {
        const category = key.replace('metrics:category:', '') as UserCategory;
        const count = await redisClient.get(key);
        if (count && category in usersByCategory) {
          usersByCategory[category] = parseInt(count);
        }
      }

      return {
        activeUsers,
        activeSessions,
        waitingUsers,
        averageSessionDuration,
        totalSessionsToday,
        usersByRegion,
        usersByCategory,
        botSessionsPercentage,
      };
    } catch (error) {
      console.error('Error en getRealtimeMetrics:', error);
      // Retornar métricas vacías en caso de error
      return {
        activeUsers: 0,
        activeSessions: 0,
        waitingUsers: 0,
        averageSessionDuration: 0,
        totalSessionsToday: 0,
        usersByRegion: {
          'north-america': 0,
          'south-america': 0,
          'europe': 0,
          'asia': 0,
          'oceania': 0,
          'africa': 0,
          'any': 0,
        },
        usersByCategory: {
          'male': 0,
          'female': 0,
          'couple': 0,
        },
        botSessionsPercentage: 0,
      };
    }
  }

  /**
   * Obtiene métricas históricas desde PostgreSQL
   */
  async getHistoricalMetrics(startDate: string, endDate: string): Promise<HistoricalMetrics[]> {
    try {
      const pool = getPool();
      
      const result = await pool.query(
        `SELECT 
          date,
          total_sessions,
          unique_users as total_users,
          average_session_duration,
          peak_concurrent_users,
          region_distribution
        FROM historical_metrics
        WHERE date >= $1 AND date <= $2
        ORDER BY date ASC`,
        [startDate, endDate]
      );

      return result.rows.map((row: any) => ({
        date: row.date,
        totalSessions: row.total_sessions,
        totalUsers: row.total_users,
        averageSessionDuration: row.average_session_duration,
        peakConcurrentUsers: row.peak_concurrent_users,
        regionDistribution: row.region_distribution || {},
      }));
    } catch (error) {
      console.error('Error en getHistoricalMetrics:', error);
      return [];
    }
  }

  /**
   * Registra evento de sesión
   */
  async recordSessionEvent(
    sessionId: string,
    event: 'start' | 'end',
    metadata: any
  ): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const today = new Date().toISOString().split('T')[0];

      if (event === 'start') {
        // Incrementar contadores
        await redisClient.incr('metrics:active_sessions');
        await redisClient.incr('metrics:total_sessions_today');
        await redisClient.incr(`metrics:total_sessions:${today}`);

        // Incrementar contador de usuarios activos (2 por sesión)
        await redisClient.incrBy('metrics:active_users', 2);

        // Incrementar contadores por región
        if (metadata.region) {
          await redisClient.incr(`metrics:region:${metadata.region}`);
        }

        // Incrementar contadores por categoría
        if (metadata.user1Category) {
          await redisClient.incr(`metrics:category:${metadata.user1Category}`);
        }
        if (metadata.user2Category) {
          await redisClient.incr(`metrics:category:${metadata.user2Category}`);
        }

        // Incrementar contador de sesiones con bot
        if (metadata.isBot) {
          await redisClient.incr('metrics:bot_sessions_today');
          await redisClient.incr(`metrics:bot_sessions:${today}`);
        }

        // Guardar timestamp de inicio
        await redisClient.set(`session:start:${sessionId}`, Date.now().toString());

        console.log(`📊 Sesión iniciada registrada: ${sessionId}`);
      } else if (event === 'end') {
        // Decrementar contadores
        await redisClient.decr('metrics:active_sessions');
        await redisClient.decrBy('metrics:active_users', 2);

        // Decrementar contadores por región
        if (metadata.region) {
          await redisClient.decr(`metrics:region:${metadata.region}`);
        }

        // Decrementar contadores por categoría
        if (metadata.user1Category) {
          await redisClient.decr(`metrics:category:${metadata.user1Category}`);
        }
        if (metadata.user2Category) {
          await redisClient.decr(`metrics:category:${metadata.user2Category}`);
        }

        // Calcular duración de sesión
        const startTime = await redisClient.get(`session:start:${sessionId}`);
        if (startTime) {
          const duration = Date.now() - parseInt(startTime);
          await redisClient.incrBy('metrics:total_duration_today', duration);
          await redisClient.incrBy(`metrics:total_duration:${today}`, duration);
          
          // Limpiar timestamp de inicio
          await redisClient.del(`session:start:${sessionId}`);
        }

        console.log(`📊 Sesión terminada registrada: ${sessionId}`);
      }

      // Establecer TTL de 48 horas para métricas diarias
      await redisClient.expire(`metrics:total_sessions:${today}`, 48 * 60 * 60);
      await redisClient.expire(`metrics:total_duration:${today}`, 48 * 60 * 60);
      await redisClient.expire(`metrics:bot_sessions:${today}`, 48 * 60 * 60);
    } catch (error) {
      console.error('Error en recordSessionEvent:', error);
    }
  }

  /**
   * Obtiene estadísticas de emparejamiento
   */
  async getMatchingStats(): Promise<MatchingStats> {
    try {
      const redisClient = getRedisClient();
      
      const [
        totalMatches,
        successfulMatches,
        totalWaitTime,
        botOffers,
      ] = await Promise.all([
        redisClient.get('metrics:total_matches').then(v => parseInt(v || '0')),
        redisClient.get('metrics:successful_matches').then(v => parseInt(v || '0')),
        redisClient.get('metrics:total_wait_time').then(v => parseInt(v || '0')),
        redisClient.get('metrics:bot_offers').then(v => parseInt(v || '0')),
      ]);

      const averageWaitTime = successfulMatches > 0
        ? Math.floor(totalWaitTime / successfulMatches)
        : 0;

      const matchSuccessRate = totalMatches > 0
        ? Math.round((successfulMatches / totalMatches) * 100)
        : 0;

      const botOfferRate = totalMatches > 0
        ? Math.round((botOffers / totalMatches) * 100)
        : 0;

      return {
        averageWaitTime,
        matchSuccessRate,
        botOfferRate,
      };
    } catch (error) {
      console.error('Error en getMatchingStats:', error);
      return {
        averageWaitTime: 0,
        matchSuccessRate: 0,
        botOfferRate: 0,
      };
    }
  }

  /**
   * Obtiene logs del sistema (anonimizados)
   */
  async getSystemLogs(limit: number = 100, offset: number = 0): Promise<SystemLog[]> {
    try {
      const redisClient = getRedisClient();
      
      // Obtener logs desde sorted set (ordenados por timestamp)
      const logs = await redisClient.zRange(
        'system:logs',
        offset,
        offset + limit - 1,
        { REV: true }
      );

      return logs.map((log: string) => {
        try {
          return JSON.parse(log);
        } catch {
          return {
            id: '',
            timestamp: 0,
            eventType: 'unknown',
            message: log,
          };
        }
      });
    } catch (error) {
      console.error('Error en getSystemLogs:', error);
      return [];
    }
  }

  /**
   * Registra log del sistema (sin PII)
   */
  async logSystemEvent(
    eventType: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const timestamp = Date.now();
      
      const log: SystemLog = {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        eventType,
        message,
        metadata: this.sanitizeMetadata(metadata),
      };

      // Agregar a sorted set con timestamp como score
      await redisClient.zAdd('system:logs', {
        score: timestamp,
        value: JSON.stringify(log),
      });

      // Mantener solo los últimos 10000 logs
      const count = await redisClient.zCard('system:logs');
      if (count > 10000) {
        await redisClient.zRemRangeByRank('system:logs', 0, count - 10000 - 1);
      }
    } catch (error) {
      console.error('Error en logSystemEvent:', error);
    }
  }

  /**
   * Sanitiza metadata para remover PII
   */
  private sanitizeMetadata(metadata: any): any {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };
    
    // Remover campos que podrían contener PII
    const piiFields = ['ip', 'ipAddress', 'email', 'username', 'name', 'address'];
    
    for (const field of piiFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }

    // Anonimizar IDs de usuario (mantener solo formato)
    if (sanitized.userId) {
      sanitized.userId = '[REDACTED]';
    }

    return sanitized;
  }

  /**
   * Incrementa contador de usuarios en espera
   */
  async incrementWaitingUsers(): Promise<void> {
    try {
      const redisClient = getRedisClient();
      await redisClient.incr('metrics:waiting_users');
    } catch (error) {
      console.error('Error en incrementWaitingUsers:', error);
    }
  }

  /**
   * Decrementa contador de usuarios en espera
   */
  async decrementWaitingUsers(): Promise<void> {
    try {
      const redisClient = getRedisClient();
      await redisClient.decr('metrics:waiting_users');
    } catch (error) {
      console.error('Error en decrementWaitingUsers:', error);
    }
  }

  /**
   * Registra intento de match
   */
  async recordMatchAttempt(success: boolean, waitTime: number): Promise<void> {
    try {
      const redisClient = getRedisClient();
      
      await redisClient.incr('metrics:total_matches');
      
      if (success) {
        await redisClient.incr('metrics:successful_matches');
        await redisClient.incrBy('metrics:total_wait_time', waitTime);
      }
    } catch (error) {
      console.error('Error en recordMatchAttempt:', error);
    }
  }

  /**
   * Registra oferta de bot
   */
  async recordBotOffer(): Promise<void> {
    try {
      const redisClient = getRedisClient();
      await redisClient.incr('metrics:bot_offers');
    } catch (error) {
      console.error('Error en recordBotOffer:', error);
    }
  }

  /**
   * Resetea métricas diarias (llamar a medianoche)
   */
  async resetDailyMetrics(): Promise<void> {
    try {
      const redisClient = getRedisClient();
      
      await Promise.all([
        redisClient.set('metrics:total_sessions_today', '0'),
        redisClient.set('metrics:total_duration_today', '0'),
        redisClient.set('metrics:bot_sessions_today', '0'),
      ]);

      console.log('✅ Métricas diarias reseteadas');
    } catch (error) {
      console.error('Error en resetDailyMetrics:', error);
    }
  }
}

// Exportar instancia singleton
export const metricsService = new MetricsService();
export type { RealtimeMetrics, HistoricalMetrics, MatchingStats, SystemLog };
