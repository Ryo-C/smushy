import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from '@/shared/components/ui/Image';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Text } from '@/shared/components/ui/Text';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatMomentDate } from '@/shared/utils/formatDate';
import { getMomentTypeAccent, getMomentTypeLabel } from '../utils/momentTypeDisplay';
import { getAccent } from '@/shared/theme';
import type { Moment } from '../types';

interface MomentCardProps {
  moment: Moment;
  currentUserId: string;
  partnerName?: string;
  onPress: (moment: Moment) => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  currentUserId,
  partnerName,
  onPress,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const isOwnMoment = moment.user_id === currentUserId;
  const typeLabel = getMomentTypeLabel(moment.type);
  const typeAccent = getAccent(colors, getMomentTypeAccent(moment.type));
  const formattedDate = formatMomentDate(moment.date);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(moment);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="mb-3"
    >
      <Animated.View style={animatedStyle}>
        <BlurView
          intensity={12}
          tint="light"
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.25)',
          }}
        >
          <View
            className="flex-row p-4"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
          >
            {moment.photo_url && (
              <View className="mr-3">
                <Image
                  source={{ uri: moment.photo_url }}
                  className="w-20 h-20 rounded-lg"
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}

            <View className="flex-1 justify-center">
              <Text
                className="font-sans-semibold text-base mb-1"
                style={{ color: colors.text.primary }}
                numberOfLines={2}
              >
                {moment.title}
              </Text>

              <View className="flex-row items-center mb-1">
                <Text className="text-sm" style={{ color: colors.text.secondary }}>
                  {formattedDate}
                </Text>
                <Text className="text-sm mx-2" style={{ color: colors.text.disabled }}>
                  •
                </Text>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: typeAccent.soft }}
                >
                  <Text
                    className="text-xs font-sans-medium"
                    style={{ color: typeAccent.solid }}
                  >
                    {typeLabel}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                {moment.is_shared && (
                  <View className="flex-row items-center mr-3 px-2 py-0.5 rounded-full">
                    <Feather name="users" size={11} color={colors.text.secondary} />
                    <Text
                      className="text-xs ml-1"
                      style={{ color: colors.text.secondary }}
                    >
                      Shared
                    </Text>
                  </View>
                )}

                {!isOwnMoment && partnerName && (
                  <Text className="text-xs" style={{ color: colors.text.secondary }}>
                    By {partnerName}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
};
