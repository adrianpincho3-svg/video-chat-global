// Tipos básicos de usuario y filtros
export type UserCategory = 'male' | 'female' | 'couple';
export type MatchingFilter = 'male' | 'female' | 'couple' | 'any';
export type Region = 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'any';

// Estado de la aplicación
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type SessionState = 'idle' | 'filter-selection' | 'waiting' | 'in-chat';

export interface AppState {
  connectionStatus: ConnectionStatus;
  sessionState: SessionState;
  currentSession: Session | null;
  userCategory: UserCategory | null;
  matchingFilter: MatchingFilter;
  regionFilter: Region;
  detectedRegion: Region;
}

export interface Session {
  sessionId: string;
  peerId: string;
  isPeerBot: boolean;
  startTime: number;
}

// Mensajes de chat
export interface Message {
  id: string;
  sender: 'local' | 'remote';
  content: string;
  timestamp: number;
}

// Props de componentes
export interface FilterSelectionProps {
  onStartChat: (userCategory: UserCategory, filter: MatchingFilter, regionFilter: Region) => void;
  onCancel: () => void;
  detectedRegion: Region;
}

export interface VideoChatProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndChat: () => void;
  onNextChat: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface TextChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export interface WaitingRoomProps {
  waitTime: number;
  onCancel: () => void;
  onAcceptBot?: () => void;
  showBotOffer: boolean;
}

// WebRTC
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface WebRTCManager {
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
  toggleMute: () => void;
  toggleVideo: () => void;
}

// Eventos de señalización
export interface SignalingEvents {
  'matched': (data: { sessionId: string; peerId: string; isPeerBot: boolean }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'peer-disconnected': () => void;
  'text-message': (data: { message: string; timestamp: number }) => void;
  'region-detected': (data: { region: Region }) => void;
  'error': (data: { code: string; message: string }) => void;
}

export interface SignalingClient {
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

// Enlaces compartibles
export interface ShareableLinkData {
  linkId: string;
  url: string;
  reusable: boolean;
  expiresAt: number;
}

// Admin
export interface AdminCredentials {
  username: string;
  password: string;
}

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
