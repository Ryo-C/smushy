import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatDate } from '@/shared/utils/formatDate';
import { getMoodEmoji } from '@/shared/utils/mood';
import type { CheckInEntry } from '../types';

interface CheckInCardProps {
  checkIn: CheckInEntry;
  /** Only passed for your own check-ins, which you can edit */
  onPress?: (checkIn: CheckInEntry) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({ checkIn, onPress }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const card = (
    <View
      className="flex-row p-4 rounded-2xl mb-3"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <Text className="text-3xl mr-3">{getMoodEmoji(checkIn.mood)}</Text>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-xs flex-1" style={{ color: colors.text.secondary }}>
            {checkIn.is_mine ? 'You' : checkIn.author_name} ·{' '}
            {formatDate(checkIn.created_at)}
          </Text>
          {checkIn.is_mine && (
            <View className="flex-row items-center">
              <Feather
                name={checkIn.is_shared ? 'users' : 'lock'}
                size={11}
                color={colors.text.secondary}
              />
              <Text className="text-xs ml-1" style={{ color: colors.text.secondary }}>
                {checkIn.is_shared ? 'Shared' : 'Only you'}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-base leading-6" style={{ color: colors.text.primary }}>
          {checkIn.content}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return card;

  return (
    <PressableScale
      onPress={() => onPress(checkIn)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel="Edit check-in"
    >
      {card}
    </PressableScale>
  );
};
