# REST API Client Documentation

> **Documentation for Smushy's custom REST API client with JWT authentication, retry logic, and error handling**

**Last Updated:** 2026-01-03

---

## Overview

Smushy uses a custom REST API client built on top of Axios with the following features:

- ✅ JWT authentication with automatic token refresh
- ✅ Exponential backoff retry logic
- ✅ Request/response interceptors
- ✅ Centralized error handling
- ✅ TypeScript type safety
- ✅ Dual-mode support (Mock + Backend)

**Location:** `/src/core/api/`

**Key Files:**
- `client.ts` - HTTP client with Axios configuration
- `tokenManager.ts` - JWT storage, refresh, and lifecycle management
- `errorHandler.ts` - Error transformation and user-friendly messages

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Feature Hook (useMoments)                  │
│  └─ Uses injected repository                │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  Repository (Backend or Mock)               │
│  └─ Backend uses apiClient                  │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  API Client (src/core/api/client.ts)        │
│  - Interceptors (add JWT token)             │
│  - Retry logic (exponential backoff)        │
│  - Error handling                           │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  REST API Backend (NestJS)                  │
│  - Validates JWT                            │
│  - Returns data or errors                   │
└─────────────────────────────────────────────┘
```

---

## Usage

### Basic API Calls

```typescript
import { apiClient } from '@/core/api/client';

// GET request
const moments = await apiClient.get<Moment[]>('/moments');

// POST request
const newMoment = await apiClient.post<Moment>('/moments', {
  title: 'Date Night',
  date: '2026-01-03',
  description: 'Dinner at our favorite restaurant'
});

// PUT request
const updatedMoment = await apiClient.put<Moment>(`/moments/${id}`, {
  title: 'Updated Title'
});

// DELETE request
await apiClient.delete(`/moments/${id}`);

// With query parameters
const filtered = await apiClient.get<Moment[]>('/moments', {
  params: {
    date: '2026-01-03',
    type: 'date'
  }
});
```

### In Repository Pattern

**Backend Repository:**
```typescript
// src/features/moments/api/backendRepository.ts
import { apiClient } from '@/core/api/client';
import type { Moment, MomentRepository } from '../types';

export const backendMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters): Promise<Moment[]> => {
    return apiClient.get<Moment[]>('/moments', { params: filters });
  },

  getById: async (id: string): Promise<Moment> => {
    return apiClient.get<Moment>(`/moments/${id}`);
  },

  create: async (data: CreateMomentDTO): Promise<Moment> => {
    return apiClient.post<Moment>('/moments', data);
  },

  update: async (id: string, updates: UpdateMomentDTO): Promise<Moment> => {
    return apiClient.put<Moment>(`/moments/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/moments/${id}`);
  }
};
```

---

## Authentication Flow

### Initial Login

```
1. User enters credentials
   ↓
2. POST /auth/login
   ↓
3. Server returns:
   - accessToken (JWT, expires in 15 min)
   - refreshToken (JWT, expires in 7 days)
   - user data
   ↓
4. TokenManager stores tokens in AsyncStorage
   ↓
5. Auth state updated (useAuthStore)
```

### Authenticated Requests

```
1. User makes API request
   ↓
2. Request interceptor adds Authorization header:
   "Authorization: Bearer <accessToken>"
   ↓
3. Backend validates JWT
   ↓
4. Data returned
```

### Token Refresh Flow

```
1. Request made with expired/expiring access token
   ↓
2. Response interceptor detects 401 Unauthorized
   ↓
3. TokenManager calls POST /auth/refresh
   with refreshToken
   ↓
4. New tokens received and stored
   ↓
5. Original request retried with new access token
   ↓
6. Success!
```

**Automatic Refresh:**
- Tokens are refreshed 5 minutes before expiry
- Refresh happens in background (transparent to user)
- If refresh fails, user is logged out

### Token Storage

**Secure Storage with AsyncStorage:**
```typescript
// src/core/api/tokenManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKENS = {
  ACCESS: '@smushy/access_token',
  REFRESH: '@smushy/refresh_token'
};

// Store tokens
await AsyncStorage.setItem(TOKENS.ACCESS, accessToken);
await AsyncStorage.setItem(TOKENS.REFRESH, refreshToken);

// Retrieve tokens
const accessToken = await AsyncStorage.getItem(TOKENS.ACCESS);
const refreshToken = await AsyncStorage.getItem(TOKENS.REFRESH);

