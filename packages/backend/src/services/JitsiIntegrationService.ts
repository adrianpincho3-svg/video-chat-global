import crypto from 'crypto';

/**
 * Servidores de Jitsi disponibles (todos gratuitos y públicos)
 */
const JITSI_SERVERS = [
  { name: 'Jitsi Meet', domain: 'meet.jit.si', region: 'Global' },
  { name: '8x8 Video Meet', domain: '8x8.vc', region: 'Global' },
  { name: 'Jitsi Framatalk', domain: 'framatalk.org/jitsi', region: 'Europe' },
];

/**
 * Servicio de integración con múltiples servidores de Jitsi Meet
 * Distribuye la carga entre varios servidores públicos
 */
export class JitsiIntegrationService {
  private jitsiServers: typeof JITSI_SERVERS;
  private usePublicInstance: boolean;

  constructor() {
    // Usar múltiples instancias públicas de Jitsi
    this.jitsiServers = JITSI_SERVERS;
    this.usePublicInstance = !process.env.JITSI_DOMAIN;
    
    console.log(`✅ Jitsi Integration: ${this.jitsiServers.length} servidores disponibles`);
  }

  /**
   * Selecciona un servidor aleatorio para distribuir la carga
   */
  private selectRandomServer() {
    const randomIndex = Math.floor(Math.random() * this.jitsiServers.length);
    const server = this.jitsiServers[randomIndex];
    console.log(`🎲 Servidor seleccionado: ${server.name} (${server.region})`);
    return server;
  }

  /**
   * Genera un nombre de sala único y seguro
   */
  generateRoomName(sessionId: string): string {
    // Crear nombre de sala único basado en el sessionId
    const hash = crypto.createHash('sha256').update(sessionId).digest('hex').substring(0, 16);
    return `RandomVideoChat-${hash}`;
  }

  /**
   * Crea una configuración de sala Jitsi
   */
  createRoomConfig(sessionId: string, options?: {
    displayName?: string;
    email?: string;
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
  }) {
    const roomName = this.generateRoomName(sessionId);
    const server = this.selectRandomServer(); // Seleccionar servidor aleatorio
    
    return {
      roomName,
      domain: server.domain,
      serverName: server.name,
      serverRegion: server.region,
      url: `https://${server.domain}/${roomName}`,
      config: {
        // Configuración de la interfaz
        prejoinPageEnabled: false,
        startWithAudioMuted: options?.startWithAudioMuted || false,
        startWithVideoMuted: options?.startWithVideoMuted || false,
        
        // Características habilitadas
        enableWelcomePage: false,
        enableClosePage: false,
        
        // Configuración de video
        resolution: 720,
        constraints: {
          video: {
            height: { ideal: 720, max: 720, min: 180 },
            width: { ideal: 1280, max: 1280, min: 320 }
          }
        },
        
        // Desactivar características no necesarias
        disableDeepLinking: true,
        disableInviteFunctions: true,
        
        // Configuración de UI
        toolbarButtons: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'hangup',
          'chat',
          'settings',
          'videoquality'
        ],
        
        // Configuración de usuario
        userInfo: {
          displayName: options?.displayName || 'Anonymous',
          email: options?.email
        }
      },
      interfaceConfig: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        APP_NAME: 'Random Video Chat',
        NATIVE_APP_NAME: 'Random Video Chat',
        PROVIDER_NAME: 'Random Video Chat',
        MOBILE_APP_PROMO: false,
        HIDE_INVITE_MORE_HEADER: true
      }
    };
  }

  /**
   * Genera un JWT token para autenticación (si se usa instancia privada)
   */
  generateJWT(roomName: string, userId: string, displayName: string, domain: string): string | null {
    const jitsiSecret = process.env.JITSI_SECRET;
    const jitsiAppId = process.env.JITSI_APP_ID;

    if (!jitsiSecret || !jitsiAppId) {
      // No hay configuración de JWT, usar instancia pública sin autenticación
      return null;
    }

    // Crear JWT para autenticación
    const payload = {
      context: {
        user: {
          id: userId,
          name: displayName,
          avatar: '',
          email: '',
          moderator: false
        }
      },
      aud: jitsiAppId,
      iss: jitsiAppId,
      sub: domain,
      room: roomName,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
    };

    // En producción, usar una librería JWT real
    // Por ahora, retornar null para usar instancia pública
    return null;
  }

  /**
   * Verifica si una sala está activa
   */
  async isRoomActive(roomName: string): Promise<boolean> {
    try {
      // Jitsi no proporciona API pública para verificar salas
      // En instancia pública, asumimos que la sala existe si fue creada
      return true;
    } catch (error) {
      console.error('Error checking room status:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de uso (solo disponible en instancia privada)
   */
  async getRoomStats(roomName: string): Promise<any> {
    if (this.usePublicInstance) {
      return {
        available: false,
        message: 'Statistics not available on public instance'
      };
    }

    // Implementar llamada a API de Jitsi si se usa instancia privada
    return {
      participants: 0,
      duration: 0
    };
  }

  /**
   * Cierra una sala (solo disponible en instancia privada)
   */
  async closeRoom(roomName: string): Promise<boolean> {
    if (this.usePublicInstance) {
      // En instancia pública, las salas se cierran automáticamente cuando no hay usuarios
      return true;
    }

    // Implementar cierre de sala en instancia privada
    return true;
  }

  /**
   * Obtiene información sobre las instancias de Jitsi
   */
  getInstanceInfo() {
    return {
      servers: this.jitsiServers,
      totalServers: this.jitsiServers.length,
      isPublic: this.usePublicInstance,
      features: {
        jwt: !!process.env.JITSI_SECRET,
        customDomain: !!process.env.JITSI_DOMAIN,
        recording: false, // Requiere configuración adicional
        streaming: false,  // Requiere configuración adicional
        loadBalancing: true // Distribución de carga entre servidores
      }
    };
  }
}
