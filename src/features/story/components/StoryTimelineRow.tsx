import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface StoryTimelineRowProps {
  children: React.ReactNode;
  /** Bigger, filled dot for moments; small hollow dot for check-ins */
  emphasis?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const GUTTER = 28;

export const StoryTimelineRow: React.FC<StoryTimelineRowProps> = ({
  children,
  emphasis = false,
  isFirst = false,
  isLast = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const dotSize = emphasis ? 14 : 10;
  const dotTop = emphasis ? 22 : 20;

  return (
    <View className="flex-row">
      <View style={{ width: GUTTER, alignItems: 'center' }}>
        <View
          style={{
            position: 'absolute',
            top: isFirst ? dotTop : 0,
            bottom: isLast ? undefined : 0,
            height: isLast ? dotTop : undefined,
            width: 2,
            backgroundColor: `${colors.primaryLight}70`,
          }}
        />
        <View
          style={{
            marginTop: dotTop - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: emphasis ? colors.primary : colors.secondaryLight,
            borderWidth: 2,
            borderColor: emphasis ? colors.primary : colors.secondaryDark,
          }}
        />
      </View>
      <View className="flex-1 pb-4">{children}</View>
    </View>
  );
};
