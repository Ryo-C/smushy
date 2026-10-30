import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { getAccent } from '@/shared/theme';
import { getMomentTypeAccent, getMomentTypeLabel, MOMENT_TYPES } from '../utils';
import type { MomentType } from '../types';

interface MomentTypeChipsProps {
  value: MomentType | null;
  onChange: (type: MomentType | null) => void;
  /** Adds an "Any" chip for filtering */
  allowAny?: boolean;
  disabled?: boolean;
}

export function MomentTypeChips({
  value,
  onChange,
  allowAny = false,
  disabled = false,
}: MomentTypeChipsProps) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const chip = (type: MomentType | null) => {
    const selected = value === type;
    const accent = type ? getAccent(colors, getMomentTypeAccent(type)) : null;

    return (
      <PressableScale
        key={type ?? 'any'}
        onPress={() => onChange(type)}
        disabled={disabled}
        haptic="selection"
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className="flex-row items-center px-3.5 py-2 rounded-full mr-2 mb-2"
        style={{
          backgroundColor: selected
            ? (accent?.soft ?? `${colors.primaryLight}55`)
            : colors.surfaceVariant,
          borderWidth: 1,
          borderColor: selected ? (accent?.solid ?? colors.primaryDark) : 'transparent',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {accent && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              marginRight: 6,
              backgroundColor: accent.solid,
            }}
          />
        )}
        <Text
          className="text-sm font-sans-medium"
          style={{
            color: selected ? (accent?.solid ?? colors.primaryDark) : colors.text.primary,
          }}
        >
          {type ? getMomentTypeLabel(type) : 'Any'}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View className="flex-row flex-wrap">
      {allowAny && chip(null)}
      {MOMENT_TYPES.map((type) => chip(type))}
    </View>
  );
}
