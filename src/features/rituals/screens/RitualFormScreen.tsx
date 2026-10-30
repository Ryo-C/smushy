import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type TextInputProps,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { Button } from '@/shared/components/ui/Button';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import {
  ScreenHeader,
  HeaderIconButton,
} from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  useCreateRitual,
  useDeleteRitual,
  useRituals,
  useUpdateRitual,
} from '../api/useRituals';
import { Feather } from '@expo/vector-icons';
import {
  formatSchedule,
  getRitualIcon,
  REMINDER_OPTIONS,
  RITUAL_ICONS,
  type RitualIcon,
} from '../utils';
import type { RitualFrequency } from '../types';

const FREQUENCIES: { value: RitualFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TIMES = ['07:00', '09:00', '12:30', '18:30', '20:00', '22:00'];

export function RitualFormScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: rituals } = useRituals();
  const existing = id ? rituals?.find((ritual) => ritual.id === id) : undefined;
  const isEditing = Boolean(id);

  const createRitual = useCreateRitual();
  const updateRitual = useUpdateRitual();
  const deleteRitual = useDeleteRitual();
  const saving = createRitual.isPending || updateRitual.isPending;
  const saveFailed = createRitual.isError || updateRitual.isError;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RitualFrequency>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay());
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [time, setTime] = useState('20:00');
  const [reminder, setReminder] = useState(true);
  const [icon, setIcon] = useState<RitualIcon | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState<number>(
    REMINDER_OPTIONS[0].minutes
  );

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description ?? '');
    setFrequency(existing.frequency);
    if (existing.day_of_week !== undefined) setDayOfWeek(existing.day_of_week);
    if (existing.day_of_month !== undefined) setDayOfMonth(existing.day_of_month);
    if (existing.time) setTime(existing.time);
    setReminder(existing.reminder_enabled);
    if (existing.reminder_minutes_before)
      setReminderMinutes(existing.reminder_minutes_before);
  }, [existing]);

  const draft = {
    frequency,
    time,
    day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
    day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
  };
  const canSave = title.trim().length > 0 && !saving;

  const handleSave = (): void => {
    const data = {
      ...draft,
      title,
      description,
      reminder_enabled: reminder,
      reminder_minutes_before: reminder ? reminderMinutes : undefined,
      icon: icon ?? getRitualIcon({ frequency }),
    };
    const callbacks = {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      },
      onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    };
    if (id) updateRitual.mutate({ id, data }, callbacks);
    else createRitual.mutate(data, callbacks);
  };

  const handleDelete = (): void => {
    if (!id) return;
    Alert.alert('Delete this ritual?', 'It will be removed for both of you.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRitual.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  };

  const inputStyle: TextInputProps['style'] = {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: colors.text.primary,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
  };

  const chip = (selected: boolean) => ({
    backgroundColor: selected ? colors.primary : 'rgba(255, 255, 255, 0.6)',
  });
  const chipText = (selected: boolean) => ({
    color: selected ? colors.text.inverse : colors.text.primary,
  });

  const label = (text: string) => (
    <Text
      className="text-xs font-sans-semibold uppercase tracking-wider mb-2 mt-5"
      style={{ color: colors.text.secondary }}
    >
      {text}
    </Text>
  );

  return (
    <Screen>
      <ScreenHeader
        title={isEditing ? 'Edit ritual' : 'New ritual'}
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
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What do you two do?"
            placeholderTextColor={colors.text.disabled}
            accessibilityLabel="Ritual name"
            className="px-4 py-3 rounded-2xl"
            style={[inputStyle, { fontSize: 18, fontFamily: 'Nunito_600SemiBold' }]}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any details (optional)"
            placeholderTextColor={colors.text.disabled}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Ritual details"
            className="px-4 py-3 rounded-2xl mt-3"
            style={[inputStyle, { minHeight: 80 }]}
          />

          {label('Icon')}
          <View className="flex-row flex-wrap">
            {RITUAL_ICONS.map((name) => {
              const selected = (icon ?? getRitualIcon({ frequency })) === name;
              return (
                <PressableScale
                  key={name}
                  onPress={() => setIcon(name)}
                  haptic="selection"
                  scaleTo={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected }}
                  className="w-11 h-11 rounded-full items-center justify-center mr-2 mb-2"
                  style={chip(selected)}
                >
                  <Feather
                    name={name}
                    size={18}
                    color={selected ? colors.text.inverse : colors.text.secondary}
                  />
                </PressableScale>
              );
            })}
          </View>

          {label('How often')}
          <View className="flex-row">
            {FREQUENCIES.map(({ value, label: text }) => (
              <PressableScale
                key={value}
                onPress={() => setFrequency(value)}
                haptic="selection"
                accessibilityRole="button"
                accessibilityState={{ selected: frequency === value }}
                className="flex-1 items-center py-2.5 rounded-xl mx-1"
                style={chip(frequency === value)}
              >
                <Text
                  className="text-sm font-sans-medium"
                  style={chipText(frequency === value)}
                >
                  {text}
                </Text>
              </PressableScale>
            ))}
          </View>

          {frequency === 'weekly' && (
            <View className="flex-row justify-between mt-3 px-1">
              {WEEKDAYS.map((day, index) => (
                <PressableScale
                  key={index}
                  onPress={() => setDayOfWeek(index)}
                  haptic="selection"
                  scaleTo={0.9}
                  accessibilityRole="button"
                  accessibilityState={{ selected: dayOfWeek === index }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={chip(dayOfWeek === index)}
                >
                  <Text
                    className="text-sm font-sans-semibold"
                    style={chipText(dayOfWeek === index)}
                  >
                    {day}
                  </Text>
                </PressableScale>
              ))}
            </View>
          )}

          {frequency === 'monthly' && (
            <View className="flex-row items-center justify-center mt-3">
              <PressableScale
                onPress={() => setDayOfMonth((d) => Math.max(1, d - 1))}
                haptic="selection"
                scaleTo={0.9}
                accessibilityLabel="Earlier day"
                className="w-10 h-10 rounded-full items-center justify-center"
                style={chip(false)}
              >
                <Text className="text-lg" style={chipText(false)}>
                  −
                </Text>
              </PressableScale>
              <Text
                className="text-base font-sans-semibold mx-5"
                style={{ color: colors.text.primary, minWidth: 90, textAlign: 'center' }}
              >
                Day {dayOfMonth}
              </Text>
              <PressableScale
                onPress={() => setDayOfMonth((d) => Math.min(28, d + 1))}
                haptic="selection"
                scaleTo={0.9}
                accessibilityLabel="Later day"
                className="w-10 h-10 rounded-full items-center justify-center"
                style={chip(false)}
              >
                <Text className="text-lg" style={chipText(false)}>
                  +
                </Text>
              </PressableScale>
            </View>
          )}

          {label('Time')}
          <View className="flex-row flex-wrap">
            {TIMES.map((value) => (
              <PressableScale
                key={value}
                onPress={() => setTime(value)}
                haptic="selection"
                accessibilityRole="button"
                accessibilityState={{ selected: time === value }}
                className="px-4 py-2 rounded-full mr-2 mb-2"
                style={chip(time === value)}
              >
                <Text
                  className="text-sm font-sans-medium"
                  style={chipText(time === value)}
                >
                  {value}
                </Text>
              </PressableScale>
            ))}
          </View>

          <View
            className="p-4 rounded-2xl mt-4 mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
          >
            <View className="flex-row items-center">
              <View className="flex-1 mr-3">
                <Text
                  className="text-base font-sans-medium"
                  style={{ color: colors.text.primary }}
                >
                  Remind us
                </Text>
                <Text className="text-sm" style={{ color: colors.text.secondary }}>
                  {formatSchedule(draft)}
                </Text>
              </View>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ true: colors.primary, false: colors.border }}
                accessibilityLabel="Remind us"
              />
            </View>

            {reminder && (
              <View className="flex-row mt-3">
                {REMINDER_OPTIONS.map((option) => {
                  const selected = reminderMinutes === option.minutes;
                  return (
                    <PressableScale
                      key={option.minutes}
                      onPress={() => setReminderMinutes(option.minutes)}
                      haptic="selection"
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      className="flex-1 items-center py-2 rounded-xl mx-1"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : `${colors.primaryLight}25`,
                      }}
                    >
                      <Text
                        className="text-sm font-sans-medium"
                        style={chipText(selected)}
                      >
                        {option.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>

          <Button onPress={handleSave} disabled={!canSave} loading={saving} fullWidth>
            {isEditing ? 'Save changes' : 'Add ritual'}
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
                  Delete ritual
                </Text>
              </PressableScale>
            </View>
          )}

          {saveFailed && (
            <Text className="text-sm text-center mt-3" style={{ color: colors.error }}>
              Couldn&apos;t save that. Try again?
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
