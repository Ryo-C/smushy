# Mock Data System Documentation

The Smushy app includes a comprehensive mock data system that enables full-stack development without a Supabase backend. This allows you to build and test features with realistic data before setting up the production infrastructure.

---

## 🎯 Overview

The mock data system provides:
- ✅ **Realistic seed data** for all features (users, moments, check-ins, rituals, profiles)
- ✅ **Persistent storage** using AsyncStorage (survives app restarts)
- ✅ **Network delay simulation** (200-800ms) for realistic loading states
- ✅ **Pagination support** for infinite scroll testing
- ✅ **Full CRUD operations** matching the real Supabase API
- ✅ **Easy toggle** between mock and real backend

---

## 🚀 Quick Start

### Enable Mock Data

```bash
# Option 1: Use npm scripts (recommended)
npm run start:mock

# Option 2: Set environment variable
EXPO_PUBLIC_USE_MOCK_DATA=true npm start

# Option 3: Update .env file
# Edit .env and set:
EXPO_PUBLIC_USE_MOCK_DATA=true
```

### Test Users

Two pre-configured test users are available:

| Name | Email | Password | Partner |
|------|-------|----------|---------|
| Ryo | ryo@example.com | password123 | Roline |
| Roline | roline@example.com | password123 | Ryo |
| Unconnected | unconnected@example.com | password123 | — (no partner, no data) |
| Partner 1 | partner1@example.com | password123 | Partner 2 (blank slate: no moments, rituals or check-ins) |
| Partner 2 | partner2@example.com | password123 | Partner 1 (blank slate) |

**Note**: In mock mode, any password works. The default is `password123`.

---

## 📁 Architecture

### File Structure

```
/src/core/mock/
├── data/                      # Seed data (JSON)
│   ├── users.json
│   ├── moments.json
│   ├── story.json
│   ├── checkins.json
│   ├── rituals.json
│   └── profiles.json
│
├── storage/                   # Storage layer
│   ├── mockStorage.ts        # In-memory storage
│   └── seedData.ts           # Initialization logic
│
├── utils/                     # Mock utilities
│   ├── delay.ts              # Network simulation
│   ├── generateId.ts         # ID generation
│   └── pagination.ts         # Pagination helper
│
└── index.ts                   # Public API
```

### Repository Pattern

Each feature has:
- **Mock Repository** (`mockRepository.ts`) - In-memory data implementation
- **Backend Repository** (`backendRepository.ts`) - REST API implementation
- **Repository Provider** - Switches between mock/backend based on config

```typescript
// /src/core/repositories/RepositoryProvider.tsx
const repositories = {
  moment: MOCK_CONFIG.enabled
    ? mockMomentRepository  // Uses mock data
    : backendMomentRepository // Uses REST API
}
```

**Components don't know or care which repository they're using!**

---

## 🔧 How It Works

### 1. Initialization

When the app starts (in mock mode):

```typescript
// app/_layout.tsx
useEffect(() => {
  if (MOCK_CONFIG.enabled) {
    initializeAllSeedData(); // Loads JSON files into AsyncStorage
  }
}, []);
```

### 2. Data Persistence

Mock data is stored in **AsyncStorage**, so changes persist across app restarts:

```typescript
// Create a moment
await mockMomentRepository.create({ title: 'Coffee Date', ... });

// Restart app - moment still exists!
const moments = await mockMomentRepository.getAll();
// ✅ "Coffee Date" is still there
```

### 3. Network Simulation

All mock operations include realistic delays (200-800ms):

```typescript
// Simulates network latency
await simulateNetworkDelay(); // Random 200-800ms delay

// Your hooks work exactly like real API calls
const { data, isLoading } = useMoments();
// isLoading is true during delay
```

---

## 📚 Available Features

### ✅ Implemented Mock Repositories

#### 1. **Auth** (`/src/features/auth/api/mockAuthRepository.ts`)
```typescript
// Sign in
const { data } = await mockAuthRepository.signIn({
  email: 'ryo@example.com',
  password: 'password123'
});

// Sign up
await mockAuthRepository.signUp({
  email: 'new@example.com',
  password: 'pass123',
  name: 'New User'
});

// Sign out
await mockAuthRepository.signOut();
```

