import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useStoryRepository } from '@/core/repositories/RepositoryProvider';

export function useStory() {
  const repository = useStoryRepository();

  return useQuery({
    queryKey: QUERY_KEYS.story.all,
    queryFn: () => repository.getAll(),
  });
}
