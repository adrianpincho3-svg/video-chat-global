import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../types';
import { matchingManager } from '../services/MatchingManager';
import { sessionManager } from '../services/SessionManager';
import { linkGenerator } from '../services/LinkGenerator';
import { geoIPService } from '../services/GeoIPService';
import { aiBotService } from '../services/AIBotService';
import { isValidUserCategory, isValidMatchingFilter, isValidRegion } from '../utils/validation';

/**
 * Configura los handlers de Socket.io para señalización WebRTC
 */
export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) {
  io.on('connection', async (socket) => {
    // Generar ID único para el usuario
    const userId = uuidv4();
    socket.data.userId = userId;

    // Detectar región del usuario
    const clientIP = geoIPService.extractIPFromRequest(socket.request);
    const region = geoIPService.detectRegion(clientIP);
    socket.data.region = region;

    console.log(`👤 Usuario conectado: ${userId} (región: ${region})`);

    // Notificar región detectada al cliente
    socket.emit('region-detected', { region });

    // Handler: Iniciar búsqueda de pareja
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

        if (!isValidRegion(regionFilter)) {
          socket.emit('error', {
            code: 'INVALID_REGION',
            message: 'Región inválida',
          });
          return;
        }

        console.log(`🔍 ${userId} buscando pareja: ${userCategory} busca ${filter} (región: ${regionFilter})`);

        // Agregar a cola de espera
        await matchingManager.addToQueue(
          userId,
          userCategory,
          filter,
          socket.data.region || 'any',
          regionFilter
        );

        // Intentar match inmediato
        await tryMatchmaking(io);

        // Configurar timeout para ofrecer bot
        setTimeout(async () => {
          const shouldOffer = await matchingManager.shouldOfferBot(userId);
          if (shouldOffer) {
            // Verificar que el usuario siga en cola
            const waitTime = await matchingManager.getWaitTime(userId);
            if (waitTime > 0) {
              console.log(`🤖 Ofreciendo bot a ${userId}`);
              // El cliente decidirá si acepta el bot
            }
          }
        }, 10000); // 10 segundos

      } catch (error) {
        console.error('Error en start-matching:', error);
        socket.emit('error', {
          code: 'MATCHING_ERROR',
          message: 'Error al iniciar búsqueda',
        });
      }
    });

    // Handler: Cancelar búsqueda
    socket.on('cancel-matching', async () => {
      try {
        await matchingManager.removeFromQueue(userId);
        console.log(`❌ ${userId} canceló búsqueda`);
      } catch (error) {
        console.error('Error en cancel-matching:', error);
      }
    });

    // Handler: Unirse mediante enlace compartible
    socket.on('join-session', async (data) => {
      try {
        const { linkId } = data;

        // Validar enlace
        const link = await linkGenerator.getLink(linkId);
        
        if (!link) {
          socket.emit('error', {
            code: 'INVALID_LINK',
            message: 'Enlace inválido o expirado',
          });
          return;
        }

        // Verificar si el creador está disponible
        const isAvailable = await linkGenerator.isCreatorAvailable(linkId);
        
        if (!isAvailable) {
          socket.emit('error', {
            code: 'CREATOR_UNAVAILABLE',
            message: 'El creador del enlace no está disponible',
          });
          return;
        }

        // Crear sesión directa
        const session = await sessionManager.createSession(
          link.creatorId,
          userId,
          false,
          socket.data.region,
          socket.data.region,
          linkId
        );

        socket.data.sessionId = session.sessionId;

        // Marcar enlace como usado
        await linkGenerator.markLinkUsed(linkId);

        // Obtener sockets de ambos usuarios
        const creatorSocket = await findSocketByUserId(io, link.creatorId);
        const joinerSocket = socket;

        if (creatorSocket) {
          creatorSocket.data.sessionId = session.sessionId;

          // Notificar a ambos usuarios
          creatorSocket.emit('matched', {
            sessionId: session.sessionId,
            peerId: userId,
            isPeerBot: false,
          });

          joinerSocket.emit('matched', {
            sessionId: session.sessionId,
            peerId: link.creatorId,
            isPeerBot: false,
          });

          console.log(`🔗 Sesión creada mediante enlace: ${session.sessionId}`);
        }

      } catch (error) {
        console.error('Error en join-session:', error);
        socket.emit('error', {
          code: 'JOIN_ERROR',
          message: 'Error al unirse a la sesión',
        });
      }
    });

    // Handler: Enviar oferta SDP
    socket.on('offer', async (data) => {
      try {
        const session = await sessionManager.getSessionByUser(userId);
        
        if (!session) {
          socket.emit('error', {
            code: 'NO_SESSION',
            message: 'No hay sesión activa',
          });
          return;
        }

        // Obtener ID del peer
        const peerId = session.user1Id === userId ? session.user2Id : session.user1Id;
        
        // Enviar oferta al peer
        const peerSocket = await findSocketByUserId(io, peerId);
        if (peerSocket) {
          peerSocket.emit('offer', { offer: data.offer });
          console.log(`📤 Oferta SDP enviada: ${userId} -> ${peerId}`);
        }

      } catch (error) {
        console.error('Error en offer:', error);
      }
    });

    // Handler: Enviar respuesta SDP
    socket.on('answer', async (data) => {
      try {
        const session = await sessionManager.getSessionByUser(userId);
        
        if (!session) {
          socket.emit('error', {
            code: 'NO_SESSION',
            message: 'No hay sesión activa',
          });
          return;
        }

        // Obtener ID del peer
        const peerId = session.user1Id === userId ? session.user2Id : session.user1Id;
        
        // Enviar respuesta al peer
        const peerSocket = await findSocketByUserId(io, peerId);
        if (peerSocket) {
          peerSocket.emit('answer', { answer: data.answer });
          console.log(`📤 Respuesta SDP enviada: ${userId} -> ${peerId}`);
        }

      } catch (error) {
        console.error('Error en answer:', error);
      }
    });

    // Handler: Enviar candidato ICE
    socket.on('ice-candidate', async (data) => {
      try {
        const session = await sessionManager.getSessionByUser(userId);
        
        if (!session) {
          return;
        }

        // Obtener ID del peer
        const peerId = session.user1Id === userId ? session.user2Id : session.user1Id;
        
        // Enviar candidato al peer
        const peerSocket = await findSocketByUserId(io, peerId);
        if (peerSocket) {
          peerSocket.emit('ice-candidate', { candidate: data.candidate });
        }

      } catch (error) {
        console.error('Error en ice-candidate:', error);
      }
    });

    // Handler: Enviar mensaje de texto
    socket.on('text-message', async (data) => {
      try {
        const session = await sessionManager.getSessionByUser(userId);
        
        if (!session) {
          socket.emit('error', {
            code: 'NO_SESSION',
            message: 'No hay sesión activa',
          });
          return;
        }

        // Obtener ID del peer
        const peerId = session.user1Id === userId ? session.user2Id : session.user1Id;
        
        // Si el peer es un bot, generar respuesta
        if (session.isUser2Bot && peerId === session.user2Id) {
          const botResponse = await aiBotService.generateResponse(session.sessionId, data.message);
          
          // Enviar respuesta del bot al usuario
          setTimeout(() => {
            socket.emit('text-message', {
              message: botResponse,
              timestamp: Date.now(),
            });
          }, 1000 + Math.random() * 2000); // Delay aleatorio 1-3 segundos
          
        } else {
          // Enviar mensaje al peer humano
          const peerSocket = await findSocketByUserId(io, peerId);
          if (peerSocket) {
            peerSocket.emit('text-message', {
              message: data.message,
              timestamp: Date.now(),
            });
          }
        }

      } catch (error) {
        console.error('Error en text-message:', error);
      }
    });

    // Handler: Terminar sesión
    socket.on('end-session', async () => {
      try {
        await endUserSession(io, userId);
      } catch (error) {
        console.error('Error en end-session:', error);
      }
    });

    // Handler: Desconexión
    socket.on('disconnect', async () => {
      console.log(`👋 Usuario desconectado: ${userId}`);
      
      try {
        // Remover de cola de espera
        await matchingManager.removeFromQueue(userId);
        
        // Terminar sesión activa
        await endUserSession(io, userId);
        
      } catch (error) {
        console.error('Error en disconnect:', error);
      }
    });
  });

  // Intentar matchmaking periódicamente
  setInterval(async () => {
    await tryMatchmaking(io);
  }, 2000); // Cada 2 segundos
}

