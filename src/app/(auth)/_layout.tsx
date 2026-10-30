import { Stack, useSegments } from 'expo-router';
import { AuthKeyboardProvider } from '@/features/auth/contexts/AuthKeyboardContext';
import { AuthSharedLayout } from '@/features/auth/components/AuthSharedLayout';

export default function AuthLayout() {
  const segments = useSegments();

  // The OAuth callback shows only a spinner, so it skips the shared hero layout
  if (segments.includes('callback')) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <AuthKeyboardProvider>
      <AuthSharedLayout />
    </AuthKeyboardProvider>
  );
}
