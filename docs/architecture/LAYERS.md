# Layer Separation and Dependencies

## Architecture Layers

Smushy follows a **layered architecture** with strict dependency rules.

```
┌─────────────────────────────────────┐
│  Layer 4: Routes (src/app)          │  Expo Router
│  - File-based routing               │
│  - Thin route components            │
└────────────┬────────────────────────┘
             │ imports screens only
             ↓
┌─────────────────────────────────────┐
│  Layer 3: Features (src/features)   │  Business Logic
│  - Self-contained modules           │
│  - Screens, components, hooks       │
└────────────┬────────────────────────┘
             │ uses shared, core, libs
             ↓
┌─────────────────────────────────────┐
│  Layer 2: Shared (src/shared)       │  Reusable Code
│  - UI components                    │
│  - Hooks, utils                     │
└────────────┬────────────────────────┘
             │ uses libs only
             ↓
┌─────────────────────────────────────┐
│  Layer 1: Infrastructure            │
│  ┌───────────────────────────────┐  │
│  │ Core (src/core)               │  │  Domain Infrastructure
│  │ - API client                  │  │
│  │ - Repositories                │  │
│  │ - Mock system                 │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Libs (src/libs)               │  │  Third-Party Abstractions
│  │ - Storage                     │  │
│  │ - Analytics                   │  │
│  │ - Logger                      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Layer Descriptions

### Layer 4: Routes (`/src/app`)

**Purpose:** File-based routing (Expo Router)

**Responsibilities:**
- Map URLs to screens
- Handle navigation structure
- Define route layouts

**Rules:**
- ✅ Can import screens from features
- ❌ Cannot contain business logic
- ❌ Cannot import from shared, core, or libs directly

**Example:**
```typescript
// src/app/(tabs)/moments.tsx
import { MomentsListScreen } from '@/features/moments';

export default function MomentsRoute() {
  return <MomentsListScreen />;
}
```

**Why thin routes?**
- Business logic is testable without router
- Screens are reusable in Storybook
- Easy to swap routers (Expo Router → React Navigation)

---

### Layer 3: Features (`/src/features`)

**Purpose:** Self-contained business logic modules

**Responsibilities:**
- Implement feature functionality
- Manage feature-specific state
- Provide screens and components
- Handle data fetching and mutations

**Module Structure:**
```
/features/moments
  /screens          # Presentation components
  /components       # Feature-specific UI
  /api              # Data access layer
  /stores           # Client state (Zustand)
  /types            # Domain types
  /utils            # Feature utilities
  index.ts          # Public API (exports screens, hooks)
```

**Rules:**
- ✅ Can use shared components, hooks, utils
- ✅ Can use core infrastructure (API, repositories)
- ✅ Can use libs (storage, analytics, logger)
- ❌ Cannot import from other features
- ❌ Cannot import from routes (`src/app`)

**Cross-Feature Communication:**
```typescript
// ❌ BAD: Direct feature import
import { useMoments } from '@/features/moments';

// ✅ GOOD: Navigate with params
router.push({ pathname: '/moments/[id]', params: { id: '123' } });

// ✅ GOOD: Share via global state (if needed)
const { sharedData } = useGlobalStore();
```

---

### Layer 2: Shared (`/src/shared`)

**Purpose:** Reusable code across features

**Responsibilities:**
- Provide design system components
- Offer common hooks and utilities
- Define theme and design tokens
- Export global types

**Module Structure:**
```
/shared
  /components       # UI components (Button, Input, Card)
  /hooks            # Reusable hooks (useDebounce, useKeyboard)
  /utils            # Pure functions (formatDate, validateEmail)
  /theme            # Design tokens (colors, spacing, typography)
  /types            # Global types
  /constants        # App-wide constants
```

**Rules:**
- ✅ Can use libs (storage, analytics, logger)
- ❌ Cannot import from features (creates coupling)
- ❌ Cannot import from core (shared should be generic)
- ❌ Cannot import from routes

**Why no core imports in shared?**
```typescript
// ❌ BAD: Shared component uses API client
// This couples shared code to domain infrastructure
import { apiClient } from '@/core/api/client';

function SharedComponent() {
  const data = await apiClient.get('/endpoint');
  return <div>{data}</div>;
}

