# Navigation & Routing Architecture

**Project:** Smushy
**Last Updated:** 2026-01-03

## Overview

Smushy uses **Expo Router** with file-based routing for type-safe, intuitive navigation.

**Key Principle:** Routes are thin - they ONLY import and render screens from features. No business logic in routes.

---

## File-Based Routing Structure

```
/app
  _layout.tsx               # Root layout: providers, Stack.Protected auth guards
  index.tsx                 # "/" entry — redirects to /moments or /login (REQUIRED, see below)

  /(auth)                   # Shown only when signed out
    login.tsx, signup.tsx, forgot-password.tsx, reset-password.tsx, callback.tsx

  /(tabs)                   # Shown only when signed in; custom tab bar
    _layout.tsx             # Center + opens the Add sheet (Moment / Check-in / Ritual)
    /moments                # Stack: index, create (modal), [id]/index, [id]/edit (modal)
    /story                  # Stack: index, moment/[id] (moment detail kept inside Story)
    rituals.tsx
    /profile                # Stack: index, check-ins/index

  new-check-in.tsx          # Root-level modals, so they open over any tab and close back to it
  new-ritual.tsx
```

---

> **Auth switching:** the root `Stack` wraps `(auth)` and `(tabs)` in `Stack.Protected` guards. Conditionally rendering `<Stack.Screen>`s does not work in Expo Router (every route file is registered anyway), so flipping `isAuthenticated` would not navigate.

> **Tabs (Expo Router 58):** set the default tab with `export const unstable_settings = { anchor: 'moments' }` in `(tabs)/_layout.tsx`; `<Tabs>` no longer accepts `initialRouteName`. A custom `tabBar` receives `emitter` and `navigateToTab(routeKey)` instead of `navigation`, and its types come from `expo-router/tabs`.

> ⚠️ **A route must match `/`.** Groups like `(tabs)` and `(auth)` don't add a URL segment, so `(tabs)/moments/index.tsx` is `/moments`, not `/`. If nothing matches `/`, Expo Router renders `+not-found` *outside* the root layout. `RootLayout` then never mounts, `SplashScreen.hideAsync()` never runs, and the app hangs on the splash screen. `src/app/index.tsx` exists to prevent this.

## Route Components (Thin Pattern)

**Routes should ONLY import and render screens from features:**

```typescript
// app/(tabs)/moments.tsx
import { MomentsListScreen } from '@/features/moments';

export default function MomentsRoute() {
  return <MomentsListScreen />;
}
```

**❌ Bad - Business logic in route:**

```typescript
// app/(tabs)/moments.tsx
import { useMoments } from '@/features/moments/api';

export default function MomentsRoute() {
  const { data, isLoading } = useMoments(); // ❌ Business logic in route

  if (isLoading) return <LoadingSpinner />;

  return <MomentsList moments={data} />;
}
```

**✅ Good - Delegate to screen component:**

```typescript
// app/(tabs)/moments.tsx
import { MomentsListScreen } from '@/features/moments';

export default function MomentsRoute() {
  return <MomentsListScreen />; // ✅ Thin route
}

// src/features/moments/screens/MomentsListScreen.tsx
export function MomentsListScreen() {
  const { data, isLoading } = useMoments(); // ✅ Business logic in screen

  if (isLoading) return <LoadingSpinner />;
  return <MomentsList moments={data} />;
}
```

---

## Navigation Hooks

### useRouter

Navigate between screens:

```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();

  // Navigate to screen
  router.push('/moments/create');

  // Navigate with params
  router.push({
    pathname: '/moments/[id]',
    params: { id: '123' }
  });

  // Go back
  router.back();

  // Replace (no back navigation)
  router.replace('/login');

  // Navigate to initial screen
  router.dismiss();
}
```

### useLocalSearchParams

Access route parameters:

```typescript
import { useLocalSearchParams } from 'expo-router';

// app/moments/[id].tsx
export default function MomentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MomentDetailScreen id={id} />;
}
```

**Type-safe params:**

```typescript
type Params = {
  id: string;
  edit?: 'true' | 'false';
};

const { id, edit } = useLocalSearchParams<Params>();
```

### usePathname

Get current route path:

```typescript
import { usePathname } from 'expo-router';

function NavigationHighlight() {
  const pathname = usePathname();

  return (
    <Tab active={pathname === '/moments'}>
      Moments
    </Tab>
  );
}
```

---

## Dynamic Routes

### Single Dynamic Segment

```typescript
// app/moments/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { MomentDetailScreen } from '@/features/moments';

export default function MomentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MomentDetailScreen id={id} />;
}
```

**URL:** `/moments/123` → `{ id: '123' }`

### Multiple Dynamic Segments

```typescript
// app/moments/[id]/comments/[commentId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function CommentDetailRoute() {
  const { id, commentId } = useLocalSearchParams<{
    id: string;
    commentId: string;
  }>();

  return <CommentDetailScreen momentId={id} commentId={commentId} />;
}
```

**URL:** `/moments/123/comments/456` → `{ id: '123', commentId: '456' }`

### Catch-All Routes

```typescript
// app/blog/[...slug].tsx
const { slug } = useLocalSearchParams<{ slug: string[] }>();
```

