import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useProfileRepository } from '@/core/repositories/RepositoryProvider';
import type { UserPreferences, UserProfile } from '../types';

export function useProfile() {
  const repository = useProfileRepository();

  return useQuery({
    queryKey: QUERY_KEYS.profile.current,
    queryFn: () => repository.getCurrent(),
  });
}

export function usePartnerProfile() {
  const repository = useProfileRepository();

  return useQuery({
    queryKey: QUERY_KEYS.profile.partner,
    queryFn: () => repository.getPartner(),
  });
}

export function useUpdatePreferences() {
  const repository = useProfileRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      repository.updatePreferences(preferences),
    // Optimistic so switches respond instantly
    onMutate: async (preferences) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile.current });
      const previous = queryClient.getQueryData<UserProfile>(QUERY_KEYS.profile.current);
      if (previous) {
        queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile.current, {
          ...previous,
          preferences: { ...previous.preferences, ...preferences },
        });
      }
      return { previous };
    },
    onError: (_error, _preferences, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.profile.current, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.current });
    },
  });
}

export function useUpdateProfileDetails() {
  const repository = useProfileRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (details: { name: string; bio?: string }) =>
      repository.updateDetails(details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.current });
      // Display names appear in Story and check-ins
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.story.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkins.all });
    },
  });
}
