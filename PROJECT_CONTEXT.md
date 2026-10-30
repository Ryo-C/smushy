# Project Context - Current State

> **Note:** For static project info (architecture, setup, tech stack), see `CLAUDE.md`  
> This file tracks **dynamic state** - what's happening NOW

**Last Updated:** 2026-10-30 (Demo build: every tab working in mock mode)
**Current Sprint:** Sprint 3 (Resume demo polish)

---

## Feature Status Dashboard

| Feature | Version | Status | Progress | Docs | Priority |
|---------|---------|--------|----------|------|----------|
| Authentication | V1 | 🟢 Complete | 100% | `/docs/features/AUTH.md` | High |
| Moments | V1 | 🟢 Complete (demo) | 95% | `/docs/features/MOMENTS.md` | High |
| User Profile | V1 | 🟢 Complete (demo) | 80% | `/docs/features/PROFILE.md` | High |
| Settings | V1 | 🔴 Planned | 0% | `/docs/features/SETTINGS.md` | Medium |
| Notifications | V1 | 🔴 Planned | 0% | `/docs/features/NOTIFICATIONS.md` | Low |
| Story | V1 | 🟢 Complete (demo) | 90% | `/docs/features/STORY.md` | Low |
| Rituals | V1 | 🟢 Complete (demo) | 80% | `/docs/features/RITUALS.md` | Low |
| Checkins | V1 | 🟢 Complete (demo) | 80% | `/docs/features/CHECKINS.md` | Low |

**Legend:**
- 🟢 Complete & Stable
- 🟡 In Progress
- 🔴 Planned / Not Started
- 🔵 Under Review
- ⚠️ Blocked / Issues

---

## Active Development Focus

### This Sprint (Sprint 2)

**Primary Goal:**
1. Complete Moments Feature

**Completed This Week:**
1. **Moments Feature Design & UI** - 90% complete
   - ✅ Comprehensive feature documentation (MOMENTS.md)
   - ✅ Feature purpose, philosophy, and user stories defined
   - ✅ MVP scope finalized (core CRUD + sharing + quick capture)
   - ✅ All UI components built:
     - MomentCard (list item display)
     - MomentForm (shared create/edit form)
     - MomentTypeSelector (type selection chips)
     - MomentFilterBar (horizontal filter chips)
   - ✅ All screens implemented:
     - MomentsListScreen (with filtering)
     - MomentDetailScreen (full view + edit/delete)
     - CreateMomentScreen (full create form)
     - EditMomentScreen (edit existing moments)
   - ✅ All routes connected (Expo Router file-based routing)
   - ✅ Moment type utilities (icons, labels)
   - ⏳ Tests pending
   - ⏳ Partner notification on share pending

**Previous Sprint (Sprint 1) - Complete:**
1. **Authentication Feature** - 100% complete
2. **Modern UI/UX Implementation** - 100% complete

---

## Recent Changes (Last 7 Days)

### Completed
- ✅ 2026-10-31 - **Expo SDK 58 upgrade** - SDK 54 → 58 (React Native 0.88, React 19.3, Reanimated 4.7, Gesture Handler 3, Expo Router 58, TypeScript 6, Jest 30). Requires Node 22.13+ (`.nvmrc`). Migrated the tab bar to Expo Router 58's props and `unstable_settings.anchor`, `TextInput` refs to `TextInputInstance`, the sheet swipe to `usePanGesture`, and the Jest preset to `@react-native/jest-preset`. Edit flows for rituals, check-ins and profile; ritual icons; Coral / Serene / Forest themes; blank-slate demo accounts.
- ✅ 2026-10-30 - **Demo build** - Every tab works in mock mode. Fixed the splash hang (no route matched `/`), sign-in/out navigation (`Stack.Protected`) and logout (wrong storage key + cached session). Built Story (derived timeline with year filter and sort), Rituals (next occurrence, done/pause), Check-ins (private by default, mood + share) and Profile (couple card, nudges, theme). Moments gained search and an Any time / Upcoming / Past filter; filters are now part of the query key. Images render via a shared `Image` (NativeWind interop). New base layout: `Screen` background, clean `ScreenHeader` and tab bar, shared `PressableScale` press feedback. Mock data rewritten (Ryo & Roline, Singapore context, verified Unsplash photos) with `SEED_VERSION` reseeding. Comment bloat removed.
- ✅ 2026-01-05 - **Moments Feature Design & UI** - Complete feature design with purpose, user stories, and MVP scope. Built all UI components (MomentCard, MomentForm, MomentTypeSelector, MomentFilterBar) and screens (List, Detail, Create, Edit). Connected all routes using Expo Router file-based routing with nested stacks.
- ✅ 2026-01-04 - **NativeWind v4 Fix** - Fixed NativeWind styles not applying on Android. Root cause: missing `metro.config.js` with `withNativeWind()` wrapper. Upgraded NativeWind to v4.2.1 for Expo SDK 54 + Reanimated v4 compatibility.
- ✅ 2026-01-04 - **Modern UI/UX Implementation** - Complete redesign of LoginScreen with modern animations (floating particles, glassmorphism, input animations). Implemented edge-to-edge safe area architecture.
- ✅ 2026-01-03 - **Authentication Feature Complete** - Full auth system with email/password, OAuth (Google/Apple), password reset, token management, comprehensive tests, and documentation

### In Review
- 🔵 [Date] - None

---

## Known Issues & Blockers

### Critical 🔴
- None currently

### High Priority ⚠️
- None currently

### Medium Priority
- None currently

---

## Next Up (Backlog)

_To be updated as features are planned_

---

## Dependencies & Waiting On

### External
- ⏳ Backend API endpoint for notifications (ETA: [Date])

### Internal
- ⏳ Security review of authentication flow

---

## Metrics & Health

### Build Status
- **iOS:** ✅ Passing
- **Android:** ✅ Passing

### Performance (Last Build)
- **Bundle Size:** - MB (iOS), - MB (Android)
- **Cold Start Time:** -
- **Memory Usage:** -

### Recent Test Results
- **Unit Tests:** ✅ All passing (229/229 across 10 test suites, 2026-10-31, SDK 58)
- **Coverage:** Auth repositories (97%), hooks (95%), utilities (100%), screens (90%)
- **E2E Tests:** Planned for future sprints

---

## Quick Links

### Documentation
- Project Overview: `CLAUDE.md`
- Development Patterns: `CONTRIBUTING.md`
- Architecture Documentation: `/docs/architecture/`
  - **OVERVIEW.md** - High-level architecture patterns
  - **LAYERS.md** - Layer separation and dependency rules
  - **DECISIONS.md** - Architecture Decision Records (ADRs)
- Claude Code Usage: `CLAUDE_CODE_GUIDE.md`
- Feature Expansion: `FEATURE_EXPANSION_GUIDE.md`

**Note on ADRs:** Detailed Architecture Decision Records will be created after the initial git commit when the baseline architecture is confirmed. Currently, DECISIONS.md contains an overview of key architectural decisions that will be formalized as proper ADRs with dates and full context.

### Key Resources
- [Backend API Docs]: [URL]
- [Design System]: [URL]
- [Project Board]: [URL]
- [CI/CD Dashboard]: [URL]

---

## Notes for Claude Code

**When starting a session:**
- Check this file first for current sprint focus
- Review "In Progress This Week" for context
- Note any known issues that might affect your work

**After completing work:**
- Update feature status table
- Mark tasks complete
- Add to "Recent Changes"
- Update "Last Updated" timestamp

**Before ending session:**
- Update "In Progress This Week" with current state
- Add any new blockers to "Known Issues"
- Note what should be "Next Up"
