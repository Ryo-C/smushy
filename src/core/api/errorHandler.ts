import type { ApiErrorResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public validationErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function handleBackendError(error: unknown): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      'Network error. Please check your internet connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new ApiError(
      'Request timeout. Please try again.',
      0,
      'TIMEOUT_ERROR'
    );
  }

  if (error && typeof error === 'object' && 'statusCode' in error) {
    const err = error as ApiErrorResponse;

    return new ApiError(
      err.message || getDefaultErrorMessage(err.statusCode),
      err.statusCode,
      err.error,
      err.validation
    );
  }

  return new ApiError(
    'An unexpected error occurred. Please try again.',
    500,
    'UNKNOWN_ERROR'
  );
}

function getDefaultErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please sign in again.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return 'Resource not found.';
    case 409:
      return 'This resource already exists.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please slow down.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

export function shouldRetryError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      return true;
    }

    if (error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }
  }

  return false;
}

export function getValidationErrors(
  error: unknown
): Record<string, string> | null {
  if (error instanceof ApiError && error.validationErrors) {
    const flattened: Record<string, string> = {};

    for (const [field, messages] of Object.entries(error.validationErrors)) {
      if (messages && messages.length > 0) {
        flattened[field] = messages[0];
      }
    }

    return flattened;
  }

  return null;
}
