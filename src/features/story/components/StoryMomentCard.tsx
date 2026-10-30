import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

import { Image } from '@/shared/components/ui/Image';
import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatDate } from '@/shared/utils/formatDate';
import type { StoryItem } from '../types';

interface StoryMomentCardProps {
  item: StoryItem;
  onPress: (item: StoryItem) => void;
}

export const StoryMomentCard: React.FC<StoryMomentCardProps> = ({ item, onPress }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <PressableScale
      onPress={() => onPress(item)}
      haptic="light"
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <BlurView
        intensity={12}
        tint="light"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.35)',
        }}
      >
        {item.photo_url && (
          <Image
            source={{ uri: item.photo_url }}
            className="w-full h-48"
            contentFit="cover"
            transition={250}
          />
        )}

        <View className="p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)' }}>
          <Text
            className="font-sans-semibold text-lg mb-1"
            style={{ color: colors.text.primary }}
          >
            {item.title}
          </Text>

          <View className="flex-row items-center flex-wrap mb-2">
            <Text className="text-sm" style={{ color: colors.text.secondary }}>
              {formatDate(item.date)}
            </Text>
            {item.location && (
              <>
                <Feather
                  name="map-pin"
                  size={12}
                  color={colors.text.secondary}
                  style={{ marginLeft: 10, marginRight: 4 }}
                />
                <Text className="text-sm" style={{ color: colors.text.secondary }}>
                  {item.location}
                </Text>
              </>
            )}
          </View>

          {item.description && (
            <Text
              className="text-base leading-6"
              style={{ color: colors.text.primary }}
              numberOfLines={3}
            >
              {item.description}
            </Text>
          )}
        </View>
      </BlurView>
    </PressableScale>
  );
};
