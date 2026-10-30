import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Button } from '@/shared/components/ui/Button';
import { getPasswordError } from '@/shared/utils/validatePassword';
import { useResetPassword } from '../api/useResetPassword';
import { handleAuthError } from '../utils/authErrors';
import { AuthField, TextLink } from './AuthField';
import { AuthHeading } from './AuthHeading';

export function ResetPasswordForm() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const resetPassword = useResetPassword();

  if (!token) {
    return (
      <>
        <AuthHeading
          title="That link's expired"
          subtitle="Reset links only last a little while. Grab a fresh one."
        />
        <Button onPress={() => router.replace('/(auth)/forgot-password')} fullWidth>
          Send a new link
        </Button>
      </>
    );
  }

  if (resetPassword.isSuccess) {
    return (
      <>
        <AuthHeading title="All set" subtitle="Your new password is ready to use." />
        <Button onPress={() => router.replace('/(auth)/login')} fullWidth>
          Sign in
        </Button>
      </>
    );
  }

  const submit = (): void => {
    const error = getPasswordError(password);
    setPasswordError(error);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    resetPassword.mutate({ token, password });
  };

  return (
    <>
      <AuthHeading title="New password" subtitle="At least 8 characters." />
      <AuthField
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(null);
        }}
        placeholder="New password"
        secure
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={submit}
        error={
          passwordError ??
          (resetPassword.error ? handleAuthError(resetPassword.error) : null)
        }
        accessibilityLabel="New password"
      />
      <Button
        onPress={submit}
        disabled={!password}
        loading={resetPassword.isPending}
        fullWidth
      >
        Save password
      </Button>
      <TextLink label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
    </>
  );
}
