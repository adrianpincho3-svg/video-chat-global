// Tipos básicos de usuario y filtros
export type UserCategory = 'male' | 'female' | 'couple';
export type MatchingFilter = 'male' | 'female' | 'couple' | 'any';
export type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

// Usuario en cola de espera
export interface WaitingUser {
  userId: string;
  category: UserCategory;
  filter: MatchingFilter;
  region: Region; // Región detectada del usuario
  regionFilter: Region; // Preferencia de región para emparejamiento
  joinedAt: number;
  offeredBot?: boolean;
}

// Sesión de chat
export interface SessionData {
  sessionId: string;
  user1Id: string;
  user2Id: string;
  user1Region: Region;
  user2Region: Region;
  isUser2Bot: boolean;
  createdAt: number;
  linkId?: string;
}

// Enlace compartible
export interface ShareableLink {
  linkId: string;
  creatorId: string;
  createdAt: number;
  expiresAt: number;
  reusable: boolean;
  used: boolean;
}

// Mensajes de señalización WebRTC
export interface OfferMessage {
  type: 'offer';
  sessionId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage {
  type: 'answer';
  sessionId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage {
  type: 'ice-candidate';
  sessionId: string;
  candidate: RTCIceCandidateInit;
}

export interface TextMessage {
  type: 'text';
  sessionId: string;
  content: string;
  timestamp: number;
}

// Tipos para reportes y moderación
export type ReportReason = 'inappropriate-behavior' | 'offensive-content' | 'spam' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ModerationAction = 'no-action' | 'warning' | 'temporary-ban' | 'permanent-ban';

export interface UserReport {
  reportId: string;
  reportedUserId: string;
  reporterUserId?: string;
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

export interface UserBan {
  userId: string;
  reason: string;
  bannedBy: string;
  bannedAt: number;
  expiresAt?: number;
  type: 'temporary' | 'permanent';
}

// Credenciales de administrador
export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  sessionId: string;
  adminId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

// Métricas
export interface RealtimeMetrics {
  activeUsers: number;
  activeSessions: number;
  waitingUsers: number;
  averageSessionDuration: number;
  totalSessionsToday: number;
  usersByRegion: Record<Region, number>;
  usersByCategory: Record<UserCategory, number>;
  botSessionsPercentage: number;
}

export interface HistoricalMetrics {
  date: string;
  totalSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  regionDistribution: Record<Region, number>;
}

// Geolocalización
export interface GeoLocation {
  country: string;
  countryCode: string;
  region: Region;
  latitude: number;
  longitude: number;
}

// Eventos Socket.io
export interface ServerToClientEvents {
  'matched': (data: { sessionId: string; peerId: string; isPeerBot: boolean }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'peer-disconnected': () => void;
  'text-message': (data: { message: string; timestamp: number }) => void;
  'region-detected': (data: { region: Region }) => void;
  'error': (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'start-matching': (data: { userCategory: UserCategory; filter: MatchingFilter; regionFilter: Region }) => void;
  'cancel-matching': () => void;
  'join-session': (data: { linkId: string }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'text-message': (data: { message: string }) => void;
  'end-session': () => void;
}

export interface SocketData {
  userId: string;
  sessionId?: string;
  region?: Region;
}

// AI Bot Service
export interface BotMessage {
  role: 'user' | 'assistant';
  content: string;
}
