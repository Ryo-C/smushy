import type { ThemeColors } from './types';

export type AccentName = 'primary' | 'secondary' | 'sage' | 'mist';

export interface Accent {
  /** For icons and small marks */
  solid: string;
  /** For the tile or pill behind them */
  soft: string;
}

/**
 * The theme's supporting colours as quiet accents. Use them only on small elements
 * (icon tiles, dots, tags) so they add depth without pulling focus from content.
 */
export function getAccent(colors: ThemeColors, name: AccentName): Accent {
  switch (name) {
    case 'primary':
      return { solid: colors.primaryDark, soft: `${colors.primaryLight}55` };
    case 'secondary':
      return { solid: colors.secondaryDark, soft: `${colors.secondaryLight}B3` };
    case 'sage':
      return { solid: colors.success, soft: `${colors.successLight}B3` };
    case 'mist':
      return { solid: colors.info, soft: `${colors.infoLight}B3` };
  }
}
