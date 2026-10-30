import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { getAccent, type AccentName } from '@/shared/theme';
import {
  formatNext,
  formatReminder,
  formatSchedule,
  getRitualIcon,
  getNextOccurrence,
  isDoneToday,
} from '../utils';
import type { Ritual } from '../types';

interface RitualCardProps {
  ritual: Ritual;
  onDone: (ritual: Ritual) => void;
  onToggleActive: (ritual: Ritual) => void;
  onEdit: (ritual: Ritual) => void;
  isUpdating?: boolean;
}

const FREQUENCY_ACCENT: Record<Ritual['frequency'], AccentName> = {
  daily: 'secondary',
  weekly: 'primary',
  biweekly: 'primary',
  monthly: 'sage',
};

export const RitualCard: React.FC<RitualCardProps> = ({
  ritual,
  onDone,
  onToggleActive,
  onEdit,
  isUpdating = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const doneToday = isDoneToday(ritual);
  const paused = !ritual.is_active;
  const tile = getAccent(colors, FREQUENCY_ACCENT[ritual.frequency]);

  const handleDone = (): void => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone(ritual);
  };

  return (
    <PressableScale
      onPress={() => onEdit(ritual)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${ritual.title}`}
    >
      <BlurView
        intensity={12}
        tint="light"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.35)',
          marginBottom: 12,
          opacity: paused ? 0.7 : 1,
        }}
      >
        <View className="p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: tile.soft }}
            >
              <Feather name={getRitualIcon(ritual)} size={18} color={tile.solid} />
            </View>
            <View className="flex-1">
              <Text
                className="font-sans-semibold text-base"
                style={{ color: colors.text.primary }}
              >
                {ritual.title}
              </Text>
              <Text className="text-sm" style={{ color: colors.text.secondary }}>
                {formatSchedule(ritual)}
              </Text>
            </View>
            {ritual.reminder_enabled && !paused && (
              <View
                className="flex-row items-center"
                accessibilityLabel={`Reminder ${formatReminder(ritual.reminder_minutes_before)}`}
              >
                <Feather name="bell" size={14} color={colors.text.secondary} />
                {ritual.reminder_minutes_before !== undefined && (
                  <Text className="text-xs ml-1" style={{ color: colors.text.secondary }}>
                    {formatReminder(ritual.reminder_minutes_before, 'short')}
                  </Text>
                )}
              </View>
            )}
          </View>

          {ritual.description && (
            <Text
              className="text-sm leading-5 mb-3"
              style={{ color: colors.text.primary }}
            >
              {ritual.description}
            </Text>
          )}

          <View className="flex-row items-center">
            <Text className="text-sm flex-1" style={{ color: colors.text.secondary }}>
              {paused ? 'Paused' : `Next: ${formatNext(getNextOccurrence(ritual))}`}
            </Text>

            <PressableScale
              onPress={() => onToggleActive(ritual)}
              haptic="selection"
              disabled={isUpdating}
              hitSlop={8}
              accessibilityRole="button"
              className="mr-4"
            >
              <Text
                className="text-sm font-sans-medium"
                style={{ color: colors.text.secondary }}
              >
                {paused ? 'Resume' : 'Pause'}
              </Text>
            </PressableScale>

            {!paused && (
              <PressableScale
                onPress={handleDone}
                disabled={doneToday || isUpdating}
                accessibilityRole="button"
                accessibilityState={{ disabled: doneToday }}
                className="flex-row items-center px-4 py-2 rounded-full"
                style={{
                  backgroundColor: doneToday ? colors.successLight : colors.primary,
                }}
              >
                <Feather
                  name="check"
                  size={14}
                  color={doneToday ? colors.text.primary : colors.text.inverse}
                />
                <Text
                  className="text-sm font-sans-semibold ml-1"
                  style={{ color: doneToday ? colors.text.primary : colors.text.inverse }}
                >
                  {doneToday ? 'Done today' : 'Done'}
                </Text>
              </PressableScale>
            )}
          </View>
        </View>
      </BlurView>
    </PressableScale>
  );
};
