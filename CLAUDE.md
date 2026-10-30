# Smushy

> Expo mobile application for couples to share and track their activities, memories, reflections and relationship well-being.

**Last Updated:** 2026-01-04
**Expo SDK:** Latest
**Target Platforms:** iOS & Android

---

## 🎯 Quick Task Router for Claude Code

> **Claude Code:** Use this router to find the RIGHT documentation for your task. Load specialized docs ON DEMAND, not all at once.

**When the user asks you to:**
- ✅ **Create a new feature** → Read [`docs/guides/CONTRIBUTING.md`](docs/guides/CONTRIBUTING.md)
- ✅ **Understand architecture** → Read [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md) + [`LAYERS.md`](docs/architecture/LAYERS.md)
- ✅ **Work with state management** → Read [`docs/architecture/STATE_MANAGEMENT.md`](docs/architecture/STATE_MANAGEMENT.md)
- ✅ **Add navigation/routing** → Read [`docs/architecture/NAVIGATION.md`](docs/architecture/NAVIGATION.md)
- ✅ **Style components** → Read [`docs/architecture/STYLING.md`](docs/architecture/STYLING.md)
- ✅ **Debug API issues** → Read [`docs/technical/API_CLIENT.md`](docs/technical/API_CLIENT.md)
- ✅ **Work with mock data** → Read [`docs/technical/MOCK_DATA.md`](docs/technical/MOCK_DATA.md)
- ✅ **Understand feature requirements** → Read `docs/features/[FEATURE].md`
- ✅ **Check current status** → Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- ✅ **Align with values** → Read [`docs/design/VALUES.md`](docs/design/VALUES.md)

### 📚 Documentation Ownership (Single Source of Truth)

| Topic | Authoritative Document | Use This Doc For |
|-------|----------------------|------------------|
| Overall Architecture | [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md) | System design, patterns |
| Layer Dependencies | [`docs/architecture/LAYERS.md`](docs/architecture/LAYERS.md) | Dependency rules, violations |
| State Management | [`docs/architecture/STATE_MANAGEMENT.md`](docs/architecture/STATE_MANAGEMENT.md) | Repository pattern, TanStack Query, Zustand |
| Navigation | [`docs/architecture/NAVIGATION.md`](docs/architecture/NAVIGATION.md) | Expo Router, navigation hooks |
| Styling | [`docs/architecture/STYLING.md`](docs/architecture/STYLING.md) | NativeWind, Reanimated, theme |
| Code Patterns | [`docs/guides/CONTRIBUTING.md`](docs/guides/CONTRIBUTING.md) | Step-by-step feature creation |
| API Client | [`docs/technical/API_CLIENT.md`](docs/technical/API_CLIENT.md) | REST API, JWT auth, retry logic |
| Mock Data | [`docs/technical/MOCK_DATA.md`](docs/technical/MOCK_DATA.md) | Mock repositories, seed data |
| Values & Philosophy | [`docs/design/VALUES.md`](docs/design/VALUES.md) | Feature naming, core principles |

**Rule:** If a topic has an authoritative document, read that instead of relying on summaries in CLAUDE.md.

---

## Overview

Smushy is a relationship companion app for couples who want to be more intentional, emotionally connected, and thoughtful with each other — without turning their relationship into a productivity project or a therapy session.

It helps couples capture meaningful moments, remember what matters, and stay emotionally in sync, while relying on the phone's existing calendar system for logistics.

**Smushy does not try to fix broken relationships.**
**It supports couples who already care and want to care better.**

### Core Philosophy

**Smushy exists to make good relationships stronger, not to fix broken ones.**

It's built around:
- 🛡️ **Emotional safety** — Safe space for reflection without judgment
- 🤝 **Consent** — Share only when both partners are comfortable
- 🎯 **Intentionality** — Focus on what matters, not metrics
- 💛 **Warmth** — Encouraging and supportive, never demanding
- 🔒 **Respect for privacy** — No tracking, no surveillance, no forced visibility

### Key Features

- **Moments** — Create and manage couple-specific events (dates, trips, rituals, milestones)
- **Our Story** — A private timeline of shared moments created in Smushy
- **Check-ins** — Optional, private reflection prompts (reflection over reaction)
- **Rituals** — Recurring couple rituals (weekly date night, monthly check-in)
- **Nudges** — Gentle reminders to stay connected (no pressure, no streaks, no guilt)

