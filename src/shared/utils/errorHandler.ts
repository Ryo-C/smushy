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

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as any;
    return new AppError(
      err.message || 'An error occurred',
      err.code,
      err.statusCode || err.status
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred');
}

export function getUserFriendlyError(error: unknown): string {
  const appError = toAppError(error);

  const errorMessages: Record<string, string> = {
    '23505': 'This item already exists',
    '23503': 'Referenced item not found',
    '42501': 'You do not have permission to perform this action',
    'PGRST116': 'No data found',
    'PGRST301': 'Invalid request parameters',
  };

  if (appError.code && errorMessages[appError.code]) {
    return errorMessages[appError.code];
  }

  return appError.message;
}
