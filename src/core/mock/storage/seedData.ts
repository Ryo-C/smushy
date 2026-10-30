import { storage, STORAGE_KEYS } from '@/libs/storage';
import { setMockData, clearAllMockData } from './mockStorage';
import { MOCK_CONFIG } from '@/shared/constants/config';
import { queryClient } from '@/core/queryClient';

import usersData from '../data/users.json';
import momentsData from '../data/moments.json';
import checkinsData from '../data/checkins.json';
import ritualsData from '../data/rituals.json';
import profilesData from '../data/profiles.json';

/**
 * Bump this whenever the seed JSON changes so existing installs reseed on next launch.
 * Reseeding overwrites any mock data created in the app.
 */
const SEED_VERSION = 1;

export async function initializeAllSeedData(): Promise<void> {
  try {
    const seededVersion = await storage.getItem<number | boolean>(
      STORAGE_KEYS.MOCK_DATA_INITIALIZED
    );

    if (seededVersion === SEED_VERSION) {
      if (MOCK_CONFIG.enableLogs) {
        console.log('[Mock Data] Already initialized, skipping seed data load');
      }
      return;
    }

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Data] Initializing seed data...');
    }

    await setMockData(STORAGE_KEYS.MOCK_USERS, usersData);
    await setMockData(STORAGE_KEYS.MOCK_MOMENTS, momentsData);
    await setMockData(STORAGE_KEYS.MOCK_CHECKINS, checkinsData);
    await setMockData(STORAGE_KEYS.MOCK_RITUALS, ritualsData);
    await setMockData(STORAGE_KEYS.MOCK_PROFILES, profilesData);

    if (MOCK_CONFIG.autoLoginOnStartup && usersData.length > 0) {
      await storage.setItem(STORAGE_KEYS.MOCK_CURRENT_USER, usersData[0].id);
      if (MOCK_CONFIG.enableLogs) {
        console.log('[Mock Data] Auto-login ENABLED - set current user to:', usersData[0].email);
      }
    } else {
      if (MOCK_CONFIG.enableLogs) {
        console.log('[Mock Data] Auto-login DISABLED - user must log in manually');
      }
    }

    await storage.setItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED, SEED_VERSION);

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Data] Seed data initialized successfully');
    }

    // Queries may have read the old data before seeding finished
    await queryClient.invalidateQueries();
  } catch (error) {
    console.error('[Mock Data] Error initializing seed data:', error);
  }
}

export async function resetToSeeds(): Promise<void> {
  try {
    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Data] Resetting to seed data...');
    }

    await clearAllMockData();

    await setMockData(STORAGE_KEYS.MOCK_USERS, usersData);
    await setMockData(STORAGE_KEYS.MOCK_MOMENTS, momentsData);
    await setMockData(STORAGE_KEYS.MOCK_CHECKINS, checkinsData);
    await setMockData(STORAGE_KEYS.MOCK_RITUALS, ritualsData);
    await setMockData(STORAGE_KEYS.MOCK_PROFILES, profilesData);

    if (MOCK_CONFIG.autoLoginOnStartup && usersData.length > 0) {
      await storage.setItem(STORAGE_KEYS.MOCK_CURRENT_USER, usersData[0].id);
      if (MOCK_CONFIG.enableLogs) {
        console.log('[Mock Data] Auto-login enabled - set current user');
      }
    }

    await storage.setItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED, SEED_VERSION);

    if (MOCK_CONFIG.enableLogs) {
      console.log('[Mock Data] Reset to seed data complete');
    }
  } catch (error) {
    console.error('[Mock Data] Error resetting to seed data:', error);
  }
}
