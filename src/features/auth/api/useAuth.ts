import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useAuthStore } from '../stores/useAuthStore';
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';

export function useAuth() {
  const { user, session, isAuthenticated, setAuth } = useAuthStore();
  const repository = useAuthRepository();

  const { data: currentSession, isLoading } = useQuery({
    queryKey: QUERY_KEYS.auth.session,
    queryFn: () => repository.getSession(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (currentSession) {
      repository.getUser().then((fetchedUser) => setAuth(fetchedUser, currentSession));
    }
  }, [currentSession, setAuth, repository]);

  return { user, session, isAuthenticated, isLoading };
}
