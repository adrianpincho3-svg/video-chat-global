import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useSignaling } from '../hooks/useSignaling';
import JitsiMeeting from '../components/JitsiMeeting';
import FilterSelection from '../components/FilterSelection';
import WaitingRoom from '../components/WaitingRoom';

type JitsiChatState = 'filter-selection' | 'waiting' | 'in-chat';

export default function JitsiChatPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { socket, startMatching, cancelMatching } = useSignaling();
  
  const [chatState, setChatState] = useState<JitsiChatState>('filter-selection');
  const [jitsiRoomName, setJitsiRoomName] = useState<string>('');
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Escuchar cuando se encuentra un match
    socket.on('matched', (data: { sessionId: string; peerId: string; jitsiRoom?: string }) => {
      console.log('✅ Match encontrado (Jitsi):', data);
      
      if (data.jitsiRoom) {
        setJitsiRoomName(data.jitsiRoom);
        setChatState('in-chat');
      }
    });

    socket.on('error', (data: { message: string }) => {
      console.error('❌ Error:', data.message);
      alert(data.message);
      setChatState('filter-selection');
    });

    return () => {
      socket.off('matched');
      socket.off('error');
    };
  }, [socket]);

  // Timer para sala de espera
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (chatState === 'waiting') {
      interval = setInterval(() => {
        setWaitingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setWaitingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatState]);

  const handleStartMatching = () => {
    if (!state.userCategory || !state.matchingFilter) {
      alert('Por favor selecciona tu categoría y filtro de emparejamiento');
      return;
    }

    setChatState('waiting');
    startMatching(
      state.userCategory,
      state.matchingFilter,
      state.regionFilter || undefined
    );
  };

  const handleCancelMatching = () => {
    cancelMatching();
    setChatState('filter-selection');
  };

  const handleMeetingEnd = () => {
    setChatState('filter-selection');
    setJitsiRoomName('');
  };

  const handleNext = () => {
    handleMeetingEnd();
    // Automáticamente iniciar nueva búsqueda
    setTimeout(() => {
      handleStartMatching();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chat con Jitsi Meet
              </h1>
              <p className="text-sm text-gray-600">
                Usando infraestructura pública de Jitsi
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-600 hover:text-gray-900"
              >
                Usar WebRTC Nativo
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {chatState === 'filter-selection' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Configurar Chat
              </h2>
              <FilterSelection
                onStartChat={handleStartMatching}
                onCancel={() => navigate('/')}
                detectedRegion={state.detectedRegion || 'north-america'}
              />
              <button
                onClick={handleStartMatching}
                disabled={!state.userCategory || !state.matchingFilter}
                className="w-full mt-6 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
              >
                Buscar Pareja
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                ℹ️ Acerca de Jitsi Meet
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span>✅</span>
                  <span>Infraestructura pública y gratuita</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✅</span>
                  <span>Open source y confiable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✅</span>
                  <span>Calidad de video HD</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✅</span>
                  <span>Funciona en todos los navegadores</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {chatState === 'waiting' && (
          <div className="max-w-2xl mx-auto">
            <WaitingRoom
              onCancel={handleCancelMatching}
              onAcceptBot={() => {}}
            />
          </div>
        )}

        {chatState === 'in-chat' && jitsiRoomName && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Chat Activo</h2>
                  <p className="text-sm opacity-90">Sala: {jitsiRoomName}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleNext}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={handleMeetingEnd}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Terminar
                  </button>
                </div>
              </div>
            </div>

            <div style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
              <JitsiMeeting
                roomName={jitsiRoomName}
                displayName={`User-${state.userCategory || 'Anonymous'}`}
                onMeetingEnd={handleMeetingEnd}
                onParticipantJoined={(participant) => {
                  console.log('Participant joined:', participant);
                }}
                onParticipantLeft={(participant) => {
                  console.log('Participant left:', participant);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
