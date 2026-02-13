import { Region, UserCategory } from '../types';

// Categorías de usuario válidas
export const USER_CATEGORIES: UserCategory[] = ['male', 'female', 'couple'];

// Regiones válidas
export const REGIONS: Region[] = [
  'north-america',
  'south-america',
  'europe',
  'asia',
  'africa',
  'oceania',
  'any'
];

// Mapeo de códigos de país a regiones
export const COUNTRY_TO_REGION: Record<string, Region> = {
  // América del Norte
  'US': 'north-america',
  'CA': 'north-america',
  'MX': 'north-america',
  
  // América del Sur
  'BR': 'south-america',
  'AR': 'south-america',
  'CL': 'south-america',
  'CO': 'south-america',
  'PE': 'south-america',
  'VE': 'south-america',
  'EC': 'south-america',
  'BO': 'south-america',
  'PY': 'south-america',
  'UY': 'south-america',
  
  // Europa
  'GB': 'europe',
  'DE': 'europe',
  'FR': 'europe',
  'ES': 'europe',
  'IT': 'europe',
  'NL': 'europe',
  'BE': 'europe',
  'PT': 'europe',
  'SE': 'europe',
  'NO': 'europe',
  'DK': 'europe',
  'FI': 'europe',
  'PL': 'europe',
  'RO': 'europe',
  'GR': 'europe',
  'CZ': 'europe',
  'HU': 'europe',
  'AT': 'europe',
  'CH': 'europe',
  'IE': 'europe',
  
  // Asia
  'CN': 'asia',
  'JP': 'asia',
  'IN': 'asia',
  'KR': 'asia',
  'SG': 'asia',
  'TH': 'asia',
  'VN': 'asia',
  'MY': 'asia',
  'PH': 'asia',
  'ID': 'asia',
  'PK': 'asia',
  'BD': 'asia',
  'TR': 'asia',
  'SA': 'asia',
  'AE': 'asia',
  'IL': 'asia',
  
  // África
  'ZA': 'africa',
  'EG': 'africa',
  'NG': 'africa',
  'KE': 'africa',
  'MA': 'africa',
  'TN': 'africa',
  'GH': 'africa',
  'ET': 'africa',
  
  // Oceanía
  'AU': 'oceania',
  'NZ': 'oceania',
};

// Servidores STUN/TURN por región
export const STUN_SERVERS_BY_REGION: Record<Region, RTCIceServer[]> = {
  'north-america': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  'south-america': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  'europe': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  'asia': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  'africa': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  'oceania': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  'any': [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Timeouts y límites
export const TIMEOUTS = {
  WEBRTC_CONNECTION: 30000, // 30 segundos
  RECONNECTION_ATTEMPT: 15000, // 15 segundos
  BOT_OFFER: 10000, // 10 segundos
  PEER_DISCONNECT_DETECTION: 5000, // 5 segundos
  ADMIN_SESSION: 1800000, // 30 minutos
};

export const LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
  WAITING_QUEUE_TTL: 300, // 5 minutos en segundos
  SESSION_TTL: 3600, // 1 hora en segundos
  LINK_TTL: 86400, // 24 horas en segundos
};

// Nombres de regiones para UI
export const REGION_NAMES: Record<Region, string> = {
  'north-america': 'América del Norte',
  'south-america': 'América del Sur',
  'europe': 'Europa',
  'asia': 'Asia',
  'africa': 'África',
  'oceania': 'Oceanía',
  'any': 'Cualquier región',
};

// Nombres de categorías para UI
export const CATEGORY_NAMES: Record<UserCategory, string> = {
  'male': 'Masculino',
  'female': 'Femenino',
  'couple': 'Pareja',
};
