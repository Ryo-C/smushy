import { apiClient } from '@/core/api/client';
import type { MomentRepository } from '@/core/repositories/types';
import type { Moment, CreateMomentDTO, UpdateMomentDTO, MomentFilters } from '../types';

function buildQueryString(filters?: MomentFilters): string {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  if (filters.type) {
    params.append('type', filters.type);
  }

  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo);
  }

  if (filters.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }

  if (filters.isShared !== undefined) {
    params.append('isShared', String(filters.isShared));
  }

  if (filters.when) {
    params.append('when', filters.when);
  }

  if (filters.search?.trim()) {
    params.append('search', filters.search.trim());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const backendMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters) => {
    const queryString = buildQueryString(filters);
    return apiClient.get<Moment[]>(`/moments${queryString}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Moment>(`/moments/${id}`);
  },

  create: async (data: CreateMomentDTO) => {
    return apiClient.post<Moment>('/moments', data);
  },

  update: async (id: string, updates: UpdateMomentDTO) => {
    return apiClient.patch<Moment>(`/moments/${id}`, updates);
  },

  delete: async (id: string) => {
    await apiClient.delete(`/moments/${id}`);
  },
};
