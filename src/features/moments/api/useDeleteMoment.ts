import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';

export function useDeleteMoment() {
  const queryClient = useQueryClient();
  const repository = useMomentRepository();

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),

    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
      // Story is derived from moments
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });

      queryClient.removeQueries({
        queryKey: QUERY_KEYS.moments.byId(deletedId),
      });
    },
  });
}
