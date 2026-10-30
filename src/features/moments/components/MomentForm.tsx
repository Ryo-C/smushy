import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Switch, Pressable, ScrollView } from 'react-native';
import { Image } from '@/shared/components/ui/Image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/shared/components/ui/Text';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { MomentTypeSelector } from './MomentTypeSelector';
import type { Moment, MomentType, CreateMomentDTO } from '../types';

interface MomentFormProps {
  /** Initial values for editing, undefined for create */
  initialValues?: Moment;
  /** Called when form is submitted with valid data */
  onSubmit: (data: CreateMomentDTO) => void;
  /** Whether the form is in loading/submitting state */
  isLoading?: boolean;
  /** Submit button text */
  submitLabel?: string;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  type: MomentType;
  location: string;
  photo_url: string;
  is_shared: boolean;
  tags: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  type?: string;
}

export const MomentForm: React.FC<MomentFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Moment',
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const descriptionRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const tagsRef = useRef<TextInput>(null);

  const [focusStates, setFocusStates] = useState({
    title: false,
    date: false,
    location: false,
    description: false,
    tags: false,
  });

  const titleScale = useSharedValue(1);
  const dateScale = useSharedValue(1);
  const locationScale = useSharedValue(1);
  const descriptionScale = useSharedValue(1);
  const tagsScale = useSharedValue(1);

  useEffect(() => {
    titleScale.value = withSpring(focusStates.title ? 1.01 : 1);
  }, [focusStates.title]);

  useEffect(() => {
    dateScale.value = withSpring(focusStates.date ? 1.01 : 1);
  }, [focusStates.date]);

  useEffect(() => {
    locationScale.value = withSpring(focusStates.location ? 1.01 : 1);
  }, [focusStates.location]);

  useEffect(() => {
    descriptionScale.value = withSpring(focusStates.description ? 1.01 : 1);
  }, [focusStates.description]);

  useEffect(() => {
    tagsScale.value = withSpring(focusStates.tags ? 1.01 : 1);
  }, [focusStates.tags]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const dateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dateScale.value }],
  }));

  const locationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: locationScale.value }],
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: descriptionScale.value }],
  }));

  const tagsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tagsScale.value }],
  }));

  const handleFocus = (field: keyof typeof focusStates): void => {
    setFocusStates((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof focusStates): void => {
    setFocusStates((prev) => ({ ...prev, [field]: false }));
  };

  const [form, setForm] = useState<FormState>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    date: initialValues?.date || new Date().toISOString().split('T')[0],
    type: initialValues?.type || 'date',
    location: initialValues?.location || '',
    photo_url: initialValues?.photo_url || '',
    is_shared: initialValues?.is_shared || false,
    tags: initialValues?.tags?.join(', ') || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        description: initialValues.description || '',
        date: initialValues.date || new Date().toISOString().split('T')[0],
        type: initialValues.type || 'date',
        location: initialValues.location || '',
        photo_url: initialValues.photo_url || '',
        is_shared: initialValues.is_shared || false,
        tags: initialValues.tags?.join(', ') || '',
      });
    }
  }, [initialValues]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!form.date) {
      newErrors.date = 'Date is required';
    } else {
      const dateObj = new Date(form.date);
      if (isNaN(dateObj.getTime())) {
        newErrors.date = 'Please enter a valid date (YYYY-MM-DD)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const tagsArray = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const data: CreateMomentDTO = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      type: form.type,
      location: form.location.trim() || undefined,
      photo_url: form.photo_url || undefined,
      is_shared: form.is_shared,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      user_id: initialValues?.user_id || '',
      partner_id: initialValues?.partner_id,
    };

    onSubmit(data);
  };

  const handlePhotoPress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement image picker
    console.log('[MomentForm] Photo picker not yet implemented');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View className="pb-8">
        <View className="mb-5">
          <Text
            className="text-base font-sans-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Photo
          </Text>
          <Pressable
            onPress={handlePhotoPress}
            disabled={isLoading}
            className="items-center justify-center rounded-lg border-2 border-dashed overflow-hidden"
            style={{
              height: 160,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            {form.photo_url ? (
              <Image
                source={{ uri: form.photo_url }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View className="items-center">
                <Feather name="camera" size={32} color={colors.text.secondary} />
                <Text className="text-sm mt-2" style={{ color: colors.text.secondary }}>
                  Tap to add a photo
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Animated.View className="mb-4" style={titleAnimatedStyle}>
          <Input
            label="Title *"
            placeholder="Give it a name"
            value={form.title}
            onChangeText={(text) => updateField('title', text)}
            error={errors.title}
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            onFocus={() => handleFocus('title')}
            onBlur={() => handleBlur('title')}
          />
        </Animated.View>

        <View className="mb-4">
          <Text
            className="text-base font-sans-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Type *
          </Text>
          <MomentTypeSelector
            value={form.type}
            onChange={(type) => updateField('type', type)}
            disabled={isLoading}
          />
        </View>

        <Animated.View className="mb-4" style={dateAnimatedStyle}>
          <Input
            label="Date *"
            placeholder="YYYY-MM-DD"
            value={form.date}
            onChangeText={(text) => updateField('date', text)}
            error={errors.date}
            editable={!isLoading}
            keyboardType="default"
            returnKeyType="next"
            onSubmitEditing={() => locationRef.current?.focus()}
            onFocus={() => handleFocus('date')}
            onBlur={() => handleBlur('date')}
          />
          <Text className="text-xs mt-1" style={{ color: colors.text.secondary }}>
            Enter date as YYYY-MM-DD (e.g., 2026-01-05)
          </Text>
        </Animated.View>

        <Animated.View className="mb-4" style={locationAnimatedStyle}>
          <Input
            ref={locationRef}
            label="Location"
            placeholder="Where was this?"
            value={form.location}
            onChangeText={(text) => updateField('location', text)}
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            onFocus={() => handleFocus('location')}
            onBlur={() => handleBlur('location')}
          />
        </Animated.View>

        <Animated.View className="mb-4" style={descriptionAnimatedStyle}>
          <Text
            className="text-base font-sans-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Description
          </Text>
          <TextInput
            ref={descriptionRef}
            placeholder="What happened?"
            value={form.description}
            onChangeText={(text) => updateField('description', text)}
            editable={!isLoading}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="text-base px-4 py-3 border rounded-lg"
            style={{
              minHeight: 100,
              borderColor: focusStates.description ? colors.primary : colors.border,
              backgroundColor: colors.surface,
              color: colors.text.primary,
            }}
            placeholderTextColor={colors.text.disabled}
            onFocus={() => handleFocus('description')}
            onBlur={() => handleBlur('description')}
          />
        </Animated.View>

        <Animated.View className="mb-5" style={tagsAnimatedStyle}>
          <Input
            ref={tagsRef}
            label="Tags"
            placeholder="food, weekend, trip"
            value={form.tags}
            onChangeText={(text) => updateField('tags', text)}
            editable={!isLoading}
            helperText="Separate tags with commas"
            returnKeyType="done"
            onFocus={() => handleFocus('tags')}
            onBlur={() => handleBlur('tags')}
          />
        </Animated.View>

        <View
          className="flex-row items-center justify-between p-4 rounded-2xl mb-6"
          style={{
            backgroundColor: `${colors.surfaceVariant}90`,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <View className="flex-1 mr-4">
            <Text
              className="text-base font-sans-medium"
              style={{ color: colors.text.primary }}
            >
              Share with partner
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Your partner will see this moment in their timeline
            </Text>
          </View>
          <Switch
            value={form.is_shared}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateField('is_shared', value);
            }}
            disabled={isLoading}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={form.is_shared ? colors.primary : colors.surface}
          />
        </View>

        <Button
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          {submitLabel}
        </Button>
      </View>
    </ScrollView>
  );
};
