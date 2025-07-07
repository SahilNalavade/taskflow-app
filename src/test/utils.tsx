import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTask = (overrides = {}) => ({
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test task description',
  status: 'pending' as const,
  priority: 'medium' as const,
  createdBy: 'test-user-id',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTeam = (overrides = {}) => ({
  id: 'test-team-id',
  name: 'Test Team',
  description: 'Test team description',
  ownerId: 'test-user-id',
  owner: createMockUser(),
  members: [],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  settings: {
    isPublic: false,
    allowGuestAccess: false,
    defaultTaskStatus: 'pending' as const,
    requiredTaskFields: [],
    workingDays: [1, 2, 3, 4, 5],
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    timezone: 'UTC',
  },
  ...overrides,
});

// Mock implementation helpers
export const mockFetch = (response: any) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

export const mockFetchError = (error: string, status = 500) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: error,
    json: async () => ({ error }),
    text: async () => error,
  });
};

// Wait utilities
export const waitForLoading = () => new Promise(resolve => setTimeout(resolve, 0));