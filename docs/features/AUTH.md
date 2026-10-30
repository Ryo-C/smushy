# Authentication Feature

**Feature:** User Authentication & Identity Management
**Status:** ✅ Complete (Email/Password, OAuth, Password Reset, Modern UI)
**Last Updated:** 2026-01-04
**Owner:** Auth Team

---

## Table of Contents

1. [Overview](#overview)
2. [User Experience](#user-experience)
3. [UI/UX Design](#uiux-design)
4. [Technical Specification](#technical-specification)
5. [Architecture Patterns](#architecture-patterns)
6. [Navigation](#navigation)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)
9. [Testing](#testing)
10. [Implementation Status](#implementation-status)
11. [API Contract](#api-contract)

---

## Overview

### Purpose

The Authentication feature provides secure user identity management for Smushy, enabling users to create accounts, sign in, and manage their authentication credentials across multiple methods.

### Core Capabilities

- 🔐 **Email/Password Authentication** - Traditional signup and signin
- 🌐 **OAuth Authentication** - Google and Apple Sign-In
- 🔄 **Account Linking** - Link multiple auth methods to one account
- 🔑 **Password Reset** - Secure password recovery flow
- 🎫 **Token Management** - JWT access and refresh tokens with auto-refresh
- 👤 **Session Management** - Persistent authentication state

### User Stories

**As a new user:**
- I want to sign up with email and password so I can create a Smushy account
- I want to sign up with Google/Apple for quick onboarding
- I want clear validation feedback so I know if my inputs are correct

**As a returning user:**
- I want to sign in with my email and password
- I want to sign in with Google/Apple if I used OAuth before
- I want my session to persist so I don't have to sign in every time

**As a user who forgot their password:**
- I want to request a password reset email
- I want to reset my password securely with a time-limited token

**As a security-conscious user:**
- I want to link multiple authentication methods to my account
- I want to see which auth methods are connected
- I want to unlink methods I no longer use (while keeping at least one)

---

## User Experience

### Signup Flow

```
Landing Screen
    ↓
[Tap "Sign Up"]
    ↓
Signup Screen
    ├─ Email/Password Form
    │   ├─ Name input (required, 2-50 chars)
    │   ├─ Email input (validated)
    │   ├─ Password input (min 8 chars)
    │   ├─ Confirm password (must match)
    │   └─ Terms acceptance (required)
    │       ↓
    │   [Tap "Create Account"]
    │       ↓
    │   Success → Auto sign-in → App
    │       OR
    │   Error → Show error message
    │
    └─ OAuth Options
        ├─ "Continue with Google"
        └─ "Continue with Apple"
            ↓
        OAuth Provider Auth
            ↓
        Success → App
            OR
        Email Exists → Show linking option
```

### Signin Flow

```
Landing Screen
    ↓
[Tap "Sign In"]
    ↓
Login Screen
    ├─ Email/Password Form
    │   ├─ Email input
    │   └─ Password input
    │       ↓
    │   [Tap "Sign In"]
    │       ↓
    │   Success → App
    │       OR
    │   Error → Show error message
    │
    ├─ OAuth Options
    │   ├─ "Continue with Google"
    │   └─ "Continue with Apple"
    │       ↓
    │   OAuth Flow → Success → App
    │
    └─ "Forgot password?" → Password Reset Flow
```

### Password Reset Flow

```
Login Screen
    ↓
[Tap "Forgot password?"]
    ↓
Forgot Password Screen
    ├─ Email input
    │   ↓
    [Tap "Send Reset Link"]
    ↓
Success Message: "Check your email"
    ↓
User receives email with link
    ↓
[Tap reset link in email]
    ↓
Deep link opens app: smushy://auth/reset-password?token=xyz
    ↓
Reset Password Screen
    ├─ New password input
    ├─ Confirm password input
    │   ↓
    [Tap "Reset Password"]
    ↓
Success → Navigate to Login
```

### OAuth Flow (Detailed)

```
User taps "Continue with Google/Apple"
    ↓
1. POST /auth/{provider}/initiate
   Response: { authUrl, state }
    ↓
2. Store state in AsyncStorage (CSRF protection)
    ↓
3. Open WebBrowser with authUrl
    ↓
4. User authenticates with provider
    ↓
5. Provider redirects to: smushy://auth/callback?code=xyz&state=abc
    ↓
6. App intercepts deep link
    ↓
7. Verify state matches (CSRF check)
    ↓
8. POST /auth/{provider}/callback { code, state }
    ↓
9. Backend returns JWT tokens OR linking required
    ↓
10. Store tokens → Navigate to app
```

### Account Linking Flow

```
Scenario: User has email account, tries OAuth with same email

OAuth callback returns:
{ requiresLinking: true, email, provider }
    ↓
Show confirmation dialog:
"Link Google to your account (user@email.com)?"
    ├─ [Confirm]
    │   ↓
    │   POST /auth/link-provider { code, state, provider }
    │   ↓
    │   Success → Account now has both email + Google
    │
    └─ [Cancel]
        ↓
        Return to login (linking declined)
```

---

## UI/UX Design

### Modern Animated LoginScreen

The LoginScreen features a modern, immersive design with smooth animations:

**Design Features:**
- ✨ **Edge-to-edge gradient background** - Full-screen gradient extending behind status bar
- 🎈 **Floating particles** - 8 animated particles with smooth float/fade animations
- 🪟 **Glassmorphic form card** - Frosted glass effect using BlurView
- 🎯 **Input focus animations** - Scale effects (1.02x) on focus with spring animation
- 🎭 **Fade-in transitions** - Hero section and form card fade in on mount
- 🎨 **Theme-aware** - All colors adapt to current theme (Warm/Serene)

**Animation Details:**

```typescript
// Floating particles
- 8 particles with random positions
- Smooth vertical float (-30px to 0px)
- Horizontal drift (±20px)
- Pulsing opacity (0.3 to 0.6)
- Duration: 3000-6500ms per particle (staggered)

// Logo animation
- Scales from 0.8 to 1.0 on mount
- Spring animation (damping: 10, stiffness: 100)
- Text shadow for depth

// Input animations
- Scale from 1.0 to 1.02 on focus
- Spring animation for smooth feel
- Returns to 1.0 on blur

// Form card
- Enters with FadeInDown (delay: 200ms, duration: 800ms)
- BlurView intensity: 20
- Semi-transparent white background (70% opacity)
```

**Performance:**
- All animations run at **60fps** using React Native Reanimated
- Animations execute on **UI thread** (not JavaScript thread)
- Optimized for smooth performance on all devices

### Safe Area Architecture

**Edge-to-Edge Design Pattern:**

The app implements a modern edge-to-edge layout where:
1. **Screen component** provides edge-to-edge background
2. **Individual screens** control their own safe areas with SafeAreaView

```typescript
<Screen>
  {/* Background extends edge-to-edge */}
  <LinearGradient style={StyleSheet.absoluteFill} />

  {/* Selective safe areas for content */}
  <SafeAreaView edges={['top', 'bottom']}>
    <ThemeToggle />
  </SafeAreaView>

  {/* Content can choose its own safe area needs */}
  <ScrollView>...</ScrollView>
</Screen>
```

**Benefits:**
- ✅ Modern, immersive full-screen aesthetics
- ✅ Backgrounds extend behind status bar and navigation bars
- ✅ Content safely positioned away from notches/home indicators
- ✅ Flexible per-screen safe area control

**StatusBar Configuration:**
```typescript
<StatusBar
  translucent              // Allows drawing behind status bar (Android)
  backgroundColor="transparent"  // Transparent status bar
  barStyle="dark-content"  // Dark icons on light background
/>
```

### Visual Design

**Color Palette (Warm Theme):**
- Primary: `#FF6B6B` (Coral) - CTAs, emphasis
- Secondary: `#F4A261` (Orange) - Accents, gradients
- Background: `#FAFAFA` (Off-white) - Main background
- Surface: `#FFFFFF` (White) - Cards, form containers
- Text: `#2B2D42` (Dark slate) - Primary text

**Gradient Background:**
```typescript
colors={[
  colors.primaryLight,  // Top: Light coral
  colors.secondary,     // Middle: Orange
  colors.background     // Bottom: Off-white
]}
```

**Glassmorphism:**
- BlurView intensity: 20
- Background: `rgba(255, 255, 255, 0.7)`
- Border: `rgba(255, 255, 255, 0.2)`
- Border radius: 24px

**Typography:**
- Logo: 56px, bold, white, text shadow
- Tagline: 18px, white, 95% opacity
- Form labels: 14px, medium weight
- Input text: 16px, regular weight
- Buttons: 16px, semibold

### Accessibility

**Touch Targets:**
- All buttons: Minimum 44x44px (iOS HIG)
- Input fields: Full-width, 48px height
- Social login buttons: 48px height

**Visual Feedback:**
- Haptic feedback on all button presses
- Loading states with spinners
- Error messages with icons
- Focus indicators on inputs

**Motion:**
- All animations are purposeful and smooth
- No jarring transitions
- Respects system motion preferences (future enhancement)

---

## Layout & Animation Architecture

### AuthSharedLayout

The `AuthSharedLayout` component (`features/auth/components/AuthSharedLayout.tsx`) provides a persistent wrapper for all auth screens using Expo Router's `Slot`.

**Key Features:**
- **Persistent wrapper** - Renders once, form content swaps via `Slot`
- **Animated gradient background** - Linear gradient with theme colors
- **Decorative blob rain** - 4 animated squishy blobs with drift animation
- **Hero compression** - Logo and tagline scale down when keyboard opens
- **Scroll indicator** - Bouncing chevron shows when content is scrollable
- **Theme toggle** - Positioned in top-right corner

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ [ThemeToggle]              SafeArea │
├─────────────────────────────────────┤
│                                     │
│         [SmushyLogo]                │
│    "Moments that bring us closer"   │  ← Hero Section (compresses)
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   [Slot] → Form Content     │    │  ← Glassmorphic Card
│  │                             │    │
│  │         [▼ scroll]          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Animation Details:**
```typescript
// Hero compression states
normal:   { scale: 1.0, opacity: 1.0, duration: 300ms }
keyboard: { scale: 0.5, opacity: 0.6, duration: 250ms }
signup:   { scale: 0.3, opacity: 0.6, duration: 400ms }

// Blob rain configuration
- 4 blobs with staggered delays (0, 8s, 16s, 24s)
- Drift animation duration: 32 seconds
- Size range: 170-230px, scales 1.0x-1.7x
- Opacity range: 0.1-0.3
```

### AuthKeyboardContext

The `AuthKeyboardContext` (`features/auth/contexts/AuthKeyboardContext.tsx`) provides responsive layout values based on device size and keyboard state.

**Device Size Classification:**
| Device Size | Screen Height | Examples |
|-------------|---------------|----------|
| `small` | < 700px | iPhone SE, iPhone 8, older Android |
| `medium` | 700-850px | iPhone 12/13/14 regular, most Android |
| `large` | > 850px | iPhone Pro Max, large Android |

**Base Layout Values (per device size):**
| Device Size | Hero Flex | Logo Size | Tagline Size |
|-------------|-----------|-----------|--------------|
| `small` | 20% | 48px | 18px |
| `medium` | 24% | 64px | 20px |
| `large` | 28% | 80px | 22px |

**Context API:**
```typescript
interface AuthKeyboardContextValue {
  // Keyboard state
  keyboardHeight: number;
  isKeyboardVisible: boolean;

  // Device info
  deviceSize: 'small' | 'medium' | 'large';
  screenHeight: number;

  // Base layout values (unscaled)
  baseHeroHeight: number;
  baseLogoSize: number;
  baseTaglineSize: number;

  // Get scaled values for compression state
  getCompression: (state: CompressionState) => CompressionValues;
}
```

**Usage:**
```typescript
const layout = useAuthKeyboard();
const compression = layout.getCompression('keyboard');
// compression.heroHeight, compression.scale, compression.opacity
```

---

## Technical Specification

### Components

#### Screen Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthCallbackScreen` | `screens/AuthCallbackScreen.tsx` | Handles OAuth redirect with `code`, `state`, `error` params |

#### Layout Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthSharedLayout` | `components/AuthSharedLayout.tsx` | Persistent wrapper with hero, gradient, blob rain, glassmorphic card |

#### Form Components

| Component | Path | Purpose |
|-----------|------|---------|
| `LoginForm` | `components/LoginForm.tsx` | Email/password inputs, OAuth buttons, forgot password link |
| `SignupForm` | `components/SignupForm.tsx` | Name, email, password, confirm password, terms checkbox, OAuth buttons |
| `ForgotPasswordForm` | `components/ForgotPasswordForm.tsx` | Email input, success state with confirmation message |
| `ResetPasswordForm` | `components/ResetPasswordForm.tsx` | New password, confirm password, invalid token state handling |
| `LogoutButton` | `components/LogoutButton.tsx` | Sign out button with optional confirmation dialog |

### Hooks (TanStack Query)

| Hook | Type | Purpose | Invalidates |
|------|------|---------|-------------|
| `useAuth()` | Query | Fetch current session, sync with store | - |
| `useSignIn()` | Mutation | Email/password signin | `auth.session` |
| `useSignUp()` | Mutation | Email/password signup | `auth.session` |
| `useSignOut()` | Mutation | Sign out and clear session | `auth.session` |
| `useSignInWithGoogle()` | Mutation | Google OAuth signin | `auth.session` |
| `useSignInWithApple()` | Mutation | Apple OAuth signin | `auth.session` |
| `useForgotPassword()` | Mutation | Request password reset | - |
| `useResetPassword()` | Mutation | Reset password with token | - |

### State Management

**TanStack Query** (Server State):
- `QUERY_KEYS.auth.session` - Current session data
- Manages API data fetching and caching
- Auto-refetches on token refresh

**Zustand** (Client State):
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setAuth: (user, session) => void;
  clearAuth: () => void;
}
```
- Persisted to AsyncStorage
- Synced with TanStack Query session
- Accessed via `useAuthStore()`

### Data Models

**User:**
```typescript
interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  app_metadata?: Record<string, any>;
  aud?: string;
  created_at?: string;
  updated_at?: string;
  partner_id?: string;
}
```

**Session:**
```typescript
interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}
```

**Credentials:**
```typescript
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}
```

### Validation Utilities

| Utility | Rules | Error Messages |
|---------|-------|----------------|
| `validateEmail()` | Basic email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) | "Email is required"<br/>"Please enter a valid email address" |
| `validatePassword()` | Min 8 characters | "Password is required"<br/>"Password must be at least 8 characters" |
| `validateName()` | 2-50 characters, trimmed | "Name is required"<br/>"Name must be at least 2 characters"<br/>"Name must be less than 50 characters" |

---

## Architecture Patterns

### Repository Pattern with Dependency Injection

The auth feature uses the Repository Pattern to abstract data access:

```
┌─────────────────────────────────────┐
│  Hooks (useSignIn, useSignUp, ...)  │
│  ↓ call                             │
│  useAuthRepository()                │
└─────────────────────────────────────┘
             ↓ provides
┌─────────────────────────────────────┐
│  RepositoryProvider (DI Container)  │
│  ↓ injects based on config          │
│  - MOCK_CONFIG.enabled = true       │
│    → mockAuthRepository             │
│  - MOCK_CONFIG.enabled = false      │
│    → backendAuthRepository          │
└─────────────────────────────────────┘
             ↓ returns
┌─────────────────────────────────────┐
│  AuthRepository Interface           │
│  - signIn()                         │
│  - signUp()                         │
│  - signOut()                        │
│  - getSession()                     │
│  - getUser()                        │
│  - signInWithGoogle()               │
│  - signInWithApple()                │
│  - forgotPassword()                 │
│  - resetPassword()                  │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ Switch between mock and backend without changing components
- ✅ Easy to test with mock repositories
- ✅ Type-safe repository interface
- ✅ Consistent API across implementations

### JWT Token Management

**Token Storage:**
- Access token: Short-lived (1 hour)
- Refresh token: Long-lived (30 days)
- Stored in AsyncStorage (encrypted on iOS)
- Managed by `tokenManager` module

**Auto-Refresh:**
```typescript
// Token refresh happens automatically
- When access token expires (or 5 min before)
- tokenManager intercepts API requests
- Calls POST /auth/refresh with refresh_token
- Updates stored tokens
- Retries original request
```

**Token Flow:**
```
1. User signs in
   ↓
2. Backend returns access_token + refresh_token
   ↓
3. setTokens(access, refresh, expires_in)
   ↓
4. Tokens stored in AsyncStorage
   ↓
5. All API requests include access_token in header
   ↓
6. When access_token expires:
   - tokenManager detects expiration
   - Calls POST /auth/refresh
   - Gets new access_token
   - Retries original request
   ↓
7. If refresh fails → clear tokens → navigate to login
```

### CSRF Protection in OAuth

OAuth flows use the **state parameter** for CSRF protection:

```typescript
// 1. Generate random state
const state = generateRandomString();

// 2. Store in AsyncStorage
await storage.setItem(STORAGE_KEYS.OAUTH_STATE, state);

// 3. Send to OAuth provider
const authUrl = `${providerUrl}?state=${state}`;

// 4. Provider redirects with state
// smushy://auth/callback?code=xyz&state=abc

// 5. Verify state matches
const savedState = await storage.getItem(STORAGE_KEYS.OAUTH_STATE);
if (savedState !== returnedState) {
  throw new Error('CSRF check failed');
}

// 6. Exchange code for tokens (state verified)
POST /auth/{provider}/callback { code, state }
```

---

## Navigation

### Routes

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/(auth)/login` | `LoginScreen` | Sign in | No |
| `/(auth)/signup` | `SignupScreen` | Create account | No |
| `/(auth)/forgot-password` | `ForgotPasswordScreen` | Request reset | No |
| `/(auth)/reset-password` | `ResetPasswordScreen` | Reset password | No |
| `/(auth)/callback` | `AuthCallbackScreen` | OAuth redirect | No |
| `/(tabs)/*` | App screens | Main app | Yes |

### Deep Linking

**OAuth Callback:**
```
URL Scheme: smushy://auth/callback
Parameters:
  - code: OAuth authorization code
  - state: CSRF protection token
  - error: Error message (if OAuth failed)

Example:
smushy://auth/callback?code=abc123&state=xyz789
```

**Password Reset:**
```
URL Scheme: smushy://auth/reset-password
Parameters:
  - token: Password reset token (from email)

Example:
smushy://auth/reset-password?token=reset-token-123
```

### Route Guards

The root `_layout.tsx` handles automatic navigation:

```typescript
const { isAuthenticated } = useAuth();

// Redirect based on auth state
useEffect(() => {
  if (isAuthenticated) {
    router.replace('/(tabs)/moments'); // Authenticated → App
  } else {
    router.replace('/'); // Unauthenticated → Landing
  }
}, [isAuthenticated]);
```

---

## Error Handling

### Error Scenarios

| Error Code | User-Facing Message | Recovery Action |
|------------|---------------------|-----------------|
| `INVALID_CREDENTIALS` | "Invalid email or password" | Retry with correct credentials |
| `EMAIL_ALREADY_EXISTS` | "An account with this email already exists" | Sign in instead, or use password reset |
| `EMAIL_EXISTS_OAUTH` | "This email is linked to [Google/Apple]. Sign in with [provider] instead?" | Show OAuth sign-in button |
| `WEAK_PASSWORD` | "Password must be at least 8 characters" | Enter stronger password |
| `INVALID_TOKEN` | "Reset link expired or invalid. Request a new one." | Return to forgot password |
| `OAUTH_CANCELLED` | User cancelled OAuth (silent) | Return to login screen |
| `OAUTH_FAILED` | "OAuth sign-in failed. Please try again." | Retry OAuth or use email/password |
| `LINKING_DECLINED` | User declined account linking (silent) | Return to login |
| `CANNOT_UNLINK_LAST_PROVIDER` | "You must have at least one sign-in method" | Keep at least one auth method |
| `PROVIDER_ALREADY_LINKED` | "This [Google/Apple] account is already linked" | No action needed |
| `NETWORK_ERROR` | "Connection error. Please check your internet." | Retry button, check network |
| `UNKNOWN_ERROR` | "Something went wrong. Please try again." | Retry or contact support |

### Error Handling Utility

```typescript
// features/auth/utils/authErrors.ts
export function handleAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

### Error Display

All error messages follow Smushy's brand values:
- ✅ **Warm and supportive** ("We couldn't sign you in" vs "Login failed")
- ✅ **Clear and actionable** (Tell users what to do next)
- ✅ **No blame or shame** (Never "You entered wrong password")
- ✅ **Respectful of privacy** (Don't reveal if email exists for security)

---

## Security Considerations

### Authentication Security

1. **Password Requirements**
   - Minimum 8 characters
   - No complexity requirements (NIST guidelines)
   - Users can use password managers

2. **Token Security**
   - JWT tokens with expiration
   - Access token: 1 hour lifetime
   - Refresh token: 30 days lifetime
   - Tokens stored in AsyncStorage (encrypted on iOS)
   - HTTPS-only transmission

3. **CSRF Protection**
   - OAuth flows use state parameter
   - State stored locally and verified on callback
   - Prevents CSRF attacks on OAuth flows

4. **Email Validation**
   - Basic format validation only
   - No email enumeration (don't reveal if email exists)
   - Password reset silently succeeds even for non-existent emails

5. **Rate Limiting**
   - Backend implements rate limiting on:
     - Sign in attempts (prevent brute force)
     - Password reset requests (prevent spam)
     - OAuth initiations (prevent abuse)

6. **Session Management**
   - Sessions expire after 30 days of inactivity
   - Refresh token rotation on use
   - Sign out invalidates refresh token on backend

### Privacy Considerations

1. **No Activity Tracking**
   - Auth system doesn't log user activity
   - No behavioral analytics
   - Minimal data collection

2. **Data Minimization**
   - Only collect: email, name, avatar (optional)
   - No phone numbers, addresses, or personal info
   - Users control their own data

3. **Account Deletion**
   - Users can delete their accounts (future feature)
   - All data permanently removed
   - Partner notified before deletion

---

## Testing

### Test Coverage Summary

| Category | Files | Tests | Coverage | Status |
|----------|-------|-------|----------|--------|
| **Validation Utilities** | 3 | 95 | 100% | ✅ Complete |
| **Hooks** | 1 | 23 | 95% | ✅ Complete |
| **Repositories** | 2 | 46 | 97% | ✅ Complete |
| **Form Components** | 0 | 0 | - | ⏸️ Planned |
| **Integration** | 0 | 0 | - | ⏸️ Planned |
| **Total** | 6 | 164 | 95% | ✅ Good |

**Note on Test Suite:** Screen component tests were removed when screens were replaced by Form components + AuthSharedLayout. Form component tests are planned.

### Test Files

```
features/auth/
├── __tests__/
│   └── test-utils.tsx              # Test wrappers and mocks
├── api/
│   ├── useSignIn.test.ts           # 23 tests
│   ├── mockAuthRepository.test.ts  # 24 tests
│   └── backendAuthRepository.test.ts # 22 tests
shared/utils/
├── validateEmail.test.ts           # 24 tests
├── validatePassword.test.ts        # 26 tests
├── validateName.test.ts            # 45 tests
└── errorHandler.test.ts            # [various tests]
```

**Testing Philosophy:**
- **Focus on behavior** over implementation details
- **Test user interactions** rather than component internals
- **Avoid brittle tests** that break on refactoring
- **Hook tests** validate business logic and API integration
- **Utility tests** ensure validation logic correctness

### Test Scenarios Covered

✅ **Unit Tests:**
- Email, password, name validation (all edge cases)
- Sign in, sign up, sign out mutations
- Session fetching and syncing
- Repository method calls
- Token management

✅ **Error Handling Tests:**
- Invalid credentials
- Network errors
- Validation failures
- OAuth cancellation
- Token expiration

⏸️ **Form Component Tests (Planned):**
- Form rendering and input changes
- Validation error display
- Button states (loading, disabled)
- Navigation between screens
- OAuth button functionality

⏸️ **Integration Tests (Planned):**
- Complete signup → signin → signout flow
- OAuth flow with WebBrowser mock
- Password reset end-to-end
- Account linking flow

### Running Tests

```bash
# Run all auth tests
npm test -- features/auth

# Run specific test file
npm test -- LoginScreen.test.tsx

# Run with coverage
npm test -- --coverage features/auth

# Watch mode
npm test -- --watch features/auth
```

---

## Implementation Status

### ✅ Completed Features

- [x] Email/password authentication (backend + mock)
- [x] JWT token management with auto-refresh
- [x] LoginScreen with validation and error handling
- [x] Modern animated LoginScreen with:
  - [x] Edge-to-edge gradient background
  - [x] Floating particle animations
  - [x] Glassmorphic form card with BlurView
  - [x] Input focus animations (scale effects)
  - [x] Fade-in/slide-in transitions
  - [x] 60fps performance with Reanimated
- [x] SignupScreen with full validation
- [x] ForgotPasswordScreen
- [x] ResetPasswordScreen
- [x] AuthCallbackScreen for OAuth redirects
- [x] Repository pattern with dependency injection
- [x] TanStack Query + Zustand state management
- [x] Automatic route switching based on auth state
- [x] Form validation utilities (email, password, name)
- [x] Error handling and user-friendly messages
- [x] OAuth implementation (Google, Apple)
- [x] CSRF protection in OAuth flows
- [x] Comprehensive test coverage (>90%)
- [x] Safe area architecture (edge-to-edge design)
- [x] Screen component refactored for flexibility
- [x] StatusBar configuration (translucent Android)

### 🟡 In Progress

- [ ] Account linking UI (settings screen)
- [ ] Email verification flow
- [ ] Multi-factor authentication (future)

### 🔴 Planned Features

- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Social sign-in (Facebook, future)
- [ ] Account deletion flow
- [ ] Session management UI
- [ ] Security audit logging

---

## API Contract

### Backend Endpoints

**Authentication:**
```
POST /auth/signin
  Body: { email: string, password: string }
  Response: { access_token, refresh_token, user, expires_in }

POST /auth/signup
  Body: { email: string, password: string, name: string }
  Response: { access_token, refresh_token, user, expires_in }
  Error: { code: 'EMAIL_EXISTS_OAUTH', providers: ['google'] }

POST /auth/signout
  Response: 200 OK

GET /auth/session
  Response: { user: User } | 401 Unauthorized

POST /auth/refresh
  Body: { refresh_token: string }
  Response: { access_token, refresh_token, expires_in }
```

**OAuth:**
```
POST /auth/google/initiate
  Response: { authUrl: string, state: string }

POST /auth/google/callback
  Body: { code: string, state: string }
  Response: { access_token, refresh_token, user, expires_in }
       OR { requiresLinking: true, email: string, provider: 'google' }

POST /auth/apple/initiate
  Response: { authUrl: string, state: string }

POST /auth/apple/callback
  Body: { code: string, state: string }
  Response: { access_token, refresh_token, user, expires_in }
       OR { requiresLinking: true, email: string, provider: 'apple' }
```

**Account Linking:**
```
POST /auth/link-provider
  Body: { code: string, state: string, provider: 'google' | 'apple' }
  Response: { access_token, refresh_token, user, expires_in }

GET /auth/providers
  Response: { providers: [{ type, linked_at }] }

DELETE /auth/providers/:provider
  Response: 200 OK | 400 CANNOT_UNLINK_LAST_PROVIDER
```

**Password Reset:**
```
POST /auth/forgot-password
  Body: { email: string }
  Response: 200 OK (always succeeds for security)

POST /auth/reset-password
  Body: { token: string, password: string }
  Response: 200 OK | 400 INVALID_TOKEN
```

---

## Backend Implementation

> **Note:** This section documents backend implementation details for the auth system. Populate as backend work progresses.

### NestJS Architecture (Planned)

```
/src/auth
├── auth.module.ts           # Auth module definition
├── auth.controller.ts       # REST endpoints
├── auth.service.ts          # Business logic
├── strategies/
│   ├── jwt.strategy.ts      # JWT validation
│   ├── local.strategy.ts    # Email/password
│   └── oauth.strategy.ts    # Google/Apple OAuth
├── guards/
│   ├── jwt-auth.guard.ts    # Protect authenticated routes
│   └── local-auth.guard.ts  # Login route guard
├── decorators/
│   └── current-user.decorator.ts  # Extract user from request
└── dto/
    ├── signin.dto.ts
    ├── signup.dto.ts
    └── reset-password.dto.ts
```

### Database Schema (Planned)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL for OAuth-only users
  name VARCHAR(100),
  avatar_url TEXT,
  partner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auth providers (for account linking)
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- 'email', 'google', 'apple'
  provider_user_id VARCHAR(255),
  linked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Rate Limiting Configuration (Planned)

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `POST /auth/signin` | 5 attempts | 15 min | Per IP + email |
| `POST /auth/signup` | 3 attempts | 1 hour | Per IP |
| `POST /auth/forgot-password` | 3 attempts | 1 hour | Per email |
| `POST /auth/refresh` | 10 attempts | 1 min | Per user |

---

## Diagrams

### Auth State Flow

```
┌─────────────────┐
│  Unauthenticated│
│   Landing Page  │
└────────┬────────┘
         │
    ┌────┴────┐─────────┐
    │ Sign In │ Sign Up │
    └────┬────┴────┬────┘
         │         │
    ┌────▼─────────▼────┐
    │   Authentication  │
    │   (Email/OAuth)   │
    └────────┬──────────┘
             │
        ┌────▼────┐
        │ Success │
        └────┬────┘
             │
    ┌────────▼─────────┐
    │  Authenticated   │
    │   App (Tabs)     │
    └────────┬─────────┘
             │
        ┌────▼────┐
        │Sign Out │
        └────┬────┘
             │
    ┌────────▼─────────┐
    │  Unauthenticated │
    └──────────────────┘
```

### Token Lifecycle

```
User signs in
    ↓
Backend returns tokens
    ↓
Store in AsyncStorage
    ↓
┌─────────────────────────────────┐
│ Access Token (1 hour)           │
│ Used for all API requests       │
└─────────────────────────────────┘
    │
    ├─ If valid → Include in request
    │
    └─ If expired (or < 5 min left)
        ↓
┌─────────────────────────────────┐
│ Refresh Token (30 days)         │
│ Used to get new access token    │
└─────────────────────────────────┘
    │
    ├─ If valid → POST /auth/refresh
    │   ↓
    │   Get new access token
    │   ↓
    │   Update AsyncStorage
    │   ↓
    │   Retry original request
    │
    └─ If expired → Clear tokens
        ↓
        Navigate to login
```

---

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Project architecture and conventions
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development patterns and guidelines
- [VALUES.md](../notes/VALUES.md) - Smushy's core values and design principles
- [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md) - Current project state

---

## Changelog

### 2026-01-05 - Auth Screen Architecture Refactor
- ✅ Extracted form components (`LoginForm`, `SignupForm`, `ForgotPasswordForm`, `ResetPasswordForm`)
- ✅ Added `AuthSharedLayout` for persistent layout with hero, gradient, blob rain
- ✅ Added `AuthKeyboardContext` for responsive keyboard handling and device sizing
- ✅ Added `ScrollViewWithIndicator` for scroll feedback in forms
- ✅ Deleted unused screen files (`LoginScreen`, `SignupScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`)
- ✅ Routes now render Form components directly within shared layout
- ✅ Hero compression scales proportionally (1.0 → 0.5 → 0.3) based on keyboard/signup state
- ✅ Device-responsive layout (small/medium/large based on screen height)

### 2026-01-04 - Modern UI/UX Implementation
- ✅ Complete redesign of LoginScreen with modern animations
- ✅ Edge-to-edge gradient background extending behind status bar
- ✅ Floating particle animations (8 particles, smooth float/fade)
- ✅ Glassmorphic form card using BlurView (frosted glass effect)
- ✅ Input focus animations with scale effects (1.02x spring animation)
- ✅ Fade-in and slide-in transitions for hero and form
- ✅ Safe area architecture (edge-to-edge design pattern)
- ✅ Screen component refactored to simple container
- ✅ Selective safe area handling per screen with SafeAreaView
- ✅ StatusBar configured for translucent Android display
- ✅ All animations run at 60fps using Reanimated on UI thread
- ✅ Theme-aware colors and effects
- ✅ STYLING.md documentation updated with safe area patterns

### 2026-01-04 - Test Suite Refinement
- ✅ Refined test suite to focus on behavior over implementation
- ✅ Improved LoginScreen and SignupScreen test assertions
- ✅ Removed brittle UI component tests for maintainability
- ✅ Final test count: 280 tests across 10 suites, all passing

### 2026-01-03 - Initial Implementation Complete
- ✅ Email/password authentication
- ✅ OAuth (Google, Apple) with CSRF protection
- ✅ Password reset flow
- ✅ Comprehensive test coverage (>90%)
- ✅ Repository pattern with dependency injection
- ✅ JWT token management with auto-refresh

### Future Enhancements
- Account linking UI in settings
- Email verification requirement
- Biometric authentication
- Session management dashboard
- Account deletion flow
