import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useCheckInRepository } from '@/core/repositories/RepositoryProvider';
import type { NewCheckInDTO } from '../types';

export function useCheckIns() {
  const repository = useCheckInRepository();

  return useQuery({
    queryKey: QUERY_KEYS.checkins.all,
    queryFn: () => repository.getVisible(),
  });
}

export function useCreateCheckIn() {
  const repository = useCheckInRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewCheckInDTO) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkins.all });
      // Shared check-ins appear in Story
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });
    },
  });
}

export function useUpdateCheckIn() {
  const repository = useCheckInRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewCheckInDTO> }) =>
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkins.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });
    },
  });
}

export function useDeleteCheckIn() {
  const repository = useCheckInRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkins.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });
    },
  });
}
