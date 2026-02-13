import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Conecta con personas de todo el mundo
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Chat de video aleatorio con filtros inteligentes y soporte global
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/chat')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Iniciar Chat (WebRTC)
          </button>
          <button
            onClick={() => navigate('/chat/jitsi')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Usar Jitsi Meet
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Jitsi Meet: Infraestructura pública y open source
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Filtros Inteligentes
          </h3>
          <p className="text-gray-600">
            Encuentra exactamente el tipo de persona que buscas con nuestros filtros de categoría
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Soporte Global
          </h3>
          <p className="text-gray-600">
            Conecta con usuarios de 6 regiones diferentes con servidores optimizados
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            100% Anónimo
          </h3>
          <p className="text-gray-600">
            Tu privacidad es nuestra prioridad. Sin registro, sin datos personales
          </p>
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Características Adicionales
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Enlaces Compartibles
              </h4>
              <p className="text-gray-600 text-sm">
                Invita a amigos específicos con enlaces únicos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Bots de IA
              </h4>
              <p className="text-gray-600 text-sm">
                Siempre hay alguien disponible para chatear
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Chat de Texto
              </h4>
              <p className="text-gray-600 text-sm">
                Fallback automático si el video no está disponible
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Moderación Activa
              </h4>
              <p className="text-gray-600 text-sm">
                Sistema de reportes y moderación para tu seguridad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
