import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import {
  ScreenHeader,
  HeaderIconButton,
} from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useCreateMoment } from '../api/useCreateMoment';
import { MomentForm } from '../components/MomentForm';
import type { CreateMomentDTO } from '../types';

export function CreateMomentScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuthStore();
  const reducedMotion = useReducedMotion();

  const createMutation = useCreateMoment();

  const headerEntering = reducedMotion ? undefined : FadeIn.duration(600);
  const formEntering = reducedMotion ? undefined : FadeInUp.delay(200).duration(400);

  const handleBack = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubmit = (data: CreateMomentDTO): void => {
    const momentData: CreateMomentDTO = {
      ...data,
      user_id: user?.id || '',
      partner_id: user?.partner_id,
    };

    createMutation.mutate(momentData, {
      onSuccess: (newMoment) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/(tabs)/moments/${newMoment.id}`);
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    });
  };

  const closeButton = <HeaderIconButton icon="x" onPress={handleBack} />;

  return (
    <Screen>
      <Animated.View entering={headerEntering}>
        <ScreenHeader title="New Moment" leftAction={closeButton} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Animated.View entering={formEntering} className="flex-1 px-4 pt-4">
          <MomentForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel="Create Moment"
          />
        </Animated.View>

        {createMutation.isError && (
          <View className="px-4 pb-4">
            <View
              className="p-3 rounded-2xl"
              style={{ backgroundColor: colors.errorLight }}
            >
              <Text className="text-sm" style={{ color: colors.error }}>
                {createMutation.error?.message ||
                  'Failed to create moment. Please try again.'}
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
