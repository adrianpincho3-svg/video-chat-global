import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Acerca de Random Video Chat
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            Random Video Chat es una plataforma moderna de chat de video aleatorio que conecta
            personas de todo el mundo de manera segura y anónima.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Nuestra Misión
          </h2>
          <p className="text-gray-600 mb-4">
            Facilitar conexiones genuinas entre personas de diferentes culturas y regiones,
            manteniendo la privacidad y seguridad como prioridades fundamentales.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Características Principales
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Chat de video aleatorio con WebRTC</li>
            <li>Filtros de emparejamiento inteligentes</li>
            <li>Soporte para 6 regiones geográficas</li>
            <li>Enlaces compartibles para invitar amigos</li>
            <li>Bots de IA cuando no hay usuarios disponibles</li>
            <li>100% anónimo y privado</li>
            <li>Moderación activa y sistema de reportes</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Privacidad y Seguridad
          </h2>
          <p className="text-gray-600 mb-4">
            No almacenamos mensajes ni datos personales. Todas las conexiones son peer-to-peer
            y los datos de sesión se eliminan automáticamente al terminar el chat.
          </p>
        </div>
      </div>
    </div>
  );
}
