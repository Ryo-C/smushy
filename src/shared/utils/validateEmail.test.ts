/**
 * Tests for Email Validation Utility
 */

import { validateEmail, getEmailError } from './validateEmail';

describe('validateEmail', () => {
  describe('Valid email addresses', () => {
    it('should validate standard email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('should validate email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should validate email with numbers', () => {
      expect(validateEmail('user123@example123.com')).toBe(true);
    });

    it('should validate email with dots in local part', () => {
      expect(validateEmail('first.last@example.com')).toBe(true);
    });

    it('should validate email with hyphens in domain', () => {
      expect(validateEmail('user@my-company.com')).toBe(true);
    });

    it('should validate email with underscores', () => {
      expect(validateEmail('user_name@example.com')).toBe(true);
    });
  });

  describe('Invalid email addresses', () => {
    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should reject email without @ symbol', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email without local part', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should reject email without TLD', () => {
      expect(validateEmail('user@example')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('user@ example.com')).toBe(false);
      expect(validateEmail('user@example .com')).toBe(false);
    });

    it('should reject email with multiple @ symbols', () => {
      expect(validateEmail('user@@example.com')).toBe(false);
      expect(validateEmail('user@domain@example.com')).toBe(false);
    });


    it('should reject plain text', () => {
      expect(validateEmail('not an email')).toBe(false);
    });
  });
});

describe('getEmailError', () => {
  describe('Valid emails return null', () => {
    it('should return null for valid email', () => {
      expect(getEmailError('user@example.com')).toBeNull();
    });

    it('should return null for valid email with subdomain', () => {
      expect(getEmailError('user@mail.example.com')).toBeNull();
    });

    it('should return null for valid email with plus sign', () => {
      expect(getEmailError('user+tag@example.com')).toBeNull();
    });
  });

  describe('Invalid emails return error messages', () => {
    it('should return error for empty string', () => {
      expect(getEmailError('')).toBe('Email is required');
    });

    it('should return error for invalid format', () => {
      expect(getEmailError('invalid')).toBe('Please enter a valid email address');
    });

    it('should return error for email without @', () => {
      expect(getEmailError('userexample.com')).toBe('Please enter a valid email address');
    });

    it('should return error for email without domain', () => {
      expect(getEmailError('user@')).toBe('Please enter a valid email address');
    });

    it('should return error for email with spaces', () => {
      expect(getEmailError('user @example.com')).toBe('Please enter a valid email address');
    });
  });

  describe('Error messages', () => {
    it('should prioritize "required" message over "invalid" message', () => {
      const emptyError = getEmailError('');
      expect(emptyError).toBe('Email is required');
      expect(emptyError).not.toBe('Please enter a valid email address');
    });

    it('should return appropriate message for invalid format', () => {
      expect(getEmailError('invalid')).toBe('Please enter a valid email address');
    });
  });
});
