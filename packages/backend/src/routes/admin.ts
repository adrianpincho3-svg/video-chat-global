import express, { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { reportManager } from '../services/ReportManager';
import { metricsService } from '../services/MetricsService';

const router = express.Router();

// Middleware de autenticación
async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.headers['x-admin-session'] as string;

    if (!sessionId) {
      res.status(401).json({ error: 'No session provided' });
      return;
    }

    const isValid = await authService.validateSession(sessionId);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    // Actualizar última actividad
    await authService.updateActivity(sessionId);

    // Guardar sessionId en request para uso posterior
    (req as any).adminSessionId = sessionId;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

/**
 * POST /api/admin/login
 * Autentica administrador y crea sesión
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const session = await authService.authenticate({ username, password });

    if (!session) {
      // Registrar intento no autorizado
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      await authService.logUnauthorizedAccess(ipAddress, username);
      
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({
      sessionId: session.sessionId,
      username: session.username,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Error en /admin/login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/admin/logout
 * Cierra sesión de administrador
 */
router.post('/logout', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = (_req as any).adminSessionId;
    await authService.logout(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error en /admin/logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============================================
// ENDPOINTS DE MÉTRICAS
// ============================================

/**
 * GET /api/admin/metrics/realtime
 * Obtiene métricas en tiempo real
 */
router.get('/metrics/realtime', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await metricsService.getRealtimeMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error en /admin/metrics/realtime:', error);
    res.status(500).json({ error: 'Failed to get realtime metrics' });
  }
});

/**
 * GET /api/admin/metrics/historical
 * Obtiene métricas históricas
 */
router.get('/metrics/historical', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate required' });
      return;
    }

    const metrics = await metricsService.getHistoricalMetrics(
      startDate as string,
      endDate as string
    );
    
    res.json(metrics);
  } catch (error) {
    console.error('Error en /admin/metrics/historical:', error);
    res.status(500).json({ error: 'Failed to get historical metrics' });
  }
});

/**
 * GET /api/admin/metrics/matching
 * Obtiene estadísticas de emparejamiento
 */
router.get('/metrics/matching', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await metricsService.getMatchingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error en /admin/metrics/matching:', error);
    res.status(500).json({ error: 'Failed to get matching stats' });
  }
});

// ============================================
// ENDPOINTS DE REPORTES Y MODERACIÓN
// ============================================

/**
 * GET /api/admin/reports
 * Obtiene reportes pendientes
 */
router.get('/reports', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await reportManager.getPendingReports();
    res.json(reports);
  } catch (error) {
    console.error('Error en /admin/reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * GET /api/admin/reports/:reportId
 * Obtiene detalle de un reporte
 */
router.get('/reports/:reportId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const report = await reportManager.getReport(reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error('Error en /admin/reports/:reportId:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

/**
 * POST /api/admin/reports/:reportId/assign
 * Asigna reporte a administrador
 */
router.post('/reports/:reportId/assign', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const sessionId = (req as any).adminSessionId;
    
    // Obtener información del admin desde la sesión
    const session = await authService.getSession(sessionId);
    
    if (!session) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    await reportManager.assignReport(reportId, session.adminId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error en /admin/reports/:reportId/assign:', error);
    res.status(500).json({ error: 'Failed to assign report' });
  }
});

/**
 * POST /api/admin/reports/:reportId/resolve
 * Resuelve reporte con acción de moderación
 */
router.post('/reports/:reportId/resolve', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body;
    const sessionId = (req as any).adminSessionId;

    if (!action || !notes) {
      res.status(400).json({ error: 'action and notes required' });
      return;
    }

    // Obtener información del admin desde la sesión
    const session = await authService.getSession(sessionId);
    
    if (!session) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    await reportManager.resolveReport(reportId, action, session.adminId, notes);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error en /admin/reports/:reportId/resolve:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

/**
 * POST /api/admin/users/:userId/ban
 * Bloquea usuario
 */
router.post('/users/:userId/ban', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;
    const sessionId = (req as any).adminSessionId;

    if (!reason) {
      res.status(400).json({ error: 'reason required' });
      return;
    }

    // Obtener información del admin desde la sesión
    const session = await authService.getSession(sessionId);
    
    if (!session) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    await reportManager.banUser(userId, reason, session.adminId, duration);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error en /admin/users/:userId/ban:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

/**
 * GET /api/admin/users/:userId/history
 * Obtiene historial de reportes de un usuario
 */
router.get('/users/:userId/history', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const history = await reportManager.getUserReportHistory(userId);
    
    res.json(history);
  } catch (error) {
    console.error('Error en /admin/users/:userId/history:', error);
    res.status(500).json({ error: 'Failed to get user history' });
  }
});

// ============================================
// ENDPOINTS DE LOGS
// ============================================

/**
 * GET /api/admin/logs
 * Obtiene logs del sistema
 */
router.get('/logs', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await metricsService.getSystemLogs(limit, offset);
    
    res.json(logs);
  } catch (error) {
    console.error('Error en /admin/logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

export default router;
