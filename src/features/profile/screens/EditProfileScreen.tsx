import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/Button';
import {
  ScreenHeader,
  HeaderIconButton,
} from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { getNameError } from '@/shared/utils/validateName';
import { useProfile, useUpdateProfileDetails } from '../api/useProfile';

export function EditProfileScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { data: profile } = useProfile();
  const updateDetails = useUpdateProfileDetails();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setBio(profile.bio ?? '');
  }, [profile]);

  const handleSave = (): void => {
    const error = getNameError(name.trim());
    setNameError(error);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    updateDetails.mutate(
      { name, bio },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
        onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      }
    );
  };

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: colors.text.primary,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
  };

  const label = (text: string) => (
    <Text
      className="text-xs font-sans-semibold uppercase tracking-wider mb-2 mt-4 px-1"
      style={{ color: colors.text.secondary }}
    >
      {text}
    </Text>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Edit profile"
        leftAction={<HeaderIconButton icon="x" onPress={() => router.back()} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {label('Name')}
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError(null);
            }}
            placeholder="Your name"
            placeholderTextColor={colors.text.disabled}
            autoCapitalize="words"
            accessibilityLabel="Name"
            className="px-4 py-3 rounded-2xl"
            style={[inputStyle, { fontSize: 18, fontFamily: 'Nunito_600SemiBold' }]}
          />
          {nameError && (
            <Text className="text-sm mt-2 ml-1" style={{ color: colors.error }}>
              {nameError}
            </Text>
          )}

          {label('About you')}
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="A line about you"
            placeholderTextColor={colors.text.disabled}
            multiline
            maxLength={140}
            textAlignVertical="top"
            accessibilityLabel="Bio"
            className="px-4 py-3 rounded-2xl"
            style={[inputStyle, { minHeight: 90 }]}
          />
          <Text
            className="text-xs mt-1 mr-1 text-right"
            style={{ color: colors.text.disabled }}
          >
            {bio.length}/140
          </Text>

          <View className="mt-6">
            <Button
              onPress={handleSave}
              disabled={!name.trim() || updateDetails.isPending}
              loading={updateDetails.isPending}
              fullWidth
            >
              Save changes
            </Button>
          </View>
          {updateDetails.isError && (
            <Text className="text-sm text-center mt-3" style={{ color: colors.error }}>
              Couldn&apos;t save that. Try again?
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
