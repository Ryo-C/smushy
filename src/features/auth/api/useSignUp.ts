import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';
import { useAuthStore } from '../stores/useAuthStore';
import type { SignUpCredentials } from '../types';

export function useSignUp() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const repository = useAuthRepository();

  return useMutation({
    mutationFn: (credentials: SignUpCredentials) =>
      repository.signUp(credentials),

    onSuccess: (data) => {
      if (data.user && data.session) {
        setAuth(data.user, data.session);
      }
    },
  });
}
