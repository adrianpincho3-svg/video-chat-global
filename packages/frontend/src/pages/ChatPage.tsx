import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import FilterSelection from '../components/FilterSelection';
import WaitingRoom from '../components/WaitingRoom';
import VideoChat from '../components/VideoChat';
import TextChat from '../components/TextChat';
import { UserCategory, MatchingFilter, Region } from '../types';

interface Message {
  id: string;
  sender: 'local' | 'remote';
  content: string;
  timestamp: number;
}

export default function ChatPage() {
  const { state, dispatch } = useApp();
  const signaling = useSignaling();
  const webrtc = useWebRTC();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Manejar evento de match
  useEffect(() => {
    const handleMatched = async (data: { sessionId: string; peerId: string; isPeerBot: boolean }) => {
      console.log('✅ Match encontrado:', data);
      
      dispatch({
        type: 'SET_CURRENT_SESSION',
        payload: {
          sessionId: data.sessionId,
          peerId: data.peerId,
          isPeerBot: data.isPeerBot,
          startTime: Date.now(),
        },
      });
      
      dispatch({ type: 'SET_SESSION_STATE', payload: 'in-chat' });
      setCurrentSessionId(data.sessionId);
      setMediaError(null); // Limpiar errores previos
      
      // Inicializar media y crear oferta
      try {
        await webrtc.initializeMedia();
        const offer = await webrtc.createOffer();
        if (offer) {
          signaling.sendOffer(offer);
        }
      } catch (error: any) {
        console.error('Error al inicializar media:', error);
        const errorMessage = error.message || 'No se pudo acceder a la cámara o micrófono. Verifica los permisos.';
        setMediaError(errorMessage);
      }
    };

    signaling.on('matched', handleMatched);
    
    return () => {
      signaling.off('matched', handleMatched);
    };
  }, [signaling, webrtc, dispatch]);

  // Manejar oferta WebRTC
  useEffect(() => {
    const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
      console.log('📥 Oferta recibida');
      
      setMediaError(null); // Limpiar errores previos
      
      try {
        await webrtc.initializeMedia();
        const answer = await webrtc.createAnswer(data.offer);
        if (answer) {
          signaling.sendAnswer(answer);
        }
      } catch (error: any) {
        console.error('Error al procesar oferta:', error);
        const errorMessage = error.message || 'No se pudo acceder a la cámara o micrófono.';
        setMediaError(errorMessage);
      }
    };

    signaling.on('offer', handleOffer);
    
    return () => {
      signaling.off('offer', handleOffer);
    };
  }, [signaling, webrtc]);

  // Manejar respuesta WebRTC
  useEffect(() => {
    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      console.log('📥 Respuesta recibida');
      
      try {
        await webrtc.setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Error al procesar respuesta:', error);
      }
    };

    signaling.on('answer', handleAnswer);
    
    return () => {
      signaling.off('answer', handleAnswer);
    };
  }, [signaling, webrtc]);

  // Manejar candidatos ICE
  useEffect(() => {
    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      console.log('🧊 Candidato ICE recibido');
      
      try {
        await webrtc.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error al agregar candidato ICE:', error);
      }
    };

    signaling.on('ice-candidate', handleIceCandidate);
    
    // Enviar candidatos ICE locales
    webrtc.onIceCandidate((candidate) => {
      signaling.sendIceCandidate(candidate);
    });
    
    return () => {
      signaling.off('ice-candidate', handleIceCandidate);
    };
  }, [signaling, webrtc]);

  // Manejar mensajes de texto
  useEffect(() => {
    const handleTextMessage = (data: { message: string; timestamp: number }) => {
      console.log('💬 Mensaje recibido:', data.message);
      
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: 'remote',
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
    };

    signaling.on('text-message', handleTextMessage);
    
    return () => {
      signaling.off('text-message', handleTextMessage);
    };
  }, [signaling]);

  // Manejar desconexión del peer
  useEffect(() => {
    const handlePeerDisconnected = () => {
      console.log('❌ Peer desconectado');
      alert('Tu pareja se ha desconectado');
      handleEndChat();
    };

    signaling.on('peer-disconnected', handlePeerDisconnected);
    
    return () => {
      signaling.off('peer-disconnected', handlePeerDisconnected);
    };
  }, [signaling]);

  // Manejar región detectada
  useEffect(() => {
    const handleRegionDetected = (data: { region: Region }) => {
      console.log('🌍 Región detectada:', data.region);
      dispatch({ type: 'SET_DETECTED_REGION', payload: data.region });
    };

    signaling.on('region-detected', handleRegionDetected);
    
    return () => {
      signaling.off('region-detected', handleRegionDetected);
    };
  }, [signaling, dispatch]);

  // Iniciar búsqueda
  const handleStartChat = useCallback((
    userCategory: UserCategory,
    filter: MatchingFilter,
    regionFilter: Region
  ) => {
    console.log('🔍 Iniciando búsqueda...', { userCategory, filter, regionFilter });
    
    dispatch({ type: 'SET_USER_CATEGORY', payload: userCategory });
    dispatch({ type: 'SET_MATCHING_FILTER', payload: filter });
    dispatch({ type: 'SET_REGION_FILTER', payload: regionFilter });
    dispatch({ type: 'SET_SESSION_STATE', payload: 'waiting' });
    
    signaling.startMatching(userCategory, filter, regionFilter);
  }, [signaling, dispatch]);

  // Cancelar búsqueda
  const handleCancelSearch = useCallback(() => {
    console.log('❌ Cancelando búsqueda');
    
    signaling.cancelMatching();
    dispatch({ type: 'SET_SESSION_STATE', payload: 'filter-selection' });
  }, [signaling, dispatch]);

  // Aceptar bot
  const handleAcceptBot = useCallback(() => {
    console.log('🤖 Aceptando bot');
    // El backend manejará esto automáticamente
  }, []);

  // Enviar mensaje de texto
  const handleSendMessage = useCallback((content: string) => {
    console.log('💬 Enviando mensaje:', content);
    
    signaling.sendTextMessage(content);
    
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: 'local',
        content,
        timestamp: Date.now(),
      },
    ]);
  }, [signaling]);

  // Terminar chat
  const handleEndChat = useCallback(() => {
    console.log('👋 Terminando chat');
    
    signaling.endSession();
    webrtc.closeConnection();
    
    dispatch({ type: 'RESET_SESSION' });
    dispatch({ type: 'SET_SESSION_STATE', payload: 'filter-selection' });
    
    setMessages([]);
    setCurrentSessionId(null);
  }, [signaling, webrtc, dispatch]);

  // Siguiente chat
  const handleNextChat = useCallback(() => {
    console.log('⏭️ Siguiente chat');
    
    // Terminar sesión actual
    signaling.endSession();
    webrtc.closeConnection();
    
    // Reiniciar búsqueda con los mismos filtros
    dispatch({ type: 'SET_SESSION_STATE', payload: 'waiting' });
    setMessages([]);
    setCurrentSessionId(null);
    
    if (state.userCategory) {
      signaling.startMatching(
        state.userCategory,
        state.matchingFilter,
        state.regionFilter
      );
    }
  }, [signaling, webrtc, dispatch, state]);

  // Volver a selección de filtros
  const handleBackToFilters = useCallback(() => {
    dispatch({ type: 'SET_SESSION_STATE', payload: 'filter-selection' });
  }, [dispatch]);

  // Renderizar según el estado
  const renderContent = () => {
    switch (state.sessionState) {
      case 'idle':
        return (
          <div className="text-center">
            <button
              onClick={handleBackToFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Comenzar
            </button>
          </div>
        );

      case 'filter-selection':
        return (
          <FilterSelection
            onStartChat={handleStartChat}
            onCancel={() => dispatch({ type: 'SET_SESSION_STATE', payload: 'idle' })}
            detectedRegion={state.detectedRegion}
          />
        );

      case 'waiting':
        return (
          <WaitingRoom
            onCancel={handleCancelSearch}
            onAcceptBot={handleAcceptBot}
          />
        );

      case 'in-chat':
        return (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VideoChat
                localStream={webrtc.localStream}
                remoteStream={webrtc.remoteStream}
                onEndChat={handleEndChat}
                onNextChat={handleNextChat}
                onToggleAudio={webrtc.toggleAudio}
                onToggleVideo={webrtc.toggleVideo}
                isAudioEnabled={webrtc.isAudioEnabled}
                isVideoEnabled={webrtc.isVideoEnabled}
                isPeerBot={state.currentSession?.isPeerBot}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="h-[600px]">
                <TextChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Estado de conexión */}
      {!signaling.connected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-yellow-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-800">
              Conectando al servidor...
            </span>
          </div>
        </div>
      )}

      {/* Error de media */}
      {mediaError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Error de Cámara/Micrófono
              </h3>
              <p className="text-sm text-red-700 mb-3">{mediaError}</p>
              <div className="text-xs text-red-600 space-y-1">
                <p>• Verifica que hayas dado permisos de cámara y micrófono</p>
                <p>• Asegúrate de que no estén en uso por otra aplicación</p>
                <p>• Recarga la página e intenta de nuevo</p>
              </div>
              <button
                onClick={() => setMediaError(null)}
                className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