// ✅ GOOD: Shared component receives data via props
function SharedComponent({ data }) {
  return <div>{data}</div>;
}

// Feature fetches data and passes to shared component
function FeatureScreen() {
  const { data } = useFeatureData(); // Feature owns data fetching
  return <SharedComponent data={data} />;
}
```

---

### Layer 1A: Core (`/src/core`)

**Purpose:** Domain-specific infrastructure

**Responsibilities:**
- Provide API client
- Define repository interfaces
- Implement mock system
- Configure TanStack Query

**Module Structure:**
```
/core
  /api              # API client, token manager
  /repositories     # Repository interfaces
  /mock             # Mock data system
  queryClient.ts    # TanStack Query config
```

**Rules:**
- ✅ Can use libs (storage, logger)
- ❌ Cannot import from features (infrastructure serves features)
- ❌ Cannot import from shared (infrastructure is independent)
- ❌ Cannot import from routes

**Examples:**
- `apiClient.ts` - HTTP client for backend API
- `tokenManager.ts` - JWT token management
- `RepositoryProvider.tsx` - Dependency injection for repos

---

### Layer 1B: Libs (`/src/libs`)

**Purpose:** Third-party library abstractions

**Responsibilities:**
- Wrap external dependencies
- Provide swappable interfaces
- Isolate implementation details

**Module Structure:**
```
/libs
  /storage          # AsyncStorage wrapper (swappable to MMKV)
  /analytics        # Analytics wrapper (no-op by default)
  /logger           # Logging wrapper (console → remote)
  /notifications    # Push notifications wrapper
```

**Rules:**
- ✅ Completely isolated (no imports from src)
- ❌ Cannot import from features, shared, core, or routes
- ❌ Only imports third-party packages

**Why isolated?**
- Easy to swap implementations
- Can be extracted as standalone npm packages
- Clear interface contracts

**Example:**
```typescript
// src/libs/storage/types.ts
export interface Storage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
}

// src/libs/storage/asyncStorageAdapter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage: Storage = {
  async getItem<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  // ... other methods
};

// Later: Swap to MMKV without changing any feature code
// src/libs/storage/mmkvAdapter.ts
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export const storage: Storage = {
  getItem<T>(key: string): T | null {
    const value = mmkv.getString(key);
    return value ? JSON.parse(value) : null;
  },
  // ... other methods
};
```

---

## Dependency Rules

### Allowed Dependencies

```typescript
// Layer 4 → Layer 3 (routes import screens)
import { MomentsListScreen } from '@/features/moments';

// Layer 3 → Layer 2, 1A, 1B (features use shared, core, libs)
import { Button } from '@/shared/components';
import { apiClient } from '@/core/api/client';
import { storage } from '@/libs/storage';

// Layer 2 → Layer 1B (shared uses libs)
import { logger } from '@/libs/logger';

// Layer 1A → Layer 1B (core uses libs)
import { storage } from '@/libs/storage';
```

### Forbidden Dependencies

```typescript
// ❌ Shared → Features (creates coupling)
import { useMoments } from '@/features/moments';

// ❌ Shared → Core (shared should be generic)
import { apiClient } from '@/core/api/client';

// ❌ Core → Features (infrastructure serves features, not vice versa)
import { MomentRepository } from '@/features/moments';

// ❌ Libs → Anything (libs are isolated)
import { Button } from '@/shared/components';

// ❌ Feature → Feature (no cross-feature imports)
import { useAuth } from '@/features/auth';
```

### How to Enforce

Use ESLint rules (future):

```javascript
// eslint.config.js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // Shared cannot import features
          {
            group: ['@/features/*'],
            importNames: ['*'],
            message: 'Shared code cannot import from features. Extract to shared or pass via props.',
          },
          // Features cannot cross-import
          {
            group: ['@/features/!(auth|moments|story|checkins|rituals)'],
            message: 'Features cannot import from other features. Use navigation or shared state.',
          },
        ],
      },
    ],
  },
}
```

---

## Layer Communication Patterns

### Pattern 1: Top-Down Props

**Use when:** Passing data down the component tree

```typescript
// Feature screen
function MomentsListScreen() {
  const { data: moments } = useMoments();

  return <MomentList moments={moments} />; // ← Pass data down
}

