import React, { useRef, useState } from 'react';
import { type TextInputInstance } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { getEmailError } from '@/shared/utils/validateEmail';
import { useSignIn } from '../api/useSignIn';
import { useSignInWithGoogle } from '../api/useSignInWithGoogle';
import { useSignInWithApple } from '../api/useSignInWithApple';
import { handleAuthError } from '../utils/authErrors';
import { AuthField, SocialRow, TextLink } from './AuthField';

export function LoginForm() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const signIn = useSignIn();
  const google = useSignInWithGoogle();
  const apple = useSignInWithApple();
  const isBusy = signIn.isPending || google.isPending || apple.isPending;
  const mutationError = signIn.error || google.error || apple.error;

  const submit = (): void => {
    const error = getEmailError(email.trim());
    setEmailError(error);
    if (error || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    signIn.mutate(
      { email: email.trim(), password },
      { onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) }
    );
  };

  const clearErrors = (): void => {
    setEmailError(null);
    if (mutationError) {
      signIn.reset();
      google.reset();
      apple.reset();
    }
  };

  return (
    <>
      <AuthField
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearErrors();
        }}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={emailError}
        accessibilityLabel="Email"
      />
      <AuthField
        ref={passwordRef}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearErrors();
        }}
        placeholder="Password"
        secure
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={submit}
        accessory={{
          label: 'Forgot?',
          onPress: () => router.push('/(auth)/forgot-password'),
        }}
        accessibilityLabel="Password"
      />

      {mutationError && (
        <Text className="text-sm mb-3 ml-1" style={{ color: colors.error }}>
          {handleAuthError(mutationError)}
        </Text>
      )}

      <Button
        onPress={submit}
        disabled={!email.trim() || !password || isBusy}
        loading={signIn.isPending}
        fullWidth
      >
        Sign in
      </Button>

      <SocialRow
        onApple={() => apple.mutate()}
        onGoogle={() => google.mutate()}
        disabled={isBusy}
      />
      <TextLink
        prefix="New here?"
        label="Make an account"
        onPress={() => router.push('/(auth)/signup')}
      />
    </>
  );
}
