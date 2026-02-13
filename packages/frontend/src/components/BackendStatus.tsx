import { useEffect, useState } from 'react';

interface BackendStatusProps {
  connected: boolean;
}

export default function BackendStatus({ connected }: BackendStatusProps) {
  const [showHelp, setShowHelp] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const isProduction = window.location.hostname !== 'localhost';

  useEffect(() => {
    // Mostrar ayuda después de 5 segundos si no conecta
    const timer = setTimeout(() => {
      if (!connected) {
        setShowHelp(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [connected]);

  if (connected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
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
            <h3 className="text-sm font-bold text-red-900 mb-1">
              ⚠️ Backend No Disponible
            </h3>
            <p className="text-xs text-red-700 mb-2">
              No se puede conectar al servidor. La aplicación no funcionará hasta que se despliegue el backend.
            </p>
            
            {showHelp && (
              <div className="mt-3 space-y-2">
                <div className="bg-white rounded p-2 text-xs">
                  <p className="font-semibold text-gray-900 mb-1">
                    🔧 Configuración Actual:
                  </p>
                  <p className="text-gray-600 font-mono break-all">
                    {backendUrl || 'No configurada (usando localhost)'}
                  </p>
                </div>

                {isProduction && !backendUrl && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">
                      ❌ Problema Detectado:
                    </p>
                    <p className="text-xs text-yellow-800">
                      La variable <code className="bg-yellow-100 px-1 rounded">VITE_BACKEND_URL</code> no está configurada en Vercel.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    ✅ Solución:
                  </p>
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Despliega el backend en Railway</li>
                    <li>Copia la URL de Railway</li>
                    <li>Agrégala en Vercel como <code className="bg-blue-100 px-1 rounded">VITE_BACKEND_URL</code></li>
                    <li>Redeploy en Vercel</li>
                  </ol>
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}

            {!showHelp && (
              <button
                onClick={() => setShowHelp(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium underline"
              >
                Ver solución
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