#### 2. **Moments** (`/src/features/moments/api/mockRepository.ts`)
```typescript
// Get all moments
const moments = await mockMomentRepository.getAll();

// Get with filters
const dateMoments = await mockMomentRepository.getAll({
  type: 'date',
  dateFrom: '2024-01-01',
  isShared: true
});

// Create moment
const newMoment = await mockMomentRepository.create({
  title: 'Beach Day',
  date: '2024-12-25',
  type: 'date',
  is_shared: true
});

// Update moment
await mockMomentRepository.update('moment-1', {
  title: 'Updated Title'
});

// Delete moment
await mockMomentRepository.delete('moment-1');
```

### 🚧 Deferred Mock Repositories

These will be implemented when you start building each feature:

- **Story/Timeline** - Create when building the timeline feature
- **Check-ins** - Create when building emotional check-ins
- **Rituals** - Create when building recurring rituals
- **Profile** - Create when building profile management

**Seed data already exists** for these features in `/src/core/mock/data/`.

---

## 🎨 Seed Data Details

### Users (5 users)
- Ryo & Roline (married partners, Ryo is the default auto-login account)
- Unconnected: account with no partner and no data (for trying the unconnected state)
- No avatar photos: the app shows an initial avatar (no stock photos of real people)

### Moments (12 moments)
- Ryo and Roline, a married couple in Singapore. Both write moments (8 by Ryo, 4 by Roline), so the demo shows "By Partner" too
- Covers every type: date, trip, milestone, ritual, anniversary (One year married, Tanah Lot, Bali, 4 May)
- One upcoming, private moment (Her birthday dinner, 12 Dec 2026) so the Upcoming filter and private badge have something to show
- **Voice**: written *to each other*, not as a diary about the other person ("Got you the iced oat latte. You still drank half of mine."). Plain, a little dry, no exclamation marks. Private notes stay personal
- **Context**: everyday Singapore (BTO keys, wet market and hawker breakfast, dabao, a Bintan weekend) without leaning on landmarks. British spelling
- **Photos**: every moment has a `photo_url` from the Unsplash CDN (`images.unsplash.com/photo-<id>?w=800&h=600&fit=crop`), each hand-checked to match its moment. Free to use under the Unsplash license; needs network access. Don't use `picsum.photos/seed/...` (random, unrelated images) or photos of real people such as artists

### Story
- No seed file: Story is derived from shared, past moments plus shared check-ins (see `src/features/story/api/mockRepository.ts`)

### Check-ins (10 check-ins)
- Various moods (great, good, okay, stressed, struggling)
- Shared and private
- Realistic emotional content

### Rituals (5 rituals)
- Different frequencies (daily, weekly, monthly)
- Active and inactive
- Realistic next occurrence dates

### Profiles (2 profiles)
- Match users
- Partner connections
- Realistic preferences

---

## 🛠️ Using Mock Data in Development

### Example: Building the Moments List Screen

```typescript
// /src/features/moments/screens/MomentsListScreen.tsx
import { useMoments } from '../api/useMoments';

export function MomentsListScreen() {
  // Works with both mock and real data!
  const { data: moments, isLoading, error } = useMoments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <FlatList
      data={moments}
      renderItem={({ item }) => <MomentCard moment={item} />}
    />
  );
}
```

**No changes needed when switching to real Supabase!**

### Example: Creating a Moment

