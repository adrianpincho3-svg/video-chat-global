import React, { useState } from 'react';
import type { ShareableLink as ShareableLinkType } from '../types';

interface ShareableLinkProps {
  onLinkCreated?: (link: ShareableLinkType) => void;
}

export const ShareableLink: React.FC<ShareableLinkProps> = ({ onLinkCreated }) => {
  const [link, setLink] = useState<ShareableLinkType | null>(null);
  const [isReusable, setIsReusable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/links/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reusable: isReusable }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      const data = await response.json();
      setLink(data.link);
      onLinkCreated?.(data.link);
    } catch (error) {
      console.error('Error creating link:', error);
      alert('Error al crear el enlace. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!link) return;

    const fullUrl = `${window.location.origin}/join/${link.linkId}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Compartir Enlace</h3>
      
      {!link ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reusable"
              checked={isReusable}
              onChange={(e) => setIsReusable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="reusable" className="text-sm text-gray-700">
              Enlace reutilizable (permite múltiples usos)
            </label>
          </div>

          <button
            onClick={generateLink}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generando...' : 'Generar Enlace'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Tu enlace:</p>
            <p className="text-sm font-mono break-all text-gray-800">
              {window.location.origin}/join/{link.linkId}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
            <button
              onClick={() => setLink(null)}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Nuevo Enlace
            </button>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p>• Tipo: {link.reusable ? 'Reutilizable' : 'Un solo uso'}</p>
            <p>• Expira: {new Date(link.expiresAt).toLocaleString()}</p>
            {!link.reusable && <p className="text-amber-600">⚠️ Este enlace se invalidará después del primer uso</p>}
          </div>
        </div>
      )}
    </div>
  );
};
