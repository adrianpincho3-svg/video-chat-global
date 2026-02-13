import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSignaling } from '../hooks/useSignaling';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoChat from '../components/VideoChat';
import TextChat from '../components/TextChat';

interface Message {
  id: string;
  sender: 'local' | 'remote';
  content: string;
  timestamp: number;
}

type JoinState = 'loading' | 'joining' | 'in-chat' | 'error' | 'creator-unavailable';

export const JoinByLinkPage: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<JoinState>('loading');
  const [error, setError] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const { socket, joinSession, sendTextMessage, endSession } = useSignaling();
  const {
    localStream,
    remoteStream,
    initializeMedia,
    createAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    closeConnection,
  } = useWebRTC();

  useEffect(() => {
    if (!linkId) {
      setError('Enlace inválido');
      setState('error');
      return;
    }

    const init = async () => {
      try {
        setState('joining');
        await initializeMedia();
        joinSession(linkId);
      } catch (err) {
        console.error('Error initializing:', err);
        setError('No se pudo acceder a la cámara o micrófono');
        setState('error');
      }
    };

    init();
  }, [linkId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('matched', (data) => {
      setSessionId(data.sessionId);
      setState('in-chat');
    });

    socket.on('offer', async (data: any) => {
      try {
        const answer = await createAnswer(data.offer);
        if (answer) {
          socket.emit('answer', { answer });
        }
      } catch (err) {
        console.error('Error creating answer:', err);
      }
    });

    socket.on('ice-candidate', (data) => {
      addIceCandidate(data.candidate);
    });

    socket.on('text-message', (data: { message: string; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'remote',
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
    });

    socket.on('peer-disconnected', () => {
      alert('El otro usuario se desconectó');
      handleEnd();
    });

    socket.on('error', (data) => {
      if (data.message.includes('not available') || data.message.includes('no disponible')) {
        setState('creator-unavailable');
      } else {
        setError(data.message);
        setState('error');
      }
    });

    return () => {
      socket.off('matched');
      socket.off('offer');
      socket.off('ice-candidate');
      socket.off('text-message');
      socket.off('peer-disconnected');
      socket.off('error');
    };
  }, [socket, createAnswer, addIceCandidate]);

  const handleSendMessage = (content: string) => {
    if (!sessionId) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'local',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, message]);
    sendTextMessage(content);
  };

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioEnabled((prev) => !prev);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled((prev) => !prev);
  };

  const handleEnd = () => {
    if (sessionId) {
      endSession();
    }
    closeConnection();
    navigate('/');
  };

  if (state === 'loading' || state === 'joining') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {state === 'loading' ? 'Cargando...' : 'Conectando...'}
          </h2>
          <p className="text-gray-600">
            {state === 'loading' 
              ? 'Preparando la conexión' 
              : 'Esperando al creador del enlace...'}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'creator-unavailable') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Creador No Disponible
          </h2>
          <p className="text-gray-600 mb-6">
            La persona que creó este enlace no está disponible en este momento.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/chat')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar Chat Aleatorio
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Ocurrió un error inesperado'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <h1 className="text-2xl font-bold">Chat Privado</h1>
            <p className="text-sm opacity-90">Conectado mediante enlace compartible</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="lg:col-span-2">
              <VideoChat
                localStream={localStream}
                remoteStream={remoteStream}
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
                onEndChat={handleEnd}
                onNextChat={handleEnd}
                isPeerBot={false}
              />
            </div>

            <div className="lg:col-span-1">
              <TextChat
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
