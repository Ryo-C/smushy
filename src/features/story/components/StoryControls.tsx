import React from 'react';
import { View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import type { StoryOrder } from '../types';

interface StoryControlsProps {
  years: number[];
  /** null = all time */
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  order: StoryOrder;
  onOrderChange: (order: StoryOrder) => void;
}

export const StoryControls: React.FC<StoryControlsProps> = ({
  years,
  selectedYear,
  onYearChange,
  order,
  onOrderChange,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const toggleOrder = (): void => onOrderChange(order === 'newest' ? 'oldest' : 'newest');

  const renderChip = (year: number | null): React.ReactNode => {
    const isSelected = selectedYear === year;
    return (
      <PressableScale
        key={year ?? 'all'}
        onPress={() => onYearChange(year)}
        haptic="selection"
        className="px-4 py-2 rounded-full mr-2"
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        style={
          isSelected
            ? {
                backgroundColor: colors.primary,
                borderWidth: 1,
                borderColor: colors.primary,
              }
            : {
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }
        }
      >
        <Text
          className="text-sm font-sans-medium"
          style={{ color: isSelected ? colors.text.inverse : colors.text.primary }}
        >
          {year ?? 'All time'}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View className="flex-row items-center py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
        className="flex-1"
      >
        {renderChip(null)}
        {years.map((year) => renderChip(year))}
      </ScrollView>

      <PressableScale
        onPress={toggleOrder}
        haptic="selection"
        className="flex-row items-center px-3 py-2 rounded-full mr-4"
        accessibilityRole="button"
        accessibilityLabel={
          order === 'newest' ? 'Showing newest first' : 'Showing oldest first'
        }
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          borderWidth: 1,
          borderColor: `${colors.primaryLight}60`,
        }}
      >
        <Feather
          name={order === 'newest' ? 'arrow-down' : 'arrow-up'}
          size={14}
          color={colors.primary}
        />
        <Text
          className="text-sm font-sans-medium ml-1"
          style={{ color: colors.text.primary }}
        >
          {order === 'newest' ? 'Newest' : 'Oldest'}
        </Text>
      </PressableScale>
    </View>
  );
};
