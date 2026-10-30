import React, { useRef, useState } from 'react';
import { type TextInputInstance } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { getNameError } from '@/shared/utils/validateName';
import { getEmailError } from '@/shared/utils/validateEmail';
import { getPasswordError } from '@/shared/utils/validatePassword';
import { useSignUp } from '../api/useSignUp';
import { useSignInWithGoogle } from '../api/useSignInWithGoogle';
import { useSignInWithApple } from '../api/useSignInWithApple';
import { handleAuthError } from '../utils/authErrors';
import { AuthField, SocialRow, TextLink } from './AuthField';

type Errors = { name?: string | null; email?: string | null; password?: string | null };

export function SignupForm() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const signUp = useSignUp();
  const google = useSignInWithGoogle();
  const apple = useSignInWithApple();
  const isBusy = signUp.isPending || google.isPending || apple.isPending;
  const mutationError = signUp.error || google.error || apple.error;

  const submit = (): void => {
    const next: Errors = {
      name: getNameError(name.trim()),
      email: getEmailError(email.trim()),
      password: getPasswordError(password),
    };
    setErrors(next);
    if (next.name || next.email || next.password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    signUp.mutate(
      { name: name.trim(), email: email.trim(), password },
      { onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) }
    );
  };

  const edit =
    (field: keyof Errors, setter: (value: string) => void) => (text: string) => {
      setter(text);
      setErrors((current) => ({ ...current, [field]: null }));
      if (mutationError) signUp.reset();
    };

  return (
    <>
      <AuthField
        value={name}
        onChangeText={edit('name', setName)}
        placeholder="Your name"
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.name}
        accessibilityLabel="Name"
      />
      <AuthField
        ref={emailRef}
        value={email}
        onChangeText={edit('email', setEmail)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
        accessibilityLabel="Email"
      />
      <AuthField
        ref={passwordRef}
        value={password}
        onChangeText={edit('password', setPassword)}
        placeholder="Password (8+ characters)"
        secure
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={errors.password}
        accessibilityLabel="Password"
      />

      {mutationError && (
        <Text className="text-sm mb-3 ml-1" style={{ color: colors.error }}>
          {handleAuthError(mutationError)}
        </Text>
      )}

      <Button
        onPress={submit}
        disabled={!name.trim() || !email.trim() || !password || isBusy}
        loading={signUp.isPending}
        fullWidth
      >
        Create account
      </Button>
      <Text className="text-xs text-center mt-3" style={{ color: colors.text.secondary }}>
        By creating an account you agree to the Terms.
      </Text>

      <SocialRow
        onApple={() => apple.mutate()}
        onGoogle={() => google.mutate()}
        disabled={isBusy}
      />
      <TextLink
        prefix="Already have an account?"
        label="Sign in"
        onPress={() => router.replace('/(auth)/login')}
      />
    </>
  );
}
