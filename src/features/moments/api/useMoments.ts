import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';
import type { MomentFilters } from '../types';

export function useMoments(filters?: MomentFilters) {
  const repository = useMomentRepository();

  return useQuery({
    queryKey: QUERY_KEYS.moments.list(filters),
    queryFn: () => repository.getAll(filters),
    // Keep showing the current list while a new filter loads, instead of flashing a spinner
    placeholderData: keepPreviousData,
  });
}
