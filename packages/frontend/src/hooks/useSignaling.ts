import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserCategory, MatchingFilter, Region } from '../types';

// Tipos de eventos del servidor
interface ServerToClientEvents {
  'matched': (data: { sessionId: string; peerId: string; isPeerBot: boolean }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'peer-disconnected': () => void;
  'text-message': (data: { message: string; timestamp: number }) => void;
  'region-detected': (data: { region: Region }) => void;
  'error': (data: { code: string; message: string }) => void;
}

// Tipos de eventos del cliente
interface ClientToServerEvents {
  'start-matching': (data: { userCategory: UserCategory; filter: MatchingFilter; regionFilter: Region }) => void;
  'cancel-matching': () => void;
  'join-session': (data: { linkId: string }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'text-message': (data: { message: string }) => void;
  'end-session': () => void;
}

type SignalingSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSignalingReturn {
  socket: SignalingSocket | null;
  connected: boolean;
  startMatching: (userCategory: UserCategory, filter: MatchingFilter, regionFilter: Region) => void;
  cancelMatching: () => void;
  joinSession: (linkId: string) => void;
  sendOffer: (offer: RTCSessionDescriptionInit) => void;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => void;
  sendTextMessage: (message: string) => void;
  endSession: () => void;
  on: <K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]) => void;
  off: <K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Verificar configuración
if (typeof window !== 'undefined') {
  console.log('🔧 Configuración de Backend:');
  console.log('   VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('   URL efectiva:', BACKEND_URL);
  
  if (!import.meta.env.VITE_BACKEND_URL) {
    console.warn('⚠️ VITE_BACKEND_URL no está configurada!');
    console.warn('   Configúrala en Vercel → Settings → Environment Variables');
  }
}

export function useSignaling(): UseSignalingReturn {
  const socketRef = useRef<SignalingSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // Inicializar conexión Socket.io
  useEffect(() => {
    console.log('🔌 Conectando a servidor de señalización:', BACKEND_URL);
    
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    }) as SignalingSocket;

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor de señalización');
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado del servidor:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setConnected(false);
    });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando del servidor de señalización');
      socket.disconnect();
    };
  }, []);

  // Funciones de envío
  const startMatching = useCallback((
    userCategory: UserCategory,
    filter: MatchingFilter,
    regionFilter: Region
  ) => {
    if (socketRef.current?.connected) {
      console.log('🔍 Iniciando búsqueda:', { userCategory, filter, regionFilter });
      socketRef.current.emit('start-matching', { userCategory, filter, regionFilter });
    } else {
      console.error('❌ Socket no conectado');
    }
  }, []);

  const cancelMatching = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('❌ Cancelando búsqueda');
      socketRef.current.emit('cancel-matching');
    }
  }, []);

  const joinSession = useCallback((linkId: string) => {
    if (socketRef.current?.connected) {
      console.log('🔗 Uniéndose a sesión por enlace:', linkId);
      socketRef.current.emit('join-session', { linkId });
    }
  }, []);

  const sendOffer = useCallback((offer: RTCSessionDescriptionInit) => {
    if (socketRef.current?.connected) {
      console.log('📤 Enviando oferta WebRTC');
      socketRef.current.emit('offer', { offer });
    }
  }, []);

  const sendAnswer = useCallback((answer: RTCSessionDescriptionInit) => {
    if (socketRef.current?.connected) {
      console.log('📤 Enviando respuesta WebRTC');
      socketRef.current.emit('answer', { answer });
    }
  }, []);

  const sendIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    if (socketRef.current?.connected) {
      console.log('📤 Enviando candidato ICE');
      socketRef.current.emit('ice-candidate', { candidate });
    }
  }, []);

  const sendTextMessage = useCallback((message: string) => {
    if (socketRef.current?.connected) {
      console.log('💬 Enviando mensaje de texto');
      socketRef.current.emit('text-message', { message });
    }
  }, []);

  const endSession = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('👋 Terminando sesión');
      socketRef.current.emit('end-session');
    }
  }, []);

  // Funciones para manejar eventos
  const on = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    startMatching,
    cancelMatching,
    joinSession,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendTextMessage,
    endSession,
    on,
    off,
  };
}
