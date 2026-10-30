import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { Button } from '@/shared/components/ui/Button';
import {
  ScreenHeader,
  HeaderIconButton,
} from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { MOOD_OPTIONS, type Mood } from '@/shared/utils/mood';
import {
  useCheckIns,
  useCreateCheckIn,
  useDeleteCheckIn,
  useUpdateCheckIn,
} from '../api/useCheckIns';

export function CheckInFormScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: checkIns } = useCheckIns();
  const existing = id ? checkIns?.find((checkIn) => checkIn.id === id) : undefined;
  const isEditing = Boolean(id);

  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const deleteCheckIn = useDeleteCheckIn();
  const saving = createCheckIn.isPending || updateCheckIn.isPending;
  const saveFailed = createCheckIn.isError || updateCheckIn.isError;

  const [mood, setMood] = useState<Mood | null>(null);
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setMood(existing.mood ?? null);
    setContent(existing.content);
    setIsShared(existing.is_shared);
  }, [existing]);

  const canSave = mood !== null && content.trim().length > 0 && !saving;

  const handleSave = (): void => {
    if (!mood) return;
    const data = { mood, content, is_shared: isShared };
    const callbacks = {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      },
      onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    };
    if (id) updateCheckIn.mutate({ id, data }, callbacks);
    else createCheckIn.mutate(data, callbacks);
  };

  const handleDelete = (): void => {
    if (!id) return;
    Alert.alert('Delete this check-in?', "It can't be recovered.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCheckIn.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={isEditing ? 'Edit check-in' : 'Check in'}
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
          <Text
            className="text-base font-sans-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            How are you doing?
          </Text>

          <View className="flex-row justify-between mb-6">
            {MOOD_OPTIONS.map((option) => {
              const selected = mood === option.value;
              return (
                <PressableScale
                  key={option.value}
                  onPress={() => setMood(option.value)}
                  haptic="selection"
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  className="items-center"
                >
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-1"
                    style={{
                      backgroundColor: selected
                        ? `${colors.primaryLight}70`
                        : 'rgba(255, 255, 255, 0.5)',
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : 'transparent',
                    }}
                  >
                    <Text className="text-3xl">{option.emoji}</Text>
                  </View>
                  <Text
                    className="text-xs"
                    style={{
                      color: selected ? colors.primaryDark : colors.text.secondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Check-in note"
            className="p-4 rounded-2xl mb-4"
            style={{
              minHeight: 140,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              color: colors.text.primary,
              fontFamily: 'Nunito_400Regular',
              fontSize: 16,
            }}
          />

          <View
            className="flex-row items-center p-4 rounded-2xl mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
          >
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-sans-medium"
                style={{ color: colors.text.primary }}
              >
                Share with your partner
              </Text>
              <Text className="text-sm" style={{ color: colors.text.secondary }}>
                {isShared
                  ? 'They’ll see it, and it shows up in your story.'
                  : 'Only you will see this.'}
              </Text>
            </View>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel="Share with your partner"
            />
          </View>

          <Button onPress={handleSave} disabled={!canSave} loading={saving} fullWidth>
            {isEditing ? 'Save changes' : 'Save check-in'}
          </Button>

          {isEditing && (
            <View className="items-center mt-4">
              <PressableScale
                onPress={handleDelete}
                haptic="light"
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text
                  className="text-sm font-sans-semibold"
                  style={{ color: colors.error }}
                >
                  Delete check-in
                </Text>
              </PressableScale>
            </View>
          )}

          {saveFailed && (
            <Text className="text-sm text-center mt-3" style={{ color: colors.error }}>
              Couldn&apos;t save your check-in. Please try again.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
