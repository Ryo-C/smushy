import type { Logger } from './types';

export const logger: Logger = {
  info: (...args: any[]) => {
    console.log('[INFO]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log('[DEBUG]', ...args);
    }
  },
};
