# Documento de Diseño: Random Video Chat

## Resumen

Random Video Chat es una aplicación web de chat aleatorio por video que conecta usuarios anónimos globalmente usando WebRTC para comunicación peer-to-peer y Socket.io para señalización. Los usuarios pueden seleccionar filtros de emparejamiento (Masculino, Femenino, o Parejas) y opcionalmente filtrar por región geográfica para encontrar el tipo de pareja que prefieren. El sistema utiliza servidores STUN/TURN distribuidos geográficamente para garantizar conexiones de video fluidas a larga distancia. La arquitectura está diseñada con tres capas principales: Frontend React, Backend de Señalización Node.js, y Servicios de IA para bots. El diseño prioriza escalabilidad, privacidad, y extensibilidad para soportar federación futura.

## Arquitectura

### Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Cliente (Navegador)"
        UI[React UI]
        WC[WebRTC Client]
        SC[Socket.io Client]
        ADMIN[Panel Admin React]
    end
    
    subgraph "Backend"
        SS[Servidor de Señalización<br/>Socket.io + Express]
        MM[Matching Manager]
        SM[Session Manager]
        LG[Link Generator]
        GEO[GeoIP Service]
        AUTH[Auth Service]
        ADMIN_API[Admin API]
        REPORT[Report Manager]
        METRICS[Metrics Service]
    end
    
    subgraph "Servicios Externos"
        STUN_NA[STUN/TURN<br/>América del Norte]
        STUN_EU[STUN/TURN<br/>Europa]
        STUN_AS[STUN/TURN<br/>Asia]
        STUN_SA[STUN/TURN<br/>América del Sur]
        AI[Servicio de IA<br/>OpenAI/Anthropic]
    end
    
    subgraph "Almacenamiento"
        REDIS[(Redis<br/>Cola + Sesiones)]
        DB[(PostgreSQL<br/>Reportes + Admins)]
    end
    
    UI --> SC
    UI --> WC
    ADMIN --> ADMIN_API
    SC <-->|Señalización| SS
    WC <-.->|ICE/SDP| SS
    WC <-->|P2P Media| WC
    SS --> MM
    SS --> SM
    SS --> LG
    SS --> GEO
    SS --> REPORT
    ADMIN_API --> AUTH
    ADMIN_API --> REPORT
    ADMIN_API --> METRICS
    ADMIN_API --> SM
    MM --> REDIS
    SM --> REDIS
    LG --> REDIS
    REPORT --> DB
    AUTH --> DB
    METRICS --> REDIS
    WC -.->|Región NA| STUN_NA
    WC -.->|Región EU| STUN_EU
    WC -.->|Región AS| STUN_AS
    WC -.->|Región SA| STUN_SA
    SS --> AI
    
    style UI fill:#61dafb
    style ADMIN fill:#ff6b6b
    style SS fill:#68a063
    style REDIS fill:#dc382d
    style DB fill:#336791
```

### Capas del Sistema

**1. Capa de Presentación (Frontend)**
- Framework: React 18+ con Hooks
- Gestión de estado: Context API + useReducer para estado de sesión
- WebRTC: API nativa del navegador con abstracción personalizada
- Comunicación: Socket.io-client para señalización en tiempo real

**2. Capa de Señalización (Backend)**
- Runtime: Node.js con Express
- WebSocket: Socket.io para comunicación bidireccional
- Gestión de sesiones: Redis para estado distribuido
- API REST: Endpoints para generación de enlaces y métricas

**3. Capa de Datos**
- Redis: Cola de espera, sesiones activas, enlaces compartibles (TTL), métricas en tiempo real
- PostgreSQL: Reportes de usuarios, cuentas de administradores, logs de moderación, bloqueos de usuarios
- Estructura en memoria: Sin persistencia de mensajes (privacidad)

**4. Servicios Externos**
- STUN/TURN: Múltiples servidores distribuidos geográficamente (Coturn o servicio cloud)
  - América del Norte: us-east, us-west
  - Europa: eu-west, eu-central
  - Asia: asia-east, asia-south
  - América del Sur: sa-east
  - África: af-south (opcional)
  - Oceanía: oc-southeast (opcional)
- IA: OpenAI API o Anthropic Claude para bots conversacionales
- GeoIP: Servicio de geolocalización (MaxMind GeoIP2, ipapi.co, o similar)

## Componentes e Interfaces

### Frontend Components

#### 1. App Component (Raíz)
```typescript
type UserCategory = 'male' | 'female' | 'couple';
type MatchingFilter = 'male' | 'female' | 'couple' | 'any';

interface AppState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  sessionState: 'idle' | 'filter-selection' | 'waiting' | 'in-chat';
  currentSession: Session | null;
  userCategory: UserCategory | null;
  matchingFilter: MatchingFilter;
}

interface Session {
  sessionId: string;
  peerId: string;
  isPeerBot: boolean;
  startTime: number;
}
```

#### 1.5. FilterSelection Component
```typescript
type UserCategory = 'male' | 'female' | 'couple';
type MatchingFilter = 'male' | 'female' | 'couple' | 'any';
type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

interface FilterSelectionProps {
  onStartChat: (userCategory: UserCategory, filter: MatchingFilter, regionFilter: Region) => void;
  onCancel: () => void;
  detectedRegion: Region; // Región detectada automáticamente
}

// Permite al usuario seleccionar:
// 1. Su propia categoría (Masculino, Femenino, Pareja)
// 2. Filtro de emparejamiento (Masculino, Femenino, Parejas, Cualquiera)
// 3. Filtro de región (América del Norte, América del Sur, Europa, Asia, África, Oceanía, Cualquier región)
// La región detectada se muestra como sugerencia pero el usuario puede cambiarla
```

#### 2. VideoChat Component
```typescript
interface VideoChatProps {
  localStream: MediaStream;
  remoteStream: MediaStream | null;
  onEndChat: () => void;
  onNextChat: () => void;
}

// Gestiona la visualización de video local y remoto
// Controles: mute, video on/off, end, next
```

#### 3. TextChat Component
```typescript
interface Message {
  id: string;
  sender: 'local' | 'remote';
  content: string;
  timestamp: number;
}

