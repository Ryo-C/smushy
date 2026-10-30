import type { Theme } from '@/shared/theme';

export function getThemedStyles(theme: Theme) {
  return {
    bg: (type: 'background' | 'surface' | 'surfaceVariant' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info') => {
      const colorMap = {
        background: theme.colors.background,
        surface: theme.colors.surface,
        surfaceVariant: theme.colors.surfaceVariant,
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        error: theme.colors.error,
        success: theme.colors.success,
        warning: theme.colors.warning,
        info: theme.colors.info,
      };
      return { backgroundColor: colorMap[type] };
    },

    text: (type: 'primary' | 'secondary' | 'disabled' | 'inverse' | 'error' | 'success' | 'warning' | 'info') => {
      const colorMap = {
        primary: theme.colors.text.primary,
        secondary: theme.colors.text.secondary,
        disabled: theme.colors.text.disabled,
        inverse: theme.colors.text.inverse,
        error: theme.colors.error,
        success: theme.colors.success,
        warning: theme.colors.warning,
        info: theme.colors.info,
      };
      return { color: colorMap[type] };
    },

    border: (type: 'default' | 'light' | 'primary' | 'error') => {
      const colorMap = {
        default: theme.colors.border,
        light: theme.colors.borderLight,
        primary: theme.colors.primary,
        error: theme.colors.error,
      };
      return { borderColor: colorMap[type] };
    },
  };
}

export function getThemeColor(theme: Theme, path: string): string {
  const parts = path.split('.');
  let value: any = theme.colors;

  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) {
      console.warn(`Theme color path "${path}" not found, using fallback`);
      return theme.colors.primary; // Fallback
    }
  }

  return value as string;
}

export function meetsContrastRequirements(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '');

  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
