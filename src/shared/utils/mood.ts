export type Mood = 'great' | 'good' | 'okay' | 'stressed' | 'struggling';

export const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'stressed', emoji: '😮‍💨', label: 'Stressed' },
  { value: 'struggling', emoji: '😔', label: 'Struggling' },
];

export function getMoodEmoji(mood?: Mood): string {
  return MOOD_OPTIONS.find((option) => option.value === mood)?.emoji ?? '💬';
}
