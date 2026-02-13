import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Random Video Chat. Todos los derechos reservados.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
