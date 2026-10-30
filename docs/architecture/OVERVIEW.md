# Architecture Overview

## High-Level Architecture

Smushy follows a **layered clean architecture** with clear separation of concerns and dependency rules.

```
┌─────────────────────────────────────┐
│  Routes (src/app)                   │  ← Expo Router (routing only)
│  Thin route components              │
└────────────┬────────────────────────┘
             │ imports screens
             ↓
┌─────────────────────────────────────┐
│  Features (src/features)            │  ← Business logic modules
│  Self-contained feature modules     │
└────────────┬────────────────────────┘
             │ uses
             ↓
┌─────────────────────────────────────┐
│  Shared (src/shared)                │  ← Reusable UI & utilities
│  UI components, hooks, utils        │
└────────────┬────────────────────────┘
             │ uses
             ↓
┌─────────────────────────────────────┐
│  Infrastructure                     │
│  ├─ Core (src/core)                 │  ← Domain infrastructure
│  │  API, repos, mock system         │
│  └─ Libs (src/libs)                 │  ← Third-party abstractions
│     Storage, analytics, logger      │
└─────────────────────────────────────┘
```

## Directory Structure

```
/src
  /app                    # Expo Router - routing only
  /features               # Feature modules (self-contained)
  /shared                 # Reusable UI, hooks, utils
  /core                   # Domain infrastructure
  /libs                   # Third-party library abstractions
```

## Core Principles

### 1. Features are Self-Contained

Each feature module contains everything it needs:

```
/features/moments
  /screens          # Presentation components
  /components       # Feature-specific UI
  /api              # Data access layer
    repository.ts   # Supabase/API calls
    useMoments.ts   # TanStack Query hooks
  /stores           # Client state (Zustand)
  /types            # Domain types
  /utils            # Feature utilities
  index.ts          # Public API
```

**Benefits:**
- Easy to locate related code
- Clear module boundaries
- Testable in isolation
- Can be extracted as packages later

### 2. Routes are Thin

Route components in `/src/app` **only** import and render screens from features:

```typescript
// src/app/(tabs)/moments.tsx
import { MomentsListScreen } from '@/features/moments';

export default function MomentsRoute() {
  return <MomentsListScreen />;
}
```

**Why?**
- Routing is separate from business logic
- Screens are reusable outside Expo Router
- Clear separation of navigation vs presentation

### 3. Data Layer Abstraction

Data access follows the **Repository Pattern**:

```typescript
// Repository - raw Supabase calls
export const momentRepository = {
  getAll: async () => {
    const { data } = await supabase.from('moments').select('*');
    return data;
  }
};

// TanStack Query hook - manages server state
export function useMoments() {
  return useQuery({
    queryKey: ['moments'],
    queryFn: momentRepository.getAll,
  });
}

// Screen - uses hook, no direct Supabase access
export function MomentsListScreen() {
  const { data: moments } = useMoments();
  return <MomentList moments={moments} />;
}
```

**Benefits:**
- Easy to mock for testing
- Can swap backend (Supabase → REST API)
- Caching & invalidation handled by TanStack Query

### 4. Dependency Rules

```typescript
✅ ALLOWED:
src/app → src/features (screens only)
src/features → src/shared, src/core, src/libs
src/shared → src/libs
src/core → src/libs

❌ FORBIDDEN:
src/shared → src/features (no feature coupling)
src/core → src/features (core is infrastructure)
src/libs → anything (libs are isolated)
Feature → Feature (no cross-feature imports)
```

## Tech Stack Alignment

### State Management Strategy

```
┌─────────────────────────────────────────┐
│ Server State (TanStack Query)          │
│ - Supabase data                         │
│ - API responses                         │
│ - Caching, invalidation, refetching     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Client State (Zustand)                  │
│ - UI state (modals, forms)              │
│ - App-level state (auth, theme)         │
│ - Transient state                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Component State (useState)              │
│ - Component-local state                 │
│ - Form inputs, toggles                  │
└─────────────────────────────────────────┘
```

### Key Technologies

- **Expo Router** - File-based routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **NativeWind** - Tailwind CSS for React Native
- **React Native Reanimated** - 60fps animations
- **TypeScript** - Strict typing

## Design Patterns

### Repository Pattern

Abstracts data access behind interfaces:

```
Component → TanStack Query Hook → Repository → Supabase/API
```

### Provider Pattern

Dependency injection for swappable implementations:

```typescript
<RepositoryProvider mode="mock|backend">
  <App />
</RepositoryProvider>
```

### Hook-Based Architecture

Business logic lives in custom hooks, not components:

```typescript
function useMomentActions() {
  const createMutation = useCreateMoment();
  const updateMutation = useUpdateMoment();
  const deleteMutation = useDeleteMoment();

  return { create, update, delete };
}
```

## Testing Strategy

- **Unit tests**: Co-located with source files
- **Repository tests**: Mock Supabase client
- **Hook tests**: Use `renderHook` from React Testing Library
- **Component tests**: Render with providers

See individual features for test examples.
