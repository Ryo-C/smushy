import { apiClient } from '@/core/api/client';
import type { NewRitualDTO, Ritual, RitualRepository } from '../types';

export const backendRitualRepository: RitualRepository = {
  getAll: async (): Promise<Ritual[]> => {
    return apiClient.get<Ritual[]>('/rituals');
  },

  markCompleted: async (id: string): Promise<Ritual> => {
    return apiClient.post<Ritual>(`/rituals/${id}/complete`);
  },

  setActive: async (id: string, isActive: boolean): Promise<Ritual> => {
    return apiClient.patch<Ritual>(`/rituals/${id}`, { is_active: isActive });
  },

  create: async (data: NewRitualDTO): Promise<Ritual> => {
    return apiClient.post<Ritual>('/rituals', data);
  },

  update: async (id: string, data: Partial<NewRitualDTO>): Promise<Ritual> => {
    return apiClient.patch<Ritual>(`/rituals/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rituals/${id}`);
  },
};
