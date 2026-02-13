-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Tabla de reportes de usuarios
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id VARCHAR(255) NOT NULL,
  reporter_user_id VARCHAR(255),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  assigned_admin_id UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de resoluciones de reportes
CREATE TABLE IF NOT EXISTS report_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES user_reports(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  admin_id UUID REFERENCES admins(id),
  notes TEXT,
  resolved_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de bloqueos de usuarios
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  banned_by UUID REFERENCES admins(id),
  ban_type VARCHAR(20) NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  banned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, banned_at)
);

-- Tabla de intentos de acceso no autorizado
CREATE TABLE IF NOT EXISTS unauthorized_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  username VARCHAR(50),
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de métricas históricas
CREATE TABLE IF NOT EXISTS historical_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_sessions INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0,
  peak_concurrent_users INTEGER DEFAULT 0,
  region_distribution JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_expires_at ON user_bans(expires_at);
CREATE INDEX IF NOT EXISTS idx_historical_metrics_date ON historical_metrics(date DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_reports
CREATE TRIGGER update_user_reports_updated_at
    BEFORE UPDATE ON user_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar administrador por defecto (solo para desarrollo)
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO admins (username, password_hash, email)
VALUES (
  'admin',
  '$2b$10$rKvVJZ8xH5qJ5YqJ5YqJ5eJ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5Y',
  'admin@localhost'
)
ON CONFLICT (username) DO NOTHING;
