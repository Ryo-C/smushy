/**
 * Tests for Mock Auth Repository
 */

import { mockAuthRepository } from './mockAuthRepository';
import { storage, STORAGE_KEYS } from '@/libs/storage';

// Mock storage and mock data functions
jest.mock('@/libs/storage');
jest.mock('@/core/mock/storage/mockStorage');
jest.mock('@/core/mock/utils/delay', () => ({
  simulateNetworkDelay: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/core/mock/utils/generateId', () => ({
  generateMockId: jest.fn((prefix) => `${prefix}-mock-123`),
}));
jest.mock('@/shared/constants/config', () => ({
  MOCK_CONFIG: {
    enabled: true,
    enableLogs: false,
  },
}));

const mockGetMockData = jest.fn();
jest.mock('@/core/mock/storage/mockStorage', () => ({
  getMockData: (...args: any[]) => mockGetMockData(...args),
}));

describe('mockAuthRepository', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      email: 'john@example.com',
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockGetMockData.mockResolvedValue(mockUsers);
    (storage.setItem as jest.Mock).mockResolvedValue(undefined);
    (storage.getItem as jest.Mock).mockResolvedValue(null);
    (storage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('signIn', () => {
    it('should sign in existing user with correct credentials', async () => {
      const result = await mockAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.user_metadata?.name).toBe('Test User');
    });

    it('should create session with access and refresh tokens', async () => {
      const result = await mockAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.session.access_token).toContain('mock-access');
      expect(result.session.refresh_token).toContain('mock-refresh');
      expect(result.session.expires_at).toBeGreaterThan(Date.now());
    });

    it('should store current user ID in storage', async () => {
      await mockAuthRepository.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOCK_CURRENT_USER,
        'user-1'
      );
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        mockAuthRepository.signIn({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should include avatar_url in user metadata if available', async () => {
      const result = await mockAuthRepository.signIn({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result.user.user_metadata?.avatar_url).toBe(
        'https://example.com/avatar.jpg'
      );
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      // Reset users to allow push
      mockGetMockData.mockResolvedValue([...mockUsers]);
    });

    it('should create new user account', async () => {
      const result = await mockAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.user_metadata?.name).toBe('New User');
    });

    it('should generate user ID', async () => {
      const result = await mockAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.user.id).toBe('user-mock-123');
    });

    it('should add new user to storage', async () => {
      await mockAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOCK_USERS,
        expect.arrayContaining([
          expect.objectContaining({
            email: 'newuser@example.com',
            name: 'New User',
          }),
        ])
      );
    });

    it('should create session for new user', async () => {
      const result = await mockAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.session.access_token).toContain('mock-access');
      expect(result.session.refresh_token).toContain('mock-refresh');
    });

    it('should store current user ID after signup', async () => {
      await mockAuthRepository.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MOCK_CURRENT_USER,
        expect.any(String)
      );
    });

    it('should throw error if email already exists', async () => {
      await expect(
        mockAuthRepository.signUp({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('signOut', () => {
    it('should remove current user from storage', async () => {
      await mockAuthRepository.signOut();

      expect(storage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MOCK_CURRENT_USER);
    });

    it('should complete without errors', async () => {
      await expect(mockAuthRepository.signOut()).resolves.not.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return session for authenticated user', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('user-1');

      const session = await mockAuthRepository.getSession();

      expect(session).not.toBeNull();
      expect(session?.user.email).toBe('test@example.com');
      expect(session?.access_token).toContain('mock-access');
    });

    it('should return null if no current user', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);

      const session = await mockAuthRepository.getSession();

      expect(session).toBeNull();
    });

    it('should return null if user not found in users list', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('nonexistent-user');

      const session = await mockAuthRepository.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user for authenticated user', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('user-1');

      const user = await mockAuthRepository.getUser();

      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(user?.user_metadata?.name).toBe('Test User');
    });

    it('should return null if no current user', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);

      const user = await mockAuthRepository.getUser();

      expect(user).toBeNull();
    });

    it('should return null if user not found', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('nonexistent-user');

      const user = await mockAuthRepository.getUser();

      expect(user).toBeNull();
    });

    it('should include avatar_url if available', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('user-2');

      const user = await mockAuthRepository.getUser();

      expect(user?.user_metadata?.avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('OAuth methods', () => {
    it('signInWithGoogle should throw not available error', async () => {
      await expect(mockAuthRepository.signInWithGoogle()).rejects.toThrow(
        'OAuth not available in mock mode'
      );
    });

    it('signInWithApple should throw not available error', async () => {
      await expect(mockAuthRepository.signInWithApple()).rejects.toThrow(
        'OAuth not available in mock mode'
      );
    });
  });

  describe('Password reset methods', () => {
    it('forgotPassword should complete without errors', async () => {
      await expect(
        mockAuthRepository.forgotPassword('test@example.com')
      ).resolves.not.toThrow();
    });

    it('resetPassword should complete without errors', async () => {
      await expect(
        mockAuthRepository.resetPassword('mock-token', 'newPassword123')
      ).resolves.not.toThrow();
    });
  });
});
