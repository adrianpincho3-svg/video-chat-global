import { UserCategory, MatchingFilter, Region } from '../types';
import { USER_CATEGORIES, REGIONS } from '../constants';

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
  return typeof filter === 'string' && 
    (USER_CATEGORIES.includes(filter as UserCategory) || filter === 'any');
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
export function isValidTextMessage(message: unknown): message is string {
  return typeof message === 'string' && 
    message.length > 0 && 
    message.length <= 1000;
}

/**
 * Valida si un ID de usuario tiene formato válido
 */
export function isValidUserId(userId: unknown): userId is string {
  return typeof userId === 'string' && userId.length > 0;
}

/**
 * Genera un ID de usuario con formato federado (localId@domain)
 */
export function generateFederatedUserId(localId: string, domain: string = 'localhost'): string {
  return `${localId}@${domain}`;
}

/**
 * Extrae el ID local de un ID federado
 */
export function extractLocalId(federatedId: string): string {
  const parts = federatedId.split('@');
  return parts[0];
}

/**
 * Extrae el dominio de un ID federado
 */
export function extractDomain(federatedId: string): string {
  const parts = federatedId.split('@');
  return parts.length > 1 ? parts[1] : 'localhost';
}
