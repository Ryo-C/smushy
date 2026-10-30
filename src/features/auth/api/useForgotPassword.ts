import { useMutation } from '@tanstack/react-query';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';

export function useForgotPassword() {
  const authRepository = useAuthRepository();

  return useMutation({
    mutationFn: (email: string) => authRepository.forgotPassword(email),
  });
}
