import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useRitualRepository } from '@/core/repositories/RepositoryProvider';
import type { NewRitualDTO } from '../types';

export function useRituals() {
  const repository = useRitualRepository();

  return useQuery({
    queryKey: QUERY_KEYS.rituals.all,
    queryFn: () => repository.getAll(),
  });
}

export function useMarkRitualDone() {
  const repository = useRitualRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.markCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rituals.all });
    },
  });
}

export function useSetRitualActive() {
  const repository = useRitualRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      repository.setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rituals.all });
    },
  });
}

export function useCreateRitual() {
  const repository = useRitualRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewRitualDTO) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rituals.all });
    },
  });
}

export function useUpdateRitual() {
  const repository = useRitualRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewRitualDTO> }) =>
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rituals.all });
    },
  });
}

export function useDeleteRitual() {
  const repository = useRitualRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rituals.all });
    },
  });
}
