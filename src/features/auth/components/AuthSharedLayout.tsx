import React, { useLayoutEffect, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Screen } from '@/shared/components/layout/Screen';
import { SmushyLogo } from '@/shared/components/brand/SmushyLogo';
import { SquishyBlob } from '@/shared/components/decorative';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthKeyboard, type CompressionState } from '../contexts/AuthKeyboardContext';
import { ThemeSwitcher } from './ThemeSwitcher';

export function AuthSharedLayout() {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const layout = useAuthKeyboard();
  const pathname = usePathname();

  const compressionState: CompressionState = pathname.includes('signup')
    ? 'signup'
    : layout.isKeyboardVisible
      ? 'keyboard'
      : 'normal';
  const compression = layout.getCompression(compressionState);

  const blobRain = useMemo(() => {
    const xPositions = [0.4, 0.9, 0.1, 0.6];
    const delays = [0, 8000, 16000, 24000];
    return xPositions.map((x, i) => ({
      id: i,
      x,
      y: -0.1 - Math.random() * 0.2,
      size: 170 + Math.random() * 60,
      opacityMin: 0.1 + Math.random() * 0.05,
      opacityMax: 0.2 + Math.random() * 0.1,
      delay: delays[i],
    }));
  }, []);

  const heroHeight = useSharedValue(layout.baseHeroHeight);
  const heroScale = useSharedValue(1);
  const heroOpacity = useSharedValue(1);

  useLayoutEffect(() => {
    const { duration } = compression;
    const easing = Easing.inOut(Easing.cubic);
    heroHeight.value = withTiming(compression.heroHeight, { duration, easing });
    heroScale.value = withTiming(compression.scale, { duration, easing });
    heroOpacity.value = withTiming(compression.opacity, { duration });
  }, [compression, heroHeight, heroOpacity, heroScale]);

  const heroContainerStyle = useAnimatedStyle(() => ({ height: heroHeight.value }));
  const heroContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
    opacity: heroOpacity.value,
  }));

  return (
    <Screen plain>
      <LinearGradient
        colors={[colors.primaryLight, colors.secondary, colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {blobRain.map((blob) => (
        <SquishyBlob
          key={blob.id}
          position={{ x: blob.x, y: blob.y }}
          size={blob.size}
          color="rgba(255, 255, 255, 0.25)"
          opacity={0.2}
          delay={blob.delay}
          variant="drift"
          driftDuration={32000}
          wobbleStyle="organic"
          sizeRange={[1, 1.7]}
          opacityRange={[blob.opacityMin, blob.opacityMax]}
        />
      ))}

      <SafeAreaView style={styles.topBar} edges={['top', 'right']}>
        <ThemeSwitcher />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View
            entering={FadeIn.duration(600)}
            style={[styles.hero, heroContainerStyle]}
          >
            <Animated.View style={[styles.heroContent, heroContentStyle]}>
              <SmushyLogo size={layout.baseLogoSize} />
              <Animated.Text
                style={[styles.tagline, { fontSize: layout.baseTaglineSize }]}
              >
                Moments that bring us closer
              </Animated.Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                key={pathname}
                entering={FadeIn.duration(220)}
                exiting={FadeOut.duration(150)}
              >
                <Slot />
              </Animated.View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
  },
  hero: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
  },
  tagline: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Nunito_500Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
