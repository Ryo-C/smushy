import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, AccessibilityInfo } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';

const BLOB_PATH = 'M45,8 C65,5 85,18 90,40 C95,62 82,85 58,92 C34,99 12,82 8,58 C4,34 18,12 45,8 Z';

interface AnimatedBlobProps {
  /** Position as percentage of screen (0-1) */
  position: { x: number; y: number };
  /** Size of the blob in pixels */
  size: number;
  /** Fill color */
  color: string;
  /** Base opacity (0-1) */
  opacity: number;
  /** Animation delay in ms for staggering */
  delay?: number;
  /** Bubble down duration in ms */
  bubbleDuration?: number;
}

export function AnimatedBlob({
  position,
  size,
  color,
  opacity,
  delay = 0,
  bubbleDuration = 40000,
}: AnimatedBlobProps) {
  const { width, height } = useWindowDimensions();

  const initialX = position.x * width - size / 2;
  const initialY = position.y * height - size / 2;

  const config = useMemo(() => {
    const seed = (delay % 5000) / 5000;
    return {
      bubbleDown: bubbleDuration + (seed * 15000),
      wobbleX: 18000 + (seed * 8000),
      wobbleRadius: 8 + (seed * 7), // 8-15px max
      scaleX: 14000 + (seed * 6000),
      scaleY: 16000 + (seed * 5000),
      opacity: 18000 + (seed * 6000),
    };
  }, [bubbleDuration, delay]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const opacityValue = useSharedValue(opacity);

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
    if (reduceMotion) {
      translateX.value = 0;
      translateY.value = 0;
      scaleX.value = 1;
      scaleY.value = 1;
      opacityValue.value = opacity;
      return;
    }

    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(height + size, {
          duration: config.bubbleDown,
          easing: Easing.linear
        }),
        -1,
        false // Don't reverse - jump back to start for continuous bubbling
      );

      translateX.value = withRepeat(
        withSequence(
          withTiming(config.wobbleRadius, { duration: config.wobbleX / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(-config.wobbleRadius, { duration: config.wobbleX / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      scaleX.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: config.scaleX / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.85, { duration: config.scaleX / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      scaleY.value = withRepeat(
        withSequence(
          withTiming(0.88, { duration: config.scaleY / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.12, { duration: config.scaleY / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      opacityValue.value = withRepeat(
        withSequence(
          withTiming(opacity * 1.3, { duration: config.opacity / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(opacity * 0.7, { duration: config.opacity / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [reduceMotion, delay, config, opacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
    opacity: opacityValue.value,
  }));

  const left = initialX;
  const top = initialY;

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(800)}
      style={[styles.container, { left, top, width: size, height: size }]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.inner, animatedContainerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Path d={BLOB_PATH} fill={color} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  inner: {
    flex: 1,
  },
});
