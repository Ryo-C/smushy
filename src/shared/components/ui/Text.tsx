import { Text as RNText, TextProps } from 'react-native';

interface Props extends TextProps {
  className?: string;
}

export function Text({ style, className, ...props }: Props) {
  // Only apply default font if no font-sans-* class is specified
  const hasFontClass = className?.includes('font-sans');
  const defaultStyle = hasFontClass ? undefined : { fontFamily: 'Nunito_400Regular' };

  return (
    <RNText
      className={className}
      style={[defaultStyle, style]}
      {...props}
    />
  );
}