// Shared component
function MomentList({ moments }: { moments: Moment[] }) {
  return moments.map(moment => <MomentCard key={moment.id} moment={moment} />);
}
```

### Pattern 2: Navigation with Params

**Use when:** Communicating between features

```typescript
// Feature A
function FeatureAScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/feature-b/[id]',
      params: { id: '123', returnTo: '/feature-a' },
    });
  };
}

// Feature B
function FeatureBScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo: string }>();
  // Use params
}
```

### Pattern 3: Global State (Use Sparingly)

**Use when:** Truly app-wide state (auth, theme)

```typescript
// Zustand store in shared
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Feature A
function FeatureAScreen() {
  const { user } = useAuthStore();
}

// Feature B
function FeatureBScreen() {
  const { user } = useAuthStore();
}
```

### Pattern 4: Event System (Future)

**Use when:** Features need to react to events without direct coupling

```typescript
// Shared event bus (future)
export const eventBus = {
  emit: (event: string, data: any) => { ... },
  on: (event: string, handler: Function) => { ... },
};

// Feature A emits
eventBus.emit('moment:created', { id: '123' });

// Feature B listens
eventBus.on('moment:created', (data) => {
  console.log('Moment created:', data.id);
});
```

---

## Testing Layers

### Layer 4 (Routes)

Routes typically don't need tests (just imports + renders).

### Layer 3 (Features)

Test screens, components, hooks:

```typescript
// src/features/moments/api/useMoments.test.ts
describe('useMoments', () => {
  it('fetches moments from repository', async () => {
    const { result } = renderHook(() => useMoments());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Layer 2 (Shared)

Test components and utils in isolation:

```typescript
// src/shared/components/ui/Button.test.tsx
describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onPress={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });
});
```

### Layer 1 (Infrastructure)

Test adapters and wrappers:

```typescript
// src/libs/storage/asyncStorageAdapter.test.ts
describe('storage', () => {
  it('stores and retrieves data', async () => {
    await storage.setItem('key', { value: 'data' });
    const retrieved = await storage.getItem('key');
    expect(retrieved).toEqual({ value: 'data' });
  });
});
```

---

## Benefits of Layered Architecture

### 1. Clear Mental Model

Developers know exactly where code belongs:
- Routing? → `/src/app`
- Feature logic? → `/src/features/{feature}`
- Reusable component? → `/src/shared/components`
- Third-party wrapper? → `/src/libs/{lib}`

### 2. Easy to Test

Each layer can be tested independently:
- Mock libs when testing core
- Mock core when testing features
- Mock features when testing routes

### 3. Swappable Implementations

Infrastructure can be swapped without changing business logic:
- AsyncStorage → MMKV (change `/src/libs/storage`)
- Supabase → REST API (change repositories in `/src/core`)
- Expo Router → React Navigation (change `/src/app`)

### 4. Scalable

As the app grows, layers stay organized:
- Add new features without restructuring
- Extract features as packages
- Multiple teams can work independently

### 5. Easier Onboarding

New developers understand the structure quickly:
- Layers are self-explanatory
- Dependencies flow in one direction
- Consistent patterns across features

---

## Common Violations and Fixes

### Violation 1: Shared imports from Features

**Problem:**
```typescript
// src/shared/components/MomentPreview.tsx
import { useMoments } from '@/features/moments';
```

**Fix:**
```typescript
// Pass data via props instead
function MomentPreview({ moments }: { moments: Moment[] }) {
  return moments.map(m => <div>{m.title}</div>);
}
```

### Violation 2: Feature imports from Feature

**Problem:**
```typescript
// src/features/story/screens/StoryScreen.tsx
import { useMoments } from '@/features/moments';
```

**Fix:**
```typescript
// Navigate to moments screen instead
router.push('/moments');

// Or lift state to shared if truly global
```

### Violation 3: Libs imports from Core

**Problem:**
```typescript
// src/libs/storage/index.ts
import { STORAGE_KEYS } from '@/core/constants';
```

**Fix:**
```typescript
// Define STORAGE_KEYS in libs/storage/types.ts instead
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  // ...
};
```

---

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
