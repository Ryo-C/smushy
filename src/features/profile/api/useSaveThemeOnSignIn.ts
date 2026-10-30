import { useEffect, useRef } from 'react';
import { useTheme } from '@/shared/hooks/useTheme';
import { useUpdatePreferences } from './useProfile';

/** Saves the theme picked on the sign-in screen to the account when the user signs in. */
export function useSaveThemeOnSignIn(isAuthenticated: boolean): void {
  const { currentThemeId } = useTheme();
  const { mutate } = useUpdatePreferences();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current) {
      mutate({ theme_id: currentThemeId });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, currentThemeId, mutate]);
}
