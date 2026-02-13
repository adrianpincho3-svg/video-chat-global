import { UserCategory, MatchingFilter, Region } from '../types';
import { USER_CATEGORIES, MATCHING_FILTERS, REGIONS, LIMITS } from '../constants';

/**
 * Valida si una categoría de usuario es válida
 */
export function isValidUserCategory(category: unknown): category is UserCategory {
  return typeof category === 'string' && USER_CATEGORIES.includes(category as UserCategory);
}

/**
 * Valida si un filtro de emparejamiento es válido
 */
export function isValidMatchingFilter(filter: unknown): filter is MatchingFilter {
  return typeof filter === 'string' && MATCHING_FILTERS.includes(filter as MatchingFilter);
}

/**
 * Valida si una región es válida
 */
export function isValidRegion(region: unknown): region is Region {
  return typeof region === 'string' && REGIONS.includes(region as Region);
}

/**
 * Valida si un mensaje de texto cumple con los límites
 */
export function isValidTextMessage(message: string): boolean {
  return message.length > 0 && message.length <= LIMITS.MESSAGE_MAX_LENGTH;
}

/**
 * Trunca un mensaje si excede el límite
 */
export function truncateMessage(message: string): string {
  if (message.length <= LIMITS.MESSAGE_MAX_LENGTH) {
    return message;
  }
  return message.substring(0, LIMITS.MESSAGE_MAX_LENGTH);
}

/**
 * Formatea el tiempo de espera en formato legible
 */
export function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formatea la duración de sesión en formato legible
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
