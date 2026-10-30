import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '@/shared/hooks/useTheme';

interface MomentSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const MomentSearchBar: React.FC<MomentSearchBarProps> = ({
  value,
  onChangeText,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View
      className="flex-1 flex-row items-center px-3 rounded-2xl"
      style={{
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
      }}
    >
      <Feather name="search" size={16} color={colors.text.secondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search moments"
        placeholderTextColor={colors.text.disabled}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="Search moments"
        className="flex-1 ml-2"
        style={{
          color: colors.text.primary,
          fontFamily: 'Nunito_400Regular',
          fontSize: 16,
        }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Feather name="x-circle" size={16} color={colors.text.secondary} />
        </Pressable>
      )}
    </View>
  );
};
