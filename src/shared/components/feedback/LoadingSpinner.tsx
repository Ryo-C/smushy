import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '@/shared/hooks/useTheme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
}) => {
  const { currentTheme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-4" testID="loading-spinner">
      <ActivityIndicator size={size} color={currentTheme.colors.primary} />
      {message && (
        <Text
          className="mt-4 text-center"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};
