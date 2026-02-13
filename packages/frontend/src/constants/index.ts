import { Region, UserCategory, MatchingFilter } from '../types';

// Categorías de usuario
export const USER_CATEGORIES: UserCategory[] = ['male', 'female', 'couple'];

// Filtros de emparejamiento
export const MATCHING_FILTERS: MatchingFilter[] = ['male', 'female', 'couple', 'any'];

// Regiones
export const REGIONS: Region[] = [
  'north-america',
  'south-america',
  'europe',
  'asia',
  'africa',
  'oceania',
  'any'
];

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

// Nombres de filtros para UI
export const FILTER_NAMES: Record<MatchingFilter, string> = {
  'male': 'Masculino',
  'female': 'Femenino',
  'couple': 'Parejas',
  'any': 'Cualquiera',
};

// Timeouts
export const TIMEOUTS = {
  WEBRTC_CONNECTION: 30000, // 30 segundos
  RECONNECTION_ATTEMPT: 15000, // 15 segundos
  BOT_OFFER: 10000, // 10 segundos
};

// Límites
export const LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
};

// URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
