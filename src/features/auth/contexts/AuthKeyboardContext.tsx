import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { useKeyboardHeight } from '@/shared/hooks/useKeyboardHeight';
import { LOGO_SIZE_MAP, LogoSizePreset } from '@/shared/components/brand/SmushyLogo';

type DeviceSize = 'small' | 'medium' | 'large';

export type CompressionState = 'normal' | 'keyboard' | 'signup';

const BREAKPOINTS = {
  small: 700, // iPhone SE, 8, older Android
  medium: 850, // iPhone 12/13 regular, most Android
};

const LAYOUT_CONFIG: Record<
  DeviceSize,
  { heroFlex: number; logoSize: LogoSizePreset; taglineSize: number }
> = {
  small: { heroFlex: 0.2, logoSize: 'small', taglineSize: 18 },
  medium: { heroFlex: 0.24, logoSize: 'medium', taglineSize: 20 },
  large: { heroFlex: 0.28, logoSize: 'large', taglineSize: 22 },
};

const COMPRESSION_CONFIG: Record<
  CompressionState,
  { scale: number; opacity: number; duration: number }
> = {
  normal: { scale: 1, opacity: 1, duration: 300 },
  keyboard: { scale: 0.5, opacity: 0.6, duration: 250 },
  signup: { scale: 0.3, opacity: 0.6, duration: 400 },
};

export interface CompressionValues {
  scale: number;
  opacity: number;
  duration: number;
  heroHeight: number;
  logoSize: number;
  taglineSize: number;
}

export interface AuthKeyboardContextValue {
  keyboardHeight: number;
  isKeyboardVisible: boolean;

  deviceSize: DeviceSize;
  screenHeight: number;

  baseHeroHeight: number;
  baseLogoSize: number;
  baseTaglineSize: number;

  getCompression: (state: CompressionState) => CompressionValues;
}

const AuthKeyboardContext = createContext<AuthKeyboardContextValue | null>(null);

interface AuthKeyboardProviderProps {
  children: ReactNode;
}

function getDeviceSize(height: number): DeviceSize {
  if (height < BREAKPOINTS.small) return 'small';
  if (height < BREAKPOINTS.medium) return 'medium';
  return 'large';
}

export function AuthKeyboardProvider({ children }: AuthKeyboardProviderProps) {
  const { height } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();

  const value = useMemo<AuthKeyboardContextValue>(() => {
    const deviceSize = getDeviceSize(height);
    const config = LAYOUT_CONFIG[deviceSize];

    const baseHeroHeight = height * config.heroFlex;
    const baseLogoSize = LOGO_SIZE_MAP[config.logoSize];
    const baseTaglineSize = config.taglineSize;

    return {
      keyboardHeight,
      isKeyboardVisible: keyboardHeight > 0,

      deviceSize,
      screenHeight: height,

      baseHeroHeight,
      baseLogoSize,
      baseTaglineSize,

      getCompression: (state: CompressionState): CompressionValues => {
        const { scale, opacity, duration } = COMPRESSION_CONFIG[state];
        return {
          scale,
          opacity,
          duration,
          heroHeight: baseHeroHeight * scale,
          logoSize: baseLogoSize * scale,
          taglineSize: baseTaglineSize * scale,
        };
      },
    };
  }, [height, keyboardHeight]);

  return (
    <AuthKeyboardContext.Provider value={value}>{children}</AuthKeyboardContext.Provider>
  );
}

export function useAuthKeyboard(): AuthKeyboardContextValue {
  const context = useContext(AuthKeyboardContext);
  if (!context) {
    throw new Error('useAuthKeyboard must be used within AuthKeyboardProvider');
  }
  return context;
}
