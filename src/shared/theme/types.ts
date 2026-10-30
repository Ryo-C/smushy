export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;

  secondary: string;
  secondaryDark: string;
  secondaryLight: string;

  background: string; // Screen/page background
  surface: string; // Card/component background
  surfaceVariant: string; // Alternative surface color

  border: string;
  borderLight: string;

  text: {
    primary: string; // Main text color
    secondary: string; // Muted text
    disabled: string; // Disabled state text
    inverse: string; // Text on colored backgrounds
  };

  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
}

export interface Theme {
  /** Unique identifier for the theme */
  id: string;

  /** Display name shown to users */
  name: string;

  /** Brief description of the theme's emotional tone */
  description: string;

  /** Color palette for this theme */
  colors: ThemeColors;
}

export type ThemePreset = 'default' | 'serene' | 'forest';
