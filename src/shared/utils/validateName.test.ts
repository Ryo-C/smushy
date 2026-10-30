/**
 * Tests for Name Validation Utility
 */

import { validateName, getNameError, NAME_RULES } from './validateName';

describe('NAME_RULES', () => {
  it('should define minimum length requirement', () => {
    expect(NAME_RULES.MIN_LENGTH).toBe(2);
  });

  it('should define maximum length requirement', () => {
    expect(NAME_RULES.MAX_LENGTH).toBe(50);
  });
});

describe('validateName', () => {
  describe('Valid names', () => {
    it('should validate name at minimum length', () => {
      const name = 'Jo'; // 2 chars
      expect(validateName(name)).toBe(true);
    });

    it('should validate name at maximum length', () => {
      const name = 'a'.repeat(NAME_RULES.MAX_LENGTH); // Exactly 50 chars
      expect(validateName(name)).toBe(true);
    });

    it('should validate standard names', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Jane Doe')).toBe(true);
      expect(validateName('Mary Ann Smith')).toBe(true);
    });

    it('should validate names with hyphens', () => {
      expect(validateName('Jean-Luc')).toBe(true);
      expect(validateName('Mary-Jane')).toBe(true);
    });

    it('should validate names with apostrophes', () => {
      expect(validateName("O'Brien")).toBe(true);
      expect(validateName("D'Angelo")).toBe(true);
    });

    it('should validate names with special characters', () => {
      expect(validateName('José')).toBe(true);
      expect(validateName('François')).toBe(true);
      expect(validateName('Müller')).toBe(true);
    });

    it('should trim whitespace and validate', () => {
      expect(validateName('  John  ')).toBe(true);
      expect(validateName(' Jane Doe ')).toBe(true);
    });

    it('should validate single word names', () => {
      expect(validateName('Madonna')).toBe(true);
      expect(validateName('Prince')).toBe(true);
    });
  });

  describe('Invalid names', () => {
    it('should reject empty string', () => {
      expect(validateName('')).toBe(false);
    });

    it('should reject single character', () => {
      expect(validateName('J')).toBe(false);
    });

    it('should reject name one char below minimum (after trim)', () => {
      expect(validateName(' J ')).toBe(false); // Trims to "J" (1 char)
    });

    it('should reject name above maximum length', () => {
      const tooLong = 'a'.repeat(NAME_RULES.MAX_LENGTH + 1); // 51 chars
      expect(validateName(tooLong)).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(validateName('   ')).toBe(false);
    });

    it('should reject null (type coercion to string "null")', () => {
      // @ts-expect-error Testing runtime behavior
      expect(validateName(null)).toBe(false);
    });

    it('should reject undefined', () => {
      // @ts-expect-error Testing runtime behavior
      expect(validateName(undefined)).toBe(false);
    });

    it('should reject non-string types', () => {
      // @ts-expect-error Testing runtime behavior
      expect(validateName(123)).toBe(false);
      // @ts-expect-error Testing runtime behavior
      expect(validateName({})).toBe(false);
      // @ts-expect-error Testing runtime behavior
      expect(validateName([])).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle name at exactly minimum length', () => {
      const name = 'ab'; // Exactly 2 chars
      expect(validateName(name)).toBe(true);
    });

    it('should handle name at exactly maximum length', () => {
      const name = 'a'.repeat(50); // Exactly 50 chars
      expect(validateName(name)).toBe(true);
    });

    it('should handle name exactly one char above maximum', () => {
      const name = 'a'.repeat(51); // Exactly 51 chars
      expect(validateName(name)).toBe(false);
    });

    it('should trim before validating length', () => {
      const name = '  ab  '; // Trims to "ab" (2 chars)
      expect(validateName(name)).toBe(true);
    });

    it('should reject if trimmed name is too short', () => {
      const name = '  a  '; // Trims to "a" (1 char)
      expect(validateName(name)).toBe(false);
    });
  });
});

