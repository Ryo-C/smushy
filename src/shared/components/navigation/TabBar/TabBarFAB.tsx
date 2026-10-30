import React from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { PressableScale } from '../../ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';

interface TabBarFABProps {
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  size?: number;
}

export const TabBarFAB: React.FC<TabBarFABProps> = ({
  icon = 'plus',
  onPress,
  size = 56,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const handlePress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel="Add"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: 4,
        borderColor: colors.background,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <Feather name={icon} size={24} color={colors.text.inverse} />
    </PressableScale>
  );
};
