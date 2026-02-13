import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../types';
import { matchingManager } from '../services/MatchingManager';
import { JitsiIntegrationService } from '../services/JitsiIntegrationService';
import { geoIPService } from '../services/GeoIPService';
import { isValidUserCategory, isValidMatchingFilter } from '../utils/validation';

const jitsiService = new JitsiIntegrationService();

/**
 * Configura los handlers de Socket.io para integración con Jitsi
 */
export function setupJitsiHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) {
  io.on('connection', async (socket) => {
    const userId = uuidv4();
    socket.data.userId = userId;

    // Detectar región del usuario
    const clientIP = geoIPService.extractIPFromRequest(socket.request);
    const region = geoIPService.detectRegion(clientIP);
    socket.data.region = region;

    console.log(`👤 Usuario conectado (Jitsi): ${userId} (región: ${region})`);

    // Notificar región detectada
    socket.emit('region-detected', { region });

    // Handler: Iniciar búsqueda con Jitsi
    socket.on('start-matching', async (data) => {
      try {
        const { userCategory, filter, regionFilter } = data;

        // Validar datos
        if (!isValidUserCategory(userCategory)) {
          socket.emit('error', {
            code: 'INVALID_CATEGORY',
            message: 'Categoría de usuario inválida',
          });
          return;
        }

        if (!isValidMatchingFilter(filter)) {
          socket.emit('error', {
            code: 'INVALID_FILTER',
            message: 'Filtro de emparejamiento inválido',
          });
          return;
        }

        // Agregar a cola de espera
        const effectiveRegion = regionFilter || region;
        await matchingManager.addToQueue(userId, userCategory, filter, effectiveRegion);

        console.log(`🔍 Usuario ${userId} buscando pareja (Jitsi)...`);

        // Intentar hacer match inmediatamente
        await tryMatchWithJitsi(socket, userId, userCategory, filter, effectiveRegion);
      } catch (error) {
        console.error('Error en start-matching (Jitsi):', error);
        socket.emit('error', {
          code: 'MATCHING_ERROR',
          message: 'Error al buscar pareja',
        });
      }
    });

    // Handler: Cancelar búsqueda
    socket.on('cancel-matching', async () => {
      try {
        await matchingManager.removeFromQueue(userId);
        console.log(`❌ Usuario ${userId} canceló búsqueda (Jitsi)`);
      } catch (error) {
        console.error('Error en cancel-matching (Jitsi):', error);
      }
    });

    // Handler: Desconexión
    socket.on('disconnect', async () => {
      try {
        await matchingManager.removeFromQueue(userId);
        console.log(`👋 Usuario ${userId} desconectado (Jitsi)`);
      } catch (error) {
        console.error('Error en disconnect (Jitsi):', error);
      }
    });
  });

  // Intentar hacer matches periódicamente
  setInterval(async () => {
    try {
      const sockets = await io.fetchSockets();
      
      for (const socket of sockets) {
        const userId = socket.data.userId;
        if (!userId) continue;

        // Obtener datos del usuario de la cola
        const userData = await matchingManager.getWaitingUser(userId);
        if (!userData) continue;

        await tryMatchWithJitsi(
          socket,
          userId,
          userData.category,
          userData.filter,
          userData.region
        );
      }
    } catch (error) {
      console.error('Error en matching periódico (Jitsi):', error);
    }
  }, 2000);
}

/**
 * Intenta hacer match y crear sala Jitsi
 */
async function tryMatchWithJitsi(
  socket: Socket,
  userId: string,
  userCategory: string,
  filter: string,
  region: string
) {
  try {
    const match = await matchingManager.tryMatch(userId);

    if (match) {
      const { user1, user2 } = match;
      const sessionId = uuidv4();

      // Crear sala Jitsi
      const jitsiConfig = jitsiService.createRoomConfig(sessionId, {
        displayName: `User-${userCategory}`,
      });

      console.log(`✅ Match encontrado (Jitsi): ${user1} <-> ${user2}`);
      console.log(`🎥 Sala Jitsi creada: ${jitsiConfig.roomName}`);

      // Obtener sockets de ambos usuarios
      const sockets = await socket.server.fetchSockets();
      const socket1 = sockets.find((s) => s.data.userId === user1);
      const socket2 = sockets.find((s) => s.data.userId === user2);

      // Notificar a ambos usuarios
      if (socket1) {
        socket1.emit('matched', {
          sessionId,
          peerId: user2,
          jitsiRoom: jitsiConfig.roomName,
          jitsiUrl: jitsiConfig.url,
          isPeerBot: false,
        });
      }

      if (socket2) {
        socket2.emit('matched', {
          sessionId,
          peerId: user1,
          jitsiRoom: jitsiConfig.roomName,
          jitsiUrl: jitsiConfig.url,
          isPeerBot: false,
        });
      }

      // Remover de la cola
      await matchingManager.removeFromQueue(user1);
      await matchingManager.removeFromQueue(user2);
    }
  } catch (error) {
    console.error('Error en tryMatchWithJitsi:', error);
  }
}

export { jitsiService };
