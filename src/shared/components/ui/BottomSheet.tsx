import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from './Text';
import { useTheme } from '@/shared/hooks/useTheme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

/** Closes the sheet with its slide-out, then runs `then` (e.g. a navigation) once it's gone. */
export type DismissSheet = (then?: () => void) => void;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode | ((dismiss: DismissSheet) => React.ReactNode);
}

const OFFSCREEN = 800;
const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const reducedMotion = useReducedMotion();

  const translateY = useSharedValue(OFFSCREEN);
  const sheetHeight = useSharedValue(OFFSCREEN);
  const afterClose = useRef<(() => void) | null>(null);

  const openDuration = reducedMotion ? 0 : 280;
  const closeDuration = reducedMotion ? 0 : 200;

  useEffect(() => {
    if (visible) {
      translateY.value = OFFSCREEN;
      translateY.value = withTiming(0, { duration: openDuration, easing: EASE_OUT });
    }
  }, [visible, openDuration, translateY]);

  const finishClose = useCallback((): void => {
    onClose();
    afterClose.current?.();
    afterClose.current = null;
  }, [onClose]);

  // Every way out slides the sheet away first; follow-up navigation waits until it's
  // gone so two iOS modals never overlap.
  const dismiss = useCallback<DismissSheet>(
    (then) => {
      afterClose.current = then ?? null;
      translateY.value = withTiming(
        sheetHeight.value,
        { duration: closeDuration, easing: EASE_IN },
        (finished) => {
          if (finished) scheduleOnRN(finishClose);
        }
      );
    },
    [closeDuration, finishClose, sheetHeight, translateY]
  );

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > sheetHeight.value * 0.3 || event.velocityY > 900;
      if (shouldClose) {
        translateY.value = withTiming(
          sheetHeight.value,
          { duration: closeDuration, easing: EASE_IN },
          (finished) => {
            if (finished) scheduleOnRN(finishClose);
          }
        );
      } else {
        translateY.value = withTiming(0, { duration: 220, easing: EASE_OUT });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight.value], [1, 0], 'clamp'),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => dismiss()}
    >
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(20, 12, 8, 0.22)' },
            backdropStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => dismiss()}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            onLayout={(event) => {
              sheetHeight.value = event.nativeEvent.layout.height;
            }}
            style={[
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 10,
                paddingHorizontal: 16,
                paddingBottom: Math.max(insets.bottom, 16) + 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
              },
              sheetStyle,
            ]}
          >
            <View
              className="self-center mb-4 rounded-full"
              style={{
                width: 36,
                height: 4,
                backgroundColor: `${colors.text.primary}1F`,
              }}
            />
            {title && (
              <Text
                className="text-xs font-sans-semibold uppercase tracking-wider mb-2 px-1"
                style={{ color: colors.text.secondary }}
              >
                {title}
              </Text>
            )}
            {typeof children === 'function' ? children(dismiss) : children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
