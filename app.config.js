/**
 * Expo App Configuration
 *
 * Dynamic configuration based on environment variables.
 * Supports multiple app variants (mock vs production) with different:
 * - App names
 * - Bundle identifiers
 * - App icons (visually differentiate mock from production)
 * - Environment settings
 */

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
const IS_DEV = process.env.EXPO_PUBLIC_ENV === 'development';

export default {
  expo: {
    // App name varies by environment
    name: IS_MOCK ? 'Smushy (Mock)' : 'Smushy',
    slug: 'smushy',
    version: '1.0.0',
    orientation: 'portrait',
    
    // Deep linking scheme for OAuth callbacks
    scheme: 'smushy',

    // App icon (you can create different icons for mock vs production)
    icon: './assets/icon.png',

    userInterfaceStyle: 'light',
    newArchEnabled: true,

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      // Different splash background for mock
      backgroundColor: IS_MOCK ? '#FFF4E6' : '#ffffff',
    },

    // iOS Configuration
    ios: {
      supportsTablet: true,
      // Different bundle identifiers = can install both versions side-by-side
      bundleIdentifier: IS_MOCK ? 'com.smushy.app.mock' : 'com.smushy.app',
      buildNumber: '1.0.0',
    },

    // Android Configuration
    android: {
      // Different package names = can install both versions side-by-side
      package: IS_MOCK ? 'com.smushy.app.mock' : 'com.smushy.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        // Different background color for mock app
        backgroundColor: IS_MOCK ? '#FFF4E6' : '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: './assets/favicon.png',
    },

    // Extra configuration accessible via expo-constants
    extra: {
      useMockData: IS_MOCK,
      environment: process.env.EXPO_PUBLIC_ENV || 'development',
    },

    // Plugins
    plugins: [
      'expo-router',
      'expo-web-browser',
      'expo-font',
      'expo-image',
      'expo-splash-screen',
      'expo-status-bar',
    ],
  },
};
