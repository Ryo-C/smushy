import {
  getNextOccurrence,
  formatSchedule,
  formatNext,
  formatReminder,
  isDoneToday,
} from './index';
import type { Ritual } from '../types';

const ritual = (overrides: Partial<Ritual>): Ritual => ({
  id: 'r',
  title: 'Ritual',
  frequency: 'daily',
  time: '09:00',
  is_active: true,
  user_id: 'u',
  reminder_enabled: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Friday 30 Oct 2026, 12:00 local
const now = new Date(2026, 9, 30, 12, 0);

describe('getNextOccurrence', () => {
  it('daily: tomorrow when today has passed, today when it has not', () => {
    expect(getNextOccurrence(ritual({ time: '07:00' }), now)).toEqual(
      new Date(2026, 9, 31, 7, 0)
    );
    expect(getNextOccurrence(ritual({ time: '22:00' }), now)).toEqual(
      new Date(2026, 9, 30, 22, 0)
    );
  });

  it('weekly: the next matching weekday', () => {
    // Sunday
    expect(
      getNextOccurrence(ritual({ frequency: 'weekly', day_of_week: 0 }), now)
    ).toEqual(new Date(2026, 10, 1, 9, 0));
    // Friday, already passed today -> next week
    expect(
      getNextOccurrence(ritual({ frequency: 'weekly', day_of_week: 5 }), now)
    ).toEqual(new Date(2026, 10, 6, 9, 0));
  });

  it('monthly: this month if still ahead, otherwise next month', () => {
    expect(
      getNextOccurrence(ritual({ frequency: 'monthly', day_of_month: 15 }), now)
    ).toEqual(new Date(2026, 10, 15, 9, 0));
    expect(
      getNextOccurrence(ritual({ frequency: 'monthly', day_of_month: 31 }), now)
    ).toEqual(new Date(2026, 9, 31, 9, 0));
  });
});

describe('formatSchedule', () => {
  it('describes each frequency', () => {
    expect(formatSchedule(ritual({ time: '07:00' }))).toBe('Every day · 7:00 AM');
    expect(formatSchedule(ritual({ frequency: 'weekly', day_of_week: 0 }))).toBe(
      'Every Sunday · 9:00 AM'
    );
    expect(
      formatSchedule(ritual({ frequency: 'monthly', day_of_month: 22, time: '18:30' }))
    ).toBe('Monthly on the 22nd · 6:30 PM');
  });
});

describe('formatNext', () => {
  it('uses Today / Tomorrow, then a short date', () => {
    expect(formatNext(new Date(2026, 9, 30, 20, 0), now)).toBe('Today');
    expect(formatNext(new Date(2026, 9, 31, 7, 0), now)).toBe('Tomorrow');
    expect(formatNext(new Date(2026, 10, 15, 9, 0), now)).toBe('Sun 15 Nov');
  });
});

describe('isDoneToday', () => {
  it('checks last_completed against today', () => {
    expect(
      isDoneToday(
        ritual({ last_completed: new Date(2026, 9, 30, 8, 0).toISOString() }),
        now
      )
    ).toBe(true);
    expect(
      isDoneToday(
        ritual({ last_completed: new Date(2026, 9, 29, 8, 0).toISOString() }),
        now
      )
    ).toBe(false);
    expect(isDoneToday(ritual({}), now)).toBe(false);
  });
});

describe('formatReminder', () => {
  it('labels the preset options', () => {
    expect(formatReminder(120)).toBe('2h before');
    expect(formatReminder(720, 'short')).toBe('12h');
    expect(formatReminder(1440)).toBe('1 day before');
  });

  it('falls back to hours for other values', () => {
    expect(formatReminder(180)).toBe('3h before');
    expect(formatReminder(undefined)).toBe('');
  });
});
