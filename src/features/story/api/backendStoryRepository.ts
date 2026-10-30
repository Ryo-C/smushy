import { apiClient } from '@/core/api/client';
import type { StoryItem, StoryRepository } from '../types';

export const backendStoryRepository: StoryRepository = {
  getAll: async (): Promise<StoryItem[]> => {
    return apiClient.get<StoryItem[]>('/story');
  },
};
