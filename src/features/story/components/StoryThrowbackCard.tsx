import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Image } from '@/shared/components/ui/Image';
import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import type { StoryItem, StoryThrowback } from '../types';

interface StoryThrowbackCardProps {
  throwback: StoryThrowback;
  onPress: (item: StoryItem) => void;
}

export const StoryThrowbackCard: React.FC<StoryThrowbackCardProps> = ({
  throwback,
  onPress,
}) => {
  const { item, yearsAgo } = throwback;
  const when =
    yearsAgo === 1 ? 'A year ago this month' : `${yearsAgo} years ago this month`;

  return (
    <PressableScale
      onPress={() => onPress(item)}
      haptic="light"
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${when}: ${item.title}`}
      className="mb-5"
    >
      <View style={{ borderRadius: 24, overflow: 'hidden' }}>
        <Image
          source={{ uri: item.photo_url }}
          className="w-full h-56"
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.65)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.35 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Text
            className="text-xs font-sans-semibold uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            {when}
          </Text>
          <Text className="text-xl font-sans-bold" style={{ color: '#FFFFFF' }}>
            {item.title}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
};
