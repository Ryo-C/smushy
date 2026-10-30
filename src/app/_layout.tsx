import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/core/queryClient';
import { RepositoryProvider } from '@/core/repositories/RepositoryProvider';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuth } from '@/features/auth';
import { useSaveThemeOnSignIn } from '@/features/profile';
import { initializeAllSeedData } from '@/core/mock';
import { MOCK_CONFIG } from '@/shared/constants/config';
import '../../global.css';

// Keep splash screen visible while loading fonts
// Both calls reject harmlessly when the splash is already gone (e.g. after a hot reload)
SplashScreen.preventAutoHideAsync().catch(() => {});

/** Must be rendered inside RepositoryProvider and QueryClientProvider */
function AppNavigator() {
  const { currentTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  useSaveThemeOnSignIn(isAuthenticated);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: currentTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-check-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="new-ritual" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ritual/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="check-in/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (MOCK_CONFIG.enabled) {
      initializeAllSeedData();
    }
  }, []);

  // Fallback: never block the app on fonts for more than 4 seconds.
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontsTimedOut(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const fontsReady = fontsLoaded || fontError !== null || fontsTimedOut;

  // Hide the splash screen once fonts are ready (or failed, so the app never hangs).
  // Done in an effect rather than onLayout, which doesn't fire reliably on iOS.
  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RepositoryProvider>
          <QueryClientProvider client={queryClient}>
            <AppNavigator />
          </QueryClientProvider>
        </RepositoryProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
