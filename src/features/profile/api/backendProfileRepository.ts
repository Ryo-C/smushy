import { apiClient } from '@/core/api/client';
import type { ProfileRepository, UserPreferences, UserProfile } from '../types';

export const backendProfileRepository: ProfileRepository = {
  getCurrent: async (): Promise<UserProfile> => apiClient.get<UserProfile>('/profile'),

  getPartner: async (): Promise<UserProfile | null> =>
    apiClient.get<UserProfile | null>('/profile/partner'),

  updatePreferences: async (
    preferences: Partial<UserPreferences>
  ): Promise<UserProfile> =>
    apiClient.patch<UserProfile>('/profile/preferences', preferences),

  updateDetails: async (details: { name: string; bio?: string }): Promise<UserProfile> =>
    apiClient.patch<UserProfile>('/profile', details),
};