// Clear tokens (on logout)
await AsyncStorage.multiRemove([TOKENS.ACCESS, TOKENS.REFRESH]);
```

---

## Error Handling

### Error Transformation

All API errors are transformed into `AppError` instances:

```typescript
// src/shared/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Common Error Codes

| Status Code | Meaning | User Message |
|-------------|---------|--------------|
| 400 | Bad Request | Invalid data provided |
| 401 | Unauthorized | Please log in to continue |
| 403 | Forbidden | You do not have permission |
| 404 | Not Found | Item not found |
| 422 | Validation Error | Please check your input and try again |
| 429 | Too Many Requests | Too many requests. Please slow down. |
| 500 | Server Error | Server error. Please try again later. |

### Using Errors in Components

```typescript
import { getUserFriendlyError } from '@/shared/utils/errorHandler';

export function MomentsScreen() {
  const { data, error, refetch } = useMoments();

  if (error) {
    const errorMessage = getUserFriendlyError(error);
    return (
      <ErrorMessage
        message={errorMessage}
        onRetry={refetch}
      />
    );
  }

  // ... rest of component
}
```

### Handling Mutation Errors

```typescript
import { Alert } from 'react-native';
import { getUserFriendlyError } from '@/shared/utils/errorHandler';

export function CreateMomentForm() {
  const createMoment = useCreateMoment();

  const handleSubmit = async (data: CreateMomentDTO) => {
    try {
      await createMoment.mutateAsync(data);
      Alert.alert('Success', 'Moment created!');
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      Alert.alert('Error', errorMessage);
    }
  };

  // ... form UI
}
```

---

## Retry Logic

### Exponential Backoff

The API client automatically retries failed requests with exponential backoff:

**Configuration:**
```typescript
// src/core/api/client.ts
const retryConfig = {
  retries: 3,                    // Maximum retry attempts
  retryDelay: (retryCount) => {
    return Math.min(1000 * 2 ** retryCount, 30000); // 1s, 2s, 4s, max 30s
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || error.response.status >= 500;
  }
};
```

**Retry Sequence:**
1. Request fails
2. Wait 1 second
3. Retry (attempt 2)
4. If fails, wait 2 seconds
5. Retry (attempt 3)
6. If fails, wait 4 seconds
7. Retry (attempt 4)
8. If still fails, throw error

**Not retried:**
- ❌ 400 Bad Request
- ❌ 401 Unauthorized (triggers token refresh instead)
- ❌ 403 Forbidden
- ❌ 404 Not Found
- ❌ 422 Validation Error

**Retried:**
- ✅ Network errors (no internet, timeout)
- ✅ 500 Internal Server Error
- ✅ 502 Bad Gateway
- ✅ 503 Service Unavailable
- ✅ 504 Gateway Timeout

---

## Request/Response Interceptors

### Request Interceptor

**Purpose:** Add JWT token to all requests

```typescript
// src/core/api/client.ts
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await tokenManager.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Response Interceptor

**Purpose:** Handle token refresh on 401 errors

```typescript
// src/core/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const newTokens = await tokenManager.refreshTokens();

        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await tokenManager.clearTokens();
        // Redirect to login (handled by auth store)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Mock Mode

When `EXPO_PUBLIC_USE_MOCK_DATA=true`, repositories use mock implementations instead of API calls:

### Mock Repository Example

```typescript
// src/features/moments/api/mockRepository.ts
import { mockStorage } from '@/core/mock/storage/mockStorage';
import type { MomentRepository } from '../types';

export const mockMomentRepository: MomentRepository = {
  getAll: async (filters?: MomentFilters): Promise<Moment[]> => {
    // Simulate network delay (200-800ms)
    await new Promise(resolve =>
      setTimeout(resolve, 200 + Math.random() * 600)
    );

    return mockStorage.getAllMoments(filters);
  },

  getById: async (id: string): Promise<Moment> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStorage.getMomentById(id);
  },

  create: async (data: CreateMomentDTO): Promise<Moment> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockStorage.createMoment(data);
  },

  // ... other methods
};
```

### Switching Between Modes

**Automatic Selection:**
```typescript
// src/core/repositories/RepositoryProvider.tsx
import { MOCK_CONFIG } from '@/shared/constants/config';
import { backendMomentRepository } from '@/features/moments/api/backendRepository';
import { mockMomentRepository } from '@/features/moments/api/mockRepository';

const repositories = {
  moment: MOCK_CONFIG.enabled
    ? mockMomentRepository
    : backendMomentRepository,
};
```

