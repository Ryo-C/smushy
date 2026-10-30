import { storage, STORAGE_KEYS } from '@/libs/storage';
import {
  getMockData,
  addToCollection,
  updateInCollection,
  removeFromCollection,
  findInCollection,
} from '@/core/mock/storage/mockStorage';
import { simulateNetworkDelay } from '@/core/mock/utils/delay';
import { generateMockId } from '@/core/mock/utils/generateId';
import { MOCK_CONFIG } from '@/shared/constants/config';
import type {
  Moment,
  CreateMomentDTO,
  UpdateMomentDTO,
  MomentFilters,
  MomentRepository,
} from '../types';

export const mockMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters): Promise<Moment[]> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    let moments = await getMockData<Moment>(STORAGE_KEYS.MOCK_MOMENTS);

    moments = moments.filter(
      (m) =>
        m.user_id === currentUserId || (m.is_shared && m.partner_id === currentUserId)
    );

    if (filters) {
      if (filters.type) {
        moments = moments.filter((m) => m.type === filters.type);
      }

      if (filters.dateFrom) {
        moments = moments.filter((m) => new Date(m.date) >= new Date(filters.dateFrom!));
      }

      if (filters.dateTo) {
        moments = moments.filter((m) => new Date(m.date) <= new Date(filters.dateTo!));
      }

      if (filters.tags && filters.tags.length > 0) {
        moments = moments.filter((m) =>
          m.tags?.some((tag) => filters.tags!.includes(tag))
        );
      }

      if (filters.isShared !== undefined) {
        moments = moments.filter((m) => m.is_shared === filters.isShared);
      }

      if (filters.when) {
        const now = Date.now();
        moments = moments.filter((m) =>
          filters.when === 'upcoming'
            ? new Date(m.date).getTime() > now
            : new Date(m.date).getTime() <= now
        );
      }

      const search = filters.search?.trim().toLowerCase();
      if (search) {
        moments = moments.filter((m) =>
          [m.title, m.description, m.location, ...(m.tags ?? [])].some((field) =>
            field?.toLowerCase().includes(search)
          )
        );
      }
    }

    // Upcoming: soonest first. Otherwise newest first.
    const direction = filters?.when === 'upcoming' ? 1 : -1;
    moments.sort(
      (a, b) => direction * (new Date(a.date).getTime() - new Date(b.date).getTime())
    );

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Moments] getAll: ${moments.length} moments`);
    }

    return moments;
  },

  getById: async (id: string): Promise<Moment> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const moment = await findInCollection<Moment>(STORAGE_KEYS.MOCK_MOMENTS, id);

    if (!moment) {
      throw new Error('Moment not found');
    }

    if (
      moment.user_id !== currentUserId &&
      !(moment.is_shared && moment.partner_id === currentUserId)
    ) {
      throw new Error('Access denied');
    }

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Moments] getById: ${id}`);
    }

    return moment;
  },

  create: async (data: CreateMomentDTO): Promise<Moment> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const newMoment: Moment = {
      ...data,
      id: generateMockId('moment'),
      user_id: currentUserId, // Override with current user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await addToCollection(STORAGE_KEYS.MOCK_MOMENTS, newMoment);

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Moments] created: ${newMoment.id}`);
    }

    return newMoment;
  },

  update: async (id: string, updates: UpdateMomentDTO): Promise<Moment> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const existing = await findInCollection<Moment>(STORAGE_KEYS.MOCK_MOMENTS, id);
    if (!existing) {
      throw new Error('Moment not found');
    }

    if (existing.user_id !== currentUserId) {
      throw new Error('Access denied - you can only update your own moments');
    }

    const updated = await updateInCollection<Moment>(
      STORAGE_KEYS.MOCK_MOMENTS,
      id,
      updates
    );

    if (!updated) {
      throw new Error('Update failed');
    }

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Moments] updated: ${id}`);
    }

    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await simulateNetworkDelay();

    const currentUserId = await storage.getItem<string>(STORAGE_KEYS.MOCK_CURRENT_USER);

    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    const existing = await findInCollection<Moment>(STORAGE_KEYS.MOCK_MOMENTS, id);
    if (!existing) {
      throw new Error('Moment not found');
    }

    if (existing.user_id !== currentUserId) {
      throw new Error('Access denied - you can only delete your own moments');
    }

    const success = await removeFromCollection(STORAGE_KEYS.MOCK_MOMENTS, id);

    if (!success) {
      throw new Error('Delete failed');
    }

    if (MOCK_CONFIG.enableLogs) {
      console.log(`[Mock Moments] deleted: ${id}`);
    }
  },
};
