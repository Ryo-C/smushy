import { apiClient } from '@/core/api/client';
import { setTokens, removeTokens, hasValidTokens } from '@/core/api/tokenManager';
import type { AuthRepository } from '@/core/repositories/types';
import type { SignInCredentials, SignUpCredentials, AuthUser, AuthSession } from '../types';
import type { AuthResponse } from '@/core/api/types';
import { storage, STORAGE_KEYS } from '@/libs/storage';

function transformAuthResponse(response: AuthResponse): {
  user: AuthUser;
  session: AuthSession;
} {
  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email,
    user_metadata: {
      name: response.user.name,
      avatar_url: response.user.avatar_url,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    partner_id: response.user.partner_id,
  };

  return {
    user,
    session: {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_in: response.expires_in,
      expires_at: Math.floor(Date.now() / 1000) + response.expires_in,
      token_type: 'bearer',
      user,
    },
  };
}

export const backendAuthRepository: AuthRepository = {
  signIn: async (credentials: SignInCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/signin',
      {
        email: credentials.email,
        password: credentials.password,
      },
      { skipAuth: true } // Don't send auth token for login
    );

    await setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return transformAuthResponse(response);
  },

  signUp: async (credentials: SignUpCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/signup',
      {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      },
      { skipAuth: true } // Don't send auth token for signup
    );

    await setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return transformAuthResponse(response);
  },

  signOut: async () => {
    try {
      await apiClient.post('/auth/signout');
    } catch (error) {
      console.error('Backend signout failed:', error);
    } finally {
      await removeTokens();
    }
  },

  getSession: async () => {
    const hasTokens = await hasValidTokens();

    if (!hasTokens) {
      return null;
    }

    try {
      const user = await apiClient.get<AuthUser>('/auth/me');

      // Note: We don't have access_token/refresh_token here since they're managed by tokenManager
      return {
        user,
        access_token: '', // Token is managed by tokenManager
        refresh_token: '',
        expires_in: 0,
        expires_at: 0,
        token_type: 'bearer',
      };
    } catch (error) {
      await removeTokens();
      return null;
    }
  },

  getUser: async () => {
    const hasTokens = await hasValidTokens();

    if (!hasTokens) {
      return null;
    }

    try {
      const user = await apiClient.get<{
        id: string;
        email: string;
        name: string;
        avatar_url?: string;
        partner_id?: string;
      }>('/auth/me');

      return {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          avatar_url: user.avatar_url,
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        partner_id: user.partner_id,
      };
    } catch (error) {
      await removeTokens();
      return null;
    }
  },

  signInWithGoogle: async () => {
    // Dynamic import to avoid bundling issues
    const WebBrowser = await import('expo-web-browser');
    
    const initiateResponse = await apiClient.post<{
      authUrl: string;
      state: string;
    }>(
      '/auth/google/initiate',
      {},
      { skipAuth: true }
    );

    const { authUrl, state } = initiateResponse;

    await storage.setItem(STORAGE_KEYS.OAUTH_STATE, state);

    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      'smushy://auth/callback'
    );

    if (result.type === 'cancel') {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_CANCELLED');
    }

    if (result.type !== 'success' || !result.url) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED');
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error(`OAUTH_FAILED: ${error}`);
    }

    if (!code || !returnedState) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED: Missing code or state');
    }

    const savedState = await storage.getItem<string>(STORAGE_KEYS.OAUTH_STATE);
    if (savedState !== returnedState) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED: Invalid state (CSRF check failed)');
    }

    const response = await apiClient.post<AuthResponse>(
      '/auth/google/callback',
      { code, state: returnedState },
      { skipAuth: true }
    );

    await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);

    await setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return transformAuthResponse(response);
  },

  signInWithApple: async () => {
    // Dynamic import to avoid bundling issues
    const WebBrowser = await import('expo-web-browser');
    
    const initiateResponse = await apiClient.post<{
      authUrl: string;
      state: string;
    }>(
      '/auth/apple/initiate',
      {},
      { skipAuth: true }
    );

    const { authUrl, state } = initiateResponse;

    await storage.setItem(STORAGE_KEYS.OAUTH_STATE, state);

    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      'smushy://auth/callback'
    );

    if (result.type === 'cancel') {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_CANCELLED');
    }

    if (result.type !== 'success' || !result.url) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED');
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error(`OAUTH_FAILED: ${error}`);
    }

    if (!code || !returnedState) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED: Missing code or state');
    }

    const savedState = await storage.getItem<string>(STORAGE_KEYS.OAUTH_STATE);
    if (savedState !== returnedState) {
      await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);
      throw new Error('OAUTH_FAILED: Invalid state (CSRF check failed)');
    }

    const response = await apiClient.post<AuthResponse>(
      '/auth/apple/callback',
      { code, state: returnedState },
      { skipAuth: true }
    );

    await storage.removeItem(STORAGE_KEYS.OAUTH_STATE);

    await setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );

    return transformAuthResponse(response);
  },
  forgotPassword: async (email: string) => {
    await apiClient.post(
      '/auth/forgot-password',
      { email },
      { skipAuth: true } // Don't require authentication
    );
    // Success - email sent (or suppressed if email doesn't exist for security)
  },

  resetPassword: async (token: string, password: string) => {
    await apiClient.post(
      '/auth/reset-password',
      { token, password },
      { skipAuth: true } // Don't require authentication
    );
  },
};