**No code changes needed** - just toggle the environment variable!

---

## Type Safety

### Generic Type Parameters

All API client methods support TypeScript generics:

```typescript
// Typed GET request
const moments = await apiClient.get<Moment[]>('/moments');
// moments is typed as Moment[]

// Typed POST request
const newMoment = await apiClient.post<Moment, CreateMomentDTO>(
  '/moments',
  { title: 'Date Night', date: '2026-01-03' }
);
// newMoment is typed as Moment
```

### Type Inference in Repositories

```typescript
export const backendMomentRepository: MomentRepository = {
  // Return type inferred from interface
  getAll: async (filters?) => {
    return apiClient.get<Moment[]>('/moments', { params: filters });
  },

  // TypeScript ensures we return Promise<Moment>
  getById: async (id: string) => {
    return apiClient.get<Moment>(`/moments/${id}`);
  }
};
```

---

## Configuration

### Base URL

**Environment Variable:**
```bash
# .env
EXPO_PUBLIC_BACKEND_URL=https://api.smushy.app
```

**Usage:**
```typescript
// src/core/api/client.ts
import Constants from 'expo-constants';

const apiClient = axios.create({
  baseURL: Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Timeout

**Default:** 15 seconds

**Override per request:**
```typescript
await apiClient.get('/slow-endpoint', {
  timeout: 30000 // 30 seconds
});
```

---

## Best Practices

### ✅ DO

- **Use repositories** - Never call `apiClient` directly from components
- **Handle errors** - Always use `getUserFriendlyError()` for UI messages
- **Type your responses** - Use generics: `apiClient.get<Type>(...)`
- **Use TanStack Query** - Let it handle caching and refetching
- **Test both modes** - Test features in mock and backend modes

### ❌ DON'T

- **Don't call API directly from components**
  ```typescript
  // ❌ BAD
  const data = await apiClient.get('/moments');

  // ✅ GOOD
  const { data } = useMoments(); // Uses repository + TanStack Query
  ```

- **Don't store tokens in plain state**
  ```typescript
  // ❌ BAD
  const [token, setToken] = useState(accessToken);

  // ✅ GOOD
  // TokenManager handles secure storage in AsyncStorage
  ```

- **Don't manually refresh tokens**
  ```typescript
  // ❌ BAD
  if (isTokenExpired()) {
    await refreshToken();
  }

  // ✅ GOOD
  // Response interceptor handles this automatically
  ```

---

## Debugging

### Enable Request Logging

```typescript
// src/core/api/client.ts
apiClient.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.config?.url, error.message);
    return Promise.reject(error);
  }
);
```

### View Network Requests

**React Native Debugger:**
1. Open React Native Debugger
2. Go to Network tab
3. See all HTTP requests/responses

**Expo DevTools:**
1. Press `m` in Expo CLI
2. View logs in browser console

---

## Testing

### Mocking API Client

```typescript
// src/features/moments/api/useMoments.test.ts
import { apiClient } from '@/core/api/client';

jest.mock('@/core/api/client');

describe('useMoments', () => {
  it('fetches moments successfully', async () => {
    const mockMoments = [{ id: '1', title: 'Date Night' }];

    (apiClient.get as jest.Mock).mockResolvedValue(mockMoments);

    const { result } = renderHook(() => useMoments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockMoments);
  });
});
```

---

## Related Documentation

- **Repository Pattern:** [../guides/CONTRIBUTING.md](../guides/CONTRIBUTING.md)
- **TanStack Query Hooks:** [../guides/CONTRIBUTING.md](../guides/CONTRIBUTING.md)
- **Error Handling:** [../guides/CONTRIBUTING.md](../guides/CONTRIBUTING.md)
- **Authentication:** [../features/AUTH.md](../features/AUTH.md)
- **Architecture Overview:** [../../CLAUDE.md](../../CLAUDE.md)

---

## Summary

The REST API client provides:

✅ **Automatic JWT authentication** - Tokens added to all requests
✅ **Automatic token refresh** - Transparent to the user
✅ **Intelligent retry logic** - Exponential backoff for transient errors
✅ **Type-safe requests** - Full TypeScript support
✅ **Dual-mode support** - Switch between mock and backend instantly
✅ **Centralized error handling** - User-friendly error messages
✅ **Production-ready** - Battle-tested patterns and best practices

**Use it through repositories** - never directly from components!
