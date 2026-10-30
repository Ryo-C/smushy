import React from 'react';
import { View, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { useTheme } from '@/shared/hooks/useTheme';
import { getAccent, type AccentName } from '@/shared/theme';

export const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  return (
    <View className="mb-6">
      <Text
        className="text-xs font-sans-semibold uppercase tracking-wider mb-2 px-1"
        style={{ color: colors.text.secondary }}
      >
        {title}
      </Text>
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: `${colors.surface}CC`,
          borderWidth: 0.5,
          borderColor: `${colors.text.primary}10`,
        }}
      >
        {children}
      </View>
    </View>
  );
};

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  detail?: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  isLast?: boolean;
  accent?: AccentName;
  children?: React.ReactNode;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  detail,
  onPress,
  value,
  onValueChange,
  isLast = false,
  accent = 'primary',
  children,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const isToggle = onValueChange !== undefined;
  const tile = getAccent(colors, accent);

  const content = (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: `${colors.text.primary}10`,
      }}
    >
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: tile.soft }}
      >
        <Feather name={icon} size={16} color={tile.solid} />
      </View>
      <View className="flex-1">
        <Text className="text-base" style={{ color: colors.text.primary }}>
          {label}
        </Text>
        {detail && (
          <Text className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
            {detail}
          </Text>
        )}
        {children}
      </View>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          accessibilityLabel={label}
        />
      ) : (
        onPress && <Feather name="chevron-right" size={18} color={colors.text.disabled} />
      )}
    </View>
  );

  if (!onPress || isToggle) {
    return content;
  }

  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={0.985}
      accessibilityRole="button"
    >
      {content}
    </PressableScale>
  );
};
