import { describe, it, expect, beforeEach, vi } from 'vitest';
import config from './index';

describe('AppConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('google configuration', () => {
    it('returns correct google configuration', () => {
      const googleConfig = config.google;
      
      expect(googleConfig).toEqual({
        clientId: 'test-client-id',
        apiKey: 'test-api-key',
        scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly openid profile email',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      });
    });
  });

  describe('api configuration', () => {
    it('returns correct api configuration', () => {
      const apiConfig = config.api;
      
      expect(apiConfig).toEqual({
        baseUrl: 'http://localhost:8000/api',
        wsUrl: 'ws://localhost:8000/ws',
        timeout: 30000,
        retries: 3,
      });
    });
  });

  describe('app configuration', () => {
    it('returns correct app configuration', () => {
      const appConfig = config.app;
      
      expect(appConfig.environment).toBe('test');
      expect(appConfig.name).toBe('TaskFlow');
      expect(appConfig.version).toBe('1.0.0');
    });
  });

  describe('environment checks', () => {
    it('correctly identifies test environment', () => {
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(false);
      expect(config.isStaging).toBe(false);
    });
  });

  describe('features configuration', () => {
    it('returns default feature flags', () => {
      const features = config.features;
      
      expect(features.teamMode).toBe(true);
      expect(features.realTime).toBe(true);
      expect(features.notifications).toBe(true);
      expect(features.analytics).toBe(false);
    });
  });

  describe('security configuration', () => {
    it('returns correct security settings', () => {
      const security = config.security;
      
      expect(security.csrfTokenHeader).toBe('X-CSRF-Token');
      expect(security.sessionTimeout).toBe(3600000);
    });
  });
});