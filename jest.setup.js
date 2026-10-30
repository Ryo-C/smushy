/**
 * Jest Setup File
 *
 * This file runs before all tests and sets up mocks for native modules
 * that aren't available in the Jest environment.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence console warnings during tests (optional)
global.console = {
  ...console,
  warn: jest.fn(), // Suppress warnings
  error: jest.fn(), // Suppress errors
};
