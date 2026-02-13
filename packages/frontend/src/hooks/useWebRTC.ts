import { useState, useRef, useCallback, useEffect } from 'react';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  initializeMedia: () => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | null>;
  setRemoteDescription: (desc: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  closeConnection: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onIceCandidate: (handler: (candidate: RTCIceCandidate) => void) => void;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC(config?: WebRTCConfig): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidateHandlerRef = useRef<((candidate: RTCIceCandidate) => void) | null>(null);

  // Inicializar conexión peer
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const iceServers = config?.iceServers || DEFAULT_ICE_SERVERS;
    const pc = new RTCPeerConnection({ iceServers });

    // Manejar cambios de estado de conexión
    pc.onconnectionstatechange = () => {
      console.log('📡 Estado de conexión:', pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    // Manejar candidatos ICE
    pc.onicecandidate = (event) => {
      if (event.candidate && iceCandidateHandlerRef.current) {
        console.log('🧊 Nuevo candidato ICE');
        iceCandidateHandlerRef.current(event.candidate);
      }
    };

    // Manejar stream remoto
    pc.ontrack = (event) => {
      console.log('📹 Stream remoto recibido');
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [config]);

  // Inicializar media (cámara y micrófono)
  const initializeMedia = useCallback(async () => {
    try {
      console.log('🎥 Solicitando acceso a cámara y micrófono...');
      
      // Verificar que getUserMedia esté disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a cámara/micrófono. Usa Chrome, Firefox o Safari.');
      }

      // Verificar que estemos en HTTPS (requerido para WebRTC en producción)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('⚠️ WebRTC requiere HTTPS en producción');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('✅ Acceso a media concedido');
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
      
      setLocalStream(stream);

      // Agregar tracks al peer connection
      const pc = initializePeerConnection();
      stream.getTracks().forEach((track) => {
        console.log(`➕ Agregando track: ${track.kind} (${track.label})`);
        pc.addTrack(track, stream);
      });

    } catch (error: any) {
      console.error('❌ Error al acceder a media:', error);
      
      // Mensajes de error más descriptivos
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Permiso denegado. Por favor, permite el acceso a tu cámara y micrófono.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No se encontró cámara o micrófono. Verifica que estén conectados.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('No se puede acceder a la cámara/micrófono. Puede estar en uso por otra aplicación.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('La configuración de video solicitada no es compatible con tu dispositivo.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Error de seguridad. Asegúrate de estar usando HTTPS.');
      }
      
      throw error;
    }
  }, [initializePeerConnection]);

  // Crear oferta
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    try {
      const pc = initializePeerConnection();
      
      console.log('📤 Creando oferta...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('✅ Oferta creada');
      return offer;
    } catch (error) {
      console.error('❌ Error al crear oferta:', error);
      return null;
    }
  }, [initializePeerConnection]);

  // Crear respuesta
  const createAnswer = useCallback(async (
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit | null> => {
    try {
      const pc = initializePeerConnection();
      
      console.log('📥 Procesando oferta...');
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      console.log('📤 Creando respuesta...');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('✅ Respuesta creada');
      return answer;
    } catch (error) {
      console.error('❌ Error al crear respuesta:', error);
      return null;
    }
  }, [initializePeerConnection]);

  // Establecer descripción remota
  const setRemoteDescription = useCallback(async (desc: RTCSessionDescriptionInit) => {
    try {
      const pc = initializePeerConnection();
      
      console.log('📥 Estableciendo descripción remota...');
      await pc.setRemoteDescription(new RTCSessionDescription(desc));
      console.log('✅ Descripción remota establecida');
    } catch (error) {
      console.error('❌ Error al establecer descripción remota:', error);
      throw error;
    }
  }, [initializePeerConnection]);

  // Agregar candidato ICE
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.warn('⚠️ Peer connection no inicializado');
        return;
      }

      console.log('🧊 Agregando candidato ICE...');
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ Candidato ICE agregado');
    } catch (error) {
      console.error('❌ Error al agregar candidato ICE:', error);
    }
  }, []);

  // Cerrar conexión
  const closeConnection = useCallback(() => {
    console.log('🔌 Cerrando conexión WebRTC...');

    // Detener stream local
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }

    // Cerrar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setConnectionState('closed');
    console.log('✅ Conexión cerrada');
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('🔊 Audio:', audioTrack.enabled ? 'activado' : 'desactivado');
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('📹 Video:', videoTrack.enabled ? 'activado' : 'desactivado');
      }
    }
  }, [localStream]);

  // Registrar handler para candidatos ICE
  const onIceCandidate = useCallback((handler: (candidate: RTCIceCandidate) => void) => {
    iceCandidateHandlerRef.current = handler;
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  return {
    localStream,
    remoteStream,
    connectionState,
    initializeMedia,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    onIceCandidate,
  };
}
