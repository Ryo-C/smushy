import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Button } from '@/shared/components/ui/Button';
import { getEmailError } from '@/shared/utils/validateEmail';
import { useForgotPassword } from '../api/useForgotPassword';
import { handleAuthError } from '../utils/authErrors';
import { AuthField, TextLink } from './AuthField';
import { AuthHeading } from './AuthHeading';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  const submit = (): void => {
    const error = getEmailError(email.trim());
    setEmailError(error);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    forgotPassword.mutate(email.trim());
  };

  if (forgotPassword.isSuccess) {
    return (
      <>
        <AuthHeading
          title="Check your inbox"
          subtitle={`If there's an account for ${email.trim()}, a reset link is on its way.`}
        />
        <Button onPress={() => router.replace('/(auth)/login')} fullWidth>
          Back to sign in
        </Button>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="No worries" subtitle="We'll email you a link to reset it." />
      <AuthField
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(null);
        }}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={submit}
        error={
          emailError ??
          (forgotPassword.error ? handleAuthError(forgotPassword.error) : null)
        }
        accessibilityLabel="Email"
      />
      <Button
        onPress={submit}
        disabled={!email.trim()}
        loading={forgotPassword.isPending}
        fullWidth
      >
        Send link
      </Button>
      <TextLink label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
    </>
  );
}
