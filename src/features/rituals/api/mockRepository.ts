import { storage, STORAGE_KEYS } from '@/libs/storage';
import {
  getMockData,
  updateInCollection,
  addToCollection,
  removeFromCollection,
} from '@/core/mock/storage/mockStorage';
import { generateMockId } from '@/core/mock/utils/generateId';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import { MOCK_CONFIG } from '@/shared/constants/config';
import type { BaseEntity } from '@/shared/types';
import type { NewRitualDTO, Ritual, RitualRepository } from '../types';

interface MockUserRecord extends BaseEntity {
  partner_id?: string;
}

const requireUserId = async (): Promise<string> => {
  const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);
  if (!currentUserId) {
    throw new Error('Not authenticated');
  }
  return currentUserId;
};

const update = async (id: string, updates: Partial<Ritual>): Promise<Ritual> => {
  const updated = await updateInCollection<Ritual>(
    STORAGE_KEYS.MOCK_RITUALS,
    id,
    updates
  );
  if (!updated) {
    throw new Error('Ritual not found');
  }
  return updated;
};

export const mockRitualRepository: RitualRepository = {
  getAll: async (): Promise<Ritual[]> => {
    await simulateNetworkDelay();
    const currentUserId = await requireUserId();

    const [rituals, users] = await Promise.all([
      getMockData<Ritual>(STORAGE_KEYS.MOCK_RITUALS),
      getMockData<MockUserRecord>(STORAGE_KEYS.MOCK_USERS),
    ]);
    const partnerId = users.find((u) => u.id === currentUserId)?.partner_id;
    const mine = rituals.filter(
      (r) => r.user_id === currentUserId || r.user_id === partnerId
    );

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Rituals] getAll: ${mine.length} rituals`);
    }

    return mine;
  },

  markCompleted: async (id: string): Promise<Ritual> => {
    await simulateNetworkDelay();
    await requireUserId();
    return update(id, { last_completed: new Date().toISOString() });
  },

  setActive: async (id: string, isActive: boolean): Promise<Ritual> => {
    await simulateNetworkDelay();
    await requireUserId();
    return update(id, { is_active: isActive });
  },

  create: async (data: NewRitualDTO): Promise<Ritual> => {
    await simulateNetworkDelay();
    const currentUserId = await requireUserId();
    const users = await getMockData<MockUserRecord>(STORAGE_KEYS.MOCK_USERS);
    const now = new Date().toISOString();

    return addToCollection<Ritual>(STORAGE_KEYS.MOCK_RITUALS, {
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      id: generateMockId('ritual'),
      user_id: currentUserId,
      partner_id: users.find((u) => u.id === currentUserId)?.partner_id,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  },

  update: async (id: string, data: Partial<NewRitualDTO>): Promise<Ritual> => {
    await simulateNetworkDelay();
    await requireUserId();
    return update(id, {
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim() || undefined,
    });
  },

  delete: async (id: string): Promise<void> => {
    await simulateNetworkDelay();
    await requireUserId();
    await removeFromCollection(STORAGE_KEYS.MOCK_RITUALS, id);
  },
};
