import { GeoIPService } from '../GeoIPService';

describe('GeoIPService', () => {
  let service: GeoIPService;

  beforeEach(() => {
    service = new GeoIPService();
  });

  describe('detectRegion', () => {
    it('should return "any" for local IPs', () => {
      expect(service.detectRegion('127.0.0.1')).toBe('any');
      expect(service.detectRegion('localhost')).toBe('any');
      expect(service.detectRegion('192.168.1.1')).toBe('any');
      expect(service.detectRegion('10.0.0.1')).toBe('any');
    });

    it('should detect region for valid IPs', () => {
      // IP de Google (US)
      const region = service.detectRegion('8.8.8.8');
      expect(region).toBe('north-america');
    });

    it('should return "any" for invalid IPs', () => {
      expect(service.detectRegion('invalid')).toBe('any');
      expect(service.detectRegion('')).toBe('any');
    });
  });

  describe('countryToRegion', () => {
    it('should map US to north-america', () => {
      expect(service.countryToRegion('US')).toBe('north-america');
    });

    it('should map BR to south-america', () => {
      expect(service.countryToRegion('BR')).toBe('south-america');
    });

    it('should map DE to europe', () => {
      expect(service.countryToRegion('DE')).toBe('europe');
    });

    it('should map JP to asia', () => {
      expect(service.countryToRegion('JP')).toBe('asia');
    });

    it('should map ZA to africa', () => {
      expect(service.countryToRegion('ZA')).toBe('africa');
    });

    it('should map AU to oceania', () => {
      expect(service.countryToRegion('AU')).toBe('oceania');
    });

    it('should return "any" for unknown countries', () => {
      expect(service.countryToRegion('XX')).toBe('any');
    });
  });

  describe('getSTUNServers', () => {
    it('should return STUN servers for a region', () => {
      const servers = service.getSTUNServers('north-america');
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
    });

    it('should return default servers for "any" region', () => {
      const servers = service.getSTUNServers('any');
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
    });
  });

  describe('getOptimalSTUNServers', () => {
    it('should return same region servers when both regions are equal', () => {
      const servers = service.getOptimalSTUNServers('europe', 'europe');
      const europeServers = service.getSTUNServers('europe');
      expect(servers).toEqual(europeServers);
    });

    it('should combine servers from different regions', () => {
      const servers = service.getOptimalSTUNServers('north-america', 'europe');
      expect(servers).toBeDefined();
      expect(servers.length).toBeGreaterThan(0);
    });

    it('should handle "any" region', () => {
      const servers = service.getOptimalSTUNServers('any', 'europe');
      const europeServers = service.getSTUNServers('europe');
      expect(servers).toEqual(europeServers);
    });
  });

  describe('getRegionDistance', () => {
    it('should return 0 for same regions', () => {
      expect(service.getRegionDistance('europe', 'europe')).toBe(0);
    });

    it('should return symmetric distances', () => {
      const d1 = service.getRegionDistance('north-america', 'europe');
      const d2 = service.getRegionDistance('europe', 'north-america');
      expect(d1).toBe(d2);
    });

    it('should return 5 for "any" region', () => {
      expect(service.getRegionDistance('any', 'europe')).toBe(5);
      expect(service.getRegionDistance('north-america', 'any')).toBe(5);
    });

    it('should return higher distances for far regions', () => {
      const nearDistance = service.getRegionDistance('europe', 'africa');
      const farDistance = service.getRegionDistance('north-america', 'oceania');
      expect(farDistance).toBeGreaterThan(nearDistance);
    });
  });

  describe('getLocation', () => {
    it('should return location info for local IPs', () => {
      const location = service.getLocation('127.0.0.1');
      expect(location).toBeDefined();
      expect(location?.country).toBe('Local');
      expect(location?.region).toBe('any');
    });

    it('should return null for invalid IPs', () => {
      const location = service.getLocation('invalid');
      expect(location).toBeNull();
    });
  });
});
