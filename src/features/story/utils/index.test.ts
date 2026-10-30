import {
  groupStoryByMonth,
  findThrowback,
  getMoodEmoji,
  getStoryYears,
  applyStoryView,
} from './index';
import type { StoryItem } from '../types';

const item = (overrides: Partial<StoryItem>): StoryItem => ({
  id: 'moment:m',
  type: 'moment',
  source_id: 'm',
  date: '2024-01-01T00:00:00Z',
  author_name: 'Ryo',
  is_mine: true,
  ...overrides,
});

describe('groupStoryByMonth', () => {
  it('groups consecutive items by month, keeping order', () => {
    const sections = groupStoryByMonth([
      item({ id: 'a', date: '2024-11-15T20:00:00Z' }),
      item({ id: 'b', date: '2024-11-10T21:00:00Z' }),
      item({ id: 'c', date: '2024-10-20T09:00:00Z' }),
    ]);

    expect(sections.map((s) => s.key)).toEqual(['2024-11', '2024-10']);
    expect(sections[0].title).toBe('November 2024');
    expect(sections[0].data.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('returns no sections for no items', () => {
    expect(groupStoryByMonth([])).toEqual([]);
  });
});

describe('findThrowback', () => {
  const today = new Date('2026-10-30T12:00:00Z');

  it('picks a photo moment from the same month in an earlier year', () => {
    const result = findThrowback(
      [
        item({ id: 'market', date: '2024-10-20T09:00:00Z', photo_url: 'x' }),
        item({ id: 'concert', date: '2024-11-15T20:00:00Z', photo_url: 'x' }),
      ],
      today
    );

    expect(result?.item.id).toBe('market');
    expect(result?.yearsAgo).toBe(2);
  });

  it('prefers the closest day, then the most recent year', () => {
    const result = findThrowback(
      [
        item({ id: 'far', date: '2025-10-01T00:00:00Z', photo_url: 'x' }),
        item({ id: 'close-old', date: '2023-10-29T00:00:00Z', photo_url: 'x' }),
        item({ id: 'close-new', date: '2024-10-31T00:00:00Z', photo_url: 'x' }),
      ],
      today
    );

    expect(result?.item.id).toBe('close-new');
  });

  it('ignores this year, check-ins and moments without photos', () => {
    const result = findThrowback(
      [
        item({ id: 'this-year', date: '2026-10-01T00:00:00Z', photo_url: 'x' }),
        item({
          id: 'checkin',
          type: 'checkin',
          date: '2024-10-30T00:00:00Z',
          photo_url: 'x',
        }),
        item({ id: 'no-photo', date: '2024-10-30T00:00:00Z' }),
      ],
      today
    );

    expect(result).toBeNull();
  });
});

describe('getMoodEmoji', () => {
  it('maps moods and falls back when missing', () => {
    expect(getMoodEmoji('great')).toBe('😄');
    expect(getMoodEmoji(undefined)).toBe('💬');
  });
});

describe('getStoryYears', () => {
  it('returns unique years, newest first', () => {
    const years = getStoryYears([
      item({ date: '2024-03-01T00:00:00Z' }),
      item({ date: '2025-01-01T00:00:00Z' }),
      item({ date: '2024-11-01T00:00:00Z' }),
    ]);

    expect(years).toEqual([2025, 2024]);
  });
});

describe('applyStoryView', () => {
  const items = [
    item({ id: 'mid', date: '2024-06-01T00:00:00Z' }),
    item({ id: 'new', date: '2025-01-01T00:00:00Z' }),
    item({ id: 'old', date: '2024-01-01T00:00:00Z' }),
  ];

  it('sorts newest or oldest first', () => {
    expect(applyStoryView(items, null, 'newest').map((i) => i.id)).toEqual([
      'new',
      'mid',
      'old',
    ]);
    expect(applyStoryView(items, null, 'oldest').map((i) => i.id)).toEqual([
      'old',
      'mid',
      'new',
    ]);
  });

  it('filters to one year', () => {
    expect(applyStoryView(items, 2024, 'oldest').map((i) => i.id)).toEqual([
      'old',
      'mid',
    ]);
  });
});
