import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/Text';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatDate } from '@/shared/utils/formatDate';
import { getMoodEmoji } from '../utils';
import type { StoryItem } from '../types';

interface StoryCheckInCardProps {
  item: StoryItem;
}

export const StoryCheckInCard: React.FC<StoryCheckInCardProps> = ({ item }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View
      className="flex-row p-3 rounded-2xl"
      style={{
        backgroundColor: `${colors.secondaryLight}80`,
        borderWidth: 1,
        borderColor: `${colors.secondary}40`,
      }}
    >
      <Text className="text-2xl mr-3">{getMoodEmoji(item.mood)}</Text>
      <View className="flex-1">
        <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
          {item.is_mine ? 'You' : item.author_name} checked in · {formatDate(item.date)}
        </Text>
        <Text className="text-sm leading-5" style={{ color: colors.text.primary }}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};
