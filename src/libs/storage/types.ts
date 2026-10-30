export interface Storage {
  getItem<T>(key: string): Promise<T | null>;

  setItem<T>(key: string, value: T): Promise<void>;

  removeItem(key: string): Promise<void>;

  clear(): Promise<void>;
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  BACKEND_ACCESS_TOKEN: 'backend_access_token',
  BACKEND_REFRESH_TOKEN: 'backend_refresh_token',
  TOKEN_EXPIRY: 'token_expiry',

  OAUTH_STATE: 'oauth_state',

  MOCK_DATA_INITIALIZED: 'mock_data_initialized',
  MOCK_CURRENT_USER: 'mock_current_user',
  MOCK_USERS: 'mock_users',
  MOCK_MOMENTS: 'mock_moments',
  MOCK_CHECKINS: 'mock_checkins',
  MOCK_RITUALS: 'mock_rituals',
  MOCK_PROFILES: 'mock_profiles',
} as const;
