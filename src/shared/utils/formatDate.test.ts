/**
 * Tests for Date Formatting Utilities
 */

import {
  formatDate,
  formatMomentDate,
  formatTime,
  formatRelativeTime,
} from './formatDate';

describe('formatDate', () => {
  it('formats Date object to short date string', () => {
    const date = new Date('2024-01-15T10:30:00');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('formats ISO date string to short date string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });

  it('formats different months correctly', () => {
    expect(formatDate('2024-02-28')).toBe('Feb 28, 2024');
    expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
  });

  it('handles leap year dates', () => {
    expect(formatDate('2024-02-29')).toBe('Feb 29, 2024');
  });

  it('formats dates with different years', () => {
    expect(formatDate('2023-06-15')).toContain('2023');
    expect(formatDate('2025-06-15')).toContain('2025');
  });
});

describe('formatMomentDate', () => {
  beforeEach(() => {
    // Mock current date to get consistent results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Today" for current date', () => {
    const today = new Date('2024-01-15T10:00:00');
    expect(formatMomentDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for previous day', () => {
    const yesterday = new Date('2024-01-14T10:00:00');
    expect(formatMomentDate(yesterday)).toBe('Yesterday');
  });

  it('returns weekday name for dates within past week', () => {
    const threeDaysAgo = new Date('2024-01-12T10:00:00');
    const result = formatMomentDate(threeDaysAgo);
    expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  });

  it('returns short date for dates older than 7 days', () => {
    const eightDaysAgo = new Date('2024-01-07T10:00:00');
    expect(formatMomentDate(eightDaysAgo)).toBe('Jan 7');
  });

  it('handles string date input', () => {
    const yesterday = '2024-01-14';
    expect(formatMomentDate(yesterday)).toBe('Yesterday');
  });

  it('handles Date object input', () => {
    const today = new Date('2024-01-15T08:00:00');
    expect(formatMomentDate(today)).toBe('Today');
  });
});

describe('formatTime', () => {
  it('formats time in 12-hour format', () => {
    const date = new Date('2024-01-15T14:30:00');
    expect(formatTime(date)).toBe('2:30 PM');
  });

  it('formats morning time correctly', () => {
    const date = new Date('2024-01-15T09:15:00');
    expect(formatTime(date)).toBe('9:15 AM');
  });

  it('formats midnight correctly', () => {
    const date = new Date('2024-01-15T00:00:00');
    expect(formatTime(date)).toBe('12:00 AM');
  });

  it('formats noon correctly', () => {
    const date = new Date('2024-01-15T12:00:00');
    expect(formatTime(date)).toBe('12:00 PM');
  });

  it('handles string date input', () => {
    expect(formatTime('2024-01-15T14:30:00')).toBe('2:30 PM');
  });

  it('pads minutes with zero', () => {
    const date = new Date('2024-01-15T14:05:00');
    expect(formatTime(date)).toBe('2:05 PM');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Just now" for dates less than 1 minute ago', () => {
    const now = new Date('2024-01-15T12:00:00');
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('returns minutes ago for dates within past hour', () => {
    const fiveMinutesAgo = new Date('2024-01-15T11:55:00');
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('returns singular "minute" for 1 minute ago', () => {
    const oneMinuteAgo = new Date('2024-01-15T11:59:00');
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('returns hours ago for dates within past day', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00');
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  it('returns singular "hour" for 1 hour ago', () => {
    const oneHourAgo = new Date('2024-01-15T11:00:00');
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
  });

  it('returns days ago for dates within past week', () => {
    const threeDaysAgo = new Date('2024-01-12T12:00:00');
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
  });

  it('returns singular "day" for 1 day ago', () => {
    const oneDayAgo = new Date('2024-01-14T12:00:00');
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });

  it('returns formatted date for dates older than 7 days', () => {
    const eightDaysAgo = new Date('2024-01-07T12:00:00');
    expect(formatRelativeTime(eightDaysAgo)).toBe('Jan 7, 2024');
  });

  it('handles string date input', () => {
    const fiveMinutesAgo = '2024-01-15T11:55:00';
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('handles Date object input', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00');
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });
});
