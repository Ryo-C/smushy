import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Text } from '../ui/Text';
import { PressableScale } from '../ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back button that calls router.back() (or onBackPress) */
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** Replaces the back button */
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode[];
  /** Drop the hairline divider on compact headers */
  transparent?: boolean;
  /** Large, left-aligned title for top-level tab screens */
  largeTitle?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftAction,
  rightActions = [],
  transparent = false,
  largeTitle = false,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const left =
    leftAction ??
    (showBackButton ? (
      <HeaderIconButton
        icon="chevron-left"
        size={26}
        onPress={onBackPress ?? (() => router.back())}
        accessibilityLabel="Back"
      />
    ) : null);

  const right =
    rightActions.length > 0 ? (
      <View className="flex-row items-center">
        {rightActions.map((action, index) => (
          <React.Fragment key={index}>{action}</React.Fragment>
        ))}
      </View>
    ) : null;

  if (largeTitle) {
    return (
      <View style={{ paddingTop: insets.top }}>
        {(left || right) && (
          <View className="flex-row items-center justify-between px-3 pt-1">
            {left ?? <View />}
            {right}
          </View>
        )}
        <View className="px-5 pt-3 pb-2">
          <Text
            className="font-sans-bold"
            style={{
              color: colors.text.primary,
              fontSize: 32,
              lineHeight: 38,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-base mt-1" style={{ color: colors.text.secondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomWidth: transparent ? 0 : 0.5,
        borderBottomColor: `${colors.text.primary}14`,
      }}
    >
      <View className="flex-row items-center px-3" style={{ height: 52 }}>
        <View style={{ minWidth: 44 }}>{left}</View>
        <View className="flex-1 items-center px-2">
          <Text
            className="text-base font-sans-semibold text-center"
            style={{ color: colors.text.primary }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-xs text-center"
              style={{ color: colors.text.secondary }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={{ minWidth: 44 }} className="items-end">
          {right}
        </View>
      </View>
    </View>
  );
};

interface HeaderIconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon,
  onPress,
  color,
  size = 22,
  disabled = false,
  accessibilityLabel,
}) => {
  const { currentTheme } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="light"
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Feather
        name={icon}
        size={size}
        color={color ?? currentTheme.colors.text.primary}
      />
    </PressableScale>
  );
};

interface HeaderTextButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'destructive';
  disabled?: boolean;
}

export const HeaderTextButton: React.FC<HeaderTextButtonProps> = ({
  label,
  onPress,
  variant = 'default',
  disabled = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const color = disabled
    ? colors.text.disabled
    : variant === 'primary'
      ? colors.primary
      : variant === 'destructive'
        ? colors.error
        : colors.text.primary;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="light"
      hitSlop={8}
      accessibilityRole="button"
      className="px-2 py-1"
    >
      <Text className="text-base font-sans-semibold" style={{ color }}>
        {label}
      </Text>
    </PressableScale>
  );
};
