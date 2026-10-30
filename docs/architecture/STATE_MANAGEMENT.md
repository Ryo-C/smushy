# State Management Architecture

**Project:** Smushy
**Last Updated:** 2026-01-03

## Overview

Smushy uses a dual-state management approach:
- **TanStack Query (React Query)** — Server/API state
- **Zustand** — Client/UI state

This separation ensures clear responsibility and optimal performance.

---

## State Management Decision Tree

```
Is it data from REST API?
├─ YES → Use TanStack Query
│         └─ Create repository interface + backend/mock implementations + useQuery hook
│
└─ NO → Is it app-wide state (auth, theme)?
    ├─ YES → Use Zustand
    │         └─ Create global store in /shared/stores or /features/*/stores
    │
    └─ NO → Is it component-local state?
        └─ YES → Use useState
                 └─ Keep in component
```

---

## TanStack Query (Server State)

### Repository Pattern with Dependency Injection

Each feature defines a repository interface in `/src/core/repositories/types.ts`:

```typescript
// src/core/repositories/types.ts
export interface MomentRepository {
  getAll: (filters?: MomentFilters) => Promise<Moment[]>;
  getById: (id: string) => Promise<Moment>;
  create: (data: CreateMomentDTO) => Promise<Moment>;
  update: (id: string, data: UpdateMomentDTO) => Promise<Moment>;
  delete: (id: string) => Promise<void>;
}
```

### Two Implementations per Feature

**1. Backend Repository (REST API):**

```typescript
// src/features/moments/api/backendMomentRepository.ts
import { apiClient } from '@/core/api/client';
import type { Moment, CreateMomentDTO, UpdateMomentDTO } from '../types';
import type { MomentRepository } from '@/core/repositories/types';

export const backendMomentRepository: MomentRepository = {
  getAll: async (filters) => {
    return apiClient.get<Moment[]>('/moments', { params: filters });
  },

  getById: async (id) => {
    return apiClient.get<Moment>(`/moments/${id}`);
  },

  create: async (data) => {
    return apiClient.post<Moment>('/moments', data);
  },

  update: async (id, data) => {
    return apiClient.patch<Moment>(`/moments/${id}`, data);
  },

  delete: async (id) => {
    await apiClient.delete(`/moments/${id}`);
  },
};
```

**2. Mock Repository (In-Memory):**

```typescript
// src/features/moments/api/mockMomentRepository.ts
import { mockStorage } from '@/core/mock/storage/mockStorage';
import type { Moment, CreateMomentDTO, UpdateMomentDTO } from '../types';
import type { MomentRepository } from '@/core/repositories/types';

export const mockMomentRepository: MomentRepository = {
  getAll: async (filters) => {
    return mockStorage.getAllMoments(filters);
  },

  getById: async (id) => {
    return mockStorage.getMomentById(id);
  },

  create: async (data) => {
    return mockStorage.createMoment(data);
  },

  update: async (id, data) => {
    return mockStorage.updateMoment(id, data);
  },

  delete: async (id) => {
    await mockStorage.deleteMoment(id);
  },
};
```

### TanStack Query Hooks (Using DI)

**Query Hook:**

```typescript
// src/features/moments/api/useMoments.ts
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';

export function useMoments(filters?: MomentFilters) {
  const repository = useMomentRepository();  // ← Injected repository

  return useQuery({
    queryKey: QUERY_KEYS.moments.list(filters),  // ← filters MUST be in the key
    queryFn: () => repository.getAll(filters),
  });
}
```

> ⚠️ Any value the `queryFn` depends on (filters, ids, params) must be part of the `queryKey`. With a fixed key like `QUERY_KEYS.moments.all`, every filter shares one cache entry and changing the filter never refetches.

**Mutation Hook:**

```typescript
// src/features/moments/api/useCreateMoment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';

export function useCreateMoment() {
  const queryClient = useQueryClient();
  const repository = useMomentRepository();  // ← Injected repository

  return useMutation({
    mutationFn: (data: CreateMomentDTO) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
    },
  });
}
```

### Query Keys (Centralized)

All query keys are defined in `/src/shared/constants/queryKeys.ts`:

```typescript
// src/shared/constants/queryKeys.ts
export const QUERY_KEYS = {
  moments: {
    all: ['moments'] as const,
    list: (filters?: object) => ['moments', 'list', filters ?? {}] as const,
    byId: (id: string) => ['moments', id] as const,
  },
  story: {
    all: ['story'] as const,
  },
  checkins: {
    all: ['checkins'] as const,
    byId: (id: string) => ['checkins', id] as const,
  },
  rituals: {
    all: ['rituals'] as const,
  },
} as const;
```

