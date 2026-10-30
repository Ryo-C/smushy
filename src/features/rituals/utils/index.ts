import type { Ritual } from '../types';

export const RITUAL_ICONS = [
  'coffee',
  'sun',
  'moon',
  'heart',
  'shopping-bag',
  'book-open',
  'music',
  'film',
  'home',
  'map',
  'feather',
  'star',
  'gift',
  'umbrella',
  'repeat',
] as const;

export type RitualIcon = (typeof RITUAL_ICONS)[number];

const FREQUENCY_ICON: Record<Ritual['frequency'], RitualIcon> = {
  daily: 'sun',
  weekly: 'repeat',
  biweekly: 'repeat',
  monthly: 'heart',
};

export function getRitualIcon(ritual: Pick<Ritual, 'icon' | 'frequency'>): RitualIcon {
  const icon = RITUAL_ICONS.find((name) => name === ritual.icon);
  return icon ?? FREQUENCY_ICON[ritual.frequency];
}

export const REMINDER_OPTIONS = [
  { minutes: 120, label: '2h before', short: '2h' },
  { minutes: 720, label: '12h before', short: '12h' },
  { minutes: 1440, label: '1 day before', short: '1d' },
] as const;

export function formatReminder(
  minutes?: number,
  style: 'label' | 'short' = 'label'
): string {
  const option = REMINDER_OPTIONS.find((o) => o.minutes === minutes);
  if (option) return option[style];
  if (!minutes) return '';
  const hours = Math.round(minutes / 60);
  return style === 'short' ? `${hours}h` : `${hours}h before`;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const parseTime = (time?: string): [number, number] => {
  const [h, m] = (time ?? '09:00').split(':').map(Number);
  return [h || 0, m || 0];
};

export function getNextOccurrence(ritual: Ritual, now: Date = new Date()): Date {
  const [hours, minutes] = parseTime(ritual.time);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  switch (ritual.frequency) {
    case 'daily':
      if (next <= now) next.setDate(next.getDate() + 1);
      return next;
    case 'weekly':
    case 'biweekly': {
      const target = ritual.day_of_week ?? 0;
      next.setDate(next.getDate() + ((target - next.getDay() + 7) % 7));
      if (next <= now) next.setDate(next.getDate() + 7);
      return next;
    }
    case 'monthly': {
      const day = ritual.day_of_month ?? 1;
      next.setDate(day);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1, day);
      }
      return next;
    }
  }
}

export function formatSchedule(
  ritual: Pick<Ritual, 'frequency' | 'time' | 'day_of_week' | 'day_of_month'>
): string {
  const [hours, minutes] = parseTime(ritual.time);
  const time = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  switch (ritual.frequency) {
    case 'daily':
      return `Every day · ${time}`;
    case 'weekly':
      return `Every ${WEEKDAYS[ritual.day_of_week ?? 0]} · ${time}`;
    case 'biweekly':
      return `Every other ${WEEKDAYS[ritual.day_of_week ?? 0]} · ${time}`;
    case 'monthly':
      return `Monthly on the ${ordinal(ritual.day_of_month ?? 1)} · ${time}`;
  }
}

export function formatNext(next: Date, now: Date = new Date()): string {
  const startOf = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(next) - startOf(now)) / 86_400_000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return next.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function isDoneToday(ritual: Ritual, now: Date = new Date()): boolean {
  if (!ritual.last_completed) return false;
  return new Date(ritual.last_completed).toDateString() === now.toDateString();
}

function ordinal(n: number): string {
  const suffix =
    n % 10 === 1 && n !== 11
      ? 'st'
      : n % 10 === 2 && n !== 12
        ? 'nd'
        : n % 10 === 3 && n !== 13
          ? 'rd'
          : 'th';
  return `${n}${suffix}`;
}
