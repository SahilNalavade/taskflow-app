import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_GOOGLE_SHEETS_API_KEY', 'test-api-key');
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
vi.stubEnv('VITE_WS_URL', 'ws://localhost:8000/ws');
vi.stubEnv('VITE_ENVIRONMENT', 'test');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock Google APIs
Object.defineProperty(window, 'gapi', {
  value: {
    load: vi.fn(),
    client: {
      init: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'google', {
  value: {
    accounts: {
      oauth2: {
        initTokenClient: vi.fn(),
        revoke: vi.fn(),
      },
    },
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods in tests
beforeEach(() => {
  vi.clearAllMocks();
});