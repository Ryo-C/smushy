import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/Button';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { MomentTypeChips } from './MomentTypeChips';
import type { MomentTimeframe, MomentType } from '../types';

interface MomentFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  type: MomentType | null;
  onTypeChange: (type: MomentType | null) => void;
  timeframe: MomentTimeframe | null;
  onTimeframeChange: (timeframe: MomentTimeframe | null) => void;
  onClear: () => void;
}

const TIMEFRAMES: { value: MomentTimeframe | null; label: string }[] = [
  { value: null, label: 'Any time' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

export function MomentFilterSheet({
  visible,
  onClose,
  type,
  onTypeChange,
  timeframe,
  onTimeframeChange,
  onClear,
}: MomentFilterSheetProps) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const hasFilters = type !== null || timeframe !== null;

  const label = (text: string) => (
    <Text
      className="text-xs font-sans-semibold uppercase tracking-wider mb-2 mt-2 px-1"
      style={{ color: colors.text.secondary }}
    >
      {text}
    </Text>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      {(dismiss) => (
        <View className="px-1">
          {label('When')}
          <View
            className="flex-row p-1 rounded-2xl mb-4"
            style={{ backgroundColor: colors.surfaceVariant }}
          >
            {TIMEFRAMES.map((option) => {
              const selected = timeframe === option.value;
              return (
                <PressableScale
                  key={option.label}
                  onPress={() => onTimeframeChange(option.value)}
                  haptic="selection"
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className="flex-1 items-center py-2 rounded-xl"
                  style={selected ? { backgroundColor: colors.surface } : undefined}
                >
                  <Text
                    className="text-sm font-sans-medium"
                    style={{
                      color: selected ? colors.text.primary : colors.text.secondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          {label('Type')}
          <MomentTypeChips value={type} onChange={onTypeChange} allowAny />

          <View className="flex-row items-center mt-5">
            <PressableScale
              onPress={onClear}
              disabled={!hasFilters}
              haptic="light"
              hitSlop={8}
              accessibilityRole="button"
              className="px-2 mr-4"
            >
              <Text
                className="text-base font-sans-semibold"
                style={{ color: hasFilters ? colors.primaryDark : colors.text.disabled }}
              >
                Clear
              </Text>
            </PressableScale>
            <View className="flex-1">
              <Button onPress={() => dismiss()} fullWidth>
                Done
              </Button>
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
