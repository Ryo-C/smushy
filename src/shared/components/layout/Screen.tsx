import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
  /** Skip the soft background wash, e.g. for full-bleed custom backgrounds */
  plain?: boolean;
}

/** Does not apply safe-area padding; headers and content handle their own insets. */
export const Screen: React.FC<ScreenProps> = ({
  children,
  backgroundColor,
  plain = false,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View
      style={[{ flex: 1, backgroundColor: backgroundColor ?? colors.background }, style]}
      {...props}
    >
      {!plain && (
        <LinearGradient
          colors={[
            `${colors.primaryLight}26`,
            `${colors.secondaryLight}33`,
            colors.background,
          ]}
          locations={[0, 0.35, 0.8]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
};
