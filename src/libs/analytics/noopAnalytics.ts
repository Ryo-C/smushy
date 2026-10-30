import type { Analytics } from './types';

export const analytics: Analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (__DEV__) {
      console.log('[Analytics]', event, properties);
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (__DEV__) {
      console.log('[Analytics] Identify:', userId, traits);
    }
  },

  screen: (name: string, properties?: Record<string, any>) => {
    if (__DEV__) {
      console.log('[Analytics] Screen:', name, properties);
    }
  },
};
