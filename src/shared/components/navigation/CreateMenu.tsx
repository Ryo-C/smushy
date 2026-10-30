import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '../ui/Text';
import { PressableScale } from '../ui/PressableScale';
import { BottomSheet } from '../ui/BottomSheet';
import { useTheme } from '@/shared/hooks/useTheme';
import { getAccent, type AccentName } from '@/shared/theme';

export interface CreateMenuItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  detail: string;
  accent?: AccentName;
  onPress: () => void;
}

interface CreateMenuProps {
  visible: boolean;
  items: CreateMenuItem[];
  onClose: () => void;
}

export const CreateMenu: React.FC<CreateMenuProps> = ({ visible, items, onClose }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add">
      {(dismiss) =>
        items.map((item) => {
          const accent = getAccent(colors, item.accent ?? 'primary');
          return (
            <PressableScale
              key={item.key}
              onPress={() => dismiss(item.onPress)}
              haptic="light"
              scaleTo={0.985}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              className="flex-row items-center p-3 rounded-2xl mb-2"
              style={{ backgroundColor: colors.surfaceVariant }}
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: accent.soft }}
              >
                <Feather name={item.icon} size={20} color={accent.solid} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-sans-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {item.label}
                </Text>
                <Text className="text-sm" style={{ color: colors.text.secondary }}>
                  {item.detail}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.text.disabled} />
            </PressableScale>
          );
        })
      }
    </BottomSheet>
  );
};
