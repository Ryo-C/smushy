import { storage, STORAGE_KEYS } from '@/libs/storage';
import {
  getMockData,
  addToCollection,
  findInCollection,
  updateInCollection,
  removeFromCollection,
} from '@/core/mock/storage/mockStorage';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import { generateMockId } from '@/core/mock/utils/generateId';
import { MOCK_CONFIG } from '@/shared/constants/config';
import type { BaseEntity } from '@/shared/types';
import type { CheckIn, CheckInEntry, CheckInRepository, NewCheckInDTO } from '../types';

interface MockUserRecord extends BaseEntity {
  name: string;
  partner_id?: string;
}

const requireUserId = async (): Promise<string> => {
  const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);
  if (!currentUserId) {
    throw new Error('Not authenticated');
  }
  return currentUserId;
};

/** Check-ins are private unless shared; partners only see each other's shared ones */
const requireOwnCheckIn = async (id: string): Promise<CheckIn> => {
  const currentUserId = await requireUserId();
  const checkIn = await findInCollection<CheckIn>(STORAGE_KEYS.MOCK_CHECKINS, id);
  if (!checkIn || checkIn.user_id !== currentUserId) {
    throw new Error('You can only change your own check-ins');
  }
  return checkIn;
};

export const mockCheckInRepository: CheckInRepository = {
  getVisible: async (): Promise<CheckInEntry[]> => {
    await simulateNetworkDelay();
    const currentUserId = await requireUserId();

    const [checkIns, users] = await Promise.all([
      getMockData<CheckIn>(STORAGE_KEYS.MOCK_CHECKINS),
      getMockData<MockUserRecord>(STORAGE_KEYS.MOCK_USERS),
    ]);
    const partnerId = users.find((u) => u.id === currentUserId)?.partner_id;
    const nameOf = (id: string): string =>
      users.find((u) => u.id === id)?.name ?? 'Someone';

    const visible = checkIns
      .filter(
        (c) => c.user_id === currentUserId || (c.user_id === partnerId && c.is_shared)
      )
      .map((c) => ({
        ...c,
        author_name: nameOf(c.user_id),
        is_mine: c.user_id === currentUserId,
      }))
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Check-ins] getVisible: ${visible.length} check-ins`);
    }

    return visible;
  },

  create: async (data: NewCheckInDTO): Promise<CheckIn> => {
    await simulateNetworkDelay();
    const currentUserId = await requireUserId();
    const now = new Date().toISOString();

    return addToCollection<CheckIn>(STORAGE_KEYS.MOCK_CHECKINS, {
      id: generateMockId('checkin'),
      user_id: currentUserId,
      content: data.content.trim(),
      mood: data.mood,
      is_shared: data.is_shared,
      shared_at: data.is_shared ? now : undefined,
      partner_viewed: false,
      created_at: now,
      updated_at: now,
    });
  },

  update: async (id: string, data: Partial<NewCheckInDTO>): Promise<CheckIn> => {
    await simulateNetworkDelay();
    const existing = await requireOwnCheckIn(id);
    const sharingNow = data.is_shared === true && !existing.is_shared;
    const updated = await updateInCollection<CheckIn>(STORAGE_KEYS.MOCK_CHECKINS, id, {
      ...data,
      content: data.content?.trim() ?? existing.content,
      shared_at: sharingNow ? new Date().toISOString() : existing.shared_at,
    });
    if (!updated) {
      throw new Error('Check-in not found');
    }
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await simulateNetworkDelay();
    await requireOwnCheckIn(id);
    await removeFromCollection(STORAGE_KEYS.MOCK_CHECKINS, id);
  },
};
