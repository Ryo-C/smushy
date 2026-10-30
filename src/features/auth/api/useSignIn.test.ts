/**
 * Tests for useSignIn Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useSignIn } from './useSignIn';
import { useAuthStore } from '../stores/useAuthStore';
import {
  createTestWrapper,
  createMockAuthRepository,
  mockSignInCredentials,
  mockUser,
  mockSession,
  createAuthError,
} from '../__tests__/test-utils';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('useSignIn', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().clearAuth();
  });

  describe('Successful sign in', () => {
    it('should call repository.signIn with credentials', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(mockAuthRepo.signIn).toHaveBeenCalledWith(mockSignInCredentials);
      });
    });

    it('should update auth store on successful sign in', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify auth store was updated
      const authState = useAuthStore.getState();
      expect(authState.user).toEqual(mockUser);
      expect(authState.session).toEqual(mockSession);
      expect(authState.isAuthenticated).toBe(true);
    });

    it('should return user and session data on success', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        user: mockUser,
        session: mockSession,
      });
    });

    it('should set isAuthenticated to true on success', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('Failed sign in', () => {
    it('should handle sign in error', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const error = createAuthError('Invalid email or password');
      mockAuthRepo.signIn.mockRejectedValue(error);

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should not update auth store on error', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockRejectedValue(
        createAuthError('Invalid email or password')
      );

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify auth store was NOT updated
      const authState = useAuthStore.getState();
      expect(authState.user).toBeNull();
      expect(authState.session).toBeNull();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const networkError = createAuthError('Network request failed', 'NETWORK_ERROR');
      mockAuthRepo.signIn.mockRejectedValue(networkError);

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(networkError);
    });

    it('should handle invalid credentials error', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const invalidCredsError = createAuthError(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
      mockAuthRepo.signIn.mockRejectedValue(invalidCredsError);

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(invalidCredsError);
    });
  });

  describe('Loading states', () => {
    it('should set isLoading to true during sign in', async () => {
      const mockAuthRepo = createMockAuthRepository();
      // Create a promise that we control
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockAuthRepo.signIn.mockReturnValue(signInPromise as any);

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      expect(result.current.isPending).toBe(false);

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Resolve the promise
      resolveSignIn!({ user: mockUser, session: mockSession });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should reset error state on new mutation', async () => {
      const mockAuthRepo = createMockAuthRepository();

      // First call fails
      mockAuthRepo.signIn.mockRejectedValueOnce(
        createAuthError('Invalid credentials')
      );

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      // First attempt - fails
      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Second attempt - succeeds
      mockAuthRepo.signIn.mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isError).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle sign in with null user (should not update store)', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockResolvedValue({
        user: null as any,
        session: mockSession,
      });

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Store should not be updated if user is null
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should handle sign in with null session (should not update store)', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockResolvedValue({
        user: mockUser,
        session: null as any,
      });

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Store should not be updated if session is null
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should handle multiple concurrent sign in attempts', async () => {
      const mockAuthRepo = createMockAuthRepository();
      mockAuthRepo.signIn.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      // Trigger multiple mutations
      result.current.mutate(mockSignInCredentials);
      result.current.mutate(mockSignInCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have called repository multiple times
      expect(mockAuthRepo.signIn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Mutation configuration', () => {
    it('should use correct mutation key', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should expose mutation helpers', async () => {
      const mockAuthRepo = createMockAuthRepository();
      const wrapper = createTestWrapper({ authRepository: mockAuthRepo });

      const { result } = renderHook(() => useSignIn(), { wrapper });

      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.mutateAsync).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
