import geoip from 'geoip-lite';
import { Region, GeoLocation } from '../types';
import { COUNTRY_TO_REGION, STUN_SERVERS_BY_REGION } from '../constants';

/**
 * Servicio de geolocalización para detectar región de usuarios
 * y obtener servidores STUN/TURN óptimos
 */
export class GeoIPService {
  /**
   * Detecta la región geográfica basándose en la dirección IP
   */
  detectRegion(ipAddress: string): Region {
    // Manejar IPs locales
    if (this.isLocalIP(ipAddress)) {
      return 'any';
    }

    const geo = geoip.lookup(ipAddress);
    
    if (!geo || !geo.country) {
      return 'any';
    }

    return this.countryToRegion(geo.country);
  }

  /**
   * Obtiene información geográfica completa de una IP
   */
  getLocation(ipAddress: string): GeoLocation | null {
    // Manejar IPs locales
    if (this.isLocalIP(ipAddress)) {
      return {
        country: 'Local',
        countryCode: 'LOCAL',
        region: 'any',
        latitude: 0,
        longitude: 0,
      };
    }

    const geo = geoip.lookup(ipAddress);
    
    if (!geo) {
      return null;
    }

    return {
      country: geo.country,
      countryCode: geo.country,
      region: this.countryToRegion(geo.country),
      latitude: geo.ll[0],
      longitude: geo.ll[1],
    };
  }

  /**
   * Mapea un código de país a una región
   */
  countryToRegion(countryCode: string): Region {
    return COUNTRY_TO_REGION[countryCode] || 'any';
  }

  /**
   * Obtiene los servidores STUN/TURN más cercanos para una región
   */
  getSTUNServers(region: Region): RTCIceServer[] {
    return STUN_SERVERS_BY_REGION[region] || STUN_SERVERS_BY_REGION['any'];
  }

  /**
   * Obtiene los servidores STUN/TURN óptimos para dos regiones
   * Prioriza servidores que estén geográficamente entre ambas regiones
   */
  getOptimalSTUNServers(region1: Region, region2: Region): RTCIceServer[] {
    // Si ambas regiones son iguales, usar servidores de esa región
    if (region1 === region2) {
      return this.getSTUNServers(region1);
    }

    // Si alguna es 'any', usar la otra
    if (region1 === 'any') {
      return this.getSTUNServers(region2);
    }
    if (region2 === 'any') {
      return this.getSTUNServers(region1);
    }

    // Combinar servidores de ambas regiones
    const servers1 = this.getSTUNServers(region1);
    const servers2 = this.getSTUNServers(region2);
    
    // Mezclar servidores alternando entre ambas regiones
    const combined: RTCIceServer[] = [];
    const maxLength = Math.max(servers1.length, servers2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < servers1.length) {
        combined.push(servers1[i]);
      }
      if (i < servers2.length) {
        combined.push(servers2[i]);
      }
    }

    // Eliminar duplicados
    const unique = combined.filter((server, index, self) =>
      index === self.findIndex((s) => 
        JSON.stringify(s.urls) === JSON.stringify(server.urls)
      )
    );

    return unique;
  }

  /**
   * Calcula la distancia aproximada entre dos regiones (en escala 0-10)
   * Usado para scoring de emparejamiento
   */
  getRegionDistance(region1: Region, region2: Region): number {
    // Si son iguales, distancia 0
    if (region1 === region2) {
      return 0;
    }

    // Si alguna es 'any', distancia neutral
    if (region1 === 'any' || region2 === 'any') {
      return 5;
    }

    // Matriz de distancias aproximadas entre regiones
    const distances: Record<Region, Record<Region, number>> = {
      'north-america': {
        'north-america': 0,
        'south-america': 3,
        'europe': 5,
        'asia': 8,
        'africa': 7,
        'oceania': 9,
        'any': 5,
      },
      'south-america': {
        'north-america': 3,
        'south-america': 0,
        'europe': 6,
        'asia': 9,
        'africa': 7,
        'oceania': 10,
        'any': 5,
      },
      'europe': {
        'north-america': 5,
        'south-america': 6,
        'europe': 0,
        'asia': 4,
        'africa': 3,
        'oceania': 8,
        'any': 5,
      },
      'asia': {
        'north-america': 8,
        'south-america': 9,
        'europe': 4,
        'asia': 0,
        'africa': 5,
        'oceania': 4,
        'any': 5,
      },
      'africa': {
        'north-america': 7,
        'south-america': 7,
        'europe': 3,
        'asia': 5,
        'africa': 0,
        'oceania': 8,
        'any': 5,
      },
      'oceania': {
        'north-america': 9,
        'south-america': 10,
        'europe': 8,
        'asia': 4,
        'africa': 8,
        'oceania': 0,
        'any': 5,
      },
      'any': {
        'north-america': 5,
        'south-america': 5,
        'europe': 5,
        'asia': 5,
        'africa': 5,
        'oceania': 5,
        'any': 5,
      },
    };

    return distances[region1]?.[region2] ?? 5;
  }

  /**
   * Verifica si una IP es local (localhost, LAN, etc.)
   */
  private isLocalIP(ipAddress: string): boolean {
    // IPv4 locales
    if (
      ipAddress === '127.0.0.1' ||
      ipAddress === 'localhost' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.16.') ||
      ipAddress === '::1' ||
      ipAddress === '::ffff:127.0.0.1'
    ) {
      return true;
    }

    return false;
  }

  /**
   * Extrae la IP real del request considerando proxies
   */
  extractIPFromRequest(req: any): string {
    // Intentar obtener IP de headers de proxy
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = forwarded.split(',');
      return ips[0].trim();
    }

    const realIP = req.headers['x-real-ip'];
    if (realIP) {
      return realIP;
    }

    // Fallback a la IP de conexión
    return req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.ip || 
           '127.0.0.1';
  }
}

// Exportar instancia singleton
export const geoIPService = new GeoIPService();
