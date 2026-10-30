/**
 * Tests for Password Validation Utility
 */

import {
  validatePassword,
  getPasswordError,
  PASSWORD_RULES,
} from './validatePassword';

describe('PASSWORD_RULES', () => {
  it('should define minimum length requirement', () => {
    expect(PASSWORD_RULES.MIN_LENGTH).toBe(8);
  });
});

describe('validatePassword', () => {
  describe('Valid passwords', () => {
    it('should validate password at minimum length', () => {
      const password = 'a'.repeat(PASSWORD_RULES.MIN_LENGTH);
      expect(validatePassword(password)).toBe(true);
    });

    it('should validate password above minimum length', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('veryLongPassword123!')).toBe(true);
    });

    it('should validate password with special characters', () => {
      expect(validatePassword('pass@123!')).toBe(true);
    });

    it('should validate password with mixed case', () => {
      expect(validatePassword('PassWord123')).toBe(true);
    });

    it('should validate password with spaces (if >= 8 chars)', () => {
      expect(validatePassword('pass word 123')).toBe(true);
    });

    it('should validate very long passwords', () => {
      const longPassword = 'a'.repeat(100);
      expect(validatePassword(longPassword)).toBe(true);
    });
  });

  describe('Invalid passwords', () => {
    it('should reject empty string', () => {
      expect(validatePassword('')).toBe(false);
    });

    it('should reject password shorter than minimum length', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('1234567')).toBe(false); // 7 chars
    });

    it('should reject password exactly one char below minimum', () => {
      const password = 'a'.repeat(PASSWORD_RULES.MIN_LENGTH - 1);
      expect(validatePassword(password)).toBe(false);
    });

    it('should reject single character', () => {
      expect(validatePassword('a')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle password at exactly minimum length', () => {
      const password = '12345678'; // Exactly 8 chars
      expect(validatePassword(password)).toBe(true);
    });

    it('should handle password one char above minimum', () => {
      const password = '123456789'; // Exactly 9 chars
      expect(validatePassword(password)).toBe(true);
    });
  });
});

describe('getPasswordError', () => {
  describe('Valid passwords return null', () => {
    it('should return null for valid password at minimum length', () => {
      const password = 'a'.repeat(PASSWORD_RULES.MIN_LENGTH);
      expect(getPasswordError(password)).toBeNull();
    });

    it('should return null for valid password above minimum length', () => {
      expect(getPasswordError('password123')).toBeNull();
    });

    it('should return null for valid password with special chars', () => {
      expect(getPasswordError('P@ssw0rd!')).toBeNull();
    });
  });

  describe('Invalid passwords return error messages', () => {
    it('should return error for empty string', () => {
      expect(getPasswordError('')).toBe('Password is required');
    });

    it('should return error for password too short', () => {
      expect(getPasswordError('short')).toBe(
        `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`
      );
    });

    it('should return error for password one char below minimum', () => {
      const password = 'a'.repeat(PASSWORD_RULES.MIN_LENGTH - 1);
      expect(getPasswordError(password)).toBe(
        `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`
      );
    });

    it('should return error for single character password', () => {
      expect(getPasswordError('a')).toBe(
        `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`
      );
    });
  });

  describe('Error messages', () => {
    it('should prioritize "required" message over "too short" message', () => {
      const emptyError = getPasswordError('');
      expect(emptyError).toBe('Password is required');
      expect(emptyError).not.toContain('must be at least');
    });

    it('should include minimum length in error message', () => {
      const error = getPasswordError('short');
      expect(error).toContain(PASSWORD_RULES.MIN_LENGTH.toString());
      expect(error).toBe('Password must be at least 8 characters');
    });

    it('should return appropriate message for short password', () => {
      expect(getPasswordError('1234567')).toBe(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('Boundary conditions', () => {
    it('should handle password at exactly minimum length', () => {
      const password = '12345678'; // Exactly 8 chars
      expect(getPasswordError(password)).toBeNull();
    });

    it('should handle password exactly one char below minimum', () => {
      const password = '1234567'; // Exactly 7 chars
      expect(getPasswordError(password)).toBe(
        'Password must be at least 8 characters'
      );
    });
  });
});
