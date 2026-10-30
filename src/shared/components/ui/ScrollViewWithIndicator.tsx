import React, { useState, useRef, useCallback } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

interface ScrollViewWithIndicatorProps extends ScrollViewProps {
  /** Style for the outer container wrapping ScrollView and indicator */
  containerStyle?: StyleProp<ViewStyle>;
  /** Icon size for the scroll indicator (default: 20) */
  indicatorSize?: number;
  /** Icon color for the scroll indicator (default: rgba(0, 0, 0, 0.4)) */
  indicatorColor?: string;
  /** Bottom offset for the indicator (default: 8) */
  indicatorBottomOffset?: number;
}

export function ScrollViewWithIndicator({
  children,
  containerStyle,
  indicatorSize = 20,
  indicatorColor = 'rgba(0, 0, 0, 0.4)',
  indicatorBottomOffset = 8,
  onScroll,
  onContentSizeChange,
  onLayout,
  ...scrollViewProps
}: ScrollViewWithIndicatorProps) {
  const [hasMoreBelow, setHasMoreBelow] = useState(true);
  const reducedMotion = useReducedMotion();
  const bounceOffset = useSharedValue(0);

  const scrollMetrics = useRef({
    layoutHeight: 0,
    contentHeight: 0,
    offsetY: 0,
  });

  React.useEffect(() => {
    if (reducedMotion) return;

    bounceOffset.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [reducedMotion, bounceOffset]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceOffset.value }],
  }));

  const updateHasMoreBelow = useCallback(() => {
    const { layoutHeight, contentHeight, offsetY } = scrollMetrics.current;
    if (layoutHeight === 0) return;
    const isAtBottom = layoutHeight + offsetY >= contentHeight - 20;
    setHasMoreBelow(!isAtBottom);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      scrollMetrics.current = {
        layoutHeight: layoutMeasurement.height,
        contentHeight: contentSize.height,
        offsetY: contentOffset.y,
      };
      updateHasMoreBelow();

      onScroll?.(event);
    },
    [onScroll, updateHasMoreBelow]
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      scrollMetrics.current.contentHeight = height;
      updateHasMoreBelow();

      onContentSizeChange?.(width, height);
    },
    [onContentSizeChange, updateHasMoreBelow]
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      scrollMetrics.current.layoutHeight = event.nativeEvent.layout.height;
      updateHasMoreBelow();

      onLayout?.(event);
    },
    [onLayout, updateHasMoreBelow]
  );

  const indicatorStyle = React.useMemo(
    () => [styles.scrollIndicator, { bottom: indicatorBottomOffset }],
    [indicatorBottomOffset]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        {...scrollViewProps}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        scrollEventThrottle={scrollViewProps.scrollEventThrottle ?? 16}
      >
        {children}
      </ScrollView>

      {hasMoreBelow && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={indicatorStyle}
          pointerEvents="none"
        >
          <Animated.View style={bounceStyle}>
            <Ionicons
              name="chevron-down"
              size={indicatorSize}
              color={indicatorColor}
            />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  scrollIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
