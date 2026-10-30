import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  type TextInputInstance,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';

interface AuthFieldProps extends TextInputProps {
  error?: string | null;
  /** Adds a show/hide toggle */
  secure?: boolean;
  /** Small text action inside the field, e.g. "Forgot?" */
  accessory?: { label: string; onPress: () => void };
}

export const AuthField = forwardRef<TextInputInstance, AuthFieldProps>(
  ({ error, secure = false, accessory, style, onFocus, onBlur, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const { colors } = currentTheme;
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);

    const borderColor = error ? colors.error : focused ? colors.primary : 'transparent';

    return (
      <View className="mb-3">
        <View
          className="flex-row items-center rounded-2xl px-5"
          style={{
            height: 60,
            backgroundColor: `${colors.surface}E6`,
            borderWidth: 1.5,
            borderColor,
          }}
        >
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={secure && hidden}
            placeholderTextColor={colors.text.disabled}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[
              {
                flex: 1,
                color: colors.text.primary,
                fontFamily: 'Nunito_500Medium',
                fontSize: 18,
              },
              style,
            ]}
          />
          {accessory && (
            <PressableScale
              onPress={accessory.onPress}
              haptic="light"
              hitSlop={8}
              className="ml-3"
            >
              <Text
                className="text-sm font-sans-semibold"
                style={{ color: colors.primaryDark }}
              >
                {accessory.label}
              </Text>
            </PressableScale>
          )}
          {secure && (
            <PressableScale
              onPress={() => setHidden((value) => !value)}
              haptic="selection"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
              className="ml-3"
            >
              <Feather
                name={hidden ? 'eye' : 'eye-off'}
                size={18}
                color={colors.text.secondary}
              />
            </PressableScale>
          )}
        </View>
        {error && (
          <Text className="text-sm mt-2 ml-1" style={{ color: colors.error }}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

AuthField.displayName = 'AuthField';

interface SocialRowProps {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
}

export function SocialRow({ onGoogle, onApple, disabled = false }: SocialRowProps) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const button = (
    icon: 'logo-google' | 'logo-apple',
    label: string,
    onPress: () => void
  ) => (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="light"
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-12 h-12 rounded-full items-center justify-center mx-2"
      style={{
        backgroundColor: `${colors.surface}E6`,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.text.primary} />
    </PressableScale>
  );

  return (
    <View className="items-center mt-4">
      <Text className="text-xs mb-3" style={{ color: colors.text.secondary }}>
        or
      </Text>
      <View className="flex-row">
        {button('logo-apple', 'Continue with Apple', onApple)}
        {button('logo-google', 'Continue with Google', onGoogle)}
      </View>
    </View>
  );
}

export function TextLink({
  prefix,
  label,
  onPress,
}: {
  prefix?: string;
  label: string;
  onPress: () => void;
}) {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View className="flex-row justify-center items-center mt-5">
      {prefix && (
        <Text className="text-sm" style={{ color: colors.text.secondary }}>
          {prefix}{' '}
        </Text>
      )}
      <PressableScale
        onPress={onPress}
        haptic="light"
        hitSlop={8}
        accessibilityRole="button"
      >
        <Text
          className="text-sm font-sans-semibold"
          style={{ color: colors.primaryDark }}
        >
          {label}
        </Text>
      </PressableScale>
    </View>
  );
}