/**
 * Intenta emparejar usuarios en la cola
 */
async function tryMatchmaking(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) {
  try {
    const match = await matchingManager.tryMatch();
    
    if (!match) {
      return;
    }

    const [user1Id, user2Id] = match;

    // Remover de cola
    await matchingManager.removeFromQueue(user1Id);
    await matchingManager.removeFromQueue(user2Id);

    // Obtener regiones de los usuarios
    const user1Socket = await findSocketByUserId(io, user1Id);
    const user2Socket = await findSocketByUserId(io, user2Id);

    const user1Region = user1Socket?.data.region || 'any';
    const user2Region = user2Socket?.data.region || 'any';

    // Crear sesión
    const session = await sessionManager.createSession(
      user1Id,
      user2Id,
      false,
      user1Region,
      user2Region
    );

    // Actualizar datos de socket
    if (user1Socket) user1Socket.data.sessionId = session.sessionId;
    if (user2Socket) user2Socket.data.sessionId = session.sessionId;

    // Notificar a ambos usuarios
    if (user1Socket) {
      user1Socket.emit('matched', {
        sessionId: session.sessionId,
        peerId: user2Id,
        isPeerBot: false,
      });
    }

    if (user2Socket) {
      user2Socket.emit('matched', {
        sessionId: session.sessionId,
        peerId: user1Id,
        isPeerBot: false,
      });
    }

    console.log(`✅ Match exitoso: ${user1Id} <-> ${user2Id}`);

  } catch (error) {
    console.error('Error en tryMatchmaking:', error);
  }
}

/**
 * Termina la sesión de un usuario
 */
async function endUserSession(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
  userId: string
) {
  const session = await sessionManager.getSessionByUser(userId);
  
  if (!session) {
    return;
  }

  // Obtener ID del peer
  const peerId = session.user1Id === userId ? session.user2Id : session.user1Id;

  // Notificar al peer
  const peerSocket = await findSocketByUserId(io, peerId);
  if (peerSocket) {
    peerSocket.emit('peer-disconnected');
    peerSocket.data.sessionId = undefined;
  }

  // Limpiar conversación con bot si aplica
  if (session.isUser2Bot) {
    await aiBotService.cleanupConversation(session.sessionId);
  }

  // Terminar sesión
  await sessionManager.endSession(session.sessionId);

  console.log(`🔚 Sesión terminada: ${session.sessionId}`);
}

/**
 * Encuentra un socket por ID de usuario
 */
async function findSocketByUserId(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
  userId: string
) {
  const sockets = await io.fetchSockets();
  return sockets.find(s => s.data.userId === userId) || null;
}
