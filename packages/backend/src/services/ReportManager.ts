import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/redis';
import { getPool } from '../config/database';
import { sessionManager } from './SessionManager';

type ReportReason = 'inappropriate-behavior' | 'offensive-content' | 'spam' | 'harassment' | 'other';
type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
type ModerationAction = 'no-action' | 'warning' | 'temporary-ban' | 'permanent-ban';

interface UserReport {
  reportId: string;
  reportedUserId: string;
  reporterUserId?: string;
  reason: ReportReason;
  description: string;
  sessionId?: string;
  timestamp: number;
  status: ReportStatus;
  assignedAdmin?: string;
  resolution?: {
    action: ModerationAction;
    adminId: string;
    notes: string;
    resolvedAt: number;
  };
}

interface UserBan {
  userId: string;
  reason: string;
  bannedBy: string;
  bannedAt: number;
  expiresAt?: number;
  type: 'temporary' | 'permanent';
}

class ReportManager {
  /**
   * Crea nuevo reporte de usuario
   */
  async createReport(
    report: Omit<UserReport, 'reportId' | 'timestamp' | 'status'>
  ): Promise<UserReport> {
    try {
      const pool = getPool();
      const reportId = uuidv4();
      const timestamp = Date.now();

      const newReport: UserReport = {
        reportId,
        timestamp,
        status: 'pending',
        ...report,
      };

      // Guardar en PostgreSQL
      await pool.query(
        `INSERT INTO user_reports 
        (id, reported_user_id, reporter_user_id, reason, description, session_id, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8 / 1000.0))`,
        [
          reportId,
          report.reportedUserId,
          report.reporterUserId || null,
          report.reason,
          report.description,
          report.sessionId || null,
          'pending',
          timestamp,
        ]
      );

      console.log(`📝 Reporte creado: ${reportId} - Usuario: ${report.reportedUserId}`);

      // Notificar a administradores (incrementar contador de reportes pendientes)
      const redisClient = getRedisClient();
      await redisClient.incr('admin:pending_reports_count');

      return newReport;
    } catch (error) {
      console.error('Error en createReport:', error);
      throw error;
    }
  }

  /**
   * Obtiene reportes pendientes
   */
  async getPendingReports(): Promise<UserReport[]> {
    try {
      const pool = getPool();
      
      const result = await pool.query(
        `SELECT 
          id as report_id,
          reported_user_id,
          reporter_user_id,
          reason,
          description,
          session_id,
          status,
          assigned_admin_id,
          EXTRACT(EPOCH FROM created_at) * 1000 as timestamp
        FROM user_reports
        WHERE status IN ('pending', 'reviewing')
        ORDER BY created_at DESC`
      );

      return result.rows.map((row: any) => ({
        reportId: row.report_id,
        reportedUserId: row.reported_user_id,
        reporterUserId: row.reporter_user_id,
        reason: row.reason as ReportReason,
        description: row.description,
        sessionId: row.session_id,
        timestamp: parseInt(row.timestamp),
        status: row.status as ReportStatus,
        assignedAdmin: row.assigned_admin_id,
      }));
    } catch (error) {
      console.error('Error en getPendingReports:', error);
      return [];
    }
  }

