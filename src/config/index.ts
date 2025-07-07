import type { EnvironmentConfig } from '@/types';

// Environment configuration with type safety and validation
class AppConfig {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): EnvironmentConfig {
    return {
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      VITE_GOOGLE_SHEETS_API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      VITE_WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_ENVIRONMENT: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
      VITE_FEATURE_FLAGS: import.meta.env.VITE_FEATURE_FLAGS,
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    if (!this.config.VITE_GOOGLE_CLIENT_ID && this.config.VITE_ENVIRONMENT === 'production') {
      errors.push('VITE_GOOGLE_CLIENT_ID is required in production');
    }

    if (!this.config.VITE_GOOGLE_SHEETS_API_KEY && this.config.VITE_ENVIRONMENT === 'production') {
      errors.push('VITE_GOOGLE_SHEETS_API_KEY is required in production');
    }

    if (errors.length > 0) {
      console.error('Configuration validation errors:', errors);
      if (this.config.VITE_ENVIRONMENT === 'production') {
        throw new Error(`Invalid configuration: ${errors.join(', ')}`);
      }
    }
  }

  get google() {
    return {
      clientId: this.config.VITE_GOOGLE_CLIENT_ID,
      apiKey: this.config.VITE_GOOGLE_SHEETS_API_KEY,
      scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly openid profile email',
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    };
  }

  get api() {
    return {
      baseUrl: this.config.VITE_API_BASE_URL,
      wsUrl: this.config.VITE_WS_URL,
      timeout: 30000,
      retries: 3,
    };
  }

  get app() {
    return {
      name: import.meta.env.VITE_APP_NAME || 'TaskFlow',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: this.config.VITE_ENVIRONMENT,
    };
  }

  get features() {
    return {
      teamMode: this.getBooleanEnv('VITE_FEATURE_TEAM_MODE', true),
      realTime: this.getBooleanEnv('VITE_FEATURE_REAL_TIME', true),
      notifications: this.getBooleanEnv('VITE_FEATURE_NOTIFICATIONS', true),
      analytics: this.getBooleanEnv('VITE_FEATURE_ANALYTICS', false),
    };
  }

  get monitoring() {
    return {
      sentryDsn: this.config.VITE_SENTRY_DSN,
      googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    };
  }

  get security() {
    return {
      csrfTokenHeader: import.meta.env.VITE_CSRF_TOKEN_HEADER || 'X-CSRF-Token',
      sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
    };
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
  }

  get isDevelopment(): boolean {
    return this.config.VITE_ENVIRONMENT === 'development';
  }

  get isProduction(): boolean {
    return this.config.VITE_ENVIRONMENT === 'production';
  }

  get isStaging(): boolean {
    return this.config.VITE_ENVIRONMENT === 'staging';
  }
}

export const config = new AppConfig();
export default config;