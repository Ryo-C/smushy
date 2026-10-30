# Smushy

A calm relationship app for couples: shared moments, a photo timeline, rituals and private mood check-ins. Built with React Native, TypeScript and Expo.

> **Status: work-in-progress demo.** Every screen works end to end in **mock mode**, with seed data for a demo couple. The NestJS backend isn't in this repo, and things like photo upload, partner invites and real notifications aren't built yet.

<!-- Screenshots: add images to docs/screenshots/ and uncomment
| Moments | Our Story | Rituals |
| --- | --- | --- |
| ![Moments](docs/screenshots/moments.png) | ![Story](docs/screenshots/story.png) | ![Rituals](docs/screenshots/rituals.png) |
-->

## What you can try

- **Moments:** dates, trips and milestones with photos. Search, filter by time and type, create, edit and delete.
- **Our Story:** a timeline of what you've shared, grouped by month, with a "years ago this month" throwback.
- **Rituals:** the things you two do on repeat, with next-time scheduling, reminders and a done / pause toggle.
- **Check-ins:** a mood and a line about how you're doing. Private unless you choose to share.
- **Profile:** your couple card, reminder settings and three colour themes (Coral, Serene, Forest).

## Try it in two minutes (mock mode)

Needs **Node.js 22.13+** (there's an `.nvmrc`, so `nvm use` picks it) and, on a phone, **Expo Go for SDK 58**.

```bash
nvm use
npm install
cp .env.example .env
npm run ios:mock        # or: npm run android:mock, or npm run start:mock and scan the QR code
```

Mock mode runs entirely on the device and signs you in as Ryo automatically. Log out from Profile to try another account. Every demo account uses the password `password123`.

| Email | What's there |
| --- | --- |
| `ryo@example.com` | The demo couple, full of moments, rituals and check-ins (partnered with Roline) |
| `roline@example.com` | The other half of the demo couple |
| `partner1@example.com` | A blank slate, already partnered with partner2. Start your own story |
| `partner2@example.com` | The other half of the blank-slate couple |
| `unconnected@example.com` | No partner and no data, to see the unconnected state |

Seed photos load from Unsplash, so the demo needs an internet connection.

## What's inside

- **Expo SDK 58, React Native 0.88** with the New Architecture, **TypeScript 6** in strict mode
- **Expo Router** for file-based navigation; **NativeWind**, **Reanimated** and **FlashList** for UI
- **TanStack Query** for server data, **Zustand** for app state
- **Repository pattern with dependency injection:** every feature has a backend and a mock implementation, switched by one environment variable
- **API client:** JWT auth with single-flight token refresh, retries with exponential backoff, request timeouts
- **229 Jest tests** covering auth, the API client, shared utilities and the Story and Rituals logic

## Architecture

Routes → Features → Shared → Core and Libs, with dependencies flowing one way only. Each feature is self-contained (screens, components, data layer, types).

```
src/
  app/        Expo Router routes (thin: routing only)
  features/   auth, moments, story, rituals, checkins, profile
  shared/     UI components, hooks, theme, utilities
  core/       API client, token management, repositories, mock system
  libs/       storage, logging and analytics abstractions
```

Details: [Overview](docs/architecture/OVERVIEW.md) · [Layers](docs/architecture/LAYERS.md) · [State management](docs/architecture/STATE_MANAGEMENT.md) · [Navigation](docs/architecture/NAVIGATION.md) · [Decisions](docs/architecture/DECISIONS.md)

## Built with Claude Code

Smushy was built with Claude Code from day one, and the repo is set up so an AI agent works from documented decisions instead of guessing:

- [`CLAUDE.md`](CLAUDE.md) routes each kind of task to the one document that owns it
- Architecture, state, API and feature docs are the single source of truth
- A docs-first rule: a task isn't done until its documentation is updated
- Changes are type-checked and tested before they're committed

I set the architecture and product direction and reviewed what the agent wrote; Claude Code did most of the typing.

## Product principles

Smushy supports couples who already care and want to care better. It's built around emotional safety, consent, intentionality and privacy, and it deliberately leaves out chat, streaks, effort counters and calendar tracking. See [Values](docs/design/VALUES.md).

## Scripts

```bash
npm run ios:mock         # iOS Simulator, mock data
npm run android:mock     # Android emulator, mock data
npm run start:prod       # backend mode (needs EXPO_PUBLIC_BACKEND_URL)
npm test                 # Jest tests
npm run type-check       # TypeScript
npm run lint             # ESLint
```

## Documentation

- [Project status](PROJECT_CONTEXT.md)
- [Contributing guide](docs/guides/CONTRIBUTING.md) · [Setup](docs/guides/SETUP.md) · [Testing](docs/guides/TESTING.md)
- [API client](docs/technical/API_CLIENT.md) · [Mock data](docs/technical/MOCK_DATA.md)
- [Branding and UI](docs/design/BRANDING_UIUX.md)
