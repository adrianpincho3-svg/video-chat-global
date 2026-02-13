import { Router, Request, Response } from 'express';
import { LinkGenerator } from '../services/LinkGenerator';

const router = Router();
const linkGenerator = new LinkGenerator();

// POST /api/links/create - Crear enlace compartible
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { reusable = false } = req.body;
    
    // En producción, obtener userId de la sesión autenticada
    // Por ahora, generar un ID temporal
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const link = await linkGenerator.createLink(userId, reusable);
    
    return res.status(201).json({
      success: true,
      link,
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el enlace',
    });
  }
});

// GET /api/links/:linkId - Obtener información del enlace
router.get('/:linkId', async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    
    const link = await linkGenerator.getLink(linkId);
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Enlace no encontrado o expirado',
      });
    }
    
    return res.status(200).json({
      success: true,
      link,
    });
  } catch (error) {
    console.error('Error getting link:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el enlace',
    });
  }
});

export default router;
