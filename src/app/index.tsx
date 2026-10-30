import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';

/**
 * Without a route matching "/", Expo Router renders +not-found outside the
 * root layout, so RootLayout never mounts and the splash screen never hides.
 */
export default function Index() {
  const { isAuthenticated } = useAuth();

  return <Redirect href={isAuthenticated ? '/moments' : '/login'} />;
}
