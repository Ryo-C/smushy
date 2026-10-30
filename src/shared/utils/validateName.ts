export const NAME_RULES = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
} as const;

export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();

  return (
    trimmedName.length >= NAME_RULES.MIN_LENGTH &&
    trimmedName.length <= NAME_RULES.MAX_LENGTH
  );
}

export function getNameError(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }

  const trimmedName = name.trim();

  if (trimmedName.length < NAME_RULES.MIN_LENGTH) {
    return `Name must be at least ${NAME_RULES.MIN_LENGTH} characters`;
  }

  if (trimmedName.length > NAME_RULES.MAX_LENGTH) {
    return `Name must be less than ${NAME_RULES.MAX_LENGTH} characters`;
  }

  return null;
}
