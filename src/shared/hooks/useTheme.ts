import { useThemeStore } from '@/shared/stores/useThemeStore';
import { themes, getDefaultTheme, type Theme } from '@/shared/theme';

export function useTheme() {
  const { currentTheme, currentThemeId, setTheme, resetTheme } = useThemeStore();

  const isDefaultTheme = currentThemeId === getDefaultTheme().id;

  const availableThemes: Theme[] = themes;

  const themeCount = themes.length;

  return {
    /** Current active theme */
    currentTheme,

    /** Current theme ID */
    currentThemeId,

    /** Change the active theme */
    setTheme,

    /** Reset to default theme */
    resetTheme,

    /** All available themes */
    availableThemes,

    /** Number of available themes */
    themeCount,

    /** Whether the current theme is the default */
    isDefaultTheme,
  };
}
