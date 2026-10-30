import React from 'react';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';

const THEME_ICON: Record<string, string> = { default: '🪸', serene: '🌊', forest: '🌲' };

/** Cycles the colour theme before signing in; the choice is saved to the account on sign-in. */
export function ThemeSwitcher() {
  const { currentThemeId, setTheme, availableThemes } = useTheme();
  const index = availableThemes.findIndex((theme) => theme.id === currentThemeId);
  const next = availableThemes[(index + 1) % availableThemes.length];

  return (
    <PressableScale
      onPress={() => setTheme(next.id)}
      haptic="selection"
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${availableThemes[index]?.name}. Switch to ${next.name}`}
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
    >
      <Text style={{ fontSize: 18 }}>{THEME_ICON[currentThemeId] ?? '🎨'}</Text>
    </PressableScale>
  );
}
