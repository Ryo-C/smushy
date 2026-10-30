import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/shared/hooks/useTheme';

interface TabBarProps {
  children: React.ReactNode;
  /** Center action, layered above the bar */
  fab?: React.ReactNode;
}

export const TabBar: React.FC<TabBarProps> = ({ children, fab }) => {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <BlurView
        intensity={60}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          {
            overflow: 'hidden',
            backgroundColor: `${colors.surface}D9`,
            borderTopWidth: 0.5,
            borderTopColor: `${colors.text.primary}14`,
          },
        ]}
      />

      <View className="flex-row items-center justify-around px-2 pt-2">{children}</View>

      {fab && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: -18,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          {fab}
        </View>
      )}
    </View>
  );
};
