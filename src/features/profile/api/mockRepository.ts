import { storage, STORAGE_KEYS } from '@/libs/storage';
import { getMockData, updateInCollection } from '@/core/mock/storage/mockStorage';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import type { ProfileRepository, UserPreferences, UserProfile } from '../types';

const getProfiles = async (): Promise<{ profiles: UserProfile[]; userId: string }> => {
  const userId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return { profiles: await getMockData<UserProfile>(STORAGE_KEYS.MOCK_PROFILES), userId };
};

export const mockProfileRepository: ProfileRepository = {
  getCurrent: async (): Promise<UserProfile> => {
    await simulateNetworkDelay();
    const { profiles, userId } = await getProfiles();
    const profile = profiles.find((p) => p.user_id === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile;
  },

  getPartner: async (): Promise<UserProfile | null> => {
    await simulateNetworkDelay();
    const { profiles, userId } = await getProfiles();
    const partnerId = profiles.find((p) => p.user_id === userId)?.partner_id;
    return profiles.find((p) => p.user_id === partnerId) ?? null;
  },

  updatePreferences: async (
    preferences: Partial<UserPreferences>
  ): Promise<UserProfile> => {
    await simulateNetworkDelay();
    const { profiles, userId } = await getProfiles();
    const profile = profiles.find((p) => p.user_id === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const updated = await updateInCollection<UserProfile>(
      STORAGE_KEYS.MOCK_PROFILES,
      profile.id,
      {
        preferences: { ...profile.preferences, ...preferences },
      }
    );
    if (!updated) {
      throw new Error('Profile not found');
    }
    return updated;
  },

  updateDetails: async (details: {
    name: string;
    bio?: string;
  }): Promise<UserProfile> => {
    await simulateNetworkDelay();
    const { profiles, userId } = await getProfiles();
    const profile = profiles.find((p) => p.user_id === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    const name = details.name.trim();
    const updated = await updateInCollection<UserProfile>(
      STORAGE_KEYS.MOCK_PROFILES,
      profile.id,
      {
        name,
        bio: details.bio?.trim() || undefined,
      }
    );
    // Story and check-ins read display names from the users collection
    await updateInCollection<UserProfile>(STORAGE_KEYS.MOCK_USERS, userId, { name });
    if (!updated) {
      throw new Error('Profile not found');
    }
    return updated;
  },
};
