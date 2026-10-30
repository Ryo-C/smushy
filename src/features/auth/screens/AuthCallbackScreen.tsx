import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Screen, Container } from '@/shared/components';
import { useTheme } from '@/shared/hooks/useTheme';

export function AuthCallbackScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { error, error_description } = useLocalSearchParams<{
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  }, [error, router]);

  if (error) {
    return (
      <Screen>
        <Container className="flex-1 justify-center items-center py-8">
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: currentTheme.colors.error + '20' }}
            >
              <Text className="text-3xl">✕</Text>
            </View>
            <Text
              className="text-2xl font-sans-bold mb-2 text-center"
              style={{ color: currentTheme.colors.text.primary }}
            >
              Sign In Failed
            </Text>
            <Text
              className="text-base text-center mb-4"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              {error_description || 'Unable to complete sign in'}
            </Text>
            <Text
              className="text-sm text-center"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Redirecting to login...
            </Text>
          </View>
        </Container>
      </Screen>
    );
  }

  return (
    <Screen>
      <Container className="flex-1 justify-center items-center py-8">
        <View className="items-center">
          <ActivityIndicator
            size="large"
            color={currentTheme.colors.primary}
            className="mb-4"
          />
          <Text
            className="text-xl font-sans-semibold mb-2 text-center"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Completing Sign In...
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            Please wait
          </Text>
        </View>
      </Container>
    </Screen>
  );
}
