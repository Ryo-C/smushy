export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
};

export function validatePassword(password: string): boolean {
  return password.length >= PASSWORD_RULES.MIN_LENGTH;
}

export function getPasswordError(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`;
  }

  return null;
}
