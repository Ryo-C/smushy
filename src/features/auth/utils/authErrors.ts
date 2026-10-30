export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  EMAIL_EXISTS_OAUTH: 'This email is already linked to {provider}. Sign in with {provider} instead?',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',

  INVALID_TOKEN: 'This link has expired or is invalid. Please request a new one.',
  EXPIRED_TOKEN: 'This link has expired. Please request a new one.',

  OAUTH_CANCELLED: 'Sign in was cancelled.',
  OAUTH_FAILED: 'Could not complete sign in. Please try again.',

  LINKING_DECLINED: 'Account linking was cancelled.',
  CANNOT_UNLINK_LAST_PROVIDER: 'You must have at least one sign-in method.',
  PROVIDER_ALREADY_LINKED: 'This {provider} account is already linked.',

  NETWORK_ERROR: 'Connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',

  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  EMAIL_EXISTS_OAUTH: 'EMAIL_EXISTS_OAUTH',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  OAUTH_CANCELLED: 'OAUTH_CANCELLED',
  OAUTH_FAILED: 'OAUTH_FAILED',
  LINKING_DECLINED: 'LINKING_DECLINED',
  CANNOT_UNLINK_LAST_PROVIDER: 'CANNOT_UNLINK_LAST_PROVIDER',
  PROVIDER_ALREADY_LINKED: 'PROVIDER_ALREADY_LINKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type AuthErrorCode = keyof typeof ERROR_CODES;

export function getAuthErrorMessage(
  code: string,
  context?: { provider?: string }
): string {
  const errorCode = code as AuthErrorCode;

  if (errorCode in AUTH_ERRORS) {
    let message: string = AUTH_ERRORS[errorCode];

    if (context?.provider) {
      message = message.replace(/{provider}/g, formatProviderName(context.provider));
    }

    return message;
  }

  return AUTH_ERRORS.UNKNOWN_ERROR;
}

function formatProviderName(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'google':
      return 'Google';
    case 'apple':
      return 'Apple';
    case 'email':
      return 'Email';
    default:
      return provider;
  }
}

export function extractErrorCode(error: unknown): string {
  if (!error) {
    return ERROR_CODES.UNKNOWN_ERROR;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    if (err.code && typeof err.code === 'string') {
      return err.code;
    }

    if (err.response?.data?.code) {
      return err.response.data.code;
    }

    if (err.response?.status === 401) {
      return ERROR_CODES.INVALID_CREDENTIALS;
    }

    if (err.response?.status === 409) {
      return ERROR_CODES.EMAIL_ALREADY_EXISTS;
    }

    if (err.response?.status >= 500) {
      return ERROR_CODES.SERVER_ERROR;
    }

    if (err.message?.toLowerCase().includes('network')) {
      return ERROR_CODES.NETWORK_ERROR;
    }

    if (err.message?.toLowerCase().includes('timeout')) {
      return ERROR_CODES.TIMEOUT_ERROR;
    }
  }

  return ERROR_CODES.UNKNOWN_ERROR;
}

export function handleAuthError(
  error: unknown,
  context?: { provider?: string }
): string {
  const code = extractErrorCode(error);
  return getAuthErrorMessage(code, context);
}
