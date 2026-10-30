import type { StoryItem, StoryOrder, StorySection, StoryThrowback } from '../types';

export { getMoodEmoji } from '@/shared/utils/mood';

export function getStoryYears(items: StoryItem[]): number[] {
  const years = new Set(items.map((item) => new Date(item.date).getUTCFullYear()));
  return [...years].sort((a, b) => b - a);
}

export function applyStoryView(
  items: StoryItem[],
  year: number | null,
  order: StoryOrder
): StoryItem[] {
  const filtered =
    year === null
      ? items
      : items.filter((item) => new Date(item.date).getUTCFullYear() === year);
  const direction = order === 'newest' ? -1 : 1;

  return [...filtered].sort(
    (a, b) => direction * (new Date(a.date).getTime() - new Date(b.date).getTime())
  );
}

export function groupStoryByMonth(items: StoryItem[]): StorySection[] {
  const sections: StorySection[] = [];

  for (const item of items) {
    const date = new Date(item.date);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const last = sections[sections.length - 1];

    if (last && last.key === key) {
      last.data.push(item);
    } else {
      sections.push({
        key,
        title: date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }),
        data: [item],
      });
    }
  }

  return sections;
}

export function findThrowback(
  items: StoryItem[],
  today: Date = new Date()
): StoryThrowback | null {
  const month = today.getUTCMonth();
  const year = today.getUTCFullYear();
  const day = today.getUTCDate();

  const candidates = items.filter((item) => {
    const date = new Date(item.date);
    return (
      item.type === 'moment' &&
      !!item.photo_url &&
      date.getUTCMonth() === month &&
      date.getUTCFullYear() < year
    );
  });

  if (candidates.length === 0) {
    return null;
  }

  const distance = (item: StoryItem): number =>
    Math.abs(new Date(item.date).getUTCDate() - day);
  const best = candidates.reduce((a, b) => {
    if (distance(a) !== distance(b)) return distance(a) < distance(b) ? a : b;
    return new Date(a.date) > new Date(b.date) ? a : b;
  });

  return { item: best, yearsAgo: year - new Date(best.date).getUTCFullYear() };
}
