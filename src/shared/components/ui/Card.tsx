import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'warm';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1, // Android shadow
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.background,
        };
      case 'warm':
        return {
          backgroundColor: colors.surfaceVariant, // cream-50
        };
    }
  };

  const combinedStyle = [getVariantStyle(), style];

  return (
    <View
      className={`rounded-lg ${paddingClasses[padding]} ${className || ''}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </View>
  );
};
