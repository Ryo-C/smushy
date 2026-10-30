import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../ui/Text';
import { PressableScale } from '../../ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { TabBarBadge } from './TabBarBadge';

interface TabBarItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isFocused: boolean;
  badge?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TabBarItem: React.FC<TabBarItemProps> = ({
  icon,
  label,
  isFocused,
  badge,
  onPress,
  onLongPress,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, focus]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.5 + 0.5 * focus.value }],
  }));

  const color = isFocused ? colors.primary : colors.text.secondary;

  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      haptic="selection"
      scaleTo={0.92}
      className="items-center justify-center px-3 py-1"
      style={{ minWidth: 64 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <View>
        <Ionicons
          name={isFocused ? icon : (`${icon}-outline` as keyof typeof Ionicons.glyphMap)}
          size={24}
          color={color}
        />
        {badge !== undefined && badge > 0 && <TabBarBadge count={badge} />}
      </View>
      <Text className="text-[11px] mt-1 font-sans-medium" style={{ color }}>
        {label}
      </Text>
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            marginTop: 3,
            backgroundColor: colors.secondaryDark,
          },
          dotStyle,
        ]}
      />
    </PressableScale>
  );
};
