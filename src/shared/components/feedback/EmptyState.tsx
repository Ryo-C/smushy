import React from 'react';
import { View } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'warm'; // New: warm variant for gentle empty states
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
  variant = 'default',
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View className="flex-1 items-center justify-center p-4">
      {icon && (
        <View
          className="mb-4 p-4 rounded-full"
          style={variant === 'warm' ? { backgroundColor: colors.surfaceVariant } : undefined}
        >
          {icon}
        </View>
      )}

      <Text
        className="text-xl font-sans-semibold mb-2 text-center"
        style={{ color: colors.text.primary }}
      >
        {title}
      </Text>

      <Text
        className="text-center mb-6 max-w-sm"
        style={{ color: colors.text.secondary }}
      >
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button onPress={onAction}>{actionLabel}</Button>
      )}
    </View>
  );
};
