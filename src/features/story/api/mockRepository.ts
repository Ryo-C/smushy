import { storage, STORAGE_KEYS } from '@/libs/storage';
import { getMockData } from '@/core/mock/storage/mockStorage';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import { MOCK_CONFIG } from '@/shared/constants/config';
import type { BaseEntity } from '@/shared/types';
import type { StoryItem, StoryMood, StoryRepository } from '../types';

// Minimal shapes of the mock records Story reads, so Story doesn't import other features' types
interface MockMomentRecord extends BaseEntity {
  title: string;
  description?: string;
  date: string;
  location?: string;
  photo_url?: string;
  user_id: string;
  is_shared: boolean;
}

interface MockCheckInRecord extends BaseEntity {
  user_id: string;
  content: string;
  mood?: StoryMood;
  is_shared: boolean;
}

interface MockUserRecord extends BaseEntity {
  name: string;
  partner_id?: string;
}

/**
 * Built from the mock moments and check-ins, so anything created in the app shows up here.
 * Only the couple's shared items appear, and moments only once they've happened.
 */
export const mockStoryRepository: StoryRepository = {
  getAll: async (): Promise<StoryItem[]> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const [moments, checkIns, users] = await Promise.all([
      getMockData<MockMomentRecord>(STORAGE_KEYS.MOCK_MOMENTS),
      getMockData<MockCheckInRecord>(STORAGE_KEYS.MOCK_CHECKINS),
      getMockData<MockUserRecord>(STORAGE_KEYS.MOCK_USERS),
    ]);

    const partnerId = users.find((u) => u.id === currentUserId)?.partner_id;
    const isCouple = (userId: string): boolean =>
      userId === currentUserId || userId === partnerId;
    const nameOf = (userId: string): string =>
      users.find((u) => u.id === userId)?.name ?? 'Someone';
    const now = Date.now();

    const momentItems: StoryItem[] = moments
      .filter(
        (m) => m.is_shared && isCouple(m.user_id) && new Date(m.date).getTime() <= now
      )
      .map((m) => ({
        id: `moment:${m.id}`,
        type: 'moment',
        source_id: m.id,
        date: m.date,
        title: m.title,
        description: m.description,
        photo_url: m.photo_url,
        location: m.location,
        author_name: nameOf(m.user_id),
        is_mine: m.user_id === currentUserId,
      }));

    const checkInItems: StoryItem[] = checkIns
      .filter((c) => c.is_shared && isCouple(c.user_id))
      .map((c) => ({
        id: `checkin:${c.id}`,
        type: 'checkin',
        source_id: c.id,
        date: c.created_at,
        description: c.content,
        mood: c.mood,
        author_name: nameOf(c.user_id),
        is_mine: c.user_id === currentUserId,
      }));

    const items = [...momentItems, ...checkInItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Story] getAll: ${items.length} items`);
    }

    return items;
  },
};
