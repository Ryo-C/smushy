import type { AccentName } from '@/shared/theme';
import type { MomentType } from '../types';

const MOMENT_TYPE_LABEL: Record<MomentType, string> = {
  date: 'Date',
  trip: 'Trip',
  milestone: 'Milestone',
  ritual: 'Ritual',
  anniversary: 'Anniversary',
};

const MOMENT_TYPE_ACCENT: Record<MomentType, AccentName> = {
  date: 'primary',
  trip: 'mist',
  milestone: 'secondary',
  ritual: 'sage',
  anniversary: 'primary',
};

export const MOMENT_TYPES: MomentType[] = [
  'date',
  'trip',
  'milestone',
  'ritual',
  'anniversary',
];

export function getMomentTypeLabel(type: MomentType): string {
  return MOMENT_TYPE_LABEL[type] ?? type;
}

export function getMomentTypeAccent(type: MomentType): AccentName {
  return MOMENT_TYPE_ACCENT[type] ?? 'primary';
}
