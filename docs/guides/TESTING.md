# Testing Guide

**Purpose:** Comprehensive testing strategy and best practices for Smushy

**Last Updated:** 2026-01-04

---

## Testing Philosophy

**Goal:** Build confidence in code changes while maintaining development velocity.

**Principles:**
1. **Test behavior, not implementation** - Tests should survive refactoring
2. **Test like a user** - Focus on user-facing functionality
3. **Prefer integration over unit tests** - Test how components work together
4. **Co-locate tests** - Keep tests next to the code they test
5. **Mock sparingly** - Real implementations when possible, mocks only when necessary

---

## Testing Stack

- **Test Runner:** Jest
- **Component Testing:** React Native Testing Library
- **Mock Data:** In-memory mock repositories (dual-mode architecture)
- **API Mocking:** MSW (Mock Service Worker) for E2E tests
- **Type Safety:** TypeScript strict mode in tests

---

## Test Organization

### Co-location Pattern

Keep tests next to the code they test:

```
/src/features/moments
  /api
    useMoments.ts
    useMoments.test.ts          # ← Test next to hook
  /components
    MomentCard.tsx
    MomentCard.test.tsx         # ← Test next to component
  /screens
    MomentsListScreen.tsx
    MomentsListScreen.test.tsx  # ← Test next to screen
```

**Benefits:**
- Easy to find tests
- Easy to update tests when code changes
- Clear 1:1 relationship

---

## Test Types

### 1. Unit Tests

**What:** Test individual functions/utilities in isolation

**When to use:**
- Utility functions (`formatDate`, `validateEmail`)
- Type guards
- Pure functions with no side effects

**Example:**
```typescript
// src/shared/utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO date to readable format', () => {
    expect(formatDate('2024-12-25')).toBe('December 25, 2024');
  });

  it('handles invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});
```

**Best Practices:**
- Test edge cases (null, undefined, empty strings)
- Test error handling
- Keep tests simple and focused
- No mocking needed for pure functions

---

### 2. Component Tests

**What:** Test React components with React Native Testing Library

**When to use:**
- Shared UI components (`Button`, `Input`, `Card`)
- Feature-specific components (`MomentCard`)
- Components with user interactions

**Example:**
```typescript
// src/shared/components/ui/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Click Me</Button>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>Click Me</Button>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**Best Practices:**
- Use `getByText`, `getByRole`, `getByLabelText` (not `getByTestId`)
- Test user interactions (press, type, scroll)
- Test accessibility
- Avoid testing implementation details (state, props)

---

### 3. Hook Tests

**What:** Test custom React hooks (TanStack Query hooks, custom hooks)

**When to use:**
- TanStack Query hooks (`useMoments`, `useCreateMoment`)
- Custom hooks with logic (`useDebounce`, `useForm`)

**Example:**
```typescript
// src/features/moments/api/useMoments.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoments } from './useMoments';
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';

// Test wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        {children}
      </RepositoryProvider>
    </QueryClientProvider>
  );
};

describe('useMoments', () => {
  it('fetches moments successfully', async () => {
    const { result } = renderHook(() => useMoments(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('handles errors correctly', async () => {
    // Mock repository to throw error
    // ... error testing logic
  });
});
```

**Best Practices:**
- Wrap hooks with necessary providers (QueryClient, RepositoryProvider)
- Test loading, success, and error states
- Use `waitFor` for async operations
- Test cache invalidation for mutations

---

### 4. Integration Tests

**What:** Test how multiple components/hooks work together

**When to use:**
- Screen components (orchestrate multiple components + hooks)
- Complete user flows (create → view → edit → delete)

**Example:**
```typescript
// src/features/moments/screens/MomentsListScreen.test.tsx
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';
import { MomentsListScreen } from './MomentsListScreen';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        {children}
      </RepositoryProvider>
    </QueryClientProvider>
  );
};

describe('MomentsListScreen', () => {
  it('displays loading state initially', () => {
    const { getByTestId } = render(<MomentsListScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays moments after loading', async () => {
    const { getByText } = render(<MomentsListScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText(/Date Night/i)).toBeTruthy();
    });
  });

  it('handles empty state', async () => {
    // Mock empty repository response
    const { getByText } = render(<MomentsListScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText(/No moments yet/i)).toBeTruthy();
    });
  });

  it('navigates to detail screen when moment is pressed', async () => {
    const mockNavigate = jest.fn();
    // Mock navigation
    // ... test navigation
  });
});
```

**Best Practices:**
- Test complete user flows
- Use real providers (not mocks)
- Test error states and edge cases
- Verify navigation and side effects

---

### 5. E2E Tests (Future)

**What:** Full application tests simulating real user scenarios

**Tools:** Detox or Maestro

**When to use:**
- Critical user flows (auth, create moment, view story)
- Multi-screen workflows
- Before major releases

**Not implemented yet.** Add when needed for regression testing.

---

## Testing Patterns

### Pattern 1: Testing TanStack Query Hooks

```typescript
// ✅ GOOD: Test with real QueryClient and RepositoryProvider
const { result } = renderHook(() => useMoments(), {
  wrapper: createWrapper(), // Includes QueryClient + RepositoryProvider
});

