import React, { useState } from 'react';
import { UserCategory, MatchingFilter, Region } from '../types';

interface FilterSelectionProps {
  onStartChat: (userCategory: UserCategory, filter: MatchingFilter, regionFilter: Region) => void;
  onCancel: () => void;
  detectedRegion: Region | null;
}

const CATEGORY_OPTIONS: { value: UserCategory; label: string; icon: string }[] = [
  { value: 'male', label: 'Masculino', icon: '👨' },
  { value: 'female', label: 'Femenino', icon: '👩' },
  { value: 'couple', label: 'Pareja', icon: '👫' },
];

const FILTER_OPTIONS: { value: MatchingFilter; label: string }[] = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'couple', label: 'Parejas' },
];

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: 'any', label: 'Cualquier región' },
  { value: 'north-america', label: 'América del Norte' },
  { value: 'south-america', label: 'América del Sur' },
  { value: 'europe', label: 'Europa' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'África' },
  { value: 'oceania', label: 'Oceanía' },
];

export default function FilterSelection({
  onStartChat,
  onCancel,
  detectedRegion,
}: FilterSelectionProps) {
  const [userCategory, setUserCategory] = useState<UserCategory | null>(null);
  const [matchingFilter, setMatchingFilter] = useState<MatchingFilter>('any');
  const [regionFilter, setRegionFilter] = useState<Region>(detectedRegion || 'any');

  const handleStartChat = () => {
    if (!userCategory) {
      alert('Por favor selecciona tu categoría');
      return;
    }

    onStartChat(userCategory, matchingFilter, regionFilter);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Configurar Preferencias
        </h2>

        {/* Categoría de Usuario */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tu categoría <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setUserCategory(option.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    userCategory === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Emparejamiento */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Buscar
          </label>
          <select
            value={matchingFilter}
            onChange={(e) => setMatchingFilter(e.target.value as MatchingFilter)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Región */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Región preferida
          </label>
          {detectedRegion && (
            <p className="text-sm text-gray-600 mb-2">
              Tu región detectada: <span className="font-medium">{REGION_OPTIONS.find(r => r.value === detectedRegion)?.label}</span>
            </p>
          )}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as Region)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {REGION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Selecciona una región específica para mejores conexiones o "Cualquier región" para buscar globalmente
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartChat}
            disabled={!userCategory}
            className={`
              flex-1 py-3 px-6 rounded-lg font-semibold transition-colors
              ${
                userCategory
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Iniciar Chat
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Nota de privacidad */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Tu privacidad es importante. No almacenamos datos personales.
        </p>
      </div>
    </div>
  );
}
