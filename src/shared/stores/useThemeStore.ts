import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeById, getDefaultTheme, type Theme } from '@/shared/theme';

interface ThemeState {
  /** Current theme ID */
  currentThemeId: string;

  /** Current theme object */
  currentTheme: Theme;

  /** Set the active theme */
  setTheme: (themeId: string) => void;

  /** Reset to default theme */
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => {
      const defaultTheme = getDefaultTheme();

      return {
        currentThemeId: defaultTheme.id,
        currentTheme: defaultTheme,

        setTheme: (themeId) => {
          const theme = getThemeById(themeId);
          set({
            currentThemeId: theme.id,
            currentTheme: theme,
          });
        },

        resetTheme: () => {
          const theme = getDefaultTheme();
          set({
            currentThemeId: theme.id,
            currentTheme: theme,
          });
        },
      };
    },
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