await waitFor(() => {
  expect(result.current.isSuccess).toBe(true);
});

// ❌ BAD: Mocking TanStack Query
jest.mock('@tanstack/react-query');
```

**Why:** Real TanStack Query behavior ensures tests catch real bugs.

---

### Pattern 2: Testing with Mock Data

```typescript
// ✅ GOOD: Use dual-mode architecture (mock repositories)
// No setup needed! RepositoryProvider uses mock mode by default in tests

describe('useMoments', () => {
  it('fetches moments', async () => {
    const { result } = renderHook(() => useMoments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});

// ❌ BAD: Mocking fetch/axios
jest.mock('axios');
```

**Why:** Mock repositories provide realistic data without backend dependency.

---

### Pattern 3: Testing Navigation

```typescript
import { useRouter } from 'expo-router';

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('MomentCard', () => {
  it('navigates to detail screen when pressed', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByText } = render(<MomentCard moment={mockMoment} />);

    fireEvent.press(getByText('Date Night'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/moments/[id]',
      params: { id: 'moment-1' },
    });
  });
});
```

---

### Pattern 4: Testing Forms

```typescript
import { fireEvent } from '@testing-library/react-native';

describe('CreateMomentForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <CreateMomentForm onSubmit={onSubmit} />
    );

    // Fill form
    fireEvent.changeText(
      getByPlaceholderText('Moment title'),
      'Coffee Date'
    );
    fireEvent.changeText(
      getByPlaceholderText('Description'),
      'Morning coffee at our favorite cafe'
    );

    // Submit
    fireEvent.press(getByText('Create Moment'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Coffee Date',
        description: 'Morning coffee at our favorite cafe',
      });
    });
  });

  it('shows validation errors for invalid input', () => {
    const { getByText, getByPlaceholderText } = render(<CreateMomentForm />);

    // Submit without filling
    fireEvent.press(getByText('Create Moment'));

    expect(getByText('Title is required')).toBeTruthy();
  });
});
```

---

### Pattern 5: Testing Loading/Error States

```typescript
describe('MomentsListScreen', () => {
  it('shows loading spinner while fetching', () => {
    const { getByTestId } = render(<MomentsListScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error message on fetch failure', async () => {
    // Mock repository to throw error
    const mockRepository = {
      getAll: jest.fn().mockRejectedValue(new Error('Network error')),
    };

    // ... custom wrapper with mocked repository

    const { getByText } = render(<MomentsListScreen />, {
      wrapper: createCustomWrapper(mockRepository),
    });

    await waitFor(() => {
      expect(getByText(/Network error/i)).toBeTruthy();
    });
  });

  it('shows empty state when no moments', async () => {
    // Mock repository to return empty array
    const mockRepository = {
      getAll: jest.fn().mockResolvedValue([]),
    };

    const { getByText } = render(<MomentsListScreen />, {
      wrapper: createCustomWrapper(mockRepository),
    });

    await waitFor(() => {
      expect(getByText(/No moments yet/i)).toBeTruthy();
    });
  });
});
```

---

## Test Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### Jest Setup File

```typescript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- useMoments.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="fetches moments"

# Update snapshots
npm test -- -u
```

---

## Coverage Guidelines

**Targets:**
- **Overall:** 80%+ coverage
- **Utilities:** 90%+ coverage (pure functions are easy to test)
- **Components:** 70%+ coverage (focus on behavior)
- **Hooks:** 80%+ coverage (critical for data flow)

**What to test:**
- ✅ User interactions
- ✅ Data fetching and mutations
- ✅ Error handling
- ✅ Edge cases
- ✅ Conditional rendering

**What NOT to test:**
- ❌ Third-party libraries
- ❌ Implementation details
- ❌ Styled components (visual regression is separate)
- ❌ Trivial code (getters/setters)

---

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// ✅ GOOD: Describes behavior
it('shows error message when API call fails', () => {});
it('disables submit button when form is invalid', () => {});
it('navigates to detail screen when moment is pressed', () => {});

// ❌ BAD: Unclear what's being tested
it('works', () => {});
it('test 1', () => {});
it('renders correctly', () => {});
```

---

### 2. Arrange-Act-Assert Pattern

```typescript
it('creates a new moment', async () => {
  // Arrange - Set up test data
  const momentData = {
    title: 'Coffee Date',
    description: 'Morning coffee',
  };

  // Act - Perform action
  const { result } = renderHook(() => useCreateMoment(), {
    wrapper: createWrapper(),
  });

  result.current.mutate(momentData);

  // Assert - Verify outcome
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
});
```

---

### 3. Test One Thing Per Test

```typescript
// ✅ GOOD: One assertion per test
it('shows loading state initially', () => {
  const { getByTestId } = render(<MomentsListScreen />);
  expect(getByTestId('loading-spinner')).toBeTruthy();
});

it('shows moments after loading', async () => {
  const { getByText } = render(<MomentsListScreen />);
  await waitFor(() => {
    expect(getByText('Date Night')).toBeTruthy();
  });
});

// ❌ BAD: Testing multiple things
it('renders and loads data', async () => {
  // Too much in one test
});
```

---

### 4. Avoid Implementation Details

```typescript
// ✅ GOOD: Test behavior
it('filters moments by type', async () => {
  const { getByText } = render(<MomentsListScreen />);
  fireEvent.press(getByText('Dates'));

  await waitFor(() => {
    expect(getByText('Coffee Date')).toBeTruthy();
  });
});

// ❌ BAD: Test implementation
it('calls setFilter with "date"', () => {
  // Testing internal state/functions
});
```

---

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Not Waiting for Async Operations

```typescript
// ❌ BAD: Not waiting
it('fetches moments', () => {
  const { result } = renderHook(() => useMoments());
  expect(result.current.data).toBeDefined(); // Will fail!
});

// ✅ GOOD: Wait for async
it('fetches moments', async () => {
  const { result } = renderHook(() => useMoments());
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  expect(result.current.data).toBeDefined();
});
```

---

### ❌ Pitfall 2: Over-Mocking

```typescript
// ❌ BAD: Mocking everything
jest.mock('@tanstack/react-query');
jest.mock('@/core/repositories/RepositoryProvider');
jest.mock('@/features/moments/api/useMoments');

// ✅ GOOD: Use real implementations
// RepositoryProvider already uses mock repositories in tests!
```

---

### ❌ Pitfall 3: Testing Library Internals

```typescript
// ❌ BAD: Testing TanStack Query internals
expect(queryClient.getQueryState(['moments'])).toBeDefined();

// ✅ GOOD: Test user-facing behavior
await waitFor(() => {
  expect(getByText('Date Night')).toBeTruthy();
});
```

---

## Debugging Tests

### Debug Output

```typescript
import { screen, debug } from '@testing-library/react-native';

it('renders moments', async () => {
  render(<MomentsListScreen />);

  // Print component tree
  debug();

  // Or use screen
  screen.debug();
});
```

### Log Test State

```typescript
console.log('Current data:', result.current.data);
console.log('Is loading:', result.current.isLoading);
console.log('Error:', result.current.error);
```

### VSCode Debugging

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["${fileBasenameNoExtension}", "--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Resources

- **React Native Testing Library:** https://callstack.github.io/react-native-testing-library/
- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **TanStack Query Testing:** https://tanstack.com/query/latest/docs/framework/react/guides/testing
- **Testing Library Queries:** https://testing-library.com/docs/queries/about

---

## Summary

**Testing Pyramid for Smushy:**
```
        /\
       /  \      E2E Tests (Few, Critical Flows)
      /    \
     /------\    Integration Tests (Screens, User Flows)
    /        \
   /----------\  Component Tests (UI Components)
  /            \
 /--------------\ Unit Tests (Utilities, Pure Functions)
```

**Key Takeaways:**
1. Test behavior, not implementation
2. Use dual-mode architecture (mock repositories)
3. Co-locate tests with code
4. Prefer integration tests for screens
5. Write tests that would survive refactoring

**When in doubt:** Test like a user would use your app.
