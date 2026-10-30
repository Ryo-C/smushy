import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import {
  ScreenHeader,
  HeaderIconButton,
} from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useMoment } from '../api/useMoment';
import { useUpdateMoment } from '../api/useUpdateMoment';
import { MomentForm } from '../components/MomentForm';
import type { CreateMomentDTO } from '../types';

/** Only the moment creator can edit. */
export function EditMomentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuthStore();
  const reducedMotion = useReducedMotion();

  const { data: moment, isLoading, isError, error, refetch } = useMoment(id || '');
  const updateMutation = useUpdateMoment();

  const currentUserId = user?.id || '';
  const isOwnMoment = moment?.user_id === currentUserId;

  const headerEntering = reducedMotion ? undefined : FadeIn.duration(600);
  const formEntering = reducedMotion ? undefined : FadeInUp.delay(200).duration(400);

  const handleBack = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubmit = (data: CreateMomentDTO): void => {
    if (!moment) return;

    updateMutation.mutate(
      { id: moment.id, data },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      }
    );
  };

  const closeButton = <HeaderIconButton icon="x" onPress={handleBack} />;

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Edit Moment" leftAction={closeButton} />
        <View className="flex-1">
          <LoadingSpinner message="Loading moment..." />
        </View>
      </Screen>
    );
  }

  if (isError || !moment) {
    return (
      <Screen>
        <ScreenHeader title="Edit Moment" leftAction={closeButton} />
        <EmptyState
          title="Couldn't load moment"
          message={error?.message || 'This moment could not be found.'}
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  if (!isOwnMoment) {
    return (
      <Screen>
        <ScreenHeader title="Edit Moment" leftAction={closeButton} />
        <EmptyState
          title="Not yours to edit"
          message="Only whoever added a moment can edit it."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Animated.View entering={headerEntering}>
        <ScreenHeader title="Edit Moment" leftAction={closeButton} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Animated.View entering={formEntering} className="flex-1 px-4 pt-4">
          <MomentForm
            initialValues={moment}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </Animated.View>

        {updateMutation.isError && (
          <View className="px-4 pb-4">
            <View
              className="p-3 rounded-2xl"
              style={{ backgroundColor: colors.errorLight }}
            >
              <Text className="text-sm" style={{ color: colors.error }}>
                {updateMutation.error?.message ||
                  'Failed to update moment. Please try again.'}
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