describe('getNameError', () => {
  describe('Valid names return null', () => {
    it('should return null for valid name at minimum length', () => {
      expect(getNameError('Jo')).toBeNull();
    });

    it('should return null for valid name at maximum length', () => {
      const name = 'a'.repeat(NAME_RULES.MAX_LENGTH);
      expect(getNameError(name)).toBeNull();
    });

    it('should return null for standard names', () => {
      expect(getNameError('John Doe')).toBeNull();
      expect(getNameError('Jane Smith')).toBeNull();
    });

    it('should return null for names with special characters', () => {
      expect(getNameError("O'Brien")).toBeNull();
      expect(getNameError('José')).toBeNull();
    });

    it('should return null for names with whitespace (that trim correctly)', () => {
      expect(getNameError('  John  ')).toBeNull();
    });
  });

  describe('Invalid names return error messages', () => {
    it('should return error for empty string', () => {
      expect(getNameError('')).toBe('Name is required');
    });

    it('should return error for whitespace-only string', () => {
      expect(getNameError('   ')).toBe('Name is required');
    });

    it('should return error for name too short', () => {
      expect(getNameError('J')).toBe(
        `Name must be at least ${NAME_RULES.MIN_LENGTH} characters`
      );
    });

    it('should return error for name too long', () => {
      const tooLong = 'a'.repeat(NAME_RULES.MAX_LENGTH + 1);
      expect(getNameError(tooLong)).toBe(
        `Name must be less than ${NAME_RULES.MAX_LENGTH} characters`
      );
    });

    it('should return error for single character after trim', () => {
      expect(getNameError('  J  ')).toBe(
        `Name must be at least ${NAME_RULES.MIN_LENGTH} characters`
      );
    });
  });

  describe('Error messages', () => {
    it('should prioritize "required" message over "too short" message', () => {
      const emptyError = getNameError('');
      expect(emptyError).toBe('Name is required');
      expect(emptyError).not.toContain('must be at least');
    });

    it('should prioritize "required" over "too short" for whitespace', () => {
      const whitespaceError = getNameError('   ');
      expect(whitespaceError).toBe('Name is required');
      expect(whitespaceError).not.toContain('must be at least');
    });

    it('should include minimum length in error message', () => {
      const error = getNameError('J');
      expect(error).toContain(NAME_RULES.MIN_LENGTH.toString());
      expect(error).toBe('Name must be at least 2 characters');
    });

    it('should include maximum length in error message', () => {
      const tooLong = 'a'.repeat(NAME_RULES.MAX_LENGTH + 1);
      const error = getNameError(tooLong);
      expect(error).toContain(NAME_RULES.MAX_LENGTH.toString());
      expect(error).toBe('Name must be less than 50 characters');
    });
  });

  describe('Boundary conditions', () => {
    it('should handle name at exactly minimum length', () => {
      const name = 'ab'; // Exactly 2 chars
      expect(getNameError(name)).toBeNull();
    });

    it('should handle name exactly one char below minimum', () => {
      const name = 'a'; // Exactly 1 char
      expect(getNameError(name)).toBe('Name must be at least 2 characters');
    });

    it('should handle name at exactly maximum length', () => {
      const name = 'a'.repeat(50); // Exactly 50 chars
      expect(getNameError(name)).toBeNull();
    });

    it('should handle name exactly one char above maximum', () => {
      const name = 'a'.repeat(51); // Exactly 51 chars
      expect(getNameError(name)).toBe('Name must be less than 50 characters');
    });
  });

  describe('Whitespace handling', () => {
    it('should trim and validate correctly', () => {
      expect(getNameError('  John  ')).toBeNull();
      expect(getNameError('  Jo  ')).toBeNull();
    });

    it('should return error if trimmed result is too short', () => {
      expect(getNameError('  J  ')).toBe('Name must be at least 2 characters');
    });

    it('should return error if only whitespace', () => {
      expect(getNameError('     ')).toBe('Name is required');
    });
  });
});
