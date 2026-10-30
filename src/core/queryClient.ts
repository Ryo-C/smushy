import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      // Don't refetch on window focus in mobile app
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