**URL:** `/blog/2024/01/post` → `{ slug: ['2024', '01', 'post'] }`

---

## Layouts

### Root Layout

```typescript
// app/_layout.tsx
import { Slot } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';
import { queryClient } from '@/core/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <Slot /> {/* Renders nested routes */}
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
```

### Tab Layout

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
      }}
    >
      <Tabs.Screen
        name="moments"
        options={{
          title: 'Moments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          title: 'Our Story',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Stack Layout

```typescript
// app/moments/_layout.tsx
import { Stack } from 'expo-router';

export default function MomentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Moment Details',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Moment',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

---

## Route Groups

Route groups `(name)` organize routes without affecting the URL structure.

### Tab Group Example

```
/app
  /(tabs)
    _layout.tsx     # Tab bar configuration
    moments.tsx     # URL: /moments (not /tabs/moments)
    story.tsx       # URL: /story
```

### Auth Group Example

```
/app
  /(auth)
    _layout.tsx     # Auth layout (no header, different styling)
    login.tsx       # URL: /login (not /auth/login)
    signup.tsx      # URL: /signup
```

**Benefits:**
- Separate layouts for different app sections
- Clean URLs without group name
- Logical code organization

---

## Modals

Present screens as modals using `presentation: 'modal'` option:

```typescript
// app/moments/_layout.tsx
<Stack>
  <Stack.Screen
    name="create"
    options={{
      title: 'Create Moment',
      presentation: 'modal',
      headerLeft: () => <CloseButton />,
    }}
  />
</Stack>
```

**Navigation:**

```typescript
router.push('/moments/create'); // Opens as modal
```

---

## Redirects

### Conditional Redirects

```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/moments" />;
}
```

### Protected Routes

```typescript
// app/(tabs)/_layout.tsx
import { useRouter, Slot } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export default function ProtectedLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // or <LoadingScreen />
  }

  return <Slot />;
}
```

---

## Deep Linking

Expo Router automatically handles deep links.

### Configure Deep Links

```javascript
// app.config.js
export default {
  scheme: 'smushy',
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
  ],
};
```

### Handle Deep Links

```typescript
// Incoming link: smushy://moments/123
// Automatically routes to: app/moments/[id].tsx with { id: '123' }
```

**OAuth Callback Example:**

```typescript
// app/(auth)/callback.tsx
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CallbackRoute() {
  const { code, state } = useLocalSearchParams<{
    code?: string;
    state?: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    // Handle OAuth callback
    if (code) {
      // Exchange code for tokens
      router.replace('/moments');
    }
  }, [code]);

  return <LoadingScreen />;
}
```

---

## Navigation Best Practices

### 1. Keep Routes Thin

**❌ Bad:**
```typescript
// app/(tabs)/moments.tsx
export default function MomentsRoute() {
  const { data, isLoading } = useMoments(); // ❌ API call in route

  return <MomentsList moments={data} />;
}
```

**✅ Good:**
```typescript
// app/(tabs)/moments.tsx
export default function MomentsRoute() {
  return <MomentsListScreen />; // ✅ Delegate to screen
}
```

### 2. Use Type-Safe Params

```typescript
// Define param types
type MomentDetailParams = {
  id: string;
};

const { id } = useLocalSearchParams<MomentDetailParams>();
```

### 3. Cross-Feature Navigation

**✅ Good - Via navigation params:**
```typescript
router.push({ pathname: '/moments/[id]', params: { id: '123' } });
```

**❌ Bad - Direct feature import:**
```typescript
import { useMoments } from '@/features/moments'; // ❌ Cross-feature coupling
```

### 4. Avoid Navigation in Effects

**❌ Bad:**
```typescript
useEffect(() => {
  router.push('/moments'); // ❌ Side effect
}, []);
```

**✅ Good:**
```typescript
function handleSubmit() {
  router.push('/moments'); // ✅ User action
}
```

### 5. Handle Navigation Errors

```typescript
try {
  router.push('/moments/create');
} catch (error) {
  console.error('Navigation failed:', error);
  // Show error toast
}
```

---

## Common Patterns

### Back with Fallback

```typescript
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/moments');
  }
}
```

### Navigate with State

Use query params for state:

```typescript
router.push({
  pathname: '/moments/create',
  params: { mode: 'quick' }
});

// In create screen
const { mode } = useLocalSearchParams<{ mode?: string }>();
```

### Prevent Back Navigation

```typescript
// Use replace instead of push
router.replace('/login'); // Can't go back to previous screen
```

---

## Testing Navigation

```typescript
import { renderRouter, screen } from 'expo-router/testing-library';

test('navigates to moment detail', async () => {
  const { getByText } = renderRouter({
    index: () => <MomentsListScreen />,
    'moments/[id]': () => <MomentDetailScreen />,
  });

  const moment = screen.getByText('Birthday Dinner');
  fireEvent.press(moment);

  await waitFor(() => {
    expect(screen.getByText('Moment Details')).toBeVisible();
  });
});
```

---

## Related Documentation

- **Project Architecture:** `CLAUDE.md`
- **State Management:** `docs/architecture/STATE_MANAGEMENT.md`
- **Code Patterns:** `docs/guides/CONTRIBUTING.md`
- **Expo Router Docs:** https://docs.expo.dev/router/introduction
