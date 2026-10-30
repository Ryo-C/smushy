import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';
import type { CreateMomentDTO } from '../types';

export function useCreateMoment() {
  const queryClient = useQueryClient();
  const repository = useMomentRepository();

  return useMutation({
    mutationFn: (data: CreateMomentDTO) => repository.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
      // Story is derived from moments
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });
    },
  });
}
