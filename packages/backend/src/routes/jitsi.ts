import { Router, Request, Response } from 'express';
import { JitsiIntegrationService } from '../services/JitsiIntegrationService';

const router = Router();
const jitsiService = new JitsiIntegrationService();

// GET /api/jitsi/info - Obtener información de la instancia Jitsi
router.get('/info', (_req: Request, res: Response) => {
  try {
    const info = jitsiService.getInstanceInfo();
    return res.status(200).json({
      success: true,
      info,
    });
  } catch (error) {
    console.error('Error getting Jitsi info:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información de Jitsi',
    });
  }
});

// POST /api/jitsi/create-room - Crear una sala Jitsi
router.post('/create-room', (req: Request, res: Response) => {
  try {
    const { sessionId, displayName, email } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId es requerido',
      });
    }

    const config = jitsiService.createRoomConfig(sessionId, {
      displayName,
      email,
    });

    return res.status(201).json({
      success: true,
      room: {
        name: config.roomName,
        url: config.url,
        domain: config.domain,
      },
      config: config.config,
    });
  } catch (error) {
    console.error('Error creating Jitsi room:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear sala Jitsi',
    });
  }
});

// GET /api/jitsi/room/:roomName/status - Verificar estado de una sala
router.get('/room/:roomName/status', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const isActive = await jitsiService.isRoomActive(roomName);

    return res.status(200).json({
      success: true,
      roomName,
      isActive,
    });
  } catch (error) {
    console.error('Error checking room status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar estado de sala',
    });
  }
});

// GET /api/jitsi/room/:roomName/stats - Obtener estadísticas de una sala
router.get('/room/:roomName/stats', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const stats = await jitsiService.getRoomStats(roomName);

    return res.status(200).json({
      success: true,
      roomName,
      stats,
    });
  } catch (error) {
    console.error('Error getting room stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de sala',
    });
  }
});

// DELETE /api/jitsi/room/:roomName - Cerrar una sala
router.delete('/room/:roomName', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const closed = await jitsiService.closeRoom(roomName);

    return res.status(200).json({
      success: true,
      roomName,
      closed,
    });
  } catch (error) {
    console.error('Error closing room:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar sala',
    });
  }
});

export default router;
