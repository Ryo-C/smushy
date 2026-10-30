import React from 'react';
import { View } from 'react-native';

import { Image } from './Image';
import { Text } from './Text';
import { useTheme } from '@/shared/hooks/useTheme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  /** Use the secondary colour instead of primary (e.g. for the partner) */
  tone?: 'primary' | 'secondary';
  /** Ring in the background colour, for overlapping avatars */
  ring?: boolean;
}

/** Shows the photo when there is one, otherwise the person's initial on a warm circle */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  uri,
  size = 48,
  tone = 'primary',
  ring = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const background = tone === 'primary' ? colors.primary : colors.secondaryDark;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: colors.surface,
      }}
      accessibilityLabel={name}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <Text
          className="font-sans-bold"
          style={{ color: colors.text.inverse, fontSize: size * 0.42 }}
        >
          {name.trim().charAt(0).toUpperCase() || '?'}
        </Text>
      )}
    </View>
  );
};
