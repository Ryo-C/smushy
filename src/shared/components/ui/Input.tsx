import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  type TextInputInstance,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Text';
import { useTheme } from '@/shared/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'warm'; // New: warm variant uses cream background
  showPasswordToggle?: boolean; // Show eye icon for password visibility toggle
}

export const Input = forwardRef<TextInputInstance, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      showPasswordToggle,
      secureTextEntry,
      style,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const { colors } = currentTheme;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const shouldShowToggle = showPasswordToggle ?? secureTextEntry;

    const inputStyle = {
      borderColor: error ? colors.error : colors.border,
      backgroundColor: variant === 'warm' ? colors.surfaceVariant : colors.surface,
      color: colors.text.primary,
      ...(style as object),
    };

    return (
      <View className="w-full">
        {label && (
          <Text
            className="text-base font-sans-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            {label}
          </Text>
        )}

        <View className="relative">
          <TextInput
            ref={ref}
            className="text-base w-full px-4 py-3 border rounded-lg"
            style={[inputStyle, shouldShowToggle && { paddingRight: 48 }]}
            placeholderTextColor={colors.text.disabled}
            {...props}
            {...(secureTextEntry && {
              secureTextEntry: !isPasswordVisible,
              autoCorrect: false,
              autoCapitalize: 'none' as const,
              autoComplete: 'off' as const,
              spellCheck: false,
              keyboardType: 'default' as const,
            })}
          />

          {shouldShowToggle && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-0 bottom-0 justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              <Feather
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={colors.text.secondary}
              />
            </Pressable>
          )}
        </View>

        {error && (
          <Text className="text-base mt-1" style={{ color: colors.error }}>
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text className="text-base mt-1" style={{ color: colors.text.secondary }}>
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);