**Benefits:**
- Type-safe query keys
- Centralized management
- Easy to invalidate related queries (invalidating `moments.all` also covers every `moments.list(...)` key, since it's a prefix)
- Consistent across features

---

## Zustand (Client State)

### Global App State

For app-wide state like authentication, theme, or global UI state:

```typescript
// src/features/auth/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthSession } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, session: AuthSession | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      setAuth: (user, session) => set({
        user,
        session,
        isAuthenticated: !!user && !!session
      }),
      clearAuth: () => set({
        user: null,
        session: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Usage:**

```typescript
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

function ProfileScreen() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Button onPress={clearAuth}>Logout</Button>
    </View>
  );
}
```

### Feature-Specific State

For UI state specific to a feature:

```typescript
// src/features/moments/stores/useMomentFormStore.ts
import { create } from 'zustand';

interface MomentFormState {
  isOpen: boolean;
  editingId: string | null;
  openForm: (id?: string) => void;
  closeForm: () => void;
}

export const useMomentFormStore = create<MomentFormState>((set) => ({
  isOpen: false,
  editingId: null,
  openForm: (id) => set({ isOpen: true, editingId: id ?? null }),
  closeForm: () => set({ isOpen: false, editingId: null }),
}));
```

**Usage:**

```typescript
import { useMomentFormStore } from '../stores/useMomentFormStore';

function MomentsList() {
  const { openForm } = useMomentFormStore();

  return (
    <View>
      <Button onPress={() => openForm()}>Create Moment</Button>
    </View>
  );
}

function MomentFormModal() {
  const { isOpen, editingId, closeForm } = useMomentFormStore();

  return (
    <Modal visible={isOpen} onClose={closeForm}>
      {/* Form content */}
    </Modal>
  );
}
```

---

## Best Practices

### When to Use Each

| State Type | Tool | Use Case |
|------------|------|----------|
| **Server Data** | TanStack Query | API responses, server-synced data |
| **Global UI State** | Zustand (persisted) | Auth, theme, user preferences |
| **Feature UI State** | Zustand | Modals, forms, feature-specific UI |
| **Component State** | useState | Local component state, form inputs |

### TanStack Query Configuration

Configured in `/src/core/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Zustand Persistence

Use `persist` middleware for state that should survive app restarts:

```typescript
export const useStore = create<State>()(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'store-name',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Important:** Only persist necessary data (auth, preferences). Don't persist transient UI state.

---

## Repository Provider Setup

Repositories are injected via `RepositoryProvider`:

```typescript
// src/core/repositories/RepositoryProvider.tsx
import { MOCK_CONFIG } from '@/core/mock/config';
import { backendMomentRepository } from '@/features/moments/api/backendMomentRepository';
import { mockMomentRepository } from '@/features/moments/api/mockMomentRepository';

const repositories = {
  moment: MOCK_CONFIG.enabled
    ? mockMomentRepository
    : backendMomentRepository,
  // ... other repositories
};

export const useRepositories = () => repositories;
export const useMomentRepository = () => repositories.moment;
```

**Mode Switching:**

Toggle between mock and backend modes via `.env`:

```bash
# Mock mode (development)
EXPO_PUBLIC_USE_MOCK_DATA=true

# Backend mode (production)
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_BACKEND_URL=https://api.smushy.app
```

---

## Testing Patterns

### Testing TanStack Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoments } from './useMoments';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('useMoments fetches data', async () => {
  const { result } = renderHook(() => useMoments(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

### Testing Zustand Stores

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMomentFormStore } from './useMomentFormStore';

test('opens and closes form', () => {
  const { result } = renderHook(() => useMomentFormStore());

  expect(result.current.isOpen).toBe(false);

  act(() => {
    result.current.openForm();
  });

  expect(result.current.isOpen).toBe(true);

  act(() => {
    result.current.closeForm();
  });

  expect(result.current.isOpen).toBe(false);
});
```

---

## Common Patterns

### Optimistic Updates

```typescript
export function useUpdateMoment() {
  const queryClient = useQueryClient();
  const repository = useMomentRepository();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMomentDTO }) =>
      repository.update(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.moments.all });

      // Snapshot previous value
      const previousMoments = queryClient.getQueryData(QUERY_KEYS.moments.all);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.moments.all, (old: Moment[]) =>
        old.map((m) => (m.id === id ? { ...m, ...data } : m))
      );

      return { previousMoments };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        QUERY_KEYS.moments.all,
        context?.previousMoments
      );
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
    },
  });
}
```

### Derived State

```typescript
// Compute derived state from Zustand store
export const useStore = create<State>((set) => ({ /* ... */ }));

// Selector for derived values
export const useIsFormValid = () =>
  useStore((state) => state.name && state.email);
```

---

## Related Documentation

- **Repository Pattern:** `docs/architecture/LAYERS.md`
- **API Client:** `docs/technical/API_CLIENT.md`
- **Mock Data System:** `docs/technical/MOCK_DATA.md`
- **Code Examples:** `docs/guides/CONTRIBUTING.md`
