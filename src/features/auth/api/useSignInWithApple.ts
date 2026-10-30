import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';
import { useAuthStore } from '../stores/useAuthStore';

export function useSignInWithApple() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: repository.signInWithApple,

    onSuccess: (data) => {
      if (data.user && data.session) {
        setAuth(data.user, data.session);
      }
    },
  });
}
