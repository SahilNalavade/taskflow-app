/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_SHEETS_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly VITE_FEATURE_FLAGS?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_FEATURE_TEAM_MODE?: string;
  readonly VITE_FEATURE_REAL_TIME?: string;
  readonly VITE_FEATURE_NOTIFICATIONS?: string;
  readonly VITE_FEATURE_ANALYTICS?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_CSRF_TOKEN_HEADER?: string;
  readonly VITE_SESSION_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}