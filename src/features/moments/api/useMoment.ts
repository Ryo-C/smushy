import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';

export function useMoment(id: string) {
  const repository = useMomentRepository();

  return useQuery({
    queryKey: QUERY_KEYS.moments.byId(id),
    queryFn: () => repository.getById(id),
    enabled: !!id, // Only run query if ID is provided
  });
}
