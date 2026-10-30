import React from 'react';
import { Alert } from 'react-native';
import { Button } from '@/shared/components/ui/Button';
import { useSignOut } from '../api/useSignOut';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showConfirmation?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  size = 'md',
  showConfirmation = true,
}) => {
  const signOut = useSignOut();

  const handleLogout = (): void => {
    signOut.mutate(undefined, {
      onError: (error) => {
        console.error('[LogoutButton] ❌ Error during logout:', error);
        Alert.alert('Logout Error', 'Failed to log out. Please try again.');
      },
    });
  };

  const onPress = () => {
    if (showConfirmation) {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]);
    } else {
      handleLogout();
    }
  };

  return (
    <Button
      onPress={onPress}
      variant={variant}
      size={size}
      loading={signOut.isPending}
      disabled={signOut.isPending}
    >
      Log Out
    </Button>
  );
};
