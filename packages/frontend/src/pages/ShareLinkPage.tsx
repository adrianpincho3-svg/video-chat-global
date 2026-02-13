import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShareableLink } from '../components/ShareableLink';

export default function ShareLinkPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Volver al inicio</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Crear Enlace Compartible
        </h1>
        <p className="text-lg text-gray-600">
          Genera un enlace único para invitar a alguien específico a chatear contigo
        </p>
      </div>

      <ShareableLink />

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          ℹ️ Cómo funciona
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="font-semibold">1.</span>
            <span>Genera un enlace único (de un solo uso o reutilizable)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold">2.</span>
            <span>Comparte el enlace con la persona que quieres invitar</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold">3.</span>
            <span>Cuando hagan clic en el enlace, se conectarán directamente contigo</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-semibold">4.</span>
            <span>Los enlaces expiran después de 24 horas</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          ⚠️ Importante
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Debes estar disponible cuando la otra persona use el enlace</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Los enlaces de un solo uso se invalidan después del primer uso</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Los enlaces reutilizables permiten múltiples conexiones</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
