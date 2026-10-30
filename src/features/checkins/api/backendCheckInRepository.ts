import { apiClient } from '@/core/api/client';
import type { CheckIn, CheckInEntry, CheckInRepository, NewCheckInDTO } from '../types';

export const backendCheckInRepository: CheckInRepository = {
  getVisible: async (): Promise<CheckInEntry[]> => {
    return apiClient.get<CheckInEntry[]>('/checkins');
  },

  create: async (data: NewCheckInDTO): Promise<CheckIn> => {
    return apiClient.post<CheckIn>('/checkins', data);
  },

  update: async (id: string, data: Partial<NewCheckInDTO>): Promise<CheckIn> => {
    return apiClient.patch<CheckIn>(`/checkins/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/checkins/${id}`);
  },
};
