import { randomBytes } from 'crypto';
import { ShareableLink } from '../types';
import { LIMITS } from '../constants';
import {
  setHash,
  getHashParsed,
  deleteKey,
} from '../utils/redis-helpers';

/**
 * Generador de enlaces compartibles
 * Permite a usuarios crear enlaces para invitar a personas específicas
 */
export class LinkGenerator {
  /**
   * Genera un nuevo enlace compartible
   */
  async createLink(
    userId: string,
    reusable: boolean = false,
    ttlSeconds: number = LIMITS.LINK_TTL
  ): Promise<ShareableLink> {
    const linkId = this.generateLinkId();
    const now = Date.now();
    const expiresAt = now + (ttlSeconds * 1000);

    const link: ShareableLink = {
      linkId,
      creatorId: userId,
      createdAt: now,
      expiresAt,
      reusable,
      used: false,
    };

    // Guardar enlace en Redis con TTL
    await setHash(
      `link:${linkId}`,
      link,
      ttlSeconds
    );

    console.log(`✅ Enlace creado: ${linkId} (creador: ${userId}, reutilizable: ${reusable})`);

    return link;
  }

  /**
   * Valida y obtiene un enlace
   */
  async getLink(linkId: string): Promise<ShareableLink | null> {
    const link = await getHashParsed<ShareableLink>(`link:${linkId}`);

    if (!link) {
      return null;
    }

    // Verificar si el enlace ha expirado
    if (Date.now() > link.expiresAt) {
      await this.invalidateLink(linkId);
      return null;
    }

    // Verificar si el enlace ya fue usado y no es reutilizable
    if (link.used && !link.reusable) {
      return null;
    }

    return link;
  }

  /**
   * Marca un enlace como usado (si no es reutilizable)
   */
  async markLinkUsed(linkId: string): Promise<void> {
    const link = await this.getLink(linkId);

    if (!link) {
      console.log(`⚠️ Enlace ${linkId} no encontrado`);
      return;
    }

    // Si es reutilizable, no marcar como usado
    if (link.reusable) {
      console.log(`ℹ️ Enlace ${linkId} es reutilizable, no se marca como usado`);
      return;
    }

    // Marcar como usado
    link.used = true;

    // Actualizar en Redis (mantener el TTL original)
    const remainingTTL = Math.floor((link.expiresAt - Date.now()) / 1000);
    if (remainingTTL > 0) {
      await setHash(
        `link:${linkId}`,
        link,
        remainingTTL
      );
    }

    console.log(`✅ Enlace ${linkId} marcado como usado`);
  }

  /**
   * Invalida un enlace (lo elimina)
   */
  async invalidateLink(linkId: string): Promise<void> {
    await deleteKey(`link:${linkId}`);
    console.log(`✅ Enlace ${linkId} invalidado`);
  }

  /**
   * Verifica si un enlace es válido y está disponible
   */
  async isLinkValid(linkId: string): Promise<boolean> {
    const link = await this.getLink(linkId);
    return link !== null;
  }

  /**
   * Obtiene todos los enlaces de un usuario
   * Nota: Esta es una operación costosa, usar con precaución
   */
  async getUserLinks(userId: string): Promise<ShareableLink[]> {
    // En una implementación real, mantendríamos un índice de enlaces por usuario
    // Por ahora, retornamos array vacío
    console.warn('⚠️ getUserLinks no está implementado completamente');
    return [];
  }

  /**
   * Genera un ID único para el enlace
   * Usa caracteres URL-safe para facilitar compartir
   */
  private generateLinkId(): string {
    // Generar 12 bytes aleatorios y convertir a base64 URL-safe
    const bytes = randomBytes(12);
    return bytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Construye la URL completa del enlace
   */
  buildLinkURL(linkId: string, baseURL?: string): string {
    const base = baseURL || process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${base}/join/${linkId}`;
  }

  /**
   * Obtiene estadísticas de enlaces
   */
  async getLinkStats(): Promise<{
    totalActive: number;
    totalUsed: number;
    totalReusable: number;
  }> {
    // En una implementación completa, mantendríamos contadores
    // Por ahora, retornamos valores por defecto
    return {
      totalActive: 0,
      totalUsed: 0,
      totalReusable: 0,
    };
  }

  /**
   * Limpia enlaces expirados (mantenimiento)
   * Redis maneja esto automáticamente con TTL
   */
  async cleanupExpiredLinks(): Promise<number> {
    console.log('🧹 Limpieza de enlaces expirados (manejado por Redis TTL)');
    return 0;
  }

  /**
   * Extiende el TTL de un enlace
   */
  async extendLinkTTL(linkId: string, additionalSeconds: number): Promise<boolean> {
    const link = await this.getLink(linkId);

    if (!link) {
      return false;
    }

    // Actualizar tiempo de expiración
    link.expiresAt += additionalSeconds * 1000;

    // Calcular nuevo TTL
    const newTTL = Math.floor((link.expiresAt - Date.now()) / 1000);

    if (newTTL > 0) {
      await setHash(
        `link:${linkId}`,
        link,
        newTTL
      );
      console.log(`✅ TTL de enlace ${linkId} extendido por ${additionalSeconds}s`);
      return true;
    }

    return false;
  }

  /**
   * Verifica si el creador del enlace está disponible
   */
  async isCreatorAvailable(linkId: string): Promise<boolean> {
    const link = await this.getLink(linkId);

    if (!link) {
      return false;
    }

    // Importar SessionManager para verificar si el creador está en sesión
    const { sessionManager } = await import('./SessionManager');
    const isInSession = await sessionManager.isUserInSession(link.creatorId);

    // El creador está disponible si NO está en una sesión activa
    return !isInSession;
  }
}

// Exportar instancia singleton
export const linkGenerator = new LinkGenerator();
