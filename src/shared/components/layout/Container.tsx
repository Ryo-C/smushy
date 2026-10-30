import React from 'react';
import { View, ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'md',
  className,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
  };

  return (
    <View className={`${paddingClasses[padding]} ${className || ''}`} {...props}>
      {children}
    </View>
  );
};
