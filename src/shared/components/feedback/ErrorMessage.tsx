import React from 'react';
import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';

interface ErrorMessageProps {
  message: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  size = 'medium',
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const iconSizes = {
    small: 24,
    medium: 32,
    large: 48,
  };

  const titleSizes = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View
        className="p-4 mb-4 rounded-full"
        style={{ backgroundColor: colors.errorLight }}
      >
        <Ionicons
          name="alert-circle"
          size={iconSizes[size]}
          color={colors.error}
        />
      </View>
      <Text
        className={`${titleSizes[size]} font-sans-semibold mb-2`}
        style={{ color: colors.text.primary }}
      >
        {title}
      </Text>
      <Text
        className="text-center"
        style={{ color: colors.text.secondary }}
      >
        {message}
      </Text>
    </View>
  );
};
