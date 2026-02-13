import React, { useState, useEffect } from 'react';

interface WaitingRoomProps {
  onCancel: () => void;
  onAcceptBot?: () => void;
}

export default function WaitingRoom({ onCancel, onAcceptBot }: WaitingRoomProps) {
  const [waitTime, setWaitTime] = useState(0);
  const [showBotOffer, setShowBotOffer] = useState(false);

  useEffect(() => {
    // Incrementar tiempo de espera cada segundo
    const timer = setInterval(() => {
      setWaitTime((prev) => prev + 1);
    }, 1000);

    // Mostrar oferta de bot después de 10 segundos
    const botTimer = setTimeout(() => {
      setShowBotOffer(true);
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(botTimer);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        {/* Animación de búsqueda */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Buscando pareja...
          </h2>
          <p className="text-gray-600">
            Estamos buscando a alguien compatible para ti
          </p>
        </div>

        {/* Tiempo de espera */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Tiempo de espera:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatTime(waitTime)}
            </span>
          </div>
        </div>

        {/* Oferta de bot */}
        {showBotOffer && onAcceptBot && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  ¿Quieres chatear con un bot de IA?
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  No hay usuarios disponibles en este momento. Puedes chatear con nuestro bot de IA mientras esperas.
                </p>
                <button
                  onClick={onAcceptBot}
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Chatear con Bot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Consejos */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            💡 Consejos mientras esperas:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Asegúrate de tener buena iluminación</li>
            <li>• Verifica que tu cámara y micrófono funcionen</li>
            <li>• Sé respetuoso y amigable</li>
          </ul>
        </div>

        {/* Botón cancelar */}
        <button
          onClick={onCancel}
          className="w-full py-3 px-6 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
        >
          Cancelar Búsqueda
        </button>
      </div>
    </div>
  );
}
