import { useMutation } from '@tanstack/react-query';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';

export function useResetPassword() {
  const authRepository = useAuthRepository();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authRepository.resetPassword(token, password),
  });
}