  /**
   * Obtiene reporte por ID
   */
  async getReport(reportId: string): Promise<UserReport | null> {
    try {
      const pool = getPool();
      
      const result = await pool.query(
        `SELECT 
          ur.id as report_id,
          ur.reported_user_id,
          ur.reporter_user_id,
          ur.reason,
          ur.description,
          ur.session_id,
          ur.status,
          ur.assigned_admin_id,
          EXTRACT(EPOCH FROM ur.created_at) * 1000 as timestamp,
          rr.action,
          rr.admin_id as resolution_admin_id,
          rr.notes,
          EXTRACT(EPOCH FROM rr.resolved_at) * 1000 as resolved_at
        FROM user_reports ur
        LEFT JOIN report_resolutions rr ON ur.id = rr.report_id
        WHERE ur.id = $1`,
        [reportId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const report: UserReport = {
        reportId: row.report_id,
        reportedUserId: row.reported_user_id,
        reporterUserId: row.reporter_user_id,
        reason: row.reason as ReportReason,
        description: row.description,
        sessionId: row.session_id,
        timestamp: parseInt(row.timestamp),
        status: row.status as ReportStatus,
        assignedAdmin: row.assigned_admin_id,
      };

      if (row.action) {
        report.resolution = {
          action: row.action as ModerationAction,
          adminId: row.resolution_admin_id,
          notes: row.notes,
          resolvedAt: parseInt(row.resolved_at),
        };
      }

      return report;
    } catch (error) {
      console.error('Error en getReport:', error);
      return null;
    }
  }

  /**
   * Asigna reporte a administrador
   */
  async assignReport(reportId: string, adminId: string): Promise<void> {
    try {
      const pool = getPool();
      
      await pool.query(
        `UPDATE user_reports 
        SET assigned_admin_id = $1, status = 'reviewing', updated_at = NOW()
        WHERE id = $2`,
        [adminId, reportId]
      );

      console.log(`✅ Reporte ${reportId} asignado a admin ${adminId}`);
    } catch (error) {
      console.error('Error en assignReport:', error);
      throw error;
    }
  }

  /**
   * Resuelve reporte con acción de moderación
   */
  async resolveReport(
    reportId: string,
    action: ModerationAction,
    adminId: string,
    notes: string
  ): Promise<void> {
    try {
      const pool = getPool();
      
      // Actualizar estado del reporte
      await pool.query(
        `UPDATE user_reports 
        SET status = 'resolved', updated_at = NOW()
        WHERE id = $1`,
        [reportId]
      );

      // Crear resolución
      await pool.query(
        `INSERT INTO report_resolutions 
        (report_id, action, admin_id, notes, resolved_at)
        VALUES ($1, $2, $3, $4, NOW())`,
        [reportId, action, adminId, notes]
      );

      console.log(`✅ Reporte ${reportId} resuelto con acción: ${action}`);

      // Decrementar contador de reportes pendientes
      const redisClient = getRedisClient();
      await redisClient.decr('admin:pending_reports_count');
    } catch (error) {
      console.error('Error en resolveReport:', error);
      throw error;
    }
  }

  /**
   * Bloquea usuario
   */
  async banUser(
    userId: string,
    reason: string,
    adminId: string,
    duration?: number
  ): Promise<void> {
    try {
      const pool = getPool();
      const redisClient = getRedisClient();
      const bannedAt = Date.now();
      const type = duration ? 'temporary' : 'permanent';
      const expiresAt = duration ? bannedAt + duration : null;

      // Guardar en PostgreSQL
      await pool.query(
        `INSERT INTO user_bans 
        (user_id, reason, banned_by, banned_at, expires_at, type)
        VALUES ($1, $2, $3, to_timestamp($4 / 1000.0), $5, $6)`,
        [
          userId,
          reason,
          adminId,
          bannedAt,
          expiresAt ? new Date(expiresAt) : null,
          type,
        ]
      );

      // Guardar en Redis para verificación rápida
      if (type === 'permanent') {
        await redisClient.set(`user_ban:${userId}`, 'permanent');
      } else {
        const ttl = Math.floor(duration! / 1000);
        await redisClient.setEx(`user_ban:${userId}`, ttl, expiresAt!.toString());
      }

      console.log(`🚫 Usuario bloqueado: ${userId} - Tipo: ${type}`);

      // Terminar sesiones activas
      await this.terminateUserSessions(userId);
    } catch (error) {
      console.error('Error en banUser:', error);
      throw error;
    }
  }

  /**
   * Verifica si usuario está bloqueado
   */
  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      
      // Verificar en Redis primero (más rápido)
      const banData = await redisClient.get(`user_ban:${userId}`);
      
      if (banData === 'permanent') {
        return true;
      }
      
      if (banData) {
        const expiresAt = parseInt(banData);
        if (Date.now() < expiresAt) {
          return true;
        } else {
          // Ban expirado, limpiar
          await redisClient.del(`user_ban:${userId}`);
          return false;
        }
      }

      // Si no está en Redis, verificar en PostgreSQL
      const pool = getPool();
      const result = await pool.query(
        `SELECT type, expires_at 
        FROM user_bans 
        WHERE user_id = $1 
        AND (type = 'permanent' OR expires_at > NOW())
        ORDER BY banned_at DESC
        LIMIT 1`,
        [userId]
      );

      if (result.rows.length > 0) {
        const ban = result.rows[0];
        
        // Actualizar cache en Redis
        if (ban.type === 'permanent') {
          await redisClient.set(`user_ban:${userId}`, 'permanent');
        } else {
          const expiresAt = new Date(ban.expires_at).getTime();
          const ttl = Math.floor((expiresAt - Date.now()) / 1000);
          if (ttl > 0) {
            await redisClient.setEx(`user_ban:${userId}`, ttl, expiresAt.toString());
          }
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en isUserBanned:', error);
      return false;
    }
  }

  /**
   * Obtiene historial de reportes de un usuario
   */
  async getUserReportHistory(userId: string): Promise<UserReport[]> {
    try {
      const pool = getPool();
      
      const result = await pool.query(
        `SELECT 
          ur.id as report_id,
          ur.reported_user_id,
          ur.reporter_user_id,
          ur.reason,
          ur.description,
          ur.session_id,
          ur.status,
          ur.assigned_admin_id,
          EXTRACT(EPOCH FROM ur.created_at) * 1000 as timestamp,
          rr.action,
          rr.admin_id as resolution_admin_id,
          rr.notes,
          EXTRACT(EPOCH FROM rr.resolved_at) * 1000 as resolved_at
        FROM user_reports ur
        LEFT JOIN report_resolutions rr ON ur.id = rr.report_id
        WHERE ur.reported_user_id = $1
        ORDER BY ur.created_at DESC`,
        [userId]
      );

      return result.rows.map((row: any) => {
        const report: UserReport = {
          reportId: row.report_id,
          reportedUserId: row.reported_user_id,
          reporterUserId: row.reporter_user_id,
          reason: row.reason as ReportReason,
          description: row.description,
          sessionId: row.session_id,
          timestamp: parseInt(row.timestamp),
          status: row.status as ReportStatus,
          assignedAdmin: row.assigned_admin_id,
        };

        if (row.action) {
          report.resolution = {
            action: row.action as ModerationAction,
            adminId: row.resolution_admin_id,
            notes: row.notes,
            resolvedAt: parseInt(row.resolved_at),
          };
        }

        return report;
      });
    } catch (error) {
      console.error('Error en getUserReportHistory:', error);
      return [];
    }
  }

  /**
   * Termina sesiones activas de usuario bloqueado
   */
  async terminateUserSessions(userId: string): Promise<void> {
    try {
      // Obtener sesión del usuario
      const session = await sessionManager.getSessionByUser(userId);
      
      if (session) {
        // Terminar sesión
        await sessionManager.endSession(session.sessionId);
        console.log(`✅ Sesión terminada para usuario bloqueado: ${userId}`);
      }
    } catch (error) {
      console.error('Error en terminateUserSessions:', error);
    }
  }
}

// Exportar instancia singleton
export const reportManager = new ReportManager();
export type { UserReport, UserBan, ReportReason, ReportStatus, ModerationAction };
