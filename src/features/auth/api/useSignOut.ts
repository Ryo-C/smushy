import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: repository.signOut,

    onSuccess: () => {
      // Clear the cached session too, otherwise useAuth re-syncs it and signs the user back in
      queryClient.setQueryData(QUERY_KEYS.auth.session, null);
      clearAuth();
      router.replace('/');
    },
  });
}
