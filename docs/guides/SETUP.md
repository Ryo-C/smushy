# Setup Instructions

## Initial Setup

You've successfully scaffolded the Smushy project! Here's what to do next:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env
```

Then edit `.env` and configure your environment:

```env
# Mock Mode (Development - No backend needed)
EXPO_PUBLIC_USE_MOCK_DATA=true

# Backend Mode (Production - Requires REST API backend)
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_BACKEND_URL=https://api.smushy.app
```

### 3. Choose Your Development Mode

**Option A: Mock Mode (Recommended for getting started)**
- No backend setup required
- Uses in-memory mock data with realistic seed data
- Perfect for UI development and testing
- Set `EXPO_PUBLIC_USE_MOCK_DATA=true`

**Option B: Backend Mode (For production or API integration testing)**
- Requires NestJS REST API backend running
- Uses JWT authentication
- Set `EXPO_PUBLIC_USE_MOCK_DATA=false`
- Set `EXPO_PUBLIC_BACKEND_URL` to your API URL

### 4. Start Development Server

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure Created

```
✓ Configuration files (tsconfig, tailwind, babel, etc.)
✓ App structure with Expo Router
  - Root layout with TanStack Query provider
  - Tab navigation (Moments, Story, Profile)
  - Auth screens (Login, Signup)
✓ Infrastructure (lib/)
  - Supabase client
  - TanStack Query configuration
  - Storage utilities
✓ Shared components
  - UI: Button, Input, Card
  - Layout: Screen, Container
  - Feedback: LoadingSpinner, ErrorMessage, EmptyState
✓ Shared utilities
  - Error handling
  - Date formatting
  - Email validation
  - Query keys
  - Config constants
✓ Example auth feature
  - Complete authentication flow
  - Zustand store for auth state
  - TanStack Query hooks
  - Repository pattern
```

## Next Steps

### 1. Create Your First Feature

Follow the pattern in `src/features/auth/`:

```bash
# Create feature structure
mkdir -p src/features/moments/{screens,components,api,types}
```

See `CLAUDE.md` for the complete feature creation guide.

## What's Next?

Now that you're set up, explore the documentation:

- **Architecture overview:** See [CLAUDE.md](../../CLAUDE.md)
- **Development patterns:** See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Core values:** See [../design/VALUES.md](../design/VALUES.md)
- **Current sprint status:** See [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)

## Useful Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS
npm run android        # Run on Android

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Code Quality
npm run lint           # Lint code
npm run type-check     # Type check
```

## Architecture Reminders

### State Management Decision Tree
- **Supabase data?** → TanStack Query
- **App-wide state?** → Zustand
- **Component-local?** → useState

### Dependency Rules
- ✅ `/app` → `/src/features` (screens only)
- ✅ `/src/features` → `/src/shared`
- ✅ `/src/shared` → `/src/lib`
- ❌ `/src/shared` → `/src/features` (forbidden)

### File Naming
- Components: `PascalCase.tsx`
- Screens: `PascalCaseScreen.tsx`
- Hooks: `useHookName.ts`
- Utils: `camelCase.ts`

## Need Help?

- See `../../CLAUDE.md` for complete architecture guide
- See `../design/VALUES.md` for core values and principles
- Check examples in `src/features/auth/`

Happy coding! 💛