```typescript
import { useCreateMoment } from '@/features/moments';

function CreateMomentForm() {
  const createMoment = useCreateMoment();

  const handleSubmit = async (data) => {
    await createMoment.mutateAsync({
      title: data.title,
      date: data.date,
      type: 'date',
      is_shared: true
    });
    // Automatically invalidates cache and refetches
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔄 Resetting Mock Data

### Seed Version (automatic reseed)

Seed data is written to storage once, and `mock_data_initialized` stores the seed version that was written. **When you change any `src/core/mock/data/*.json` file, bump `SEED_VERSION` in `src/core/mock/storage/seedData.ts`**. Existing installs then reseed on next launch. Reseeding overwrites any mock data created in the app.

### Reset to Seed Data

If you want to start fresh:

```typescript
import { resetToSeeds } from '@/core/mock';

// In a dev screen or debug menu
<Button onPress={() => resetToSeeds()}>
  Reset to Seed Data
</Button>
```

### Clear All Mock Data

```typescript
import { clearAllMockData } from '@/core/mock/storage/mockStorage';

// Nuclear option - clears everything
await clearAllMockData();
```

---

## 🧪 Testing with Mock Data

### Unit Testing

```typescript
// Import mock repository directly
import { mockMomentRepository } from '@/features/moments/api/mockRepository';

test('should filter moments by type', async () => {
  const moments = await mockMomentRepository.getAll({ type: 'date' });
  expect(moments.every(m => m.type === 'date')).toBe(true);
});
```

### Integration Testing

```typescript
// Use hooks with mock QueryClient
import { renderHook, waitFor } from '@testing-library/react-native';
import { useMoments } from '@/features/moments';

test('useMoments returns moments', async () => {
  const { result } = renderHook(() => useMoments(), {
    wrapper: createQueryClientWrapper()
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.length).toBeGreaterThan(0);
});
```

---

## 🔀 Switching to Real Supabase

When you're ready to migrate:

### 1. Set Up Supabase

```bash
# Create Supabase project
# Create tables matching mock types
# Set up RLS policies
```

### 2. Update Environment

```bash
# .env
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Implement Real Repositories

```typescript
// /src/features/moments/api/repository.ts
export const momentRepository: MomentRepository = {
  getAll: async (filters?) => {
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },
  // ... other methods
};
```

### 4. Test & Deploy

```bash
# Test locally
npm run start:prod

# Build production version
npm run build:production
```

**Your hooks, components, and screens don't change at all!**

---

## ⚙️ Configuration

### Mock Config

Located in `/src/shared/constants/config.ts`:

```typescript
export const MOCK_CONFIG = {
  enabled: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  delayMin: 200,        // Minimum network delay (ms)
  delayMax: 800,        // Maximum network delay (ms)
  errorRate: 0,         // Error simulation (disabled)
  enableLogs: true,     // Console logging for debugging
} as const;
```

### Storage Keys

Located in `/src/core/storage.ts`:

```typescript
export const STORAGE_KEYS = {
  MOCK_DATA_INITIALIZED: 'mock_data_initialized',
  MOCK_CURRENT_USER: 'mock_current_user',
  MOCK_USERS: 'mock_users',
  MOCK_MOMENTS: 'mock_moments',
  MOCK_STORY: 'mock_story',
  MOCK_CHECKINS: 'mock_checkins',
  MOCK_RITUALS: 'mock_rituals',
  MOCK_PROFILES: 'mock_profiles',
} as const;
```

---

## 🐛 Troubleshooting

### Mock data not loading

```bash
# Check environment variable
echo $EXPO_PUBLIC_USE_MOCK_DATA

# Clear cache and restart
npx expo start --clear

# Check console for initialization logs
# Should see: "[Mock Data] Initializing seed data..."
```

### Changes not persisting

```typescript
// Verify AsyncStorage is working
import { storage } from '@/libs/storage';

const test = await storage.getItem('test');
console.log('AsyncStorage works:', test);
```

### Auth not working

```bash
# Use test credentials
Email: ryo@example.com
Password: password123 (or any password in mock mode)
```

### TypeScript errors

```bash
# Check repository implements interface
// Each mock repository should implement the repository interface
export const mockMomentRepository: MomentRepository = { ... }
```

---

## 📖 Additional Resources

- **Main README**: `/README.md` - Project overview
- **Setup Guide**: `../guides/SETUP.md` - Installation instructions
- **Project Context**: `/PROJECT_CONTEXT.md` - Current development status
- **Architecture**: `/CLAUDE.md` - Detailed architecture documentation

---

## 🎯 Next Steps

1. **Start developing** with mock data: `npm run start:mock`
2. **Create new features** using the established patterns
3. **Add mock repositories** when starting each new feature
4. **Test thoroughly** with realistic data
5. **Migrate to Supabase** when features are validated

---

**Happy coding! 🚀**

The mock data system gives you full freedom to build and test without backend constraints. Focus on creating great features, and switch to the real backend when you're ready.
