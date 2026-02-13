import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Report {
  reportId: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  status: 'pending' | 'assigned' | 'resolved';
  createdAt: string;
}

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al obtener reportes');
      }

      const data = await response.json();
      setReports(data.reports || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleBanUser = async (userId: string, duration: number) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/ban`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duration,
            reason: 'Violación de términos de servicio',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al bloquear usuario');
      }

      alert('Usuario bloqueado exitosamente');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Error al bloquear usuario');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Reportes
            </h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay reportes pendientes
            </h3>
            <p className="text-gray-600">
              Todos los reportes han sido procesados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.reportId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {report.reason}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reportado: {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : report.status === 'assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {report.status === 'pending'
                      ? 'Pendiente'
                      : report.status === 'assigned'
                      ? 'Asignado'
                      : 'Resuelto'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Descripción:</span> {report.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Usuario reportado:</span> {report.reportedUserId}
                  </p>
                </div>

                {report.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBanUser(report.reportedUserId, 24)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
                    >
                      Bloquear 24h
                    </button>
                    <button
                      onClick={() => handleBanUser(report.reportedUserId, 168)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                    >
                      Bloquear 7 días
                    </button>
                    <button
                      onClick={() => handleBanUser(report.reportedUserId, -1)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
                    >
                      Bloquear Permanente
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
