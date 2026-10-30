import React, { useEffect } from 'react';
import { StyleSheet, AccessibilityInfo } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/hooks/useTheme';

export type LogoSizePreset = 'small' | 'medium' | 'large';

interface SmushyLogoProps {
  /** Logo size - preset name or numeric value in pixels */
  size?: LogoSizePreset | number;
  /** Override primary color */
  primaryColor?: string;
  /** Override secondary color */
  secondaryColor?: string;
  /** Disable breathing animation */
  animated?: boolean;
}

export const LOGO_SIZE_MAP: Record<LogoSizePreset, number> = {
  small: 60,
  medium: 100,
  large: 140,
};

/** Resolve size to numeric value */
function resolveSize(size: LogoSizePreset | number): number {
  return typeof size === 'number' ? size : LOGO_SIZE_MAP[size];
}

export function SmushyLogo({
  size = 'medium',
  primaryColor,
  secondaryColor,
  animated = true,
}: SmushyLogoProps) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const logoSize = resolveSize(size);

  const primary = primaryColor || colors.primary;
  const secondary = secondaryColor || colors.secondary;

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!animated || reduceMotion) {
      scale.value = 1;
      rotation.value = 0;
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-2, { duration: 3500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [animated, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const smooshPath = `
    M 50 8
    C 72 8, 88 20, 92 38
    C 96 56, 88 68, 78 72
    C 68 76, 58 70, 50 72
    C 42 70, 32 76, 22 72
    C 12 68, 4 56, 8 38
    C 12 20, 28 8, 50 8
    Z
  `;

  const innerDetailPath = `
    M 50 24
    C 60 24, 68 32, 70 42
    C 72 52, 66 58, 58 60
    C 54 61, 50 58, 50 58
    C 50 58, 46 61, 42 60
    C 34 58, 28 52, 30 42
    C 32 32, 40 24, 50 24
    Z
  `;

  return (
    <Animated.View
      entering={animated ? FadeIn.duration(600) : undefined}
      style={[styles.container, { width: logoSize, height: logoSize }]}
      accessible
      accessibilityLabel="Smushy logo"
      accessibilityRole="image"
    >
      <Animated.View style={[styles.inner, animatedStyle]}>
        <Svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 100 80"
        >
          <Defs>
            <LinearGradient id="smooshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={primary} stopOpacity="1" />
              <Stop offset="50%" stopColor={primary} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={secondary} stopOpacity="0.85" />
            </LinearGradient>

            <LinearGradient id="innerGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <Stop offset="100%" stopColor={secondary} stopOpacity="0.15" />
            </LinearGradient>
          </Defs>

          <Path
            d={smooshPath}
            fill="url(#smooshGradient)"
          />

          <Path
            d={innerDetailPath}
            fill="url(#innerGradient)"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
