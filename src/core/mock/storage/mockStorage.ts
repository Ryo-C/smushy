import { storage, STORAGE_KEYS } from '@/libs/storage';
import type { BaseEntity } from '@/shared/types';

export async function getMockData<T extends BaseEntity>(
  key: string
): Promise<T[]> {
  try {
    const data = await storage.getItem<T[]>(key);
    return data || [];
  } catch (error) {
    console.error(`Error getting mock data for ${key}:`, error);
    return [];
  }
}

export async function setMockData<T extends BaseEntity>(
  key: string,
  data: T[]
): Promise<void> {
  try {
    await storage.setItem(key, data);
  } catch (error) {
    console.error(`Error setting mock data for ${key}:`, error);
  }
}

export async function addToCollection<T extends BaseEntity>(
  key: string,
  item: T
): Promise<T> {
  const collection = await getMockData<T>(key);
  collection.push(item);
  await setMockData(key, collection);
  return item;
}

export async function updateInCollection<T extends BaseEntity>(
  key: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const collection = await getMockData<T>(key);
  const index = collection.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...collection[index],
    ...updates,
    updated_at: new Date().toISOString(),
  } as T;

  collection[index] = updated;
  await setMockData(key, collection);
  return updated;
}

export async function removeFromCollection(
  key: string,
  id: string
): Promise<boolean> {
  const collection = await getMockData(key);
  const filtered = collection.filter((item) => item.id !== id);

  if (filtered.length === collection.length) {
    return false; // Item not found
  }

  await setMockData(key, filtered);
  return true;
}

export async function findInCollection<T extends BaseEntity>(
  key: string,
  id: string
): Promise<T | null> {
  const collection = await getMockData<T>(key);
  return collection.find((item) => item.id === id) || null;
}

export async function clearAllMockData(): Promise<void> {
  const mockKeys = [
    STORAGE_KEYS.MOCK_USERS,
    STORAGE_KEYS.MOCK_MOMENTS,
    STORAGE_KEYS.MOCK_CHECKINS,
    STORAGE_KEYS.MOCK_RITUALS,
    STORAGE_KEYS.MOCK_PROFILES,
    STORAGE_KEYS.MOCK_CURRENT_USER,
  ];

  for (const key of mockKeys) {
    await storage.removeItem(key);
  }

  await storage.removeItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED);
}
