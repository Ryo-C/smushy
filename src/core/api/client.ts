import { BACKEND_CONFIG, MOCK_CONFIG } from '@/shared/constants/config';
import { getToken, refreshToken, removeTokens } from './tokenManager';
import { handleBackendError, shouldRetryError, ApiError } from './errorHandler';
import type { RequestOptions } from './types';

const MAX_RETRIES = 2;

const BASE_RETRY_DELAY = 1000;

/** Flag to prevent concurrent token refreshes */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export interface ApiClient {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T>;
  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T>;
  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}

interface RequestConfig extends RequestInit {
  endpoint: string;
  skipAuth?: boolean;
  timeout?: number;
}

async function executeRequest<T>(config: RequestConfig): Promise<T> {
  const { endpoint, skipAuth, timeout, ...fetchConfig } = config;

  const url = `${BACKEND_CONFIG.baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = timeout
    ? setTimeout(() => controller.abort(), timeout)
    : null;

  try {
    let token: string | null = null;
    if (!skipAuth) {
      token = await getToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...( fetchConfig.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (MOCK_CONFIG.enableLogs && __DEV__) {
      console.log(`[API] ${fetchConfig.method} ${endpoint}`);
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
      signal: controller.signal,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return await handleResponse<T>(response);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    throw handleBackendError(error);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: any;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw {
      statusCode: response.status,
      message: data?.message || response.statusText,
      error: data?.error,
      validation: data?.validation,
    };
  }

  return data as T;
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: any,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = BACKEND_CONFIG.timeout, ...restOptions } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await executeRequest<T>({
        method,
        endpoint,
        body: body ? JSON.stringify(body) : undefined,
        timeout,
        ...restOptions,
      });
    } catch (error) {
      lastError = error;

      if (error instanceof ApiError && error.statusCode === 401) {
        try {
          // Prevent concurrent refresh attempts
          if (isRefreshing && refreshPromise) {
            await refreshPromise;
          } else {
            isRefreshing = true;
            refreshPromise = refreshToken();
            await refreshPromise;
            refreshPromise = null;
            isRefreshing = false;
          }

          continue;
        } catch (refreshError) {
          await removeTokens();
          throw error;
        }
      }

      if (shouldRetryError(error) && attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
        continue;
      }

      throw error;
    }

    attempt++;
  }

  throw lastError;
}

export const apiClient: ApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('GET', endpoint, undefined, options),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>('POST', endpoint, body, options),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>('PUT', endpoint, body, options),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>('PATCH', endpoint, body, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, undefined, options),
};
