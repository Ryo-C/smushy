import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';
import type { UpdateMomentDTO } from '../types';

export function useUpdateMoment() {
  const queryClient = useQueryClient();
  const repository = useMomentRepository();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMomentDTO }) =>
      repository.update(id, data),

    onSuccess: (updatedMoment) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
      // Story is derived from moments
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.moments.byId(updatedMoment.id),
      });
    },
  });
}
