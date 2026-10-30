# Moments Feature

**Feature:** Shared Couple Moments & Memory Capture
**Status:** 🔄 In Progress (Backend Complete, UI Pending)
**Last Updated:** 2026-01-05
**Owner:** Moments Team

---

## Table of Contents

1. [Overview](#overview)
2. [User Experience](#user-experience)
3. [UI/UX Design](#uiux-design)
4. [Technical Specification](#technical-specification)
5. [Architecture Patterns](#architecture-patterns)
6. [Navigation](#navigation)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Implementation Status](#implementation-status)
10. [API Contract](#api-contract)

---

## Overview

### Purpose

The Moments feature helps couples capture, celebrate, and remember meaningful shared experiences. Unlike calendar events (which are logistical), Moments are **emotion-forward** - they capture the *why* and *feeling* behind an experience, not just the when and where.

> **"Help couples capture, celebrate, and remember what matters - without turning their relationship into a productivity project."**

### Core Capabilities

- 📸 **Create Moments** - Capture meaningful experiences with photos
- ⚡ **Quick Capture** - Minimal-friction flow for spontaneous memories
- 📋 **Timeline View** - Chronological list of all moments
- 🔍 **Filter & Search** - Find moments by type, date, or tags
- 🤝 **Partner Sharing** - Optional visibility to partner
- 🔔 **Share Notifications** - Gentle nudge when partner shares a moment

### Philosophy Alignment

| Smushy Value | How Moments Supports It |
|--------------|------------------------|
| **Emotional Safety** | Private by default; sharing is optional and consensual |
| **Consent** | Partner visibility is opt-in; no forced transparency |
| **Intentionality** | Focuses on meaning, not logistics; quality over quantity |
| **Warmth** | Celebrates love without judgment; no "you should" pressure |
| **Privacy** | No tracking, no surveillance; memories belong to the couple |

### What Moments is NOT

- ❌ A shared calendar (use phone calendar for logistics)
- ❌ A task list or to-do tracker
- ❌ A streak counter or activity metric
- ❌ An effort scoreboard between partners
- ❌ A way to prove who's "trying harder"

### User Stories

**As a partner creating moments:**
- I want to quickly capture a meaningful moment that just happened so I don't forget it
- I want to plan and record a date night with details and a photo
- I want to record major milestones in our relationship journey

**As a partner viewing moments:**
- I want to scroll through our moments timeline to relive memories
- I want to filter moments by type (dates, trips, milestones) to focus on specific experiences
- I want to see full details of any moment including the photo and story

**As a partner managing moments:**
- I want to edit moments I created to fix mistakes or add details
- I want to delete moments I created that I no longer want to keep
- I want to share moments with my partner so we can celebrate together

**As a partner receiving shared moments:**
- I want to see moments my partner shared in my timeline
- I want to receive a gentle notification when my partner shares a moment
- I want to know who created each moment in our shared timeline

---

## User Experience

### Moment Types

| Type | Purpose | Examples |
|------|---------|----------|
| **Date** | Intentional one-on-one time | Dinner date, movie night, coffee walk |
| **Trip** | Travel experiences together | Weekend getaway, vacation, road trip |
| **Milestone** | Relationship achievements | Moving in together, engagement, first home |
| **Ritual** | Recurring meaningful traditions | Sunday brunch, monthly check-in, annual trip |
| **Anniversary** | Recurring celebration dates | Dating anniversary, wedding anniversary |

### Create Moment Flow (Full Form)

```
Moments List Screen
    ↓
[Tap "+" Button]
    ↓
Create Moment Screen
    ├─ Title Input (required)
    ├─ Type Selector (required)
    │   └─ Date | Trip | Milestone | Ritual | Anniversary
    ├─ Date Picker (required, defaults to today)
    ├─ Description Input (optional)
    ├─ Location Input (optional)
    ├─ Photo Capture/Select (optional)
    ├─ Tags Input (optional)
    └─ Share Toggle (optional, default: off)
        ↓
[Tap "Save Moment"]
    ↓
Success → Navigate back to list
    OR
Error → Show error message
```

### Quick Capture Flow

```
Moments List Screen
    ↓
[Long press "+" or swipe up on FAB]
    ↓
Quick Capture Modal
    ├─ Title Input (required)
    ├─ Photo Button (optional, one tap)
    │   └─ Opens camera directly
    ├─ Type defaults to last used or "date"
    └─ Date defaults to now
        ↓
[Tap "Save"]
    ↓
Moment saved instantly → Toast confirmation
```

### View Moments Flow

```
Moments List Screen
    ├─ Filter Bar
    │   ├─ Type chips: All | Date | Trip | Milestone | Ritual | Anniversary
    │   └─ Optional: Date range picker
    │
    ├─ Moments List (FlashList)
    │   ├─ MomentCard
    │   │   ├─ Photo thumbnail (if exists)
    │   │   ├─ Title
    │   │   ├─ Date
    │   │   ├─ Type badge/icon
    │   │   ├─ Shared indicator (if shared)
    │   │   └─ Creator indicator (if partner's moment)
    │   └─ ... more cards
    │
    └─ Empty State (if no moments)
        └─ "Create your first moment together"
```

### View Moment Detail Flow

```
[Tap MomentCard in list]
    ↓
Moment Detail Screen
    ├─ Photo (full width, if exists)
    ├─ Title
    ├─ Date (formatted nicely)
    ├─ Type badge
    ├─ Location (if exists)
    ├─ Description (full text)
    ├─ Tags (as chips)
    ├─ Creator info: "Created by [You/Partner name]"
    ├─ Shared indicator
    │
    └─ Action Bar (only for own moments)
        ├─ Edit Button → Edit Screen
        └─ Delete Button → Confirmation Dialog
```

### Edit Moment Flow

```
Moment Detail Screen (own moment only)
    ↓
[Tap Edit]
    ↓
Edit Moment Screen
    ├─ Pre-filled form with current values
    ├─ All fields editable
    └─ Photo can be changed or removed
        ↓
[Tap "Save Changes"]
    ↓
Success → Navigate back to detail
    ↓
Partner sees updated version (if shared)
```

### Delete Moment Flow

```
Moment Detail Screen (own moment only)
    ↓
[Tap Delete]
    ↓
Confirmation Dialog
    "Delete this moment?"
    "This will remove it from your timeline
     and your partner's if shared."
    [Cancel] [Delete]
        ↓
[Confirm Delete]
    ↓
Moment removed → Navigate to list
    ↓
Removed from partner's view (if was shared)
```

### Partner Sharing Flow

```
Create/Edit Moment
    ↓
[Toggle "Share with partner" ON]
    ↓
Moment marked as shared
    ↓
Save moment
    ↓
Partner receives notification:
    "Alex shared a memory with you"
    ↓
Partner taps notification → Opens moment detail
    OR
Partner sees moment in their timeline
```

---

## UI/UX Design

### Moments List Screen Design

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Moments                    [Filter] │  ← Header
├─────────────────────────────────────┤
│ [All] [Date] [Trip] [Mile...] [Ann] │  ← Type filter chips (horizontal scroll)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📷 [Thumbnail]              │    │
│  │ Beach sunset walk           │    │  ← MomentCard
│  │ Jan 3, 2026 • Date          │    │
│  │ 🤝 Shared                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Our first apartment 🏠      │    │
│  │ Dec 15, 2025 • Milestone    │    │  ← MomentCard (no photo)
│  │ Created by Alex             │    │
│  └─────────────────────────────┘    │
│                                     │
│                         [+]         │  ← FAB (Floating Action Button)
└─────────────────────────────────────┘
```

**MomentCard Component:**
- Card with subtle shadow and rounded corners (16px)
- Photo thumbnail on left (if exists) - 80x80px, rounded 8px
- Title: 16px, semibold, primary text color
- Date + Type: 14px, secondary text color, formatted as "Jan 3, 2026"
- Type shown as text with icon (not colored badge)
- Shared indicator: Small icon if shared with partner
- Creator indicator: "By [Partner name]" if partner's moment

**Filter Chips:**
- Horizontal scroll, pill-shaped chips
- Active state: Primary color fill, white text
- Inactive state: Secondary border, primary text
- "All" selected by default

**Empty State:**
- Centered illustration (couple-themed)
- "No moments yet"
- "Capture your first moment together"
- Primary CTA button: "Create Moment"

### Moment Detail Screen Design

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ←                       [Edit] [🗑️] │  ← Header (actions for own moments)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      [Full-width Photo]     │    │  ← Hero image (if exists)
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Beach sunset walk                  │  ← Title (24px, bold)
│                                     │
│  📅 January 3, 2026                 │  ← Date
│  🏷️ Date                            │  ← Type
│  📍 Santa Monica Beach              │  ← Location (if exists)
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  We watched the sunset together     │
│  after dinner. Perfect evening.     │  ← Description
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [romantic] [beach] [sunset]        │  ← Tags (if exist)
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Created by you • Shared            │  ← Metadata
│                                     │
└─────────────────────────────────────┘
```

### Create/Edit Moment Screen Design

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Create Moment              [Save] │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │      [Tap to add photo]     │    │  ← Photo picker (dashed border)
│  │           📷                │    │
│  └─────────────────────────────┘    │
│                                     │
│  Title *                            │
│  ┌─────────────────────────────┐    │
│  │ Our beach sunset walk       │    │  ← Text input
│  └─────────────────────────────┘    │
│                                     │
│  Type *                             │
│  [Date] [Trip] [Milestone]...       │  ← Segmented control or chips
│                                     │
│  Date *                             │
│  ┌─────────────────────────────┐    │
│  │ January 3, 2026         📅  │    │  ← Date picker trigger
│  └─────────────────────────────┘    │
│                                     │
│  Location                           │
│  ┌─────────────────────────────┐    │
│  │ Santa Monica Beach          │    │  ← Text input
│  └─────────────────────────────┘    │
│                                     │
│  Description                        │
│  ┌─────────────────────────────┐    │
│  │ We watched the sunset...    │    │  ← Multiline text input
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Tags (comma separated)             │
│  ┌─────────────────────────────┐    │
│  │ romantic, beach, sunset     │    │  ← Text input
│  └─────────────────────────────┘    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Share with partner                 │
│  ┌────────────────────────┐ [OFF]   │  ← Toggle switch
│  │ Partner will see this moment    │
│  └────────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

### Quick Capture Modal Design

**Layout Structure:**
```
┌─────────────────────────────────────┐
│         Quick Capture         [×]   │  ← Header with close
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │      [📷 Add Photo]         │    │  ← One-tap camera
│  └─────────────────────────────┘    │
│                                     │
│  What's this moment?                │
│  ┌─────────────────────────────┐    │
│  │                             │    │  ← Auto-focused input
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         [Save]              │    │  ← Primary CTA
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Visual Design

**Color Usage:**
- Type badges use subtle colors, not bright/distracting
- Shared indicator: Subtle icon, not prominent
- Partner's moments: Subtle visual distinction (avatar or name)

**Typography:**
- Card title: 16px, semibold
- Card metadata: 14px, regular, secondary color
- Detail title: 24px, bold
- Detail body: 16px, regular

**Animations:**
- Card press: Subtle scale (0.98) with haptic
- FAB: Spring animation on press
- Modal: Slide up from bottom
- List: Smooth FlashList scrolling

### Accessibility

**Touch Targets:**
- All cards: Full card tappable
- FAB: Minimum 56x56px
- Filter chips: Minimum 44px height
- Form inputs: 48px height

**Screen Reader:**
- Moment cards announce: "[Title], [Type], [Date], [Shared status]"
- Photo descriptions provided via alt text
- Form labels properly associated

---

## Technical Specification

### Components

#### Screen Components

| Component | Path | Purpose |
|-----------|------|---------|
| `MomentsListScreen` | `screens/MomentsListScreen.tsx` | Main timeline with filtering |
| `MomentDetailScreen` | `screens/MomentDetailScreen.tsx` | Full moment view |
| `CreateMomentScreen` | `screens/CreateMomentScreen.tsx` | Full create form |
| `EditMomentScreen` | `screens/EditMomentScreen.tsx` | Edit existing moment |

#### Feature Components

| Component | Path | Purpose |
|-----------|------|---------|
| `MomentCard` | `components/MomentCard.tsx` | List item display |
| `MomentForm` | `components/MomentForm.tsx` | Shared create/edit form |
| `MomentFilters` | `components/MomentFilters.tsx` | Type filter chips |
| `MomentTypeSelector` | `components/MomentTypeSelector.tsx` | Type selection in form |
| `QuickCaptureModal` | `components/QuickCaptureModal.tsx` | Minimal capture overlay |

### Hooks (TanStack Query)

| Hook | Type | Purpose | Invalidates |
|------|------|---------|-------------|
| `useMoments(filters?)` | Query | Fetch all moments with filtering | - |
| `useMoment(id)` | Query | Fetch single moment | - |
| `useCreateMoment()` | Mutation | Create new moment | `moments.all` |
| `useUpdateMoment()` | Mutation | Update existing moment | `moments.all`, `moments.byId` |
| `useDeleteMoment()` | Mutation | Delete moment | `moments.all` |

### State Management

**TanStack Query** (Server State):
- `QUERY_KEYS.moments.all` - All moments (with filters)
- `QUERY_KEYS.moments.byId(id)` - Single moment
- Manages API data fetching, caching, invalidation

**Component State** (useState):
- Filter selections (type, date range)
- Form inputs before submission
- Modal open/close state

**No Zustand needed** - Moments feature is purely server state + local UI state.

### Data Models

**Moment:**
```typescript
interface Moment {
  id: string;
  title: string;
  description?: string;
  date: string;  // ISO date string
  type: MomentType;
  location?: string;
  photo_url?: string;
  user_id: string;
  partner_id?: string;
  is_shared: boolean;
  tags?: string[];
  calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

type MomentType = 'date' | 'trip' | 'milestone' | 'ritual' | 'anniversary';
```

**DTOs:**
```typescript
interface CreateMomentDTO {
  title: string;
  description?: string;
  date: string;
  type: MomentType;
  location?: string;
  photo_url?: string;
  is_shared?: boolean;
  tags?: string[];
}

interface UpdateMomentDTO {
  title?: string;
  description?: string;
  date?: string;
  type?: MomentType;
  location?: string;
  photo_url?: string;
  is_shared?: boolean;
  tags?: string[];
}

interface MomentFilters {
  type?: MomentType;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  isShared?: boolean;
}
```

### Validation

| Field | Rules | Error Messages |
|-------|-------|----------------|
| `title` | Required, 1-100 chars | "Title is required"<br/>"Title must be less than 100 characters" |
| `date` | Required, valid date | "Date is required"<br/>"Please select a valid date" |
| `type` | Required, valid type | "Please select a moment type" |
| `description` | Optional, max 2000 chars | "Description must be less than 2000 characters" |
| `location` | Optional, max 200 chars | "Location must be less than 200 characters" |

---

## Architecture Patterns

### Repository Pattern

The Moments feature follows the established repository pattern:

```
┌─────────────────────────────────────┐
│  Hooks (useMoments, useCreateMoment)│
│  ↓ call                             │
│  useMomentRepository()              │
└─────────────────────────────────────┘
             ↓ provides
┌─────────────────────────────────────┐
│  RepositoryProvider (DI Container)  │
│  ↓ injects based on config          │
│  - MOCK_CONFIG.enabled = true       │
│    → mockMomentRepository           │
│  - MOCK_CONFIG.enabled = false      │
│    → backendMomentRepository        │
└─────────────────────────────────────┘
             ↓ returns
┌─────────────────────────────────────┐
│  MomentRepository Interface         │
│  - getAll(filters?)                 │
│  - getById(id)                      │
│  - create(data)                     │
│  - update(id, data)                 │
│  - delete(id)                       │
└─────────────────────────────────────┘
```

### Data Flow

```
1. Screen (MomentsListScreen)
   ↓ calls
2. Hook (useMoments)
   ↓ uses
3. Repository (via useMomentRepository)
   ↓ makes
4. API call (backendMomentRepository) or Mock (mockMomentRepository)
   ↓ returns
5. Data cached by TanStack Query
   ↓ renders
6. Screen receives data, maps to MomentCard components
```

### File Structure

```
/src/features/moments
├── /screens
│   ├── MomentsListScreen.tsx
│   ├── MomentDetailScreen.tsx
│   ├── CreateMomentScreen.tsx
│   └── EditMomentScreen.tsx
├── /components
│   ├── MomentCard.tsx
│   ├── MomentForm.tsx
│   ├── MomentFilters.tsx
│   ├── MomentTypeSelector.tsx
│   └── QuickCaptureModal.tsx
├── /api
│   ├── backendMomentRepository.ts   ✅ EXISTS
│   ├── mockMomentRepository.ts      ✅ EXISTS
│   ├── useMoments.ts                ✅ EXISTS
│   ├── useMoment.ts                 ✅ EXISTS
│   ├── useCreateMoment.ts           ✅ EXISTS
│   ├── useUpdateMoment.ts           ✅ EXISTS
│   └── useDeleteMoment.ts           ✅ EXISTS
├── /types
│   └── index.ts                     ✅ EXISTS
├── /utils
│   └── validation.ts
└── index.ts                         ✅ EXISTS
```

---

## Navigation

### Routes

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/(tabs)/moments` | `MomentsListScreen` | Main moments list | Yes |
| `/(tabs)/moments/[id]` | `MomentDetailScreen` | View single moment | Yes |
| `/(tabs)/moments/create` | `CreateMomentScreen` | Create new moment | Yes |
| `/(tabs)/moments/[id]/edit` | `EditMomentScreen` | Edit moment | Yes |

### Deep Linking

```
URL Scheme: smushy://moments
  - Opens moments list

URL Scheme: smushy://moments/:id
  - Opens specific moment detail

URL Scheme: smushy://moments/create
  - Opens create moment screen
```

### Navigation Flow

```typescript
// From list to detail
router.push(`/(tabs)/moments/${moment.id}`);

// From list to create
router.push('/(tabs)/moments/create');

// From detail to edit
router.push(`/(tabs)/moments/${moment.id}/edit`);

// Back to list after save/delete
router.back();
// or
router.replace('/(tabs)/moments');
```

---

## Error Handling

### Error Scenarios

| Error Code | User-Facing Message | Recovery Action |
|------------|---------------------|-----------------|
| `MOMENT_NOT_FOUND` | "This moment could not be found" | Navigate back to list |
| `UNAUTHORIZED_EDIT` | "You can only edit moments you created" | Return to detail view |
| `UNAUTHORIZED_DELETE` | "You can only delete moments you created" | Return to detail view |
| `VALIDATION_ERROR` | Specific field errors | Highlight field, show message |
| `PHOTO_UPLOAD_FAILED` | "Photo couldn't be uploaded. Try again?" | Retry button |
| `NETWORK_ERROR` | "Connection error. Please check your internet." | Retry button |
| `UNKNOWN_ERROR` | "Something went wrong. Please try again." | Retry or contact support |

### Error Handling Pattern

```typescript
// In mutation hooks
const { mutate, error } = useCreateMoment();

// In component
{error && (
  <ErrorMessage
    message={toAppError(error).message}
    onRetry={() => mutate(data)}
  />
)}
```

### Optimistic Updates

```typescript
// Delete with optimistic update
const deleteMoment = useMutation({
  mutationFn: (id) => repository.delete(id),
  onMutate: async (id) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: QUERY_KEYS.moments.all });

    // Snapshot previous value
    const previous = queryClient.getQueryData(QUERY_KEYS.moments.all);

    // Optimistically remove from list
    queryClient.setQueryData(QUERY_KEYS.moments.all, (old) =>
      old?.filter(m => m.id !== id)
    );

    return { previous };
  },
  onError: (err, id, context) => {
    // Rollback on error
    queryClient.setQueryData(QUERY_KEYS.moments.all, context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.moments.all });
  },
});
```

---

## Testing

### Test Strategy

| Category | Priority | Status |
|----------|----------|--------|
| Hook tests (mutations, queries) | High | Planned |
| Repository tests (mock + backend) | High | Planned |
| MomentCard component | Medium | Planned |
| MomentForm component | Medium | Planned |
| Screen integration tests | Low | Future |

### Test Files Structure

```
/src/features/moments
├── /api
│   ├── useMoments.test.ts
│   ├── useCreateMoment.test.ts
│   ├── mockMomentRepository.test.ts
│   └── backendMomentRepository.test.ts
├── /components
│   ├── MomentCard.test.tsx
│   └── MomentForm.test.tsx
```

### Key Test Scenarios

**Hook Tests:**
- Fetch moments with various filters
- Create moment with all fields
- Create moment with minimal fields (quick capture)
- Update moment fields
- Delete moment
- Error handling for all mutations

**Component Tests:**
- MomentCard renders all fields correctly
- MomentCard shows shared indicator
- MomentCard shows partner attribution
- MomentForm validates required fields
- MomentForm handles photo selection

---

## Implementation Status

### ✅ Completed (Backend/Data Layer)

- [x] Type definitions (`Moment`, `MomentType`, DTOs, `MomentFilters`)
- [x] Repository interface in `/core/repositories/types.ts`
- [x] Backend repository (`backendMomentRepository.ts`)
- [x] Mock repository (`mockMomentRepository.ts`)
- [x] TanStack Query hooks (all 5: list, detail, create, update, delete)
- [x] Mock seed data (`moments.json`)
- [x] Public exports in `index.ts`

### ✅ Completed (UI Layer)

- [x] `MomentCard` component (photo thumbnail via shared `Image`)
- [x] `MomentForm` component
- [x] `MomentTypeSelector` and `MomentFilterBar` components
- [x] `MomentsListScreen` (with type filtering; filters are part of the query key)
- [x] `MomentDetailScreen`
- [x] `CreateMomentScreen`
- [x] `EditMomentScreen`
- [x] Route integration (`src/app/(tabs)/moments/`)

### 🔴 Planned

- [x] Search box plus a filter button that opens a bottom sheet (When: Any time / Upcoming / Past; Type chips). Active filters show as one dismissible pill under the search. Search covers title, description, location, tags; the Upcoming / Past filter (`when`, resolved by the repository so the query key stays stable)
- [ ] Quick capture modal
- [ ] Photo picker / upload (form shows a placeholder; seed data uses remote URLs)
- [ ] Partner notification on share
- [ ] Filter persistence
- [ ] Tests

### 📋 Post-MVP

- [ ] "This Time Last Year" nudges
- [ ] Moment Collections (auto-grouping)
- [ ] Reflection Prompts
- [ ] Offline support with queue

---

## API Contract

### Backend Endpoints

**Moments CRUD:**
```
GET /moments
  Query: ?type=date&dateFrom=2025-01-01&dateTo=2025-12-31&tags=romantic&isShared=true
  Response: Moment[]

GET /moments/:id
  Response: Moment | 404

POST /moments
  Body: CreateMomentDTO
  Response: Moment

PATCH /moments/:id
  Body: UpdateMomentDTO
  Response: Moment | 403 (not owner) | 404

DELETE /moments/:id
  Response: 204 | 403 (not owner) | 404
```

**Photo Upload (future):**
```
POST /moments/:id/photo
  Body: FormData (multipart/form-data)
  Response: { photo_url: string }

DELETE /moments/:id/photo
  Response: 204
```

### Mock Repository Behavior

The mock repository (`mockMomentRepository.ts`) provides:
- In-memory storage via `mockStorage`
- User-scoped data (own moments + partner's shared moments)
- Full filtering support (type, date range, tags, shared)
- Access control (only owner can edit/delete)
- Sorting by date descending

---

## What to Avoid (Anti-Patterns)

Based on Smushy values, the Moments feature **MUST NOT** include:

| Anti-Pattern | Why It's Harmful |
|--------------|------------------|
| Moment counts ("You've created 47 moments!") | Creates quantification of love |
| Streak indicators ("Keep your weekly date streak!") | Creates guilt and pressure |
| Comparison between partners | Creates competition and blame |
| AI suggestions ("You haven't planned a date in 3 weeks") | Creates pressure and shame |
| Comments/replies on moments | Turns sharing into debate |
| Effort scoring or rankings | Gamifies relationship |
| Social sharing or public posting | Violates privacy |

---

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project architecture and conventions
- [CONTRIBUTING.md](../guides/CONTRIBUTING.md) - Development patterns and guidelines
- [VALUES.md](../design/VALUES.md) - Smushy's core values and design principles
- [STATE_MANAGEMENT.md](../architecture/STATE_MANAGEMENT.md) - Data layer patterns
- [AUTH.md](./AUTH.md) - Reference implementation for feature structure

---

## Changelog

### 2026-01-05 - Feature Design Complete
- ✅ Created comprehensive feature documentation
- ✅ Defined all user stories and flows
- ✅ Designed UI/UX for all screens
- ✅ Documented component and hook specifications
- ✅ Finalized MVP scope (core CRUD + sharing + quick capture)
- ✅ Deferred enhancements to post-MVP

### Previous - Backend Implementation
- ✅ Type definitions complete
- ✅ Repository pattern implemented (backend + mock)
- ✅ TanStack Query hooks implemented
- ✅ Mock data seeded
