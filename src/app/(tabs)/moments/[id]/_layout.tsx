import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

export default function MomentDetailLayout() {
  const { currentTheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: currentTheme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
