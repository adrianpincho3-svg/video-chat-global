import { UserCategory, MatchingFilter, Region, WaitingUser } from '../types';
import { LIMITS, TIMEOUTS } from '../constants';
import {
  setHash,
  getHashParsed,
  deleteKey,
  pushToList,
  removeFromList,
  getList,
} from '../utils/redis-helpers';
import { geoIPService } from './GeoIPService';

/**
 * Gestor de emparejamiento de usuarios
 * Maneja la cola de espera y el algoritmo de matching con filtros
 */
export class MatchingManager {
  /**
   * Agrega un usuario a la cola de espera
   */
  async addToQueue(
    userId: string,
    category: UserCategory,
    filter: MatchingFilter,
    region: Region,
    regionFilter: Region
  ): Promise<void> {
    const waitingUser: WaitingUser = {
      userId,
      category,
      filter,
      region,
      regionFilter,
      joinedAt: Date.now(),
      offeredBot: false,
    };

    // Guardar datos del usuario
    await setHash(
      `waiting_user:${userId}`,
      waitingUser,
      LIMITS.WAITING_QUEUE_TTL
    );

    // Agregar a la cola de su región
    await pushToList(`waiting_queue:${region}`, userId);

    // También agregar a la cola global para búsqueda cross-region
    await pushToList('waiting_queue:any', userId);

    console.log(`✅ Usuario ${userId} agregado a cola (${category}, busca ${filter}, región ${region})`);
  }

  /**
   * Remueve un usuario de la cola de espera
   */
  async removeFromQueue(userId: string): Promise<void> {
    // Obtener datos del usuario para saber de qué cola removerlo
    const user = await this.getWaitingUser(userId);
    
    if (user) {
      // Remover de la cola de su región
      await removeFromList(`waiting_queue:${user.region}`, userId);
      
      // Remover de la cola global
      await removeFromList('waiting_queue:any', userId);
    }

    // Eliminar datos del usuario
    await deleteKey(`waiting_user:${userId}`);

    console.log(`✅ Usuario ${userId} removido de cola`);
  }

  /**
   * Intenta emparejar usuarios en la cola
   * Retorna par de userIds si hay match, null si no
   */
  async tryMatch(): Promise<[string, string] | null> {
    // Obtener todos los usuarios en espera de la cola global
    const userIds = await getList('waiting_queue:any');

    if (userIds.length < 2) {
      return null;
    }

    // Obtener datos de todos los usuarios
    const users = await Promise.all(
      userIds.map(id => this.getWaitingUser(id))
    );

    // Filtrar usuarios válidos
    const validUsers = users.filter((u): u is WaitingUser => u !== null);

    if (validUsers.length < 2) {
      return null;
    }

    // Encontrar el mejor par
    let bestMatch: [WaitingUser, WaitingUser] | null = null;
    let bestScore = -1;

    for (let i = 0; i < validUsers.length; i++) {
      for (let j = i + 1; j < validUsers.length; j++) {
        const user1 = validUsers[i];
        const user2 = validUsers[j];

        // Verificar compatibilidad básica
        if (!this.areCompatible(user1, user2)) {
          continue;
        }

        // Calcular score
        const score = this.calculateMatchScore(user1, user2);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = [user1, user2];
        }
      }
    }

    if (bestMatch) {
      const [user1, user2] = bestMatch;
      console.log(`✅ Match encontrado: ${user1.userId} <-> ${user2.userId} (score: ${bestScore})`);
      return [user1.userId, user2.userId];
    }

