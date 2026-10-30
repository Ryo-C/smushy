import React from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  className?: string;
  /** Scale while pressed. Keep close to 1; the effect should be felt, not seen. */
  scaleTo?: number;
  haptic?: 'light' | 'selection' | 'none';
}

const PressableScaleBase: React.FC<PressableScaleProps> = ({
  scaleTo = 0.97,
  haptic = 'none',
  onPressIn,
  onPressOut,
  onPress,
  style,
  disabled,
  children,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - scaleTo) * pressed.value }],
    opacity: 1 - 0.06 * pressed.value,
  }));

  const handlePressIn = (event: GestureResponderEvent): void => {
    if (!reducedMotion) pressed.value = withTiming(1, { duration: 90 });
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent): void => {
    pressed.value = withSpring(0, { damping: 18, stiffness: 320 });
    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent): void => {
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (haptic === 'selection') Haptics.selectionAsync();
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style as object, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

// Interop goes on this plain component so NativeWind resolves className into `style`
// before the animated style is merged. Registering the animated component itself drops the styles.
cssInterop(PressableScaleBase, { className: 'style' });

export const PressableScale = PressableScaleBase;
