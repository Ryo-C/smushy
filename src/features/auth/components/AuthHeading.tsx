import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/Text';
import { useTheme } from '@/shared/hooks/useTheme';

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View className="mb-5">
      <Text className="text-2xl font-sans-bold" style={{ color: colors.text.primary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-base mt-1" style={{ color: colors.text.secondary }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