    return null;
  }

  /**
   * Verifica si dos usuarios son compatibles según sus filtros
   */
  areCompatible(user1: WaitingUser, user2: WaitingUser): boolean {
    // Verificar si la categoría de user1 coincide con el filtro de user2
    const user1MatchesUser2Filter =
      user2.filter === 'any' || user2.filter === user1.category;

    // Verificar si la categoría de user2 coincide con el filtro de user1
    const user2MatchesUser1Filter =
      user1.filter === 'any' || user1.filter === user2.category;

    // Ambas condiciones deben cumplirse
    return user1MatchesUser2Filter && user2MatchesUser1Filter;
  }

  /**
   * Calcula score de compatibilidad (mayor = mejor match)
   * Considera: filtros de categoría + preferencia de región + tiempo de espera
   */
  calculateMatchScore(user1: WaitingUser, user2: WaitingUser): number {
    // Verificar compatibilidad básica (requisito obligatorio)
    if (!this.areCompatible(user1, user2)) {
      return -1;
    }

    let score = 100; // Puntos base por compatibilidad

    // Bonus por coincidencia de región preferida
    // Si user1 prefiere la región de user2
    if (user1.regionFilter === 'any' || user1.regionFilter === user2.region) {
      score += 50;
    }

    // Si user2 prefiere la región de user1
    if (user2.regionFilter === 'any' || user2.regionFilter === user1.region) {
      score += 50;
    }

    // Bonus adicional si ambos están en la misma región
    if (user1.region === user2.region) {
      score += 30;
    }

    // Penalización por distancia geográfica
    const distance = geoIPService.getRegionDistance(user1.region, user2.region);
    score -= distance * 2; // -2 puntos por cada unidad de distancia

    // Bonus por tiempo de espera (priorizar usuarios que llevan más tiempo)
    const now = Date.now();
    const wait1 = (now - user1.joinedAt) / 1000; // segundos
    const wait2 = (now - user2.joinedAt) / 1000;
    const avgWait = (wait1 + wait2) / 2;
    
    // +1 punto por cada 5 segundos de espera promedio (máximo +20)
    const waitBonus = Math.min(Math.floor(avgWait / 5), 20);
    score += waitBonus;

    return score;
  }

  /**
   * Obtiene el tiempo de espera de un usuario en segundos
   */
  async getWaitTime(userId: string): Promise<number> {
    const user = await this.getWaitingUser(userId);
    
    if (!user) {
      return 0;
    }

    const now = Date.now();
    return Math.floor((now - user.joinedAt) / 1000);
  }

  /**
   * Verifica si debe ofrecer bot a un usuario
   * Se ofrece después de TIMEOUTS.BOT_OFFER ms sin match
   */
  async shouldOfferBot(userId: string): Promise<boolean> {
    const user = await this.getWaitingUser(userId);
    
    if (!user) {
      return false;
    }

    // Si ya se le ofreció bot, no ofrecer de nuevo
    if (user.offeredBot) {
      return false;
    }

    const waitTime = await this.getWaitTime(userId);
    const shouldOffer = waitTime >= (TIMEOUTS.BOT_OFFER / 1000);

    // Marcar como ofrecido si corresponde
    if (shouldOffer) {
      user.offeredBot = true;
      await setHash(
        `waiting_user:${userId}`,
        user,
        LIMITS.WAITING_QUEUE_TTL
      );
    }

    return shouldOffer;
  }

  /**
   * Obtiene los datos de un usuario en espera
   */
  private async getWaitingUser(userId: string): Promise<WaitingUser | null> {
    return await getHashParsed<WaitingUser>(`waiting_user:${userId}`);
  }

  /**
   * Obtiene estadísticas de la cola de espera
   */
  async getQueueStats(): Promise<{
    totalWaiting: number;
    byRegion: Record<Region, number>;
    byCategory: Record<UserCategory, number>;
  }> {
    const userIds = await getList('waiting_queue:any');
    const users = await Promise.all(
      userIds.map(id => this.getWaitingUser(id))
    );
    const validUsers = users.filter((u): u is WaitingUser => u !== null);

    const byRegion: Record<Region, number> = {
      'north-america': 0,
      'south-america': 0,
      'europe': 0,
      'asia': 0,
      'africa': 0,
      'oceania': 0,
      'any': 0,
    };

    const byCategory: Record<UserCategory, number> = {
      'male': 0,
      'female': 0,
      'couple': 0,
    };

    for (const user of validUsers) {
      byRegion[user.region]++;
      byCategory[user.category]++;
    }

    return {
      totalWaiting: validUsers.length,
      byRegion,
      byCategory,
    };
  }
}

// Exportar instancia singleton
export const matchingManager = new MatchingManager();
