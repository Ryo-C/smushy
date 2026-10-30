import React from 'react';
import { View } from 'react-native';
import { Text } from '../../ui/Text';
import { useTheme } from '@/shared/hooks/useTheme';

interface TabBarBadgeProps {
  /** Count to display (max 99, shows 99+ for larger) */
  count: number;
}

export const TabBarBadge: React.FC<TabBarBadgeProps> = ({ count }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const isWide = count > 9;

  return (
    <View
      className={`absolute -top-1 -right-2 items-center justify-center ${
        isWide ? 'px-1 min-w-5' : 'w-4'
      } h-4 rounded-full`}
      style={{ backgroundColor: colors.error }}
    >
      <Text className="text-[10px] font-sans-bold" style={{ color: colors.text.inverse }}>
        {displayCount}
      </Text>
    </View>
  );
};
