import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Image } from '@/shared/components/ui/Image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
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
import { formatDate } from '@/shared/utils/formatDate';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useMoment } from '../api/useMoment';
import { useDeleteMoment } from '../api/useDeleteMoment';
import { getMomentTypeLabel, getMomentTypeAccent } from '../utils';
import { getAccent } from '@/shared/theme';

export function MomentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuthStore();
  const reducedMotion = useReducedMotion();

  const { data: moment, isLoading, isError, error, refetch } = useMoment(id || '');
  const deleteMutation = useDeleteMoment();

  const currentUserId = user?.id || '';
  const isOwnMoment = moment?.user_id === currentUserId;
  // TODO: Get partner name from user/couple data
  const partnerName = 'Your partner';

  const headerEntering = reducedMotion ? undefined : FadeIn.duration(600);
  const imageEntering = reducedMotion ? undefined : FadeInUp.delay(0).duration(400);
  const titleEntering = reducedMotion ? undefined : FadeInUp.delay(100).duration(400);
  const metadataEntering = reducedMotion ? undefined : FadeInUp.delay(200).duration(400);
  const descriptionEntering = reducedMotion
    ? undefined
    : FadeInUp.delay(300).duration(400);
  const tagsEntering = reducedMotion ? undefined : FadeInUp.delay(400).duration(400);
  const footerEntering = reducedMotion ? undefined : FadeInUp.delay(500).duration(400);

  const handleEdit = (): void => {
    if (!moment) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/moments/${moment.id}/edit`);
  };

  const handleDelete = (): void => {
    if (!moment) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Delete this moment?', "If it's shared, it disappears for both of you.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(moment.id, {
            onSuccess: () => {
              router.replace('/(tabs)/moments');
            },
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Moment" showBackButton />
        <View className="flex-1">
          <LoadingSpinner message="Loading moment..." />
        </View>
      </Screen>
    );
  }

  if (isError || !moment) {
    return (
      <Screen>
        <ScreenHeader title="Moment" showBackButton />
        <EmptyState
          title="Couldn't load moment"
          message={error?.message || 'This moment could not be found.'}
          actionLabel="Try Again"
          onAction={() => refetch()}
          icon={<Feather name="alert-circle" size={48} color={colors.error} />}
        />
      </Screen>
    );
  }

  const typeLabel = getMomentTypeLabel(moment.type);
  const typeAccent = getAccent(colors, getMomentTypeAccent(moment.type));
  const formattedDate = formatDate(moment.date);
  const creatorText = isOwnMoment ? 'Created by you' : `Created by ${partnerName}`;

  const rightActions = isOwnMoment
    ? [
        <HeaderIconButton key="edit" icon="edit-2" onPress={handleEdit} />,
        <HeaderIconButton
          key="delete"
          icon="trash-2"
          onPress={handleDelete}
          color={colors.error}
        />,
      ]
    : [];

  return (
    <Screen>
      <Animated.View entering={headerEntering}>
        <ScreenHeader title={moment.title} showBackButton rightActions={rightActions} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {moment.photo_url && (
          <Animated.View entering={imageEntering}>
            <Image
              source={{ uri: moment.photo_url }}
              className="w-full h-64"
              contentFit="cover"
              transition={300}
            />
          </Animated.View>
        )}

        <View className="p-4">
          <Animated.View entering={titleEntering}>
            <Text
              className="text-2xl font-sans-bold mb-3"
              style={{ color: colors.text.primary }}
            >
              {moment.title}
            </Text>
          </Animated.View>

          <Animated.View entering={metadataEntering} className="mb-4">
            <View className="flex-row flex-wrap gap-2">
              <View
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{
                  backgroundColor: `${colors.primaryLight}30`,
                  borderWidth: 1,
                  borderColor: `${colors.primaryLight}50`,
                }}
              >
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text className="text-sm ml-2" style={{ color: colors.text.primary }}>
                  {formattedDate}
                </Text>
              </View>

              <View
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{ backgroundColor: typeAccent.soft }}
              >
                <Text
                  className="text-sm font-sans-medium"
                  style={{ color: typeAccent.solid }}
                >
                  {typeLabel}
                </Text>
              </View>

              {moment.location && (
                <View
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: `${colors.primaryLight}30`,
                    borderWidth: 1,
                    borderColor: `${colors.primaryLight}50`,
                  }}
                >
                  <Feather name="map-pin" size={14} color={colors.primary} />
                  <Text className="text-sm ml-2" style={{ color: colors.text.primary }}>
                    {moment.location}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {moment.description && (
            <Animated.View entering={descriptionEntering}>
              <View className="h-px my-4" style={{ backgroundColor: colors.border }} />
              <Text
                className="text-base leading-6 mb-4"
                style={{ color: colors.text.primary }}
              >
                {moment.description}
              </Text>
            </Animated.View>
          )}

          {moment.tags && moment.tags.length > 0 && (
            <Animated.View entering={tagsEntering}>
              <View className="h-px my-4" style={{ backgroundColor: colors.border }} />
              <View className="flex-row flex-wrap gap-2 mb-4">
                {moment.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Text className="text-sm" style={{ color: colors.text.primary }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <Animated.View entering={footerEntering}>
            <View className="h-px my-4" style={{ backgroundColor: colors.border }} />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm" style={{ color: colors.text.secondary }}>
                {creatorText}
              </Text>
              {moment.is_shared && (
                <View
                  className="flex-row items-center px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: `${colors.primaryLight}30`,
                    borderWidth: 1,
                    borderColor: `${colors.primaryLight}50`,
                  }}
                >
                  <Feather name="users" size={13} color={colors.primaryDark} />
                  <Text className="text-sm ml-1.5" style={{ color: colors.primaryDark }}>
                    Shared
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {deleteMutation.isPending && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <LoadingSpinner message="Deleting..." />
        </View>
      )}
    </Screen>
  );
}
