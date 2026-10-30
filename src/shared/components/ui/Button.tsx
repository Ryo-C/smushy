import React from 'react';
import { ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const baseClasses = 'items-center justify-center rounded-2xl';

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = disabled || loading ? 'opacity-50' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surfaceVariant,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
    }
  };

  const getTextStyles = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return {
          color: colors.text.inverse,
        };
      case 'secondary':
        return {
          color: colors.text.primary,
        };
      case 'outline':
        return {
          color: colors.primary,
        };
    }
  };

  const getLoadingColor = (): string => {
    return variant === 'primary' ? colors.text.inverse : colors.primary;
  };

  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`}
      style={getVariantStyles()}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor()} />
      ) : typeof children === 'string' ? (
        <Text
          className={`font-sans-semibold ${textSizeClasses[size]}`}
          style={getTextStyles()}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </PressableScale>
  );
};
