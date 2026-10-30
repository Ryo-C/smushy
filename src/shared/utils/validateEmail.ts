export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getEmailError(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }

  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}
