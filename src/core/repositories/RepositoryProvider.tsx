import { createContext, useContext, useMemo, ReactNode } from 'react';
import { MOCK_CONFIG, BACKEND_CONFIG } from '@/shared/constants/config';
import type { Repositories } from './types';

const RepositoryContext = createContext<Repositories | null>(null);

interface RepositoryProviderProps {
  children: ReactNode;
  /** If provided, these will be used instead of loading from environment config. */
  repositories?: Partial<Repositories>;
}

export function RepositoryProvider({ children, repositories: customRepositories }: RepositoryProviderProps) {
  const repositories = useMemo<Repositories>(() => {
    if (customRepositories) {
      if (MOCK_CONFIG.enableLogs) {
        console.log('[RepositoryProvider] Using CUSTOM repositories (testing mode)');
      }
      return {
        auth: customRepositories.auth ?? ({} as any),
        moments: customRepositories.moments ?? ({} as any),
        story: customRepositories.story ?? ({} as any),
        checkIns: customRepositories.checkIns ?? ({} as any),
        rituals: customRepositories.rituals ?? ({} as any),
        profile: customRepositories.profile ?? ({} as any),
      };
    }

    if (MOCK_CONFIG.enabled) {
      if (MOCK_CONFIG.enableLogs) {
        console.log('[RepositoryProvider] Using MOCK repositories');
      }
      return loadMockRepositories();
    }

    if (BACKEND_CONFIG.enabled) {
      if (MOCK_CONFIG.enableLogs) {
        console.log('[RepositoryProvider] Using BACKEND repositories');
      }
      return loadBackendRepositories();
    }

    throw new Error(
      'Invalid repository configuration. Set EXPO_PUBLIC_USE_MOCK_DATA in .env:\n' +
        '- true = Mock mode (in-memory data)\n' +
        '- false = Backend mode (REST API)'
    );
  }, [customRepositories]);

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
}

function loadMockRepositories(): Repositories {
  const { mockAuthRepository } = require('@/features/auth/api/mockAuthRepository');
  const { mockMomentRepository } = require('@/features/moments/api/mockRepository');
  const { mockStoryRepository } = require('@/features/story/api/mockRepository');
  const { mockCheckInRepository } = require('@/features/checkins/api/mockRepository');
  const { mockRitualRepository } = require('@/features/rituals/api/mockRepository');
  const { mockProfileRepository } = require('@/features/profile/api/mockRepository');

  return {
    auth: mockAuthRepository,
    moments: mockMomentRepository,
    story: mockStoryRepository,
    checkIns: mockCheckInRepository,
    rituals: mockRitualRepository,
    profile: mockProfileRepository,
  };
}

function loadBackendRepositories(): Repositories {
  const { backendAuthRepository } = require('@/features/auth/api/backendAuthRepository');
  const { backendMomentRepository } = require('@/features/moments/api/backendMomentRepository');
  const { backendStoryRepository } = require('@/features/story/api/backendStoryRepository');
  const { backendCheckInRepository } = require('@/features/checkins/api/backendCheckInRepository');
  const { backendRitualRepository } = require('@/features/rituals/api/backendRitualRepository');
  const { backendProfileRepository } = require('@/features/profile/api/backendProfileRepository');

  return {
    auth: backendAuthRepository,
    moments: backendMomentRepository,
    story: backendStoryRepository,
    checkIns: backendCheckInRepository,
    rituals: backendRitualRepository,
    profile: backendProfileRepository,
  };
}

/** Throws error if used outside RepositoryProvider */
export function useRepositories(): Repositories {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories must be used within RepositoryProvider');
  }
  return context;
}

export function useAuthRepository() {
  return useRepositories().auth;
}

export function useMomentRepository() {
  return useRepositories().moments;
}

export function useStoryRepository() {
  return useRepositories().story;
}

export function useCheckInRepository() {
  return useRepositories().checkIns;
}

export function useRitualRepository() {
  return useRepositories().rituals;
}

export function useProfileRepository() {
  return useRepositories().profile;
}
