/**
 * Tests for Backend Auth Repository
 */

import { backendAuthRepository } from './backendAuthRepository';
import { apiClient } from '@/core/api/client';
import { setTokens, removeTokens, hasValidTokens } from '@/core/api/tokenManager';
import { storage, STORAGE_KEYS } from '@/libs/storage';

// Mock dependencies
jest.mock('@/core/api/client');
jest.mock('@/core/api/tokenManager');
jest.mock('@/libs/storage');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSetTokens = setTokens as jest.MockedFunction<typeof setTokens>;
const mockRemoveTokens = removeTokens as jest.MockedFunction<typeof removeTokens>;
const mockHasValidTokens = hasValidTokens as jest.MockedFunction<typeof hasValidTokens>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('backendAuthRepository', () => {
  const mockAuthResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      partner_id: 'partner-456',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should call API with credentials', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/signin',
        {
          email: 'test@example.com',
          password: 'password123',
        },
        { skipAuth: true }
      );
    });

    it('should store tokens after successful sign in', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSetTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
        3600
      );
    });

    it('should return transformed user and session', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      const result = await backendAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.user_metadata?.name).toBe('Test User');
      expect(result.session.access_token).toBe('mock-access-token');
    });

    it('should throw error on API failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        backendAuthRepository.signIn({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should call API with credentials and name', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/signup',
        {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        },
        { skipAuth: true }
      );
    });

    it('should store tokens after successful sign up', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(mockSetTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
        3600
      );
    });

    it('should return transformed user and session', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      const result = await backendAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('signOut', () => {
    it('should call backend signout endpoint', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      mockRemoveTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signOut();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/signout');
    });

    it('should remove tokens after sign out', async () => {
      mockApiClient.post.mockResolvedValue(undefined);
      mockRemoveTokens.mockResolvedValue(undefined);

      await backendAuthRepository.signOut();

      expect(mockRemoveTokens).toHaveBeenCalled();
    });

    it('should remove tokens even if backend call fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));
      mockRemoveTokens.mockResolvedValue(undefined);

      // Mock console.error to suppress error log in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await backendAuthRepository.signOut();

      expect(mockRemoveTokens).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getSession', () => {
    it('should return null if no valid tokens', async () => {
      mockHasValidTokens.mockResolvedValue(false);

      const session = await backendAuthRepository.getSession();

      expect(session).toBeNull();
    });

    it('should fetch user and return session if tokens valid', async () => {
      mockHasValidTokens.mockResolvedValue(true);
      mockApiClient.get.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });

      const session = await backendAuthRepository.getSession();

      expect(session).not.toBeNull();
      expect(session?.user.email).toBe('test@example.com');
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should remove tokens and return null if user fetch fails', async () => {
      mockHasValidTokens.mockResolvedValue(true);
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));
      mockRemoveTokens.mockResolvedValue(undefined);

      const session = await backendAuthRepository.getSession();

      expect(session).toBeNull();
      expect(mockRemoveTokens).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return null if no valid tokens', async () => {
      mockHasValidTokens.mockResolvedValue(false);

      const user = await backendAuthRepository.getUser();

      expect(user).toBeNull();
    });

    it('should fetch and return user if tokens valid', async () => {
      mockHasValidTokens.mockResolvedValue(true);
      mockApiClient.get.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const user = await backendAuthRepository.getUser();

      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(user?.user_metadata?.name).toBe('Test User');
      expect(user?.user_metadata?.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('should remove tokens and return null if user fetch fails', async () => {
      mockHasValidTokens.mockResolvedValue(true);
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));
      mockRemoveTokens.mockResolvedValue(undefined);

      const user = await backendAuthRepository.getUser();

      expect(user).toBeNull();
      expect(mockRemoveTokens).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should call API with email', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await backendAuthRepository.forgotPassword('test@example.com');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        { skipAuth: true }
      );
    });

    it('should complete without errors', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await expect(
        backendAuthRepository.forgotPassword('test@example.com')
      ).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should call API with token and password', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await backendAuthRepository.resetPassword('reset-token-123', 'newPassword123');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        { token: 'reset-token-123', password: 'newPassword123' },
        { skipAuth: true }
      );
    });

    it('should complete without errors', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await expect(
        backendAuthRepository.resetPassword('reset-token-123', 'newPassword123')
      ).resolves.not.toThrow();
    });
  });

  describe('transformAuthResponse helper', () => {
    it('should transform response correctly', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse);
      mockSetTokens.mockResolvedValue(undefined);

      const result = await backendAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.user_metadata?.name).toBe('Test User');
      expect(result.user.user_metadata?.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(result.user.partner_id).toBe('partner-456');
      expect(result.session.access_token).toBe('mock-access-token');
      expect(result.session.refresh_token).toBe('mock-refresh-token');
      expect(result.session.expires_in).toBe(3600);
      expect(result.session.token_type).toBe('bearer');
    });

    it('should handle missing optional fields', async () => {
      const minimalResponse = {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockApiClient.post.mockResolvedValue(minimalResponse);
      mockSetTokens.mockResolvedValue(undefined);

      const result = await backendAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.user_metadata?.avatar_url).toBeUndefined();
      expect(result.user.partner_id).toBeUndefined();
    });
  });
});
