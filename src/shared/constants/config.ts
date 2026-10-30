export const APP_CONFIG = {
  name: 'Smushy',
  version: '0.1.0',
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
} as const;

export const MOCK_CONFIG = {
  enabled: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  autoLoginOnStartup: process.env.EXPO_PUBLIC_MOCK_AUTO_LOGIN !== 'false',  // Auto-login first user in mock mode
  delayMin: 200,        // Minimum network delay (ms)
  delayMax: 800,        // Maximum network delay (ms)
  errorRate: 0,         // Error simulation rate (0 = disabled)
  enableLogs: true,     // Log mock operations for debugging
} as const;

export const BACKEND_CONFIG = {
  enabled: !MOCK_CONFIG.enabled,  // Inverse of mock mode
  baseUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000/api',
  timeout: 30000,       // Request timeout (ms)
} as const;

export const FEATURE_FLAGS = {
  enableAnalytics: false,
  enablePushNotifications: false,
  enableCalendarSync: false,
} as const;

export const VALIDATION = {
  minPasswordLength: 8,
  maxMomentTitleLength: 100,
  maxMomentDescriptionLength: 500,
  maxCheckinLength: 1000,
} as const;