interface TextChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  disabled: boolean;
}
```

#### 4. WebRTCManager (Hook personalizado)
```typescript
interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface WebRTCManager {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  
  initializeMedia: () => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  setRemoteDescription: (desc: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  sendMessage: (message: string) => void;
  closeConnection: () => void;
}

// Hook: useWebRTC(config: WebRTCConfig): WebRTCManager
```

#### 5. SignalingClient (Hook personalizado)
```typescript
type UserCategory = 'male' | 'female' | 'couple';
type MatchingFilter = 'male' | 'female' | 'couple' | 'any';
type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

interface SignalingEvents {
  'matched': (data: { sessionId: string; peerId: string; isPeerBot: boolean }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'peer-disconnected': () => void;
  'text-message': (data: { message: string; timestamp: number }) => void;
  'region-detected': (data: { region: Region }) => void;
  'error': (data: { code: string; message: string }) => void;
}

interface SignalingClient {
  connected: boolean;
  
  startMatching: (userCategory: UserCategory, filter: MatchingFilter, regionFilter: Region) => void;
  cancelMatching: () => void;
  joinSession: (linkId: string) => void;
  sendOffer: (offer: RTCSessionDescriptionInit) => void;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => void;
  sendTextMessage: (message: string) => void;
  endSession: () => void;
  
  on: <K extends keyof SignalingEvents>(event: K, handler: SignalingEvents[K]) => void;
  off: <K extends keyof SignalingEvents>(event: K, handler: SignalingEvents[K]) => void;
}

// Hook: useSignaling(): SignalingClient
```

### Backend Components

#### 1. Signaling Server
```typescript
// Servidor Socket.io principal
interface SocketData {
  userId: string;
  sessionId?: string;
}

interface ServerToClientEvents {
  'matched': (data: MatchedData) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'peer-disconnected': () => void;
  'text-message': (data: { message: string; timestamp: number }) => void;
  'error': (data: ErrorData) => void;
}

interface ClientToServerEvents {
  'start-matching': (data: { userCategory: UserCategory; filter: MatchingFilter; regionFilter: Region }) => void;
  'cancel-matching': () => void;
  'join-session': (data: { linkId: string }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'text-message': (data: { message: string }) => void;
  'end-session': () => void;
}
```

#### 2. Matching Manager
```typescript
type UserCategory = 'male' | 'female' | 'couple';
type MatchingFilter = 'male' | 'female' | 'couple' | 'any';
type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

interface WaitingUser {
  userId: string;
  category: UserCategory;
  filter: MatchingFilter;
  region: Region; // Región detectada del usuario
  regionFilter: Region; // Preferencia de región para emparejamiento
  joinedAt: number;
}

interface MatchingManager {
  // Agrega usuario a la cola de espera con sus preferencias
  addToQueue(userId: string, category: UserCategory, filter: MatchingFilter, region: Region, regionFilter: Region): Promise<void>;
  
  // Remueve usuario de la cola
  removeFromQueue(userId: string): Promise<void>;
  
  // Intenta emparejar usuarios en la cola basándose en compatibilidad
  // Prioriza usuarios de la misma región preferida
  // Retorna par de userIds si hay match, null si no
  tryMatch(): Promise<[string, string] | null>;
  
  // Verifica si dos usuarios son compatibles según sus filtros
  areCompatible(user1: WaitingUser, user2: WaitingUser): boolean;
  
  // Calcula score de compatibilidad (mayor = mejor match)
  // Considera: filtros de categoría + preferencia de región
  calculateMatchScore(user1: WaitingUser, user2: WaitingUser): number;
  
  // Obtiene tiempo de espera de un usuario
  getWaitTime(userId: string): Promise<number>;
  
  // Verifica si debe ofrecer bot
  shouldOfferBot(userId: string): Promise<boolean>;
}

// Implementación usando Redis:
// - Lista por región: waiting_queue:{region} (para búsqueda optimizada)
// - Hash: waiting_user:{userId} -> WaitingUser
```

#### 3. GeoIP Service
```typescript
type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

interface GeoLocation {
  country: string;
  countryCode: string;
  region: Region;
  latitude: number;
  longitude: number;
}

interface GeoIPService {
  // Detecta región geográfica basándose en IP
  detectRegion(ipAddress: string): Promise<Region>;
  
  // Obtiene información geográfica completa
  getLocation(ipAddress: string): Promise<GeoLocation>;
  
  // Mapea código de país a región
  countryToRegion(countryCode: string): Region;
  
  // Obtiene servidores STUN/TURN más cercanos para una región
  getSTUNServers(region: Region): RTCIceServer[];
  
  // Obtiene servidores STUN/TURN óptimos para dos regiones
  getOptimalSTUNServers(region1: Region, region2: Region): RTCIceServer[];
}

// Mapeo de países a regiones:
// - América del Norte: US, CA, MX
// - América del Sur: BR, AR, CL, CO, PE, VE, etc.
// - Europa: GB, DE, FR, ES, IT, NL, etc.
// - Asia: CN, JP, IN, KR, SG, TH, etc.
// - África: ZA, EG, NG, KE, etc.
// - Oceanía: AU, NZ, etc.
```

#### 4. Session Manager
```typescript
interface SessionData {
  sessionId: string;
  user1Id: string;
  user2Id: string;
  isUser2Bot: boolean;
  createdAt: number;
  linkId?: string;
}

interface SessionManager {
  // Crea nueva sesión entre dos usuarios
  createSession(user1Id: string, user2Id: string, isBot: boolean): Promise<SessionData>;
  
  // Obtiene datos de sesión
  getSession(sessionId: string): Promise<SessionData | null>;
  
  // Obtiene sesión por userId
  getSessionByUser(userId: string): Promise<SessionData | null>;
  
  // Termina sesión
  endSession(sessionId: string): Promise<void>;
  
  // Registra métricas de sesión
  recordSessionMetrics(sessionId: string, duration: number): Promise<void>;
}

// Implementación usando Redis:
// - Hash: session:{sessionId} -> SessionData
// - Hash: user_session:{userId} -> sessionId
// - TTL: 1 hora para limpieza automática
```

#### 4. Link Generator
```typescript
interface ShareableLink {
  linkId: string;
  creatorId: string;
  createdAt: number;
  expiresAt: number;
  reusable: boolean;
  used: boolean;
}

interface LinkGenerator {
  // Genera nuevo enlace compartible
  createLink(userId: string, reusable: boolean, ttlSeconds: number): Promise<ShareableLink>;
  
  // Valida y obtiene enlace
  getLink(linkId: string): Promise<ShareableLink | null>;
  
  // Marca enlace como usado (si no es reutilizable)
  markLinkUsed(linkId: string): Promise<void>;
  
  // Invalida enlace
  invalidateLink(linkId: string): Promise<void>;
}

// Implementación usando Redis:
// - Hash: link:{linkId} -> ShareableLink
// - TTL: configurable (default 24 horas)
```

#### 5. AI Bot Service
```typescript
interface BotMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIBotService {
  // Inicializa conversación con bot
  initializeConversation(sessionId: string): Promise<void>;
  
  // Genera respuesta del bot
  generateResponse(sessionId: string, userMessage: string): Promise<string>;
  
  // Limpia conversación
  cleanupConversation(sessionId: string): Promise<void>;
}

// Implementación:
// - Mantiene historial de conversación en memoria (Map)
// - Usa OpenAI API o Claude API
// - Personalidad: amigable, conversacional, hace preguntas
```

#### 6. Auth Service
```typescript
interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminSession {
  sessionId: string;
  adminId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

interface AuthService {
  // Autentica administrador con credenciales
  authenticate(credentials: AdminCredentials): Promise<AdminSession | null>;
  
  // Valida sesión de administrador
  validateSession(sessionId: string): Promise<boolean>;
  
  // Actualiza última actividad de sesión
  updateActivity(sessionId: string): Promise<void>;
  
  // Cierra sesión de administrador
  logout(sessionId: string): Promise<void>;
  
  // Limpia sesiones expiradas (>30 minutos inactivas)
  cleanupExpiredSessions(): Promise<void>;
  
  // Registra intento de acceso no autorizado
  logUnauthorizedAccess(ipAddress: string, username?: string): Promise<void>;
}

// Implementación:
// - Passwords hasheados con bcrypt
// - Sesiones almacenadas en Redis con TTL de 30 minutos
// - Actualización de TTL en cada actividad
// - PostgreSQL para cuentas de administradores
```

#### 7. Report Manager
```typescript
type ReportReason = 'inappropriate-behavior' | 'offensive-content' | 'spam' | 'harassment' | 'other';
type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
type ModerationAction = 'no-action' | 'warning' | 'temporary-ban' | 'permanent-ban';

interface UserReport {
  reportId: string;
  reportedUserId: string;
  reporterUserId?: string; // Opcional si es anónimo
  reason: ReportReason;
  description: string;
  sessionId?: string;
  timestamp: number;
  status: ReportStatus;
  assignedAdmin?: string;
  resolution?: {
    action: ModerationAction;
    adminId: string;
    notes: string;
    resolvedAt: number;
  };
}

interface UserBan {
  userId: string;
  reason: string;
  bannedBy: string;
  bannedAt: number;
  expiresAt?: number; // null para ban permanente
  type: 'temporary' | 'permanent';
}

interface ReportManager {
  // Crea nuevo reporte
  createReport(report: Omit<UserReport, 'reportId' | 'timestamp' | 'status'>): Promise<UserReport>;
  
  // Obtiene reportes pendientes
  getPendingReports(): Promise<UserReport[]>;
  
  // Obtiene reporte por ID
  getReport(reportId: string): Promise<UserReport | null>;
  
  // Asigna reporte a administrador
  assignReport(reportId: string, adminId: string): Promise<void>;
  
  // Resuelve reporte con acción de moderación
  resolveReport(reportId: string, action: ModerationAction, adminId: string, notes: string): Promise<void>;
  
  // Bloquea usuario
  banUser(userId: string, reason: string, adminId: string, duration?: number): Promise<void>;
  
  // Verifica si usuario está bloqueado
  isUserBanned(userId: string): Promise<boolean>;
  
  // Obtiene historial de reportes de un usuario
  getUserReportHistory(userId: string): Promise<UserReport[]>;
  
  // Termina sesiones activas de usuario bloqueado
  terminateUserSessions(userId: string): Promise<void>;
}

// Implementación:
// - PostgreSQL para almacenamiento persistente de reportes
// - Redis para cache de usuarios bloqueados (verificación rápida)
// - Notificaciones en tiempo real a administradores vía WebSocket
```

#### 8. Metrics Service
```typescript
interface RealtimeMetrics {
  activeUsers: number;
  activeSessions: number;
  waitingUsers: number;
  averageSessionDuration: number;
  totalSessionsToday: number;
  usersByRegion: Record<Region, number>;
  usersByCategory: Record<UserCategory, number>;
  botSessionsPercentage: number;
}

interface HistoricalMetrics {
  date: string;
  totalSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  regionDistribution: Record<Region, number>;
}

interface MetricsService {
  // Obtiene métricas en tiempo real
  getRealtimeMetrics(): Promise<RealtimeMetrics>;
  
  // Obtiene métricas históricas por rango de fechas
  getHistoricalMetrics(startDate: string, endDate: string): Promise<HistoricalMetrics[]>;
  
  // Registra evento de sesión
  recordSessionEvent(sessionId: string, event: 'start' | 'end', metadata: any): Promise<void>;
  
  // Obtiene estadísticas de emparejamiento
  getMatchingStats(): Promise<{
    averageWaitTime: number;
    matchSuccessRate: number;
    botOfferRate: number;
  }>;
  
  // Obtiene logs del sistema (anonimizados)
  getSystemLogs(limit: number, offset: number): Promise<any[]>;
}

// Implementación:
// - Redis para métricas en tiempo real (contadores, sorted sets)
// - Agregación periódica a PostgreSQL para históricos
// - Anonimización de datos antes de almacenar
```

#### 9. Admin API
```typescript
// API REST para el panel de administrador
interface AdminAPI {
  // Autenticación
  'POST /api/admin/login': {
    body: AdminCredentials;
    response: { sessionId: string; username: string };
  };
  
  'POST /api/admin/logout': {
    headers: { 'X-Admin-Session': string };
    response: { success: boolean };
  };
  
  // Métricas
  'GET /api/admin/metrics/realtime': {
    headers: { 'X-Admin-Session': string };
    response: RealtimeMetrics;
  };
  
  'GET /api/admin/metrics/historical': {
    headers: { 'X-Admin-Session': string };
    query: { startDate: string; endDate: string };
    response: HistoricalMetrics[];
  };
  
  // Reportes
  'GET /api/admin/reports': {
    headers: { 'X-Admin-Session': string };
    query: { status?: ReportStatus; limit?: number };
    response: UserReport[];
  };
  
  'POST /api/admin/reports/:reportId/assign': {
    headers: { 'X-Admin-Session': string };
    response: { success: boolean };
  };
  
  'POST /api/admin/reports/:reportId/resolve': {
    headers: { 'X-Admin-Session': string };
    body: { action: ModerationAction; notes: string };
    response: { success: boolean };
  };
  
  // Moderación
  'POST /api/admin/users/:userId/ban': {
    headers: { 'X-Admin-Session': string };
    body: { reason: string; duration?: number };
    response: { success: boolean };
  };
  
  'GET /api/admin/users/:userId/history': {
    headers: { 'X-Admin-Session': string };
    response: UserReport[];
  };
  
  // Logs
  'GET /api/admin/logs': {
    headers: { 'X-Admin-Session': string };
    query: { limit?: number; offset?: number };
    response: any[];
  };
}

// Middleware de autenticación:
// - Verifica X-Admin-Session header en cada request
// - Valida sesión con AuthService
// - Actualiza última actividad
// - Retorna 401 si sesión inválida o expirada
```

## Modelos de Datos

### PostgreSQL Schema

```sql
-- Tabla de administradores
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Tabla de reportes de usuarios
CREATE TABLE user_reports (
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
CREATE TABLE report_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES user_reports(id),
  action VARCHAR(50) NOT NULL,
  admin_id UUID REFERENCES admins(id),
  notes TEXT,
  resolved_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de bloqueos de usuarios
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  banned_by UUID REFERENCES admins(id),
  ban_type VARCHAR(20) NOT NULL, -- 'temporary' o 'permanent'
  banned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, banned_at)
);

-- Tabla de intentos de acceso no autorizado
CREATE TABLE unauthorized_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  username VARCHAR(50),
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de métricas históricas
CREATE TABLE historical_metrics (
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
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_expires_at ON user_bans(expires_at);
```

### Redis Data Structures

```typescript
// Cola de espera por región (Lista) - organizada por región para búsqueda optimizada
Key: "waiting_queue:{region}"  // region = 'north-america', 'europe', 'asia', etc.
Type: List
Value: [userId1, userId2, ...]

// Datos de usuario en espera (Hash)
Key: "waiting_user:{userId}"
Type: Hash
Fields: {
  userId: string,
  category: 'male' | 'female' | 'couple',
  filter: 'male' | 'female' | 'couple' | 'any',
  region: 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania',
  regionFilter: 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any',
  joinedAt: timestamp,
  offeredBot: boolean
}
TTL: 5 minutos

// Sesión activa (Hash)
Key: "session:{sessionId}"
Type: Hash
Fields: {
  sessionId: string,
  user1Id: string,
  user2Id: string,
  user1Region: string,
  user2Region: string,
  isUser2Bot: boolean,
  createdAt: timestamp,
  linkId?: string
}
TTL: 1 hora

// Mapeo usuario -> sesión (String)
Key: "user_session:{userId}"
Type: String
Value: sessionId
TTL: 1 hora

// Enlace compartible (Hash)
Key: "link:{linkId}"
Type: Hash
Fields: {
  linkId: string,
  creatorId: string,
  createdAt: timestamp,
  expiresAt: timestamp,
  reusable: boolean,
  used: boolean
}
TTL: 24 horas (configurable)

// Métricas de sesión (Sorted Set para agregación)
Key: "metrics:sessions:daily:{date}"
Type: Sorted Set
Score: duration (segundos)
Member: sessionId
TTL: 30 días

// Sesión de administrador (Hash)
Key: "admin_session:{sessionId}"
Type: Hash
Fields: {
  sessionId: string,
  adminId: string,
  username: string,
  createdAt: timestamp,
  lastActivity: timestamp
}
TTL: 30 minutos (se renueva con cada actividad)

// Cache de usuarios bloqueados (Set)
Key: "banned_users"
Type: Set
Members: [userId1, userId2, ...]
TTL: Sin expiración (se actualiza manualmente)

// Métricas en tiempo real (Hash)
Key: "metrics:realtime"
Type: Hash
Fields: {
  activeUsers: number,
  activeSessions: number,
  waitingUsers: number,
  totalSessionsToday: number
}

// Distribución por región (Hash)
Key: "metrics:regions"
Type: Hash
Fields: {
  'north-america': number,
  'south-america': number,
  'europe': number,
  'asia': number,
  'africa': number,
  'oceania': number
}
```

### WebRTC Signaling Messages

```typescript
// Mensaje de oferta
interface OfferMessage {
  type: 'offer';
  sessionId: string;
  offer: RTCSessionDescriptionInit;
}

// Mensaje de respuesta
interface AnswerMessage {
  type: 'answer';
  sessionId: string;
  answer: RTCSessionDescriptionInit;
}

// Mensaje de candidato ICE
interface IceCandidateMessage {
  type: 'ice-candidate';
  sessionId: string;
  candidate: RTCIceCandidateInit;
}

// Mensaje de texto
interface TextMessage {
  type: 'text';
  sessionId: string;
  content: string;
  timestamp: number;
}
```

## Flujos de Trabajo Principales

### Flujo 1: Emparejamiento Aleatorio con Filtros

```mermaid
sequenceDiagram
    participant U1 as Usuario 1
    participant C1 as Cliente 1
    participant SS as Servidor Señalización
    participant MM as Matching Manager
    participant U2 as Usuario 2
    participant C2 as Cliente 2
    
    U1->>C1: Seleccionar categoría y filtro
    C1->>C1: Validar selección
    U1->>C1: Click "Iniciar Chat"
    C1->>SS: start-matching {category: 'male', filter: 'female'}
    SS->>MM: addToQueue(user1, 'male', 'female')
    
    U2->>C2: Seleccionar categoría y filtro
    U2->>C2: Click "Iniciar Chat"
    C2->>SS: start-matching {category: 'female', filter: 'male'}
    SS->>MM: addToQueue(user2, 'female', 'male')
    
    MM->>MM: tryMatch()
    MM->>MM: areCompatible(user1, user2)
    Note over MM: user1 busca 'female' y user2 es 'female'<br/>user2 busca 'male' y user1 es 'male'<br/>✓ Compatible
    MM-->>SS: Match: [user1, user2]
    
    SS->>C1: matched {sessionId, peerId: user2}
    SS->>C2: matched {sessionId, peerId: user1}
    
    C1->>C1: Inicializar WebRTC
    C1->>SS: offer {sdp}
    SS->>C2: offer {sdp}
    
    C2->>C2: Procesar oferta
    C2->>SS: answer {sdp}
    SS->>C1: answer {sdp}
    
    C1->>SS: ice-candidate
    SS->>C2: ice-candidate
    C2->>SS: ice-candidate
    SS->>C1: ice-candidate
    
    C1<-->C2: Conexión P2P establecida
```

### Lógica de Compatibilidad de Filtros

```typescript
function areCompatible(user1: WaitingUser, user2: WaitingUser): boolean {
  // Verificar si la categoría de user1 coincide con el filtro de user2
  const user1MatchesUser2Filter = 
    user2.filter === 'any' || user2.filter === user1.category;
  
  // Verificar si la categoría de user2 coincide con el filtro de user1
  const user2MatchesUser1Filter = 
    user1.filter === 'any' || user1.filter === user2.category;
  
  // Ambas condiciones deben cumplirse para ser compatibles
  return user1MatchesUser2Filter && user2MatchesUser1Filter;
}

// Ejemplos:
// user1: {category: 'male', filter: 'female'}
// user2: {category: 'female', filter: 'male'}
// → Compatible ✓

// user1: {category: 'male', filter: 'female'}
// user2: {category: 'male', filter: 'female'}
// → No compatible ✗ (ambos buscan 'female' pero ambos son 'male')

// user1: {category: 'couple', filter: 'any'}
// user2: {category: 'male', filter: 'couple'}
// → Compatible ✓
```

### Lógica de Emparejamiento con Regiones

```typescript
function calculateMatchScore(user1: WaitingUser, user2: WaitingUser): number {
  let score = 0;
  
  // Verificar compatibilidad básica de categorías (requisito obligatorio)
  if (!areCompatible(user1, user2)) {
    return -1; // No compatible
  }
  
  // Puntos base por compatibilidad
  score += 100;
  
  // Bonus por coincidencia de región preferida
  // Si user1 prefiere la región de user2
  if (user1.regionFilter === 'any' || user1.regionFilter === user2.region) {
    score += 50;
  }
  
  // Si user2 prefiere la región de user1
  if (user2.regionFilter === 'any' || user2.regionFilter === user1.region) {
    score += 50;
  }
  
  // Bonus adicional si ambos están en la misma región
  if (user1.region === user2.region) {
    score += 30;
  }
  
  // Penalización por tiempo de espera (priorizar usuarios que esperan más)
  const avgWaitTime = (Date.now() - user1.joinedAt + Date.now() - user2.joinedAt) / 2;
  score += Math.min(avgWaitTime / 1000, 50); // Máximo 50 puntos por espera
  
  return score;
}

// Algoritmo de emparejamiento:
// 1. Obtener todos los usuarios en espera
// 2. Para cada par posible, calcular score de compatibilidad
// 3. Ordenar pares por score (mayor a menor)
// 4. Seleccionar el par con mayor score
// 5. Si no hay pares compatibles (score > 0), retornar null

// Ejemplos de scores:
// user1: {category: 'male', filter: 'female', region: 'north-america', regionFilter: 'any'}
// user2: {category: 'female', filter: 'male', region: 'north-america', regionFilter: 'north-america'}
// → Score: 100 (base) + 50 (user1 acepta cualquier región) + 50 (user2 prefiere NA y user1 es NA) + 30 (misma región) = 230

// user1: {category: 'male', filter: 'female', region: 'europe', regionFilter: 'asia'}
// user2: {category: 'female', filter: 'male', region: 'asia', regionFilter: 'europe'}
// → Score: 100 (base) + 50 (user1 prefiere Asia y user2 es Asia) + 50 (user2 prefiere Europa y user1 es Europa) = 200

// user1: {category: 'male', filter: 'female', region: 'north-america', regionFilter: 'europe'}
// user2: {category: 'female', filter: 'male', region: 'asia', regionFilter: 'south-america'}
// → Score: 100 (base) + 0 (preferencias de región no coinciden) = 100 (compatible pero no ideal)
```

### Configuración de Servidores STUN/TURN Distribuidos

```typescript
// Configuración de servidores por región
const STUN_TURN_SERVERS: Record<Region, RTCIceServer[]> = {
  'north-america': [
    { urls: 'stun:stun-na-east.example.com:3478' },
    { urls: 'stun:stun-na-west.example.com:3478' },
    {
      urls: 'turn:turn-na-east.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'south-america': [
    { urls: 'stun:stun-sa-east.example.com:3478' },
    {
      urls: 'turn:turn-sa-east.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'europe': [
    { urls: 'stun:stun-eu-west.example.com:3478' },
    { urls: 'stun:stun-eu-central.example.com:3478' },
    {
      urls: 'turn:turn-eu-west.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'asia': [
    { urls: 'stun:stun-asia-east.example.com:3478' },
    { urls: 'stun:stun-asia-south.example.com:3478' },
    {
      urls: 'turn:turn-asia-east.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'africa': [
    { urls: 'stun:stun-af-south.example.com:3478' },
    {
      urls: 'turn:turn-af-south.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'oceania': [
    { urls: 'stun:stun-oc-southeast.example.com:3478' },
    {
      urls: 'turn:turn-oc-southeast.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  'any': [] // Se llenará dinámicamente
};

// Función para obtener servidores óptimos para una sesión
function getOptimalSTUNServers(region1: Region, region2: Region): RTCIceServer[] {
  const servers: RTCIceServer[] = [];
  
  // Agregar servidores de ambas regiones
  if (region1 !== 'any') {
    servers.push(...STUN_TURN_SERVERS[region1]);
  }
  
  if (region2 !== 'any' && region2 !== region1) {
    servers.push(...STUN_TURN_SERVERS[region2]);
  }
  
  // Agregar servidores públicos de Google como fallback
  servers.push({ urls: 'stun:stun.l.google.com:19302' });
  servers.push({ urls: 'stun:stun1.l.google.com:19302' });
  
  return servers;
}

// El servidor de señalización envía la configuración de ICE servers
// al cliente cuando se establece una sesión, basándose en las regiones
// de ambos peers
```

### Flujo 2: Enlace Compartible

```mermaid
sequenceDiagram
    participant U1 as Usuario Creador
    participant C1 as Cliente 1
    participant SS as Servidor
    participant LG as Link Generator
    participant U2 as Usuario Invitado
    participant C2 as Cliente 2
    
    U1->>C1: Click "Crear Enlace"
    C1->>SS: POST /api/links/create
    SS->>LG: createLink(userId, reusable, ttl)
    LG-->>SS: {linkId, url}
    SS-->>C1: {linkId, url}
    C1->>U1: Mostrar URL
    
    U1->>U2: Compartir URL (fuera del sistema)
    
    U2->>C2: Abrir URL
    C2->>SS: join-session {linkId}
    SS->>LG: getLink(linkId)
    LG-->>SS: LinkData
    SS->>SS: Validar enlace
    
    alt Creador disponible
        SS->>C1: matched {sessionId, peerId: user2}
        SS->>C2: matched {sessionId, peerId: user1}
        Note over C1,C2: Continúa con negociación WebRTC
    else Creador no disponible
        SS->>C2: error {code: 'creator-unavailable'}
        C2->>U2: Mostrar opciones alternativas
    end
```

### Flujo 3: Bot de IA

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Cliente
    participant SS as Servidor
    participant MM as Matching Manager
    participant AI as AI Bot Service
    
    U->>C: Click "Iniciar Chat"
    C->>SS: start-matching
    SS->>MM: addToQueue(userId)
    
    loop Cada 2 segundos
        MM->>MM: tryMatch()
        MM-->>SS: null (sin match)
    end
    
    Note over MM: 10 segundos transcurridos
    MM->>MM: shouldOfferBot(userId)
    MM-->>SS: true
    
    SS->>C: offer-bot-match
    U->>C: Aceptar bot
    C->>SS: accept-bot
    
    SS->>AI: initializeConversation(sessionId)
    SS->>C: matched {sessionId, peerId: 'bot', isPeerBot: true}
    
    C->>C: Simular video con avatar
    
    U->>C: Escribir mensaje
    C->>SS: text-message {content}
    SS->>AI: generateResponse(sessionId, content)
    AI-->>SS: respuesta
    SS->>C: text-message {content: respuesta}
    
    U->>C: Click "Terminar"
    C->>SS: end-session
    SS->>AI: cleanupConversation(sessionId)
```

## Preparación para Federación

### Identificadores Globales

Para soportar federación futura, todos los identificadores de usuario incluirán el dominio del servidor:

```typescript
// Formato de userId federado
type FederatedUserId = `${localId}@${domain}`;

// Ejemplo: "abc123@chat.example.com"

interface UserIdentifier {
  localId: string;      // "abc123"
  domain: string;       // "chat.example.com"
  full: FederatedUserId; // "abc123@chat.example.com"
}

// Función helper
function parseUserId(userId: string): UserIdentifier {
  const [localId, domain] = userId.split('@');
  return { localId, domain: domain || 'localhost', full: userId as FederatedUserId };
}
```

### Protocolo de Señalización Extensible

El protocolo Socket.io se diseña para ser extensible a comunicación servidor-a-servidor:

```typescript
// Mensajes actuales (cliente-servidor)
interface LocalSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  sessionId: string;
  payload: any;
}

// Mensajes futuros (servidor-servidor)
interface FederatedSignalingMessage extends LocalSignalingMessage {
  sourceServer: string;    // Dominio del servidor origen
  targetServer: string;    // Dominio del servidor destino
  signature: string;       // Firma criptográfica para autenticación
  timestamp: number;
}
```

### API de Federación (Diseño Futuro)

```typescript
// Endpoints para comunicación entre servidores
interface FederationAPI {
  // Consultar usuarios disponibles en servidor remoto
  'GET /federation/available-users': {
    response: { count: number; serverLoad: number };
  };
  
  // Solicitar emparejamiento con usuario remoto
  'POST /federation/request-match': {
    body: { localUserId: string; remoteUserId: string };
    response: { sessionId: string; accepted: boolean };
  };
  
  // Retransmitir señalización WebRTC
  'POST /federation/relay-signal': {
    body: FederatedSignalingMessage;
    response: { delivered: boolean };
  };
}
```

### Arquitectura Federada (Visión Futura)

```mermaid
graph TB
    subgraph "Servidor A (chat.example.com)"
        SA[Servidor Señalización A]
        MMA[Matching Manager A]
        REDISA[(Redis A)]
    end
    
    subgraph "Servidor B (chat.other.com)"
        SB[Servidor Señalización B]
        MMB[Matching Manager B]
        REDISB[(Redis B)]
    end
    
    subgraph "Servidor C (chat.third.com)"
        SC[Servidor Señalización C]
        MMC[Matching Manager C]
        REDISC[(Redis C)]
    end
    
    U1[Usuario A1] --> SA
    U2[Usuario A2] --> SA
    U3[Usuario B1] --> SB
    U4[Usuario C1] --> SC
    
    SA <-->|Federation API| SB
    SB <-->|Federation API| SC
    SA <-->|Federation API| SC
    
    SA --> MMA --> REDISA
    SB --> MMB --> REDISB
    SC --> MMC --> REDISC
    
    style SA fill:#68a063
    style SB fill:#68a063
    style SC fill:#68a063
```

## Propiedades de Correctness

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de correctness verificables por máquina.*

Antes de definir las propiedades, realizaré el análisis de prework para determinar qué criterios de aceptación son testables:


### Propiedades Testables

#### Propiedad 1: Agregar a cola de espera
*Para cualquier* usuario que solicite iniciar chat, el sistema debe agregar ese usuario a la Cola_de_Espera y el usuario debe aparecer en la cola.
**Valida: Requisitos 2.1**

#### Propiedad 2: Emparejamiento con cola suficiente
*Para cualquier* Cola_de_Espera con dos o más usuarios, ejecutar el algoritmo de emparejamiento debe resultar en la creación de una Sesión_de_Chat y la remoción de ambos usuarios emparejados de la cola.
**Valida: Requisitos 2.2, 2.4**

#### Propiedad 3: Usuario solo permanece en cola
*Para cualquier* Cola_de_Espera con exactamente un usuario, ese usuario debe permanecer en la cola hasta que otro usuario se una.
**Valida: Requisitos 2.5**

#### Propiedad 4: Cancelar remueve de cola
*Para cualquier* usuario en la Cola_de_Espera, cuando ese usuario cancela la búsqueda, el usuario debe ser removido de la cola.
**Valida: Requisitos 2.6**

#### Propiedad 5: Almacenamiento de preferencias de filtro
*Para cualquier* usuario que selecciona un Filtro_de_Emparejamiento, el sistema debe almacenar la preferencia asociada con ese usuario para el proceso de emparejamiento.
**Valida: Requisitos 1.2**

#### Propiedad 6: Requerimiento de categoría de usuario
*Para cualquier* solicitud de iniciar chat sin especificar Categoría_de_Usuario, el sistema debe rechazar la solicitud.
**Valida: Requisitos 1.3**

#### Propiedad 7: Validación de categoría de usuario
*Para cualquier* valor de Categoría_de_Usuario proporcionado, el sistema debe aceptar únicamente 'male', 'female', o 'couple', y rechazar cualquier otro valor.
**Valida: Requisitos 1.4**

#### Propiedad 8: Filtro predeterminado
*Para cualquier* usuario que no selecciona explícitamente un Filtro_de_Emparejamiento, el sistema debe usar 'any' como valor predeterminado.
**Valida: Requisitos 1.5**

#### Propiedad 9: Agregar a cola con preferencias
*Para cualquier* usuario que solicita iniciar chat con un Filtro_de_Emparejamiento específico, el usuario debe ser agregado a la Cola_de_Espera con su categoría y filtro almacenados.
**Valida: Requisitos 2.1**

#### Propiedad 10: Emparejamiento compatible
*Para cualquier* par de usuarios emparejados de la Cola_de_Espera, la Categoría_de_Usuario de cada usuario debe coincidir con el Filtro_de_Emparejamiento del otro (o el filtro debe ser 'any').
**Valida: Requisitos 2.2, 2.3**

#### Propiedad 11: Usuario sin match compatible permanece en cola
*Para cualquier* usuario en la Cola_de_Espera cuyo filtro no es compatible con ningún otro usuario disponible, ese usuario debe permanecer en la cola hasta que un usuario compatible se una.
**Valida: Requisitos 2.5**

#### Propiedad 32: Detección automática de región
*Para cualquier* usuario que se conecta al sistema, el sistema debe detectar automáticamente la región geográfica del usuario basándose en su dirección IP.
**Valida: Requisitos 9.2**

#### Propiedad 33: Priorización de región preferida
*Para cualquier* usuario con un Filtro_de_Región específico (no 'any'), el sistema debe priorizar emparejamiento con usuarios de la región especificada cuando estén disponibles.
**Valida: Requisitos 9.3**

#### Propiedad 34: Expansión de búsqueda a otras regiones
*Para cualquier* usuario esperando en la Cola_de_Espera sin usuarios compatibles en su región preferida, el sistema debe eventualmente expandir la búsqueda a otras regiones.
**Valida: Requisitos 9.4**

#### Propiedad 35: Selección óptima de servidores STUN/TURN
*Para cualquier* sesión WebRTC establecida, la configuración de ICE servers debe incluir servidores STUN/TURN de las regiones geográficas de ambos peers.
**Valida: Requisitos 9.1, 9.5**

#### Propiedad 36: Filtro de región predeterminado
*Para cualquier* usuario que no especifica explícitamente un Filtro_de_Región, el sistema debe usar 'any' como valor predeterminado, permitiendo emparejamiento con usuarios de cualquier región.
**Valida: Requisitos 9.6**

#### Propiedad 57: Autenticación requerida para panel de administrador
*Para cualquier* intento de acceso al Panel_de_Administrador sin credenciales válidas, el sistema debe rechazar el acceso.
**Valida: Requisitos 13.1**

#### Propiedad 58: Verificación de rol de administrador
*Para cualquier* usuario autenticado, el sistema debe verificar que tiene rol de administrador antes de otorgar acceso al panel.
**Valida: Requisitos 13.2**

#### Propiedad 59: Creación de reportes
*Para cualquier* reporte de comportamiento inapropiado, el sistema debe crear un Reporte_de_Usuario y notificar a los administradores.
**Valida: Requisitos 13.4**

#### Propiedad 60: Visualización de reportes pendientes
*Para cualquier* administrador que accede a la sección de reportes, el sistema debe mostrar todos los Reportes_de_Usuario con estado 'pending'.
**Valida: Requisitos 13.5**

#### Propiedad 61: Aplicación de acciones de moderación
*Para cualquier* acción de moderación tomada por un administrador sobre un reporte, el sistema debe aplicar la acción correctamente (resolver, bloquear temporal, bloquear permanente).
**Valida: Requisitos 13.6**

#### Propiedad 62: Bloqueo de usuario termina sesiones
*Para cualquier* usuario bloqueado por un administrador, el sistema debe terminar todas las sesiones activas del usuario y prevenir nuevas conexiones.
**Valida: Requisitos 13.7**

#### Propiedad 63: Logs sin PII
*Para cualquier* log del sistema mostrado a administradores, el log no debe contener información personal identificable de usuarios.
**Valida: Requisitos 13.9**

#### Propiedad 64: Registro de intentos no autorizados
*Para cualquier* intento de acceso no autorizado al panel de administrador, el sistema debe registrar el intento con IP y timestamp.
**Valida: Requisitos 13.12**

#### Propiedad 12: Retransmisión de mensajes de señalización
*Para cualquier* mensaje de señalización (SDP_Offer, SDP_Answer, o ICE_Candidate) recibido por el Servidor_de_Señalización para una sesión válida, el mensaje debe ser retransmitido al peer correspondiente en esa sesión.
**Valida: Requisitos 3.2, 3.3, 3.4**

#### Propiedad 13: Transmisión de mensajes de texto
#### Propiedad 13: Transmisión de mensajes de texto
*Para cualquier* mensaje de texto enviado por un usuario en una Sesión_de_Chat activa, el mensaje debe ser transmitido al otro peer y aparecer en su interfaz con marca de tiempo.
**Valida: Requisitos 4.1, 4.2**

#### Propiedad 14: Fallback de mensajes sin WebRTC
*Para cualquier* mensaje de texto enviado cuando la conexión WebRTC no está establecida, el mensaje debe ser transmitido a través del Servidor_de_Señalización como respaldo.
**Valida: Requisitos 4.3**

#### Propiedad 15: Unicidad de enlaces compartibles
*Para cualquier* solicitud de creación de Enlace_Compartible, el sistema debe generar un identificador único que no colisione con enlaces existentes.
**Valida: Requisitos 5.1**

#### Propiedad 16: Conexión mediante enlace válido
*Para cualquier* Enlace_Compartible válido con creador disponible, cuando un usuario accede al enlace, debe resultar en la creación de una Sesión_de_Chat entre el visitante y el creador.
**Valida: Requisitos 5.2**

#### Propiedad 17: Notificación de creador no disponible
*Para cualquier* Enlace_Compartible válido cuyo creador no está disponible, cuando un usuario accede al enlace, debe recibir una notificación de error apropiada.
**Valida: Requisitos 5.3**

#### Propiedad 18: Invalidación de enlaces de un solo uso
*Para cualquier* Enlace_Compartible configurado como no reutilizable, después de ser usado una vez, el enlace debe ser marcado como inválido y rechazar conexiones subsecuentes.
**Valida: Requisitos 5.4**

#### Propiedad 19: Enlaces reutilizables permiten múltiples usos
*Para cualquier* Enlace_Compartible configurado como reutilizable, el enlace debe permitir múltiples conexiones exitosas sin invalidarse.
**Valida: Requisitos 5.5**

#### Propiedad 20: Oferta de bot después de timeout
*Para cualquier* usuario en la Cola_de_Espera por más de 10 segundos sin otros usuarios disponibles, el sistema debe ofrecer emparejamiento con un Bot_IA.
**Valida: Requisitos 6.1**

#### Propiedad 21: Creación de sesión con bot
*Para cualquier* usuario que acepta chatear con un Bot_IA, el sistema debe crear una Sesión_de_Chat válida con el bot como peer.
**Valida: Requisitos 6.2**

#### Propiedad 22: Respuestas del bot
*Para cualquier* mensaje de texto enviado a un Bot_IA en una sesión activa, el bot debe generar y enviar una respuesta.
**Valida: Requisitos 6.3**

#### Propiedad 23: Terminación de sesión con bot
*Para cualquier* Sesión_de_Chat con un Bot_IA, cuando el usuario solicita terminar, la sesión debe finalizarse y el usuario debe recibir opciones para buscar un usuario real.
**Valida: Requisitos 6.5**

#### Propiedad 24: Terminación completa de sesión
*Para cualquier* Sesión_de_Chat activa, cuando un usuario solicita terminar, el sistema debe cerrar la conexión WebRTC, notificar al otro peer, limpiar todos los recursos asociados, y permitir a ambos usuarios buscar nuevas parejas.
**Valida: Requisitos 7.1, 7.2**

#### Propiedad 25: Registro de métricas de sesión
*Para cualquier* Sesión_de_Chat que termina, el sistema debe registrar la duración de la sesión en las métricas.
**Valida: Requisitos 7.4**

#### Propiedad 26: Función "siguiente" termina y re-encola
*Para cualquier* usuario en una Sesión_de_Chat activa, cuando solicita "siguiente", el sistema debe terminar la sesión actual y agregar al usuario a la Cola_de_Espera automáticamente.
**Valida: Requisitos 7.5**

#### Propiedad 27: Formato federado de identificadores
*Para cualquier* identificador de usuario generado por el sistema, el identificador debe seguir el formato federado `localId@domain`.
**Valida: Requisitos 8.1**

#### Propiedad 28: Metadatos de servidor en sesiones
*Para cualquier* Sesión_de_Chat creada, los metadatos de la sesión deben incluir el servidor de origen de cada peer.
**Valida: Requisitos 8.4**

#### Propiedad 29: Anonimato de identificadores
*Para cualquier* identificador de usuario generado, el identificador no debe contener información personal identificable (PII) como nombres, emails, o direcciones IP.
**Valida: Requisitos 10.1**

#### Propiedad 30: No persistencia de datos de sesión
*Para cualquier* Sesión_de_Chat que termina, el sistema no debe persistir contenido de mensajes ni datos temporales de la sesión más allá de la duración de la sesión.
**Valida: Requisitos 10.2, 10.4**

#### Propiedad 31: Anonimización de métricas
*Para cualquier* métrica registrada por el sistema, los datos deben estar anonimizados de manera que no permitan identificar usuarios individuales.
**Valida: Requisitos 10.3**

#### Propiedad 24: Anonimización de métricas
*Para cualquier* métrica registrada por el sistema, los datos deben estar anonimizados de manera que no permitan identificar usuarios individuales.
**Valida: Requisitos 9.3**

## Manejo de Errores

### Estrategia General

El sistema implementa manejo de errores en múltiples capas:

1. **Capa de Presentación (Frontend)**
   - Validación de entrada de usuario
   - Manejo de errores de permisos de media (cámara/micrófono)
   - Detección de capacidades del navegador
   - UI de error amigable con opciones de recuperación

2. **Capa de Comunicación (WebRTC + Socket.io)**
   - Timeouts de conexión WebRTC (30 segundos)
   - Reconexión automática con backoff exponencial
   - Fallback de mensajes de texto a servidor cuando WebRTC falla
   - Detección de desconexión de peers (5 segundos)

3. **Capa de Backend**
   - Validación de mensajes de señalización
   - Manejo de sesiones huérfanas (TTL en Redis)
   - Rate limiting para prevenir abuso
   - Logging estructurado de errores

### Casos de Error Específicos

#### Error 1: Fallo de Conexión WebRTC
```typescript
interface WebRTCConnectionError {
  code: 'webrtc-connection-failed';
  message: 'No se pudo establecer conexión WebRTC';
  action: 'retry' | 'find-new-partner';
}

// Manejo:
// 1. Intentar reconexión durante 15 segundos
// 2. Si falla, notificar a ambos usuarios
// 3. Ofrecer buscar nueva pareja
```

#### Error 2: Permisos de Media Denegados
```typescript
interface MediaPermissionError {
  code: 'media-permission-denied';
  message: 'Se requiere acceso a cámara y micrófono';
  instructions: string[]; // Pasos específicos por navegador
}

// Manejo:
// 1. Detectar tipo de navegador
// 2. Mostrar instrucciones específicas
// 3. Ofrecer modo solo texto como alternativa
```

#### Error 3: Desconexión Inesperada de Peer
```typescript
interface PeerDisconnectedError {
  code: 'peer-disconnected';
  message: 'Tu pareja se ha desconectado';
  action: 'find-new-partner';
}

// Manejo:
// 1. Detectar desconexión (heartbeat cada 2 segundos)
// 2. Esperar 5 segundos por reconexión
// 3. Si no reconecta, notificar y ofrecer nueva búsqueda
```

#### Error 4: Servidor de Señalización No Disponible
```typescript
interface SignalingServerError {
  code: 'signaling-server-unavailable';
  message: 'Conexión con servidor perdida';
  retryIn: number; // milisegundos
}

// Manejo:
// 1. Intentar reconexión con backoff exponencial
// 2. Mostrar estado de reconexión al usuario
// 3. Después de 5 intentos, sugerir recargar página
```

#### Error 5: Enlace Compartible Inválido
```typescript
interface InvalidLinkError {
  code: 'invalid-link';
  message: 'Este enlace no es válido o ha expirado';
  alternatives: {
    randomChat: boolean;
    createOwnLink: boolean;
  };
}

// Manejo:
// 1. Validar enlace en backend
// 2. Retornar error específico (expirado, usado, no existe)
// 3. Ofrecer alternativas al usuario
```

#### Error 6: Bot de IA No Disponible
```typescript
interface BotUnavailableError {
  code: 'bot-unavailable';
  message: 'Servicio de bot temporalmente no disponible';
  action: 'continue-waiting' | 'cancel';
}

// Manejo:
// 1. Detectar fallo de API de IA
// 2. Notificar al usuario
// 3. Ofrecer continuar esperando usuario real
```

#### Error 7: Límite de Mensaje Excedido
```typescript
interface MessageTooLongError {
  code: 'message-too-long';
  message: 'Mensaje excede 1000 caracteres';
  maxLength: 1000;
  currentLength: number;
}

// Manejo:
// 1. Validar longitud en frontend antes de enviar
// 2. Truncar y notificar al usuario
// 3. Mostrar contador de caracteres en UI
```

### Logging y Monitoreo

```typescript
interface ErrorLog {
  timestamp: number;
  errorCode: string;
  userId?: string; // Anonimizado
  sessionId?: string;
  context: Record<string, any>;
  stack?: string;
}

// Niveles de logging:
// - ERROR: Errores que afectan funcionalidad
// - WARN: Situaciones anómalas pero manejables
// - INFO: Eventos importantes del sistema
// - DEBUG: Información detallada para desarrollo
```

## Estrategia de Testing

### Enfoque Dual: Unit Tests + Property-Based Tests

El sistema utiliza dos tipos complementarios de testing:

1. **Unit Tests**: Verifican ejemplos específicos, casos edge, y condiciones de error
2. **Property-Based Tests**: Verifican propiedades universales a través de múltiples inputs generados

Ambos son necesarios para cobertura comprehensiva:
- Unit tests capturan bugs concretos y casos específicos
- Property tests verifican correctness general y descubren casos edge inesperados

### Configuración de Property-Based Testing

**Biblioteca**: Para TypeScript/JavaScript, usaremos **fast-check**

**Configuración**:
- Mínimo 100 iteraciones por test de propiedad
- Cada test debe referenciar su propiedad del documento de diseño
- Formato de tag: `// Feature: random-video-chat, Property N: [texto de propiedad]`

### Tests por Componente

#### Frontend Tests

**WebRTCManager Tests**:
```typescript
// Unit Tests:
// - Inicialización de media con permisos concedidos
// - Manejo de permisos denegados
// - Creación de oferta SDP
// - Procesamiento de respuesta SDP
// - Manejo de desconexión

// Property Tests:
// - Property 12: Retransmisión de señalización (verificar que todos los mensajes se envían)
// - Property 14: Fallback de mensajes (verificar que mensajes se envían por canal alternativo)
```

**SignalingClient Tests**:
```typescript
// Unit Tests:
// - Conexión exitosa al servidor
// - Reconexión después de desconexión
// - Manejo de eventos de error
// - Envío de mensajes de texto

// Property Tests:
// - Property 13: Transmisión de mensajes (todos los mensajes enviados deben llegar)
// - Property 24: Terminación de sesión (terminar debe notificar al peer)
```

**TextChat Component Tests**:
```typescript
// Unit Tests:
// - Renderizado de mensajes
// - Envío de mensaje válido
// - Validación de longitud de mensaje
// - Scroll automático a nuevo mensaje

// Property Tests:
// - Property 13: Mensajes con timestamp (todos los mensajes deben tener timestamp válido)
```

**FilterSelection Component Tests**:
```typescript
// Unit Tests:
// - Renderizado de opciones de categoría
// - Renderizado de opciones de filtro
// - Selección de categoría válida
// - Selección de filtro válido
// - Validación antes de iniciar chat

// Property Tests:
// - Property 6: Requerimiento de categoría (no permitir iniciar sin categoría)
// - Property 7: Validación de categoría (solo valores válidos)
// - Property 8: Filtro predeterminado (usar 'any' si no se selecciona)
```

#### Backend Tests

**MatchingManager Tests**:
```typescript
// Unit Tests:
// - Agregar usuario a cola vacía con categoría y filtro
// - Emparejar dos usuarios compatibles
// - Rechazar emparejamiento de usuarios incompatibles
// - Manejo de cola con un solo usuario
// - Cancelar búsqueda
// - Validar función areCompatible con diferentes combinaciones

// Property Tests:
// - Property 1: Agregar a cola (todos los usuarios solicitantes deben aparecer en cola)
// - Property 2: Emparejamiento (cola con 2+ usuarios debe resultar en match)
// - Property 3: Usuario solo permanece (usuario único debe permanecer en cola)
// - Property 4: Cancelar remueve (cancelar debe remover de cola)
// - Property 5: Almacenamiento de preferencias (filtros seleccionados deben almacenarse)
// - Property 6: Requerimiento de categoría (solicitudes sin categoría deben rechazarse)
// - Property 7: Validación de categoría (solo valores válidos deben aceptarse)
// - Property 8: Filtro predeterminado (sin selección debe usar 'any')
// - Property 9: Agregar con preferencias (usuarios deben agregarse con categoría y filtro)
// - Property 10: Emparejamiento compatible (solo usuarios compatibles deben emparejarse)
// - Property 11: Usuario sin match compatible permanece (usuarios incompatibles deben esperar)
// - Property 20: Oferta de bot (usuarios esperando >10s deben recibir oferta de bot)
```

**SessionManager Tests**:
```typescript
// Unit Tests:
// - Crear sesión entre dos usuarios
// - Obtener sesión por ID
// - Terminar sesión
// - Limpieza de sesiones expiradas (TTL)

// Property Tests:
// - Property 2: Emparejamiento crea sesión (match debe crear sesión válida)
// - Property 24: Terminación completa (terminar debe limpiar recursos)
// - Property 25: Registro de métricas (todas las sesiones deben registrar duración)
// - Property 28: Metadatos de servidor (sesiones deben incluir servidor de origen)
// - Property 30: No persistencia (datos de sesión no deben persistir después de terminar)
```

**LinkGenerator Tests**:
```typescript
// Unit Tests:
// - Crear enlace de un solo uso
// - Crear enlace reutilizable
// - Validar enlace válido
// - Rechazar enlace expirado
// - Marcar enlace como usado

// Property Tests:
// - Property 15: Unicidad de enlaces (todos los enlaces deben ser únicos)
// - Property 16: Conexión mediante enlace (enlaces válidos deben crear sesión)
// - Property 17: Notificación de creador no disponible (enlaces sin creador deben notificar)
// - Property 18: Invalidación de enlaces de un solo uso (enlaces usados deben invalidarse)
// - Property 19: Enlaces reutilizables (enlaces reutilizables deben permitir múltiples usos)
```

**AIBotService Tests**:
```typescript
// Unit Tests:
// - Inicializar conversación
// - Generar respuesta con historial
// - Limpiar conversación
// - Manejo de error de API de IA

// Property Tests:
// - Property 21: Creación de sesión con bot (aceptar bot debe crear sesión)
// - Property 22: Respuestas del bot (mensajes a bot deben generar respuestas)
// - Property 23: Terminación con bot (terminar con bot debe ofrecer opciones)
```

**Signaling Server Tests**:
```typescript
// Unit Tests:
// - Conexión de cliente
// - Desconexión de cliente
// - Retransmisión de oferta SDP
// - Retransmisión de respuesta SDP
// - Retransmisión de ICE candidates
// - Envío de mensaje de texto

// Property Tests:
// - Property 12: Retransmisión de señalización (todos los mensajes deben retransmitirse)
// - Property 26: Función "siguiente" (siguiente debe terminar y re-encolar)
```

#### Integration Tests

```typescript
// Flujo completo de emparejamiento aleatorio con filtros:
// 1. Dos usuarios seleccionan categorías y filtros compatibles
// 2. Ambos solicitan chat
// 3. Sistema los empareja basándose en compatibilidad
// 4. Negociación WebRTC completa
// 5. Intercambio de mensajes de texto
// 6. Terminación de sesión

// Flujo de emparejamiento incompatible:
// 1. Usuario A: categoría 'male', filtro 'female'
// 2. Usuario B: categoría 'male', filtro 'female'
// 3. Ambos esperan sin ser emparejados (incompatibles)
// 4. Usuario C: categoría 'female', filtro 'male' se une
// 5. Sistema empareja A con C (compatibles)
// 6. Usuario B sigue esperando

// Flujo de enlace compartible:
// 1. Usuario crea enlace
// 2. Otro usuario accede al enlace
// 3. Conexión establecida
// 4. Enlace invalidado (si no es reutilizable)

// Flujo de bot de IA:
// 1. Usuario espera sin match
// 2. Sistema ofrece bot después de 10s
// 3. Usuario acepta bot
// 4. Conversación con bot
// 5. Usuario termina y busca usuario real
```

### Tests de Privacidad y Seguridad

```typescript
// Property Tests:
// - Property 27: Formato federado (todos los IDs deben tener formato correcto)
// - Property 29: Anonimato (IDs no deben contener PII)
// - Property 30: No persistencia (mensajes no deben almacenarse)
// - Property 31: Anonimización de métricas (métricas no deben identificar usuarios)

// Unit Tests:
// - Validación de formato de userId
// - Verificar que mensajes no se guardan en Redis
// - Verificar que métricas no incluyen IDs de usuario
// - Verificar limpieza de datos después de sesión
// - Verificar que categorías de usuario no se exponen innecesariamente
```

### Tests de Edge Cases

```typescript
// Casos específicos identificados en prework:
// - Timeout de conexión WebRTC (30 segundos)
// - Mensajes que exceden 1000 caracteres
// - Desconexión inesperada de peer (detección en 5 segundos)
// - Fallo de reconexión WebRTC
// - Reconexión al servidor con backoff exponencial
// - Error de permisos de cámara/micrófono
// - Navegador sin soporte WebRTC
```

### Métricas de Cobertura

**Objetivos**:
- Cobertura de líneas: >80%
- Cobertura de branches: >75%
- Cobertura de funciones: >90%
- Todas las propiedades de correctness deben tener tests

**Herramientas**:
- Jest para unit tests y coverage
- fast-check para property-based tests
- React Testing Library para tests de componentes
- Supertest para tests de API

### Continuous Integration

```yaml
# Ejemplo de pipeline CI
test:
  - npm run lint
  - npm run test:unit
  - npm run test:property
  - npm run test:integration
  - npm run test:coverage
  
# Criterios de éxito:
# - Todos los tests pasan
# - Cobertura cumple objetivos
# - No hay errores de linting
```

## Plan de Despliegue y Producción

### Resumen del Despliegue

La aplicación estará lista para publicarse en internet con dominio propio, usando HTTPS para seguridad, y diseño completamente responsive para funcionar en computadoras y dispositivos móviles.

### Infraestructura Recomendada

**Frontend (React)**:
- **Hosting**: Vercel (recomendado) o Netlify
  - Deploy automático desde Git
  - CDN global incluido
  - HTTPS automático con certificados SSL gratuitos
  - Soporte para dominios personalizados
  - Optimización automática de assets
- **Alternativa**: AWS CloudFront + S3
  - Mayor control pero requiere más configuración
  - Certificado SSL via AWS Certificate Manager (gratuito)

**Backend (Node.js)**:
- **Plataforma**: DigitalOcean App Platform (recomendado para simplicidad)
  - Deploy desde Git
  - Escalado automático
  - HTTPS incluido
  - Logs y monitoreo integrados
- **Alternativas**:
  - AWS ECS/Fargate (más escalable, más complejo)
  - Google Cloud Run (serverless, auto-scaling)
  - Railway.app (simple, económico para MVP)
- **Contenedor**: Docker
  - Imagen base: node:18-alpine
  - Multi-stage build para optimización
  - Health checks configurados

**Base de Datos**:
- **Redis**: 
  - Redis Cloud (recomendado) - Plan gratuito disponible
  - AWS ElastiCache (para producción a escala)
  - Configuración: Sin persistencia (solo cache)
- **PostgreSQL**:
  - DigitalOcean Managed Database
  - AWS RDS
  - Supabase (incluye autenticación)
  - Backups automáticos diarios

**STUN/TURN Servers**:
- **Opción 1 (Recomendada)**: Servicio cloud
  - Twilio STUN/TURN (confiable, global)
  - Xirsys (especializado en WebRTC)
  - Metered.ca (económico)
- **Opción 2**: Coturn auto-hospedado
  - Servidores en múltiples regiones:
    - us-east-1 (Virginia)
    - eu-west-1 (Irlanda)
    - ap-southeast-1 (Singapur)
    - sa-east-1 (São Paulo)
  - Configuración con Docker
  - Certificados SSL via Let's Encrypt

### Configuración de Dominio y HTTPS

**Dominio Personalizado**:
1. Registrar dominio (ej: videochat.com)
   - Proveedores: Namecheap, Google Domains, Cloudflare
2. Configurar DNS:
   ```
   A     @           -> IP del backend (o CNAME a plataforma)
   CNAME www         -> videochat.com
   CNAME api         -> backend.videochat.com
   CNAME admin       -> admin.videochat.com
   ```

**HTTPS (SSL/TLS)**:
- **Frontend**: Automático con Vercel/Netlify
- **Backend**: 
  - Let's Encrypt (gratuito, auto-renovación)
  - Cloudflare SSL (proxy + certificado)
  - Plataforma cloud (incluido)
- **Configuración Nginx** (si auto-hospedado):
  ```nginx
  server {
      listen 443 ssl http2;
      server_name api.videochat.com;
      
      ssl_certificate /etc/letsencrypt/live/videochat.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/videochat.com/privkey.pem;
      
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_ciphers HIGH:!aNULL:!MD5;
      
      location / {
          proxy_pass http://localhost:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  
  # Redirect HTTP to HTTPS
  server {
      listen 80;
      server_name api.videochat.com;
      return 301 https://$server_name$request_uri;
  }
  ```

### Diseño Responsive

**Breakpoints CSS**:
```css
/* Mobile First Approach */

/* Extra Small (Móviles en vertical) */
@media (max-width: 575px) {
  /* Layout de una columna */
  /* Video en modo portrait */
  /* Controles simplificados */
}

/* Small (Móviles en horizontal, tablets pequeñas) */
@media (min-width: 576px) and (max-width: 767px) {
  /* Layout adaptado */
  /* Video side-by-side si hay espacio */
}

/* Medium (Tablets) */
@media (min-width: 768px) and (max-width: 991px) {
  /* Layout de dos columnas */
  /* Video + chat lado a lado */
}

/* Large (Laptops) */
@media (min-width: 992px) and (max-width: 1199px) {
  /* Layout completo */
  /* Todos los controles visibles */
}

/* Extra Large (Desktops) */
@media (min-width: 1200px) {
  /* Layout optimizado para pantallas grandes */
  /* Máxima funcionalidad */
}
```

**Consideraciones Mobile**:
- Touch-friendly: Botones mínimo 44x44px
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Orientación: Soportar portrait y landscape
- Video: Aspect ratio adaptable (16:9 en landscape, 9:16 en portrait)
- Teclado virtual: Ajustar layout cuando aparece
- Gestos: Swipe para "siguiente", tap para controles
- Performance: Lazy loading de componentes
- PWA: Manifest.json para instalación en home screen

**Framework CSS**:
- Tailwind CSS (recomendado) - Utility-first, altamente customizable
- Material-UI - Componentes pre-diseñados, responsive por defecto
- Chakra UI - Accesible, responsive, fácil de usar

### Variables de Entorno

```bash
# Frontend (.env.production)
VITE_API_URL=https://api.videochat.com
VITE_WS_URL=wss://api.videochat.com
VITE_ENVIRONMENT=production

# Backend (.env.production)
NODE_ENV=production
PORT=3000

# URLs y Dominios
FRONTEND_URL=https://videochat.com
ADMIN_URL=https://admin.videochat.com
SERVER_DOMAIN=videochat.com

# Base de Datos
REDIS_URL=redis://user:password@redis-host:6379
DATABASE_URL=postgresql://user:password@db-host:5432/videochat
POSTGRES_SSL=true

# CORS
CORS_ORIGIN=https://videochat.com,https://www.videochat.com

# WebRTC - Servidores STUN/TURN por región
STUN_NA_SERVERS=stun:na-east.videochat.com:3478,stun:na-west.videochat.com:3478
STUN_EU_SERVERS=stun:eu-west.videochat.com:3478,stun:eu-central.videochat.com:3478
STUN_AS_SERVERS=stun:asia-east.videochat.com:3478,stun:asia-south.videochat.com:3478
STUN_SA_SERVERS=stun:sa-east.videochat.com:3478

TURN_NA_SERVER=turn:na-east.videochat.com:3478
TURN_EU_SERVER=turn:eu-west.videochat.com:3478
TURN_AS_SERVER=turn:asia-east.videochat.com:3478
TURN_SA_SERVER=turn:sa-east.videochat.com:3478

TURN_USERNAME=videochat_user
TURN_CREDENTIAL=secure_password_here

# Servicios Externos
AI_SERVICE=openai
OPENAI_API_KEY=sk-...
GEOIP_API_KEY=...

# Configuración de Aplicación
BOT_OFFER_TIMEOUT=10000
WEBRTC_CONNECTION_TIMEOUT=30000
MAX_MESSAGE_LENGTH=1000
LINK_DEFAULT_TTL=86400
ADMIN_SESSION_TIMEOUT=1800000  # 30 minutos

# Seguridad
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_PASSWORD_SALT_ROUNDS=12
RATE_LIMIT_WINDOW=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# Federación (futuro)
FEDERATION_ENABLED=false
```

### Dockerfile

```dockerfile
# Multi-stage build para optimización

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build (si es necesario, ej: TypeScript)
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copiar solo lo necesario desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando de inicio
CMD ["node", "dist/server.js"]
```

### Docker Compose (Desarrollo Local)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/videochat
    depends_on:
      - redis
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
      - VITE_WS_URL=ws://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=videochat
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### Proceso de Despliegue

**1. Preparación**:
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/random-video-chat.git
cd random-video-chat

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.production
# Editar .env.production con valores reales

# Ejecutar tests
npm run test
npm run test:integration

# Build
npm run build
```

**2. Despliegue Frontend (Vercel)**:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Configurar dominio personalizado
vercel domains add videochat.com
```

**3. Despliegue Backend (DigitalOcean)**:
```bash
# Instalar doctl CLI
brew install doctl  # o snap install doctl

# Autenticar
doctl auth init

# Crear app
doctl apps create --spec .do/app.yaml

# O usar interfaz web:
# 1. Conectar repositorio GitHub
# 2. Configurar variables de entorno
# 3. Deploy automático en cada push
```

**4. Configurar Base de Datos**:
```bash
# Ejecutar migraciones
npm run migrate:production

# Crear usuario administrador inicial
npm run seed:admin
```

**5. Configurar STUN/TURN**:
```bash
# Si auto-hospedado con Coturn
docker run -d --name coturn \
  --network=host \
  -v $(pwd)/turnserver.conf:/etc/coturn/turnserver.conf \
  coturn/coturn

# Configurar certificados SSL
certbot certonly --standalone -d turn.videochat.com
```

**6. Verificación Post-Despliegue**:
```bash
# Health check
curl https://api.videochat.com/health

# Test WebSocket
wscat -c wss://api.videochat.com

# Test STUN/TURN
# Usar herramienta: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
```

### Escalabilidad

**Limitaciones Actuales**:
- Socket.io requiere sticky sessions (limita escalado horizontal)
- Redis como punto único de fallo

**Soluciones para Escalar**:
1. **Socket.io Adapter para Redis**: Permite múltiples instancias del servidor
   ```javascript
   import { createAdapter } from '@socket.io/redis-adapter';
   import { createClient } from 'redis';
   
   const pubClient = createClient({ url: process.env.REDIS_URL });
   const subClient = pubClient.duplicate();
   
   await Promise.all([pubClient.connect(), subClient.connect()]);
   
   io.adapter(createAdapter(pubClient, subClient));
   ```

2. **Redis Cluster**: Para alta disponibilidad y escalado de datos
3. **Load Balancer con Sticky Sessions**: Nginx o AWS ALB
4. **Separación de Servicios**: Señalización, matching, y bots como microservicios

**Arquitectura Escalada**:
```mermaid
graph TB
    subgraph "CDN"
        CF[Cloudflare/CloudFront]
    end
    
    subgraph "Load Balancer"
        LB[Nginx/ALB<br/>Sticky Sessions]
    end
    
    subgraph "Servidor de Señalización (N instancias)"
        SS1[Servidor 1]
        SS2[Servidor 2]
        SS3[Servidor N]
    end
    
    subgraph "Redis Cluster"
        R1[(Redis Master)]
        R2[(Redis Replica 1)]
        R3[(Redis Replica 2)]
    end
    
    subgraph "PostgreSQL"
        DB[(Primary)]
        DB_R[(Read Replica)]
    end
    
    subgraph "Servicios Externos"
        STUN[STUN/TURN Servers]
        AI[AI Service]
        GEO[GeoIP Service]
    end
    
    Users[Usuarios] --> CF
    CF --> LB
    LB --> SS1
    LB --> SS2
    LB --> SS3
    
    SS1 --> R1
    SS2 --> R1
    SS3 --> R1
    R1 --> R2
    R1 --> R3
    
    SS1 --> DB
    SS2 --> DB
    SS3 --> DB
    DB --> DB_R
    
    SS1 --> STUN
    SS2 --> STUN
    SS3 --> STUN
    
    SS1 --> AI
    SS2 --> AI
    SS3 --> AI
    
    SS1 --> GEO
    SS2 --> GEO
    SS3 --> GEO
```

### Monitoreo y Observabilidad

**Métricas Clave**:
- Usuarios activos concurrentes
- Sesiones activas
- Tiempo promedio de espera en cola
- Tasa de éxito de conexiones WebRTC
- Latencia de señalización
- Uso de bots vs usuarios reales
- Tasa de errores por tipo
- Distribución geográfica de usuarios
- Tiempo de respuesta de API
- Uso de CPU/Memoria

**Herramientas**:
- **Prometheus + Grafana**: Métricas y dashboards
- **Sentry**: Error tracking y performance monitoring
- **CloudWatch/Datadog**: Logs y métricas de infraestructura
- **UptimeRobot**: Monitoreo de uptime
- **Custom Dashboard**: Panel de administrador con métricas de negocio

**Alertas**:
- Tasa de error > 5%
- Latencia promedio > 500ms
- Usuarios activos < umbral esperado
- Redis/PostgreSQL down
- Certificados SSL próximos a expirar (30 días)

### Costos Estimados (Mensual)

**MVP (100-500 usuarios concurrentes)**:
- Frontend (Vercel): $0 (plan gratuito)
- Backend (DigitalOcean App Platform): $12-25
- Redis (Redis Cloud): $0 (plan gratuito 30MB)
- PostgreSQL (DigitalOcean): $15
- STUN/TURN (Metered.ca): $29 (1TB tráfico)
- Dominio: $12/año
- **Total**: ~$60-70/mes

**Producción (1000-5000 usuarios concurrentes)**:
- Frontend (Vercel Pro): $20
- Backend (DigitalOcean): $100-200 (múltiples instancias)
- Redis (Redis Cloud): $50
- PostgreSQL (DigitalOcean): $60
- STUN/TURN (Twilio): $150-300
- Monitoreo (Datadog): $15
- **Total**: ~$400-650/mes

## Seguridad

### Consideraciones de Seguridad

1. **Rate Limiting**:
   - Límite de solicitudes de matching por IP: 10/minuto
   - Límite de creación de enlaces compartibles: 5/hora
   - Límite de mensajes de texto por sesión: 100/minuto
   - Límite de intentos de login admin: 5/15 minutos

2. **Validación de Entrada**:
   - Sanitización de mensajes de texto (XSS prevention)
   - Validación de formato de IDs
   - Validación de mensajes de señalización
   - Validación de parámetros de API

3. **Protección contra Abuso**:
   - Detección de comportamiento sospechoso
   - Bloqueo temporal de IPs abusivas (Redis)
   - Límite de duración de sesiones (2 horas máximo)
   - CAPTCHA para acciones sensibles (opcional)

4. **Privacidad**:
   - No almacenar contenido de mensajes
   - Anonimización de métricas
   - TTL agresivo en datos temporales
   - No logging de contenido de usuario
   - GDPR compliance

5. **HTTPS/WSS**:
   - Todas las conexiones deben usar TLS
   - Certificados válidos requeridos
   - HSTS headers
   - Secure cookies

6. **CORS**:
   - Configuración restrictiva de CORS
   - Whitelist de orígenes permitidos
   - Credentials: true solo para dominios confiables

7. **Autenticación Admin**:
   - Passwords hasheados con bcrypt (12 rounds)
   - Sesiones con TTL de 30 minutos
   - Logout automático por inactividad
   - 2FA (opcional, recomendado)

8. **Headers de Seguridad**:
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", "wss://api.videochat.com"],
         mediaSrc: ["'self'", "blob:"],
       },
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     }
   }));
   ```

### Backup y Recuperación

**PostgreSQL**:
- Backups automáticos diarios
- Retención: 30 días
- Point-in-time recovery
- Backups offsite (S3/Glacier)

**Redis**:
- No requiere backup (datos temporales)
- Snapshots opcionales para debugging

**Código**:
- Git como fuente de verdad
- Tags para releases
- Branches protegidos (main, production)

**Plan de Recuperación**:
1. Identificar problema
2. Rollback a versión anterior (< 5 minutos)
3. Restaurar base de datos si necesario
4. Verificar funcionalidad
5. Post-mortem y documentación

## Próximos Pasos para Implementación

1. **Fase 1: MVP Básico** (2-3 semanas)
   - Emparejamiento aleatorio
   - WebRTC video/audio
   - Chat de texto
   - UI React básica responsive
   - Deploy en Vercel + DigitalOcean

2. **Fase 2: Características Avanzadas** (2-3 semanas)
   - Filtros de emparejamiento
   - Enlaces compartibles
   - Bots de IA
   - Soporte global con regiones
   - Mejoras de UI/UX

3. **Fase 3: Panel de Administrador** (1-2 semanas)
   - Autenticación segura
   - Gestión de reportes
   - Moderación de usuarios
   - Estadísticas y métricas
   - Logs del sistema

4. **Fase 4: Optimización y Escalabilidad** (1-2 semanas)
   - Socket.io Redis adapter
   - Múltiples instancias del servidor
   - Monitoreo y alertas
   - Performance optimization
   - Load testing

5. **Fase 5: Federación** (Futuro)
   - Protocolo de federación
   - Comunicación servidor-a-servidor
   - Autenticación entre servidores
   - Discovery de servidores federados

   - Anonimización de métricas
   - TTL agresivo en datos temporales
   - No logging de contenido de usuario

5. **HTTPS/WSS**:
   - Todas las conexiones deben usar TLS
   - Certificados válidos requeridos
   - HSTS headers

6. **CORS**:
   - Configuración restrictiva de CORS
   - Whitelist de orígenes permitidos

## Próximos Pasos para Implementación

1. **Fase 1: MVP Básico**
   - Emparejamiento aleatorio
   - WebRTC video/audio
   - Chat de texto
   - UI React básica

2. **Fase 2: Características Avanzadas**
   - Enlaces compartibles
   - Bots de IA
   - Mejoras de UI/UX

3. **Fase 3: Escalabilidad**
   - Socket.io Redis adapter
   - Múltiples instancias del servidor
   - Monitoreo y métricas

4. **Fase 4: Federación**
   - Protocolo de federación
   - Comunicación servidor-a-servidor
   - Autenticación entre servidores