### What Smushy Intentionally Avoids

- ❌ No chat or messaging
- ❌ No shared emotional rant logs
- ❌ No effort counters or streaks
- ❌ No conflict resolution tools
- ❌ No reading or analyzing personal calendars
- ❌ No forced emotional visibility

> **Smushy is not a scoreboard, a judge, or a therapist.**

**For detailed feature naming and design rationale, see:** `docs/design/VALUES.md`

---

## 🚨 Documentation-First Development

**Rule:** BEFORE marking ANY task complete, update relevant documentation.

Use the [Documentation Ownership table](#-documentation-ownership-single-source-of-truth) above to find the authoritative doc for your change type. Always update:
1. The authoritative document for your change
2. `PROJECT_CONTEXT.md` if it affects feature status
3. Feature docs (`docs/features/*.md`) if adding/modifying features

**This is mandatory — code without documentation is incomplete.**

---

## Tech Stack

**Core:**
- Expo SDK 58 (~58.0.21) + React Native (0.88.1) + TypeScript 6 (strict mode)
- Expo Router (file-based routing with type safety)

**UI & Styling:**
- NativeWind (Tailwind for React Native)
- React Native Reanimated (60fps animations)

**State Management:**
- TanStack Query — REST API data (server state)
- Zustand — App-level state (client state)
- useState — Component-local state

**Backend Integration:**
- REST API (NestJS + PostgreSQL)
- JWT authentication with auto-refresh
- Dual-mode: Backend API or in-memory mock data

**Development:**
- Repository pattern with dependency injection
- Jest + React Native Testing Library
- ESLint + Prettier

**See [`package.json`](package.json) for complete dependencies.**

---

## Environment Configuration

**Dual-Mode Development:**
- **Mock Mode:** `EXPO_PUBLIC_USE_MOCK_DATA=true` (development, offline, demos)
- **Backend Mode:** `EXPO_PUBLIC_USE_MOCK_DATA=false` + `EXPO_PUBLIC_BACKEND_URL=https://api.smushy.app` (production)

The app automatically selects mock or backend repositories based on the environment variable. No code changes needed to switch modes.

**See:** [`docs/technical/MOCK_DATA.md`](docs/technical/MOCK_DATA.md) for detailed mock data documentation.

---

## Getting Started

For quick start, see [README.md](README.md).
For detailed setup instructions, see [docs/guides/SETUP.md](docs/guides/SETUP.md).

**Prerequisites:** Node.js 22.13+ (`nvm use` reads `.nvmrc`), Expo Go for SDK 58, iOS/Android dev tools
**Key command:** `npx expo start`

---

## Project Architecture

Smushy follows **layered clean architecture** with clear separation: Routes → Features → Shared → Infrastructure (Core + Libs).

**Key Principles:**
- Routes are thin (routing only)
- Features are self-contained (screens, components, API, types)
- Dependencies flow one way: Features → Shared → Core/Libs (never reversed)
- Repository pattern with dependency injection (backend + mock implementations)

**See [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md) for:**
- Complete architecture diagram
- Layer responsibilities
- Dependency rules
- Architecture decision records

### Directory Structure

```
/src
  /app                 # Expo Router (routing only)
  /features            # Self-contained feature modules (moments, auth, story, etc.)
  /shared              # Reusable code (UI components, hooks, utils, theme)
  /core                # Infrastructure (API client, repositories, mock system)
  /libs                # Third-party abstractions (storage, logger, analytics)
```

Features are self-contained with screens, components, API layer (repositories + hooks), and types.

**See [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md) for complete file structure details.**

### Architecture Rules

**1. Routes are thin** — `/src/app` only imports and renders screens from features

**2. Screens orchestrate** — Presentation logic in `/src/features/*/screens`, using hooks and components

**3. Data via repositories** — Repository pattern with dependency injection (backend + mock implementations)

**4. State management** — TanStack Query for API data, Zustand for app state, useState for component state

**5. Respect dependencies** — Features → Shared → Core/Libs (never reversed), no cross-feature imports

**For detailed patterns, code examples, and architecture rules:**
- [`docs/architecture/LAYERS.md`](docs/architecture/LAYERS.md) - Complete dependency rules and layer architecture
- [`docs/architecture/STATE_MANAGEMENT.md`](docs/architecture/STATE_MANAGEMENT.md) - Repository pattern, TanStack Query, Zustand
- [`docs/guides/CONTRIBUTING.md`](docs/guides/CONTRIBUTING.md) - Step-by-step implementation guides with code examples

---

## Code Conventions

### Naming Conventions
- **Components:** PascalCase (`MomentCard.tsx`, `Button.tsx`)
- **Screens:** PascalCase with `Screen` suffix (`MomentsListScreen.tsx`)
- **Hooks:** camelCase with `use` prefix (`useMoments.ts`, `useDebounce.ts`)
- **Stores:** camelCase with `use` prefix and `Store` suffix (`useAuthStore.ts`)
- **Repositories:** camelCase with `Repository` suffix (`momentRepository.ts`)
- **Utils:** camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Constants:** UPPER_SNAKE_CASE (`QUERY_KEYS`, `API_CONFIG`)
- **Types/Interfaces:** PascalCase (`Moment`, `User`, `CreateMomentDTO`)

### TypeScript Guidelines
- ✅ Strict mode enabled (`strict: true`)
- ✅ No `any` types (use `unknown` if needed)
- ✅ Interfaces for public APIs, types for internal
- ✅ Props interfaces end with `Props` suffix
- ✅ DTOs end with `DTO` suffix (`CreateMomentDTO`)
- ✅ Explicit return types for functions
- ✅ Use feature-specific types (`@/features/*/types`)

### Component Structure

**Standard component structure:**
1. External imports (React, React Native)
2. Third-party imports
3. Internal imports (@ alias)
4. Types
5. Component

For detailed examples and templates, see [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md#code-templates).

### Styling with NativeWind

```typescript
// Basic usage
<View className="flex-1 bg-gray-100 p-4">
  <Text className="text-2xl font-bold text-gray-900">Welcome</Text>
</View>
```

For comprehensive styling patterns, theme system, animations, and best practices, see:
- `docs/architecture/STYLING.md` - NativeWind patterns, theme configuration, Reanimated animations
- `docs/guides/CONTRIBUTING.md` - Additional styling examples and code templates

### Import Aliases

Use TypeScript path aliases for clean imports:
- `@/*` - Root src directory
- `@/app/*` - App routes
- `@/features/*` - Feature modules
- `@/shared/*` - Shared components, hooks, utils
- `@/core/*` - Infrastructure (API, repositories)
- `@/libs/*` - Third-party abstractions

**Example:**
```typescript
import { Button } from '@/shared/components/ui';
import { useMoments } from '@/features/moments';
import { apiClient } from '@/core/api/client';
```

---

## Development Patterns

### State Management Decision Tree

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

### Creating a New Feature

For step-by-step feature creation with code templates, see [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md#creating-new-features).

**Quick overview:**
1. Create feature directory structure
2. Define types
3. Create repository interface in `/src/core/repositories/types.ts`
4. Create backend repository (`backendRepository.ts`) using `apiClient`
5. Create mock repository (`mockRepository.ts`) using `mockStorage`
6. Register repositories in `RepositoryProvider`
7. Create TanStack Query hooks (using injected repository)
8. Create screen components
9. Create route in /app
10. Export from feature index.ts

Each feature follows the pattern: `/src/features/[name]/{screens,components,api,types}`

### Error Handling Pattern

Use `toAppError` utility for consistent error handling across the app.

For implementation details, see [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md#error-handling).

### Navigation Patterns

Smushy uses Expo Router with file-based routing.

**For detailed navigation architecture, patterns, and examples, see:**
- `docs/architecture/NAVIGATION.md` - Expo Router structure, navigation hooks, dynamic routes, layouts, modals
- `docs/guides/CONTRIBUTING.md` - Navigation code examples and templates

---

## Testing

**Test Structure:** Co-locate tests with components
```
/src/features/moments
  /api
    useMoments.ts
    useMoments.test.ts
  /components
    MomentCard.tsx
    MomentCard.test.tsx
```

**Running Tests:**
```bash
npm test                  # Run all tests
npm test -- --coverage    # With coverage
npm test -- --watch       # Watch mode
```

For detailed testing patterns and examples, see [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md#testing-patterns).

---

## Performance Guidelines

**Performance Budgets:**
- Bundle Size: < 15MB (Android), < 30MB (iOS)
- Initial Load: < 3s (TTI)
- List Rendering: 60fps with 100+ items
- Animations: 60fps (use Reanimated on UI thread)

**Key Techniques:**
- Use FlashList for large lists
- Memoize expensive computations (useMemo, useCallback)
- Optimize TanStack Query (staleTime, gcTime)
- Use Expo Image for better performance
- Run animations on UI thread (Reanimated)

For detailed optimization patterns and code examples, see [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md#performance-optimization).

---

## Documentation

**Navigation:** See the [Task Router](#-quick-task-router-for-claude-code) at the top for finding the right documentation.

**Documentation Tiers:**
1. **Entry Points:** README.md, CLAUDE.md (this file), PROJECT_CONTEXT.md
2. **Implementation Guides:** [`docs/guides/CONTRIBUTING.md`](docs/guides/CONTRIBUTING.md), [`docs/guides/SETUP.md`](docs/guides/SETUP.md)
3. **Architecture Specs:** [`docs/architecture/*`](docs/architecture/) - OVERVIEW, LAYERS, STATE_MANAGEMENT, NAVIGATION, STYLING
4. **Technical Specs:** [`docs/technical/*`](docs/technical/) - API_CLIENT, MOCK_DATA
5. **Feature Specs:** [`docs/features/*`](docs/features/) - Feature-specific documentation

**Rule:** Use the Task Router to find authoritative documentation. Don't duplicate information - link to the single source of truth.

---

## Implementation Status

**Current project status:** See [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) for:
- Feature completion matrix
- Active development focus
- Known issues and blockers
- Recent changes

**Reference implementation:** `src/features/auth/` - Complete feature following all architecture patterns

---

## Common Commands

```bash
# Development
npx expo start                  # Start Expo dev server (choose platform)
npx expo start --ios            # Run on iOS simulator
npx expo start --android        # Run on Android emulator
npx expo start --web            # Run on web (if configured)
npx expo start --clear          # Start with cleared cache

# Development with different modes
npm run start:mock              # Start with mock data
npm run start:prod              # Start with backend API
npm run android:mock            # Android with mock data
npm run ios:prod                # iOS with backend API

# Testing
npm test                        # Run tests
npm test -- --coverage          # Run with coverage
npm test -- --watch             # Run in watch mode
npm run lint                    # Run ESLint
npm run type-check              # Run TypeScript compiler

# Cleaning
npx expo start --clear          # Clear Metro bundler cache
rm -rf node_modules && npm install  # Clean reinstall
```

---

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**iOS build failures:**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

**Android build failures:**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

**Backend API connection issues:**
- Verify `EXPO_PUBLIC_BACKEND_URL` is set correctly in `.env`
- Check backend server is running and accessible
- Verify JWT tokens are being stored (check AsyncStorage)
- Check network tab for failed API requests
- Ensure `EXPO_PUBLIC_USE_MOCK_DATA` is set to `false` for backend mode

**Mock mode not working:**
- Verify `EXPO_PUBLIC_USE_MOCK_DATA=true` in `.env`
- Check mock data is loading (console logs in mock repositories)
- Clear AsyncStorage if seeing stale data

**TanStack Query not updating:**
- Check query keys are correctly defined
- Verify `invalidateQueries` is called after mutations
- Check network tab for failed requests

**NativeWind styles not applying:**
- Verify `tailwind.config.js` is configured correctly
- Check `nativewind/babel` is in `babel.config.js`
- Clear Metro cache: `npx expo start --clear`

---

## Additional Resources

### Official Documentation
- **Expo Docs:** https://docs.expo.dev
- **Expo Router:** https://docs.expo.dev/router/introduction
- **NativeWind:** https://www.nativewind.dev
- **Reanimated:** https://docs.swmansion.com/react-native-reanimated
- **TanStack Query:** https://tanstack.com/query/latest/docs/framework/react/overview
- **Zustand:** https://zustand-demo.pmnd.rs
- **TypeScript:** https://www.typescriptlang.org/docs

### Community Resources
- **Expo Discord:** https://chat.expo.dev
- **React Native Directory:** https://reactnative.directory

---

## Contributing

**See [`docs/guides/CONTRIBUTING.md`](docs/guides/CONTRIBUTING.md) for:**
- Step-by-step feature creation guide
- Code templates and examples
- Testing patterns
- Architecture rules and best practices

**Quick reminders:**
- Follow repository pattern (backend + mock implementations)
- TanStack Query for API data, Zustand for app state
- Keep routes thin, respect dependency rules
- Update documentation with code changes
