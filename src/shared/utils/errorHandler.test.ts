/**
 * Tests for Error Handler Utilities
 */

import { AppError, toAppError, getUserFriendlyError } from './errorHandler';

describe('AppError', () => {
  it('creates error with message', () => {
    const error = new AppError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AppError');
  });

  it('creates error with message and code', () => {
    const error = new AppError('Test error', 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
  });

  it('creates error with message, code, and status code', () => {
    const error = new AppError('Not found', '404', 404);

    expect(error.message).toBe('Not found');
    expect(error.code).toBe('404');
    expect(error.statusCode).toBe(404);
  });

  it('extends Error class', () => {
    const error = new AppError('Test error');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });
});

describe('toAppError', () => {
  describe('AppError input', () => {
    it('returns same instance if already AppError', () => {
      const original = new AppError('Test error', 'TEST_CODE', 400);
      const result = toAppError(original);

      expect(result).toBe(original);
      expect(result.message).toBe('Test error');
      expect(result.code).toBe('TEST_CODE');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('Error input', () => {
    it('converts standard Error to AppError', () => {
      const error = new Error('Standard error');
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Standard error');
      expect(result.code).toBeUndefined();
      expect(result.statusCode).toBeUndefined();
    });

    it('converts TypeError to AppError', () => {
      const error = new TypeError('Type error message');
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Type error message');
    });
  });

  describe('Object with message property', () => {
    it('converts object with message to AppError', () => {
      const error = { message: 'Error message' };
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Error message');
    });

    it('converts object with message and code to AppError', () => {
      const error = { message: 'Error message', code: 'ERR_CODE' };
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Error message');
      expect(result.code).toBe('ERR_CODE');
    });

    it('converts object with statusCode to AppError', () => {
      const error = { message: 'Not found', statusCode: 404 };
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Not found');
      expect(result.statusCode).toBe(404);
    });

    it('converts object with status (alternative) to AppError', () => {
      const error = { message: 'Server error', status: 500 };
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Server error');
      expect(result.statusCode).toBe(500);
    });

    it('uses default message if message is empty', () => {
      const error = { message: '' };
      const result = toAppError(error);

      expect(result.message).toBe('An error occurred');
    });

    it('handles object with all properties', () => {
      const error = {
        message: 'Full error',
        code: 'FULL_CODE',
        statusCode: 400,
      };
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Full error');
      expect(result.code).toBe('FULL_CODE');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('Unknown input types', () => {
    it('converts string to AppError', () => {
      const error = 'String error';
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('converts number to AppError', () => {
      const error = 404;
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('converts null to AppError', () => {
      const error = null;
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('converts undefined to AppError', () => {
      const error = undefined;
      const result = toAppError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });
});

describe('getUserFriendlyError', () => {
  describe('Common error codes', () => {
    it('returns friendly message for duplicate key error (23505)', () => {
      const error = new AppError('Duplicate key', '23505');
      expect(getUserFriendlyError(error)).toBe('This item already exists');
    });

    it('returns friendly message for foreign key violation (23503)', () => {
      const error = new AppError('Foreign key violation', '23503');
      expect(getUserFriendlyError(error)).toBe('Referenced item not found');
    });

    it('returns friendly message for permission denied (42501)', () => {
      const error = new AppError('Permission denied', '42501');
      expect(getUserFriendlyError(error)).toBe('You do not have permission to perform this action');
    });

    it('returns friendly message for no data found (PGRST116)', () => {
      const error = new AppError('No rows returned', 'PGRST116');
      expect(getUserFriendlyError(error)).toBe('No data found');
    });

    it('returns friendly message for invalid request (PGRST301)', () => {
      const error = new AppError('Invalid parameters', 'PGRST301');
      expect(getUserFriendlyError(error)).toBe('Invalid request parameters');
    });
  });

  describe('Unknown error codes', () => {
    it('returns original message for unknown error code', () => {
      const error = new AppError('Custom error message', 'UNKNOWN_CODE');
      expect(getUserFriendlyError(error)).toBe('Custom error message');
    });

    it('returns original message when no error code', () => {
      const error = new AppError('No code error');
      expect(getUserFriendlyError(error)).toBe('No code error');
    });
  });

  describe('Converting unknown errors', () => {
    it('converts standard Error to friendly message', () => {
      const error = new Error('Standard error');
      expect(getUserFriendlyError(error)).toBe('Standard error');
    });

    it('converts unknown error to friendly message', () => {
      const error = 'String error';
      expect(getUserFriendlyError(error)).toBe('An unexpected error occurred');
    });

    it('handles object with message and recognized code', () => {
      const error = { message: 'Duplicate', code: '23505' };
      expect(getUserFriendlyError(error)).toBe('This item already exists');
    });
  });

  describe('Edge cases', () => {
    it('handles null error', () => {
      expect(getUserFriendlyError(null)).toBe('An unexpected error occurred');
    });

    it('handles undefined error', () => {
      expect(getUserFriendlyError(undefined)).toBe('An unexpected error occurred');
    });

    it('prefers mapped message over original for known codes', () => {
      const error = new AppError('Technical DB message', '23505');
      const result = getUserFriendlyError(error);

      expect(result).toBe('This item already exists');
      expect(result).not.toBe('Technical DB message');
    });
  });
});
