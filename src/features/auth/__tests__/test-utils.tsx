/**
 * Test Utilities for Auth Feature
 *
 * Provides test wrappers, mock data, and helper functions for testing
 * auth components, hooks, and flows.
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';
import type { AuthRepository } from '@/core/repositories/types';
import type { User, Session, SignInCredentials, SignUpCredentials } from '../types';

/**
 * Mock User Data
 */
export const mockUser: User = {
  id: 'test-user-123',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockUser2: User = {
  id: 'test-user-456',
  email: 'user2@example.com',
  user_metadata: {
    name: 'Test User 2',
  },
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

/**
 * Mock Session Data
 */
export const mockSession: Session = {
  access_token: 'mock-access-token-123',
  refresh_token: 'mock-refresh-token-123',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'Bearer',
  user: mockUser,
};

/**
 * Mock Credentials
 */
export const mockSignInCredentials: SignInCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockSignUpCredentials: SignUpCredentials = {
  email: 'newuser@example.com',
  password: 'password123',
  name: 'New User',
};

/**
 * Create Mock Auth Repository
 *
 * Returns a fully mocked AuthRepository with jest mock functions.
 * All methods are mocked and can be configured in individual tests.
 */
export function createMockAuthRepository(): jest.Mocked<AuthRepository> {
  return {
    signIn: jest.fn().mockResolvedValue({
      user: mockUser,
      session: mockSession,
    }),
    signUp: jest.fn().mockResolvedValue({
      user: mockUser,
      session: mockSession,
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    getSession: jest.fn().mockResolvedValue(mockSession),
    getUser: jest.fn().mockResolvedValue(mockUser),
    signInWithGoogle: jest.fn().mockResolvedValue({
      user: mockUser,
      session: mockSession,
    }),
    signInWithApple: jest.fn().mockResolvedValue({
      user: mockUser,
      session: mockSession,
    }),
    forgotPassword: jest.fn().mockResolvedValue(undefined),
    resetPassword: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Create Test Query Client
 *
 * Creates a QueryClient configured for testing:
 * - No retries (fail fast)
 * - No caching (isolated tests)
 * - No background refetching
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Test Wrapper Options
 */
interface TestWrapperOptions {
  /**
   * Custom QueryClient instance
   */
  queryClient?: QueryClient;

  /**
   * Custom mock auth repository
   */
  authRepository?: jest.Mocked<AuthRepository>;
}

/**
 * Create Test Wrapper
 *
 * Returns a wrapper component that provides all necessary context for testing:
 * - QueryClientProvider (TanStack Query)
 * - RepositoryProvider (Dependency Injection)
 *
 * Usage:
 * ```tsx
 * const { result } = renderHook(() => useSignIn(), {
 *   wrapper: createTestWrapper(),
 * });
 * ```
 */
export function createTestWrapper(options: TestWrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const authRepository = options.authRepository ?? createMockAuthRepository();

  // Create repositories object with auth repository
  const repositories = {
    auth: authRepository,
    // Add other repositories as needed (can be empty mocks for auth tests)
    moments: {} as any,
    story: {} as any,
    checkIns: {} as any,
    rituals: {} as any,
    profile: {} as any,
  };

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider repositories={repositories}>
          {children}
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

/**
 * Wait for async operations
 *
 * Helper to wait for TanStack Query to settle.
 */
export async function waitForQuery() {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
}

/**
 * Create Auth Error
 *
 * Helper to create auth errors for testing error handling.
 */
export function createAuthError(message: string, code?: string): Error {
  const error = new Error(message) as Error & { code?: string };
  if (code) {
    error.code = code;
  }
  return error;
}
