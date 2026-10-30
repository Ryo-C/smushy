import { storage, STORAGE_KEYS } from '@/libs/storage';
import { getMockData } from '@/core/mock/storage/mockStorage';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import { generateMockId } from '@/core/mock/utils/generateId';
import { MOCK_CONFIG } from '@/shared/constants/config';
import type { SignInCredentials, SignUpCredentials } from '../types';

interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  partner_id?: string;
  created_at: string;
  updated_at: string;
}

interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url?: string;
    };
  };
}

export const mockAuthRepository = {
  signIn: async ({ email, password }: SignInCredentials) => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Attempting sign in:', email);
    }

    const users = await getMockData<MockUser>(STORAGE_KEYS.MOCK_USERS);
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const session: MockSession = {
      access_token: `mock-access-${user.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      expires_at: Date.now() + 3600000, // 1 hour
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          avatar_url: user.avatar_url,
        },
      },
    };

    await storage.setItem(STORAGE_KEYS.MOCK_CURRENT_USER, user.id);

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Sign in successful:', user.email);
    }

    return {
      user: session.user,
      session,
    };
  },

  signUp: async ({ email, password, name }: SignUpCredentials) => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Attempting sign up:', email);
    }

    const users = await getMockData<MockUser>(STORAGE_KEYS.MOCK_USERS);

    if (users.find((u) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: MockUser = {
      id: generateMockId('user'),
      email,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    await storage.setItem(STORAGE_KEYS.MOCK_USERS, users);

    const session: MockSession = {
      access_token: `mock-access-${newUser.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${newUser.id}-${Date.now()}`,
      expires_at: Date.now() + 3600000,
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          name: newUser.name,
        },
      },
    };

    await storage.setItem(STORAGE_KEYS.MOCK_CURRENT_USER, newUser.id);

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Sign up successful:', newUser.email);
    }

    return {
      user: session.user,
      session,
    };
  },

  signOut: async () => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Signing out');
    }

    await storage.removeItem(STORAGE_KEYS.MOCK_CURRENT_USER);
  },

  getSession: async () => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(
      STORAGE_KEYS.MOCK_CURRENT_USER
    );

    if (!currentUserId) {
      return null;
    }

    const users = await getMockData<MockUser>(STORAGE_KEYS.MOCK_USERS);
    const user = users.find((u) => u.id === currentUserId);

    if (!user) {
      return null;
    }

    const session: MockSession = {
      access_token: `mock-access-${user.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      expires_at: Date.now() + 3600000,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          avatar_url: user.avatar_url,
        },
      },
    };

    return session;
  },

  getUser: async () => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(
      STORAGE_KEYS.MOCK_CURRENT_USER
    );

    if (!currentUserId) {
      return null;
    }

    const users = await getMockData<MockUser>(STORAGE_KEYS.MOCK_USERS);
    const user = users.find((u) => u.id === currentUserId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };
  },

  signInWithGoogle: async () => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Google OAuth not fully supported in mock mode');
    }

    throw new Error('OAuth not available in mock mode. Use email/password sign in.');
  },

  signInWithApple: async () => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Apple OAuth not fully supported in mock mode');
    }

    throw new Error('OAuth not available in mock mode. Use email/password sign in.');
  },

  forgotPassword: async (email: string) => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Password reset requested for:', email);
    }

  },

  resetPassword: async (token: string, password: string) => {
    await simulateNetworkDelay();

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Auth] Password reset for token:', token);
    }

  },
};
