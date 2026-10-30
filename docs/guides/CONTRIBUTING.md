# Contributing Guide

> **Quick Context:**
> - Architecture overview: [CLAUDE.md](../../CLAUDE.md)
> - Project philosophy: [VALUES.md](../notes/VALUES.md)
> - Current sprint status: [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)
> - Feature template: [FEATURE_TEMPLATE.md](../FEATURE_TEMPLATE.md)
>
> This guide provides hands-on code examples and step-by-step patterns for active development.

> **See also:** [CLAUDE.md](/CLAUDE.md) for comprehensive architecture documentation and tech stack overview.

---

## Table of Contents
1. [Core Principles](#core-principles)
2. [Creating New Features](#creating-new-features)
3. [Code Templates](#code-templates)
4. [Navigation Patterns](#navigation-patterns)
5. [State Management Decision Tree](#state-management-decision-tree)
6. [Styling with NativeWind](#styling-with-nativewind)
7. [Animations with Reanimated](#animations-with-reanimated)
8. [Error Handling](#error-handling)
9. [Testing Patterns](#testing-patterns)
10. [Performance Optimization](#performance-optimization)
11. [Architecture Rules](#architecture-rules)
12. [Documentation Updates](#documentation-updates)
13. [Common Pitfalls](#common-pitfalls)
14. [Quick Reference](#quick-reference)

---

## Core Principles

### Clean Architecture Overview
Smushy follows a clean architecture pattern with clear separation of concerns:

```
/app (Routes)           → Thin routing layer, imports screens only
  ↓
/src/features           → Self-contained business logic modules
  ↓
/src/shared             → Reusable components, hooks, utilities
  ↓
/src/core               → Infrastructure (API Client, Repositories, Mock Data)
```

### Dependency Rules
✅ **Allowed:**
- `/app` → `/src/features` (screens only)
- `/src/features` → `/src/shared`
- `/src/features` → `/src/lib`
- `/src/shared` → `/src/lib`

❌ **Forbidden:**
- `/src/shared` → `/src/features` (shared can't depend on features)
- `/src/lib` → anything (lib is standalone)
- `/src/features/moments` → `/src/features/story` (no cross-feature imports)

---

## Creating New Features

### Feature Module Structure

Every feature follows this self-contained structure:

```
/src/features/feature-name
  /screens              # Screen components (presentation logic)
    FeatureListScreen.tsx
    FeatureDetailScreen.tsx
    CreateFeatureScreen.tsx

  /components           # Feature-specific components
    FeatureCard.tsx
    FeatureList.tsx
    FeatureForm.tsx

  /api                  # Data layer (repositories + TanStack Query hooks)
    backendRepository.ts   # Backend repository (REST API calls)
    mockRepository.ts      # Mock repository (in-memory storage)
    useFeatures.ts         # TanStack Query hooks
    useCreateFeature.ts
    useUpdateFeature.ts
    useDeleteFeature.ts

  /stores               # Client state (Zustand, if needed)
    useFeatureStore.ts

  /types                # Feature-specific types
    index.ts

  /utils                # Feature utilities
    formatFeatureDate.ts

  index.ts              # Public exports only
```

### Step-by-Step Feature Creation

**1. Create feature directory structure**
```bash
mkdir -p src/features/new-feature/{screens,components,api,types}
```

**2. Define types**
```typescript
// src/features/new-feature/types/index.ts
export interface NewFeatureItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type CreateNewFeatureItemDTO = Omit<NewFeatureItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNewFeatureItemDTO = Partial<CreateNewFeatureItemDTO>;
```

**3. Define repository interface**
```typescript
// Add to: src/core/repositories/types.ts
export interface NewFeatureRepository {
  getAll: (filters?: NewFeatureFilters) => Promise<NewFeatureItem[]>;
  getById: (id: string) => Promise<NewFeatureItem>;
  create: (item: CreateNewFeatureItemDTO) => Promise<NewFeatureItem>;
  update: (id: string, updates: UpdateNewFeatureItemDTO) => Promise<NewFeatureItem>;
  delete: (id: string) => Promise<void>;
}
```

**4. Create backend repository (REST API)**
```typescript
// src/features/new-feature/api/backendRepository.ts
import { apiClient } from '@/core/api/client';
import type { NewFeatureItem, CreateNewFeatureItemDTO, UpdateNewFeatureItemDTO } from '../types';
import type { NewFeatureRepository } from '@/core/repositories/types';

export const backendNewFeatureRepository: NewFeatureRepository = {
  getAll: async (filters) => {
    return apiClient.get<NewFeatureItem[]>('/new-feature-items', { params: filters });
  },

  getById: async (id) => {
    return apiClient.get<NewFeatureItem>(`/new-feature-items/${id}`);
  },

  create: async (item) => {
    return apiClient.post<NewFeatureItem>('/new-feature-items', item);
  },

  update: async (id, updates) => {
    return apiClient.patch<NewFeatureItem>(`/new-feature-items/${id}`, updates);
  },

  delete: async (id) => {
    await apiClient.delete(`/new-feature-items/${id}`);
  },
};
```

**5. Create mock repository (in-memory)**
```typescript
// src/features/new-feature/api/mockRepository.ts
import { mockStorage } from '@/core/mock/storage/mockStorage';
import type { NewFeatureItem, CreateNewFeatureItemDTO, UpdateNewFeatureItemDTO } from '../types';
import type { NewFeatureRepository } from '@/core/repositories/types';

export const mockNewFeatureRepository: NewFeatureRepository = {
  getAll: async (filters) => {
    return mockStorage.getAllNewFeatureItems(filters);
  },

  getById: async (id) => {
    return mockStorage.getNewFeatureItemById(id);
  },

  create: async (item) => {
    return mockStorage.createNewFeatureItem(item);
  },

  update: async (id, updates) => {
    return mockStorage.updateNewFeatureItem(id, updates);
  },

  delete: async (id) => {
    await mockStorage.deleteNewFeatureItem(id);
  },
};
```

**6. Register in RepositoryProvider**
```typescript
// Add to: src/core/repositories/RepositoryProvider.tsx
import { backendNewFeatureRepository } from '@/features/new-feature/api/backendRepository';
import { mockNewFeatureRepository } from '@/features/new-feature/api/mockRepository';

const repositories = {
  // ... existing repositories
  newFeature: MOCK_CONFIG.enabled
    ? mockNewFeatureRepository
    : backendNewFeatureRepository,
};

// Create custom hook
export const useNewFeatureRepository = () => {
  const { repositories } = useRepositoryContext();
  return repositories.newFeature;
};
```

**7. Create TanStack Query hooks (using injected repository)**
```typescript
// src/features/new-feature/api/useNewFeatureItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useNewFeatureRepository } from '@/core/repositories/RepositoryProvider';
import type { CreateNewFeatureItemDTO, UpdateNewFeatureItemDTO } from '../types';

// Query: Get all items
export function useNewFeatureItems(filters?: NewFeatureFilters) {
  const repository = useNewFeatureRepository();  // ← Injected repository

  return useQuery({
    queryKey: QUERY_KEYS.newFeature.all,
    queryFn: () => repository.getAll(filters),
    gcTime: 5 * 60 * 1000,  // 5 minutes (formerly staleTime)
  });
}

// Query: Get by ID
export function useNewFeatureItem(id: string) {
  const repository = useNewFeatureRepository();  // ← Injected repository

  return useQuery({
    queryKey: QUERY_KEYS.newFeature.byId(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
}

// Mutation: Create
export function useCreateNewFeatureItem() {
  const queryClient = useQueryClient();
  const repository = useNewFeatureRepository();  // ← Injected repository

  return useMutation({
    mutationFn: (data: CreateNewFeatureItemDTO) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newFeature.all });
    },
  });
}

// Mutation: Update
export function useUpdateNewFeatureItem() {
  const queryClient = useQueryClient();
  const repository = useNewFeatureRepository();  // ← Injected repository

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateNewFeatureItemDTO }) =>
      repository.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newFeature.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newFeature.byId(id) });
    },
  });
}

// Mutation: Delete
export function useDeleteNewFeatureItem() {
  const queryClient = useQueryClient();
  const repository = useNewFeatureRepository();  // ← Injected repository

  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.newFeature.all });
    },
  });
}
```

**5. Add query keys to centralized constants**
```typescript
// src/shared/constants/queryKeys.ts
export const QUERY_KEYS = {
  newFeature: {
    all: ['new-feature'] as const,
    byId: (id: string) => ['new-feature', id] as const,
  },
  // ... other feature keys
} as const;
```

**6. Create screen component**
```typescript
// src/features/new-feature/screens/NewFeatureListScreen.tsx
import { View, FlatList } from 'react-native';
import { useNewFeatureItems } from '../api/useNewFeatureItems';
import { FeatureCard } from '../components/FeatureCard';
import { LoadingSpinner, ErrorMessage } from '@/shared/components/feedback';

export function NewFeatureListScreen() {
  const { data: items, isLoading, error } = useNewFeatureItems();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={items}
        renderItem={({ item }) => <FeatureCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
      />
    </View>
  );
}
```

**7. Create route in /app**
```typescript
// app/new-feature.tsx
import { NewFeatureListScreen } from '@/features/new-feature';

export default function NewFeatureRoute() {
  return <NewFeatureListScreen />;
}
```

**8. Export from feature index.ts**
```typescript
// src/features/new-feature/index.ts
export { NewFeatureListScreen } from './screens/NewFeatureListScreen';
export { useNewFeatureItems, useCreateNewFeatureItem } from './api/useNewFeatureItems';
export type { NewFeatureItem, CreateNewFeatureItemDTO } from './types';
```

---

## Code Templates

### Component Template (NativeWind)

```typescript
// src/features/moments/components/MomentCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface MomentCardProps {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export const MomentCard: React.FC<MomentCardProps> = ({
  id,
  title,
  date,
  description
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: '/moments/[id]', params: { id } });
  };

  return (
    <Animated.View entering={FadeIn}>
      <Pressable
        onPress={handlePress}
        className="p-4 mb-3 bg-white rounded-lg shadow-sm active:bg-gray-50"
      >
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{date}</Text>
        {description && (
          <Text className="text-sm text-gray-700 mt-2" numberOfLines={2}>
            {description}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};
```

### Repository Template (REST API + Mock)

**Backend Repository:**
```typescript
// src/features/moments/api/backendMomentRepository.ts
import { apiClient } from '@/core/api/client';
import type { Moment, CreateMomentDTO, UpdateMomentDTO, MomentFilters } from '../types';
import type { MomentRepository } from '@/core/repositories/types';

export const backendMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters): Promise<Moment[]> => {
    return apiClient.get<Moment[]>('/moments', { params: filters });
  },

  getById: async (id: string): Promise<Moment> => {
    return apiClient.get<Moment>(`/moments/${id}`);
  },

  create: async (moment: CreateMomentDTO): Promise<Moment> => {
    return apiClient.post<Moment>('/moments', moment);
  },

  update: async (id: string, updates: UpdateMomentDTO): Promise<Moment> => {
    return apiClient.patch<Moment>(`/moments/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/moments/${id}`);
  },
};
```

**Mock Repository:**
```typescript
// src/features/moments/api/mockRepository.ts
import { mockStorage } from '@/core/mock/storage/mockStorage';
import type { Moment, CreateMomentDTO, UpdateMomentDTO, MomentFilters } from '../types';
import type { MomentRepository } from '@/core/repositories/types';

export const mockMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters): Promise<Moment[]> => {
    return mockStorage.getAllMoments(filters);
  },

  getById: async (id: string): Promise<Moment> => {
    return mockStorage.getMomentById(id);
  },

  create: async (moment: CreateMomentDTO): Promise<Moment> => {
    return mockStorage.createMoment(moment);
  },

  update: async (id: string, updates: UpdateMomentDTO): Promise<Moment> => {
    return mockStorage.updateMoment(id, updates);
  },

  delete: async (id: string): Promise<void> => {
    await mockStorage.deleteMoment(id);
  },
};
```

### TanStack Query Hook Template

```typescript
// src/features/moments/api/useMoments.ts
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { momentRepository } from './repository';

export function useMoments() {
  return useQuery({
    queryKey: QUERY_KEYS.moments.all,
    queryFn: momentRepository.getAll,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collection time (formerly cacheTime)
  });
}

// src/features/moments/api/useCreateMoment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { momentRepository } from './repository';
import type { CreateMomentDTO } from '../types';

export function useCreateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMomentDTO) => momentRepository.create(data),
    onSuccess: () => {
      // Invalidate and refetch moments list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
    },
    onError: (error) => {
      console.error('Failed to create moment:', error);
    },
  });
}

// src/features/moments/api/useUpdateMoment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { momentRepository } from './repository';
import type { UpdateMomentDTO } from '../types';

export function useUpdateMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateMomentDTO }) =>
      momentRepository.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.moments.all });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(QUERY_KEYS.moments.all);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.moments.all, (old: Moment[]) => {
        return old.map(m => m.id === id ? { ...m, ...updates } : m);
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.moments.all, context.previous);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.byId(id) });
    },
  });
}
```

### Screen Component Template

```typescript
// src/features/moments/screens/MomentsListScreen.tsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { useMoments } from '../api/useMoments';
import { MomentCard } from '../components/MomentCard';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/shared/components/feedback';
import { Button } from '@/shared/components/ui';
import { useRouter } from 'expo-router';

export function MomentsListScreen() {
  const router = useRouter();
  const { data: moments, isLoading, error, refetch } = useMoments();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (!moments || moments.length === 0) {
    return (
      <EmptyState
        title="No moments yet"
        description="Create your first moment together"
        action={
          <Button onPress={() => router.push('/moments/create')}>
            Create Moment
          </Button>
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={moments}
        renderItem={({ item }) => <MomentCard {...item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}
```

### Client State Store Template (Zustand)

**When to use:** App-wide client state (NOT server data). Examples: UI state, theme, modals.

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
      setAuth: (user, session) => set({ user, session, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Feature-specific UI state:**

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

---

## Navigation Patterns

Smushy uses **Expo Router** with file-based routing.

### File-Based Routing Structure

```
/app
  _layout.tsx               # Root layout (providers)
  index.tsx                 # Landing screen

  /(tabs)                   # Tab group
    _layout.tsx             # Tab bar layout
    moments.tsx             # Tab: Moments
    story.tsx               # Tab: Story
    profile.tsx             # Tab: Profile

  /moments                  # Moments stack
    [id].tsx                # Dynamic route: /moments/:id
    create.tsx              # /moments/create
    edit/[id].tsx           # /moments/edit/:id

  /(auth)                   # Auth group (separate layout)
    login.tsx
    signup.tsx
```

### Route Components (Thin)

Routes should ONLY import and render screens from features:

```typescript
// app/(tabs)/moments.tsx
import { MomentsListScreen } from '@/features/moments';

export default function MomentsRoute() {
  return <MomentsListScreen />;
}
```

### Navigation Hooks

```typescript
import { useRouter, useLocalSearchParams } from 'expo-router';

// Navigate to screen
const router = useRouter();
router.push('/moments/create');

// Navigate with params
router.push({
  pathname: '/moments/[id]',
  params: { id: '123' }
});

// Go back
router.back();

// Access params in screen
const { id } = useLocalSearchParams<{ id: string }>();
```

### Dynamic Routes

```typescript
// app/moments/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { MomentDetailScreen } from '@/features/moments';

export default function MomentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MomentDetailScreen id={id} />;
}
```

---

## State Management Decision Tree

**Use the right tool for the job:**

```
Is it data from REST API/Backend?
├─ YES → Use TanStack Query
│         └─ Create backend + mock repositories + useQuery/useMutation hooks
│
└─ NO → Is it app-wide state (auth, theme, settings)?
    ├─ YES → Use Zustand
    │         └─ Create global store in /features/*/stores or /shared/stores
    │
    └─ NO → Is it component-local state?
        └─ YES → Use useState
                 └─ Keep in component
```

### Examples

**Server Data (TanStack Query):**
- Moments, check-ins, rituals from REST API
- User profile data
- Any backend/database queries

**App-Wide Client State (Zustand):**
- Authentication state (user, session)
- Theme preference (light/dark)
- App settings
- Global UI state (modals, navigation)

**Component-Local State (useState):**
- Form input values (if not persisted)
- UI toggles (expand/collapse)
- Temporary component state

---

## Repository Pattern with Dependency Injection

Smushy uses the **Repository Pattern** to abstract data access and enable switching between backend API and mock data implementations.

### Overview

**RepositoryProvider** is a React Context provider that manages repository instances based on environment configuration (`MOCK_CONFIG.enabled`).

### Architecture

```
app/
  ├── _layout.tsx  ← Wraps app in RepositoryProvider

src/core/repositories/
  ├── RepositoryProvider.tsx  ← DI container
  └── types.ts                ← Repository interfaces

src/features/*/api/
  ├── backendRepository.ts    ← Backend implementation
  ├── mockRepository.ts       ← Mock implementation
  └── use*.ts                 ← TanStack Query hooks
```

### Usage in Features

**1. Define Repository Interface:**

```typescript
// src/core/repositories/types.ts
export interface AuthRepository {
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}
```

**2. Implement Backend Version:**

```typescript
// src/features/auth/api/backendAuthRepository.ts
import { apiClient } from '@/core/api/client';

export const backendAuthRepository: AuthRepository = {
  signIn: async (credentials) => {
    return await apiClient.post('/auth/signin', credentials);
  },
  // ...
};
```

**3. Implement Mock Version:**

```typescript
// src/features/auth/api/mockAuthRepository.ts
export const mockAuthRepository: AuthRepository = {
  signIn: async (credentials) => {
    // Mock implementation with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { user: mockUser, session: mockSession };
  },
  // ...
};
```

**4. Register in RepositoryProvider:**

```typescript
// src/core/repositories/RepositoryProvider.tsx
const repositories = {
  auth: MOCK_CONFIG.enabled ? mockAuthRepository : backendAuthRepository,
};
```

**5. Use in Hooks:**

```typescript
// src/features/auth/api/useSignIn.ts
import { useAuthRepository } from '@/core/repositories/RepositoryProvider';

export function useSignIn() {
  const authRepository = useAuthRepository();

  return useMutation({
    mutationFn: (credentials) => authRepository.signIn(credentials),
  });
}
```

### Testing with Repositories

```typescript
// Component.test.tsx
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';

const mockAuthRepository = {
  signIn: jest.fn().mockResolvedValue({ user: mockUser }),
};

const wrapper = ({ children }) => (
  <RepositoryProvider repositories={{ auth: mockAuthRepository }}>
    {children}
  </RepositoryProvider>
);

renderHook(() => useSignIn(), { wrapper });
```

### Benefits

- ✅ **Testability:** Easy to mock repositories in tests
- ✅ **Development:** Work without backend using mock data
- ✅ **Flexibility:** Swap implementations without changing components
- ✅ **Type Safety:** Interfaces ensure consistency

---

## Using Themes

Smushy has a dynamic theme system that allows users to switch between color presets while maintaining the warm, safe, and intimate brand feel.

### Available Themes

- **Default**: Warm red/orange tones (core Smushy identity)
- **Calm**: Soft blue/teal with warm undertones (peaceful yet intimate)
- **More themes**: Easy to add in the future

### Using Themes in Components

**Option 1: useTheme Hook (Recommended for dynamic colors)**

```typescript
import { useTheme } from '@/shared/hooks/useTheme';

function MyComponent() {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

**Option 2: Theme Utility Helpers**

```typescript
import { useTheme } from '@/shared/hooks/useTheme';
import { getThemedStyles } from '@/shared/utils/themeUtils';

function MyComponent() {
  const { currentTheme } = useTheme();
  const { bg, text, border } = getThemedStyles(currentTheme);

  return (
    <View style={[styles.container, bg('surface')]}>
      <Text style={text('primary')}>Hello</Text>
    </View>
  );
}
```

**Option 3: Tailwind Semantic Tokens (Static, default theme only)**

```typescript
// Only use for colors that don't need to change dynamically
<View className="bg-theme-surface border border-theme-border">
  <Text className="text-theme-text-primary">Hello</Text>
</View>
```

### Switching Themes

```typescript
import { useTheme } from '@/shared/hooks/useTheme';

function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <View>
      <Text>Current: {currentTheme.name}</Text>
      {availableThemes.map(theme => (
        <Button
          key={theme.id}
          onPress={() => setTheme(theme.id)}
        >
          {theme.name}
        </Button>
      ))}
    </View>
  );
}
```

### Adding a New Theme (Scalability)

**It's designed to be effortless!** Just edit one file:

```typescript
// src/shared/theme/presets.ts

// 1. Define your new theme
export const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Romantic pink and peach tones',
  colors: {
    primary: '#ec4899',      // Pink
    primaryDark: '#db2777',
    primaryLight: '#f9a8d4',
    // ... define all colors
  },
};

// 2. Add to the themes array - that's it!
export const themes: Theme[] = [
  defaultTheme,
  calmTheme,
  sunsetTheme,  // ← New theme automatically available everywhere
];
```

**No other files need to be modified.** The theme system will automatically:
- Make it available in `useTheme().availableThemes`
- Allow switching via `setTheme('sunset')`
- Persist the user's choice

### Theme Colors Reference

All themes must define these semantic color tokens:

**Brand Colors:**
- `primary`, `primaryDark`, `primaryLight`
- `secondary`, `secondaryDark`, `secondaryLight`

**Layout Colors:**
- `background` - Screen background
- `surface` - Card/component background
- `surfaceVariant` - Alternative surface color

**Borders:**
- `border`, `borderLight`

**Text:**
- `text.primary` - Main text
- `text.secondary` - Muted text
- `text.disabled` - Disabled state
- `text.inverse` - Text on colored backgrounds

**Status:**
- `error`, `errorLight`
- `success`, `successLight`
- `warning`, `warningLight`
- `info`, `infoLight`

### Best Practices

**✅ DO:**
- Use `useTheme()` for components that need dynamic theming
- Use semantic color names (e.g., `colors.primary`, not hardcoded `#ef4444`)
- Ensure all new themes maintain warm/safe/intimate brand feel
- Test theme switching to ensure components adapt correctly

**❌ DON'T:**
- Hardcode color values in components
- Use Tailwind color classes that won't update with theme changes
- Create themes with cold/harsh/clinical color palettes
- Break the scalability pattern (adding themes should only require editing `presets.ts`)

---

## Styling with NativeWind

Smushy uses **NativeWind** (Tailwind CSS for React Native).

### Basic Usage

```typescript
import { View, Text } from 'react-native';

<View className="flex-1 bg-gray-100 p-4">
  <Text className="text-2xl font-bold text-gray-900">Welcome</Text>
  <Text className="text-sm text-gray-500 mt-2">Subtitle text</Text>
</View>
```

### Conditional Styling

```typescript
const [isActive, setIsActive] = useState(false);

<View className={`p-4 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
  <Text className={isActive ? 'text-white' : 'text-gray-700'}>Status</Text>
</View>
```

### Pressable States

```typescript
import { Pressable } from 'react-native';

<Pressable className="px-4 py-2 bg-blue-500 rounded-lg active:bg-blue-600">
  <Text className="text-white font-medium">Press me</Text>
</Pressable>
```

### Responsive Classes

```typescript
<View className="p-4 md:p-6 lg:p-8">
  <Text className="text-base md:text-lg lg:text-xl">Responsive text</Text>
</View>
```

### Common Patterns

```typescript
// Cards
<View className="p-4 bg-white rounded-lg shadow-sm">
  <Text>Card content</Text>
</View>

// Containers
<View className="flex-1 px-4 py-6">
  <Text>Screen content</Text>
</View>

// Flexbox layouts
<View className="flex-row items-center justify-between">
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Safe areas (use Screen component instead)
import { Screen } from '@/shared/components/layout';

<Screen className="bg-gray-50">
  <Text>Content with safe areas</Text>
</Screen>
```

---

## Animations with Reanimated

Use **React Native Reanimated** for performant animations (runs on UI thread).

### Simple Animations

```typescript
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn}
  exiting={FadeOut}
  className="p-4 bg-white"
>
  <Text>Fades in/out</Text>
</Animated.View>

<Animated.View entering={SlideInRight.duration(300)}>
  <Text>Slides in from right</Text>
</Animated.View>
```

### Custom Animations

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

export const AnimatedCard = () => {
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(offset.value) }],
    opacity: withTiming(opacity.value),
  }));

  return (
    <Animated.View style={animatedStyle} className="p-4 bg-white">
      <Text>Animated content</Text>
    </Animated.View>
  );
};
```

### Combining with NativeWind

```typescript
<Animated.View
  entering={FadeIn.duration(500)}
  className="flex-1 bg-gray-50 p-4"
>
  <Text className="text-lg font-semibold">Combined styling</Text>
</Animated.View>
```

---

## Error Handling

### REST API Error Handling

```typescript
// src/shared/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as any;
    return new AppError(
      err.message || 'An error occurred',
      err.code,
      err.statusCode || err.status
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred');
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  const appError = toAppError(error);

  // Map common error codes/status codes to friendly messages
  const errorMessages: Record<string, string> = {
    'UNAUTHORIZED': 'Please log in to continue',
    'FORBIDDEN': 'You do not have permission to perform this action',
    'NOT_FOUND': 'The requested item was not found',
    'VALIDATION_ERROR': 'Please check your input and try again',
  };

  if (appError.code && errorMessages[appError.code]) {
    return errorMessages[appError.code];
  }

  // Map HTTP status codes
  if (appError.statusCode === 401) return 'Please log in to continue';
  if (appError.statusCode === 403) return 'You do not have permission';
  if (appError.statusCode === 404) return 'Item not found';
  if (appError.statusCode === 422) return 'Invalid data provided';
  if (appError.statusCode >= 500) return 'Server error. Please try again later.';

  return appError.message;
}
```

### TanStack Query Error States

```typescript
import { Alert } from 'react-native';
import { useMoments } from '../api/useMoments';
import { getUserFriendlyError } from '@/shared/utils/errorHandler';

export function MomentsScreen() {
  const { data, error, refetch } = useMoments();

  if (error) {
    const errorMessage = getUserFriendlyError(error);
    return (
      <ErrorMessage
        message={errorMessage}
        onRetry={refetch}
      />
    );
  }

  // ... rest of component
}
```

### Mutation Error Handling

```typescript
import { Alert } from 'react-native';
import { useCreateMoment } from '../api/useCreateMoment';
import { getUserFriendlyError } from '@/shared/utils/errorHandler';

export function CreateMomentForm() {
  const createMoment = useCreateMoment();

  const handleSubmit = async (data: CreateMomentDTO) => {
    try {
      await createMoment.mutateAsync(data);
      Alert.alert('Success', 'Moment created!');
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      Alert.alert('Error', errorMessage);
    }
  };

  // ... form UI
}
```

### Error Boundaries

```typescript
// Use for critical screens
import { ErrorBoundary } from '@/shared/components/feedback';

<ErrorBoundary fallback={<ErrorScreen />}>
  <CriticalScreen />
</ErrorBoundary>
```

---

## Testing Patterns

### Component Tests

```typescript
// src/features/moments/components/MomentCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MomentCard } from './MomentCard';

describe('MomentCard', () => {
  const mockMoment = {
    id: '1',
    title: 'Date Night',
    date: '2024-01-15',
    description: 'Amazing dinner',
  };

  it('renders moment information correctly', () => {
    render(<MomentCard {...mockMoment} />);

    expect(screen.getByText('Date Night')).toBeTruthy();
    expect(screen.getByText('2024-01-15')).toBeTruthy();
    expect(screen.getByText('Amazing dinner')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    render(<MomentCard {...mockMoment} onPress={onPress} />);

    fireEvent.press(screen.getByText('Date Night'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
```

### TanStack Query Hook Tests

```typescript
// src/features/moments/api/useMoments.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoments } from './useMoments';
import { momentRepository } from './repository';

// Mock repository
jest.mock('./repository');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMoments', () => {
  it('fetches moments successfully', async () => {
    const mockMoments = [
      { id: '1', title: 'Date Night', date: '2024-01-15' }
    ];

    (momentRepository.getAll as jest.Mock).mockResolvedValue(mockMoments);

    const { result } = renderHook(() => useMoments(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMoments);
    expect(result.current.error).toBeNull();
  });

  it('handles errors correctly', async () => {
    const mockError = new Error('Failed to fetch');
    (momentRepository.getAll as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useMoments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
```

### Screen Tests

```typescript
// src/features/moments/screens/MomentsListScreen.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MomentsListScreen } from './MomentsListScreen';
import { momentRepository } from '../api/repository';

jest.mock('../api/repository');

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

describe('MomentsListScreen', () => {
  it('displays loading state initially', () => {
    render(<MomentsListScreen />, { wrapper: createWrapper() });
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays moments when loaded', async () => {
    const mockMoments = [
      { id: '1', title: 'Date Night', date: '2024-01-15' }
    ];

    (momentRepository.getAll as jest.Mock).mockResolvedValue(mockMoments);

    render(<MomentsListScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Date Night')).toBeTruthy();
    });
  });

  it('displays error message on failure', async () => {
    (momentRepository.getAll as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<MomentsListScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeTruthy();
    });
  });
});
```

---

## Performance Optimization

### List Rendering with FlashList

```typescript
import { FlashList } from '@shopify/flash-list';

// Prefer FlashList over FlatList for better performance
<FlashList
  data={moments}
  renderItem={({ item }) => <MomentCard moment={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive computations
const sortedMoments = useMemo(() => {
  return moments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}, [moments]);

// Memoize callbacks passed to children
const handlePress = useCallback((id: string) => {
  router.push(`/moments/${id}`);
}, [router]);

// Memoize components
export const MomentCard = memo<MomentCardProps>(({ moment }) => {
  return <View>...</View>;
});
```

### TanStack Query Optimization

```typescript
// Configure stale and garbage collection times
export function useMoments() {
  return useQuery({
    queryKey: QUERY_KEYS.moments.all,
    queryFn: momentRepository.getAll,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Garbage collection time (formerly cacheTime)
  });
}

// Prefetch data
const queryClient = useQueryClient();

queryClient.prefetchQuery({
  queryKey: QUERY_KEYS.moments.byId(id),
  queryFn: () => momentRepository.getById(id),
});

// Optimistic updates (see useUpdateMoment template above)
```

### Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: moment.photoUrl }}
  contentFit="cover"
  transition={200}
  style={{ width: 300, height: 200 }}
  placeholder={blurhash}
  cachePolicy="memory-disk"
/>
```

### Reanimated Performance

```typescript
// Animations run on UI thread (not JS thread)
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

// ✅ Performant - runs on UI thread
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(offset.value) }]
}));

// ❌ Avoid - runs on JS thread
const [offset, setOffset] = useState(0);
<View style={{ transform: [{ translateX: offset }] }} />
```

---

## Architecture Rules

### Dependency Rules Enforcement

✅ **Allowed:**
```typescript
// Routes import screens from features
// app/moments.tsx
import { MomentsListScreen } from '@/features/moments';

// Features import from shared
// src/features/moments/components/MomentCard.tsx
import { Button } from '@/shared/components/ui';

// Features import from core
// src/features/moments/api/backendRepository.ts
import { apiClient } from '@/core/api/client';

// Shared imports from core
// src/shared/utils/storage.ts
import { storage } from '@/core/storage';
```

❌ **Forbidden:**
```typescript
// ❌ Shared importing from features
// src/shared/components/SomeComponent.tsx
import { useMoments } from '@/features/moments'; // FORBIDDEN

// ❌ Core importing from anything
// src/core/api/client.ts
import { something } from '@/shared/utils'; // FORBIDDEN

// ❌ Cross-feature imports
// src/features/moments/components/MomentCard.tsx
import { StoryCard } from '@/features/story'; // FORBIDDEN
```

### Module Boundaries

**Routes must be thin:**
```typescript
// ✅ GOOD - Route only renders screen
// app/moments.tsx
import { MomentsListScreen } from '@/features/moments';
export default function MomentsRoute() {
  return <MomentsListScreen />;
}

// ❌ BAD - Route has business logic
// app/moments.tsx
export default function MomentsRoute() {
  const { data } = useMoments(); // Business logic in route
  return <View>{data.map(...)}</View>;
}
```

**No circular dependencies:**
```typescript
// If A imports B, then B cannot import A
// If A → B → C, then C cannot import A or B
```

**Cross-feature communication:**
```typescript
// ✅ GOOD - Via navigation params
router.push({ pathname: '/moments/[id]', params: { id: '123' } });

// ✅ GOOD - Via shared state
const { user } = useAuthStore(); // Global auth state

// ❌ BAD - Direct feature import
import { useMoments } from '@/features/moments'; // From another feature
```

---

## Documentation Updates

### When Adding a Feature

1. **Create feature documentation** in `/docs/features/FEATURE_NAME.md`:
   - Feature description and user stories
   - Technical specification
   - Backend API endpoints and data models
   - Repository interfaces (backend + mock implementations)
   - TanStack Query hooks documentation
   - Component hierarchy
   - Implementation status

2. **Update `PROJECT_CONTEXT.md`:**
   - Add to feature status table
   - Update current sprint tasks if applicable

3. **Update architecture docs** (if needed):
   - `/docs/architecture/NAVIGATION.md` for new routes
   - `/docs/architecture/SUPABASE.md` for new tables

### When Changing Architecture

1. **Update relevant architecture docs:**
   - `/docs/architecture/SUPABASE.md`
   - `/docs/architecture/NAVIGATION.md`
   - `/docs/architecture/STYLING.md`
   - `/docs/architecture/STATE_MANAGEMENT.md`

2. **Update `PROJECT_CONTEXT.md`** if it affects core principles

3. **Add migration notes** if breaking changes

4. **Update `CLAUDE.md`** if fundamental architecture changes

---

## Common Pitfalls

### ❌ Don't

- **Use StyleSheet instead of NativeWind**
  ```typescript
  // ❌ BAD
  const styles = StyleSheet.create({ container: { padding: 16 } });

  // ✅ GOOD
  <View className="p-4">
  ```

- **Use useState for server data**
  ```typescript
  // ❌ BAD
  const [moments, setMoments] = useState([]);
  useEffect(() => { fetchMoments(); }, []);

  // ✅ GOOD
  const { data: moments } = useMoments();
  ```

- **Call API client directly from components**
  ```typescript
  // ❌ BAD
  const data = await apiClient.get('/moments');

  // ✅ GOOD
  const { data } = useMoments(); // Uses repository + TanStack Query
  ```

- **Use React Navigation patterns**
  ```typescript
  // ❌ BAD
  navigation.navigate('Profile', { userId });

  // ✅ GOOD
  router.push({ pathname: '/profile/[id]', params: { id: userId } });
  ```

- **Import across features**
  ```typescript
  // ❌ BAD
  import { useMoments } from '@/features/moments'; // From another feature

  // ✅ GOOD
  import { Button } from '@/shared/components/ui'; // From shared
  ```

- **Use `any` type**
  ```typescript
  // ❌ BAD
  const data: any = await fetchData();

  // ✅ GOOD
  const data: Moment[] = await momentRepository.getAll();
  ```

- **Put business logic in route components**
  ```typescript
  // ❌ BAD
  // app/moments.tsx
  export default function MomentsRoute() {
    const { data } = useMoments();
    const filtered = data.filter(...);
    return <View>...</View>;
  }

  // ✅ GOOD
  // app/moments.tsx
  export default function MomentsRoute() {
    return <MomentsListScreen />; // Logic in screen
  }
  ```

### ✅ Do

- **Use NativeWind className for styling**
  ```typescript
  <View className="flex-1 bg-gray-50 p-4">
  ```

- **Use TanStack Query for all server/API data**
  ```typescript
  const { data, isLoading, error } = useMoments();
  ```

- **Create backend and mock repository implementations**
  ```typescript
  // Backend repository (REST API)
  export const backendMomentRepository: MomentRepository = {
    getAll: async () => apiClient.get('/moments')
  };

  // Mock repository (in-memory)
  export const mockMomentRepository: MomentRepository = {
    getAll: async () => mockStorage.getAllMoments()
  };
  ```

- **Use Expo Router for navigation**
  ```typescript
  const router = useRouter();
  router.push('/moments/create');
  ```

- **Extract logic to custom hooks**
  ```typescript
  const { filteredMoments, search, setSearch } = useFilteredMoments();
  ```

- **Type everything with TypeScript strict mode**
  ```typescript
  interface MomentCardProps {
    id: string;
    title: string;
  }
  ```

- **Follow dependency rules** (Features → Shared → Lib)

- **Keep routes thin** (only import and render screens)

- **Use the state management decision tree**

- **Write tests for new features**

---

## Quick Reference

### Import Aliases

```typescript
import { apiClient } from '@/core/api/client';
import { Button } from '@/shared/components/ui';
import { useMoments } from '@/features/moments';
import { formatDate } from '@/shared/utils';
import { useMomentRepository } from '@/core/repositories/RepositoryProvider';
```

### Common Commands

```bash
# Development
npx expo start                  # Start dev server
npx expo start --ios            # Run on iOS
npx expo start --android        # Run on Android
npx expo start --clear          # Clear cache

# Testing
npm test                        # Run tests
npm test -- --coverage          # With coverage
npm test -- --watch             # Watch mode
npm run type-check              # TypeScript check
npm run lint                    # ESLint

# Development Modes
npm run start:mock              # Start with mock data
npm run start:prod              # Start with backend API
npm run android:mock            # Android with mock data
npm run ios:prod                # iOS with backend API
```

### Key Dependencies

| Dependency | Purpose |
|------------|---------|
| `expo` | Framework for React Native |
| `expo-router` | File-based routing |
| `nativewind` | Tailwind CSS for React Native |
| `react-native-reanimated` | Performant animations |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state management |
| `@shopify/flash-list` | High-performance lists |
| `@react-native-async-storage/async-storage` | Local storage |

---

## Summary

**Core principles to remember:**

1. **Clean Architecture** - Features → Shared → Core (strict dependencies)
2. **State Management** - TanStack Query for server data, Zustand for client state, useState for local
3. **Styling** - NativeWind (Tailwind CSS), not StyleSheet
4. **Navigation** - Expo Router (file-based), not React Navigation
5. **Backend** - REST API via Repository DI pattern + TanStack Query hooks
6. **Dual-Mode Development** - Mock (in-memory) or Backend (REST API)
7. **Animations** - Reanimated (UI thread), not Animated API
7. **Routes are thin** - Only import screens from features
8. **No circular deps** - Shared never imports from features
9. **Type everything** - TypeScript strict mode, no `any`
10. **Follow VALUES.md** - Emotional safety, consent, warmth

For comprehensive details, see [CLAUDE.md](/CLAUDE.md).

---

**Happy contributing! 💛**
