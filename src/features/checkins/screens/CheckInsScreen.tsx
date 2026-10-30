import React from 'react';
import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ScreenHeader } from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { MOOD_OPTIONS } from '@/shared/utils/mood';
import { useCheckIns } from '../api/useCheckIns';
import { CheckInCard } from '../components/CheckInCard';
import type { CheckInEntry } from '../types';

export function CheckInsScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const reducedMotion = useReducedMotion();

  const {
    data: checkIns,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCheckIns();

  const openNew = (): void => router.push('/new-check-in');

  const prompt = (
    <PressableScale
      onPress={openNew}
      haptic="light"
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel="New check-in"
      className="p-4 rounded-3xl mb-5"
      style={{ backgroundColor: colors.primary }}
    >
      <Text
        className="text-lg font-sans-semibold mb-1"
        style={{ color: colors.text.inverse }}
      >
        How are you doing?
      </Text>
      <Text className="text-sm mb-3" style={{ color: colors.text.inverse, opacity: 0.9 }}>
        Only you see it, unless you share.
      </Text>
      <View className="flex-row justify-between">
        {MOOD_OPTIONS.map((option) => (
          <View
            key={option.value}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
          >
            <Text className="text-2xl">{option.emoji}</Text>
          </View>
        ))}
      </View>
    </PressableScale>
  );

  const renderItem = ({ item, index }: { item: CheckInEntry; index: number }) => (
    <Animated.View
      entering={
        reducedMotion || index > 8 ? undefined : FadeInUp.delay(index * 50).duration(400)
      }
    >
      <CheckInCard
        checkIn={item}
        onPress={
          item.is_mine ? (checkIn) => router.push(`/check-in/${checkIn.id}`) : undefined
        }
      />
    </Animated.View>
  );

  const renderBody = (): React.ReactElement => {
    if (isLoading) {
      return <LoadingSpinner message="Loading check-ins..." />;
    }

    if (isError) {
      return (
        <EmptyState
          title="Something went wrong"
          message={error?.message || 'Failed to load check-ins. Please try again.'}
          actionLabel="Retry"
          onAction={() => refetch()}
          icon={<Feather name="alert-circle" size={48} color={colors.error} />}
        />
      );
    }

    return (
      <FlatList
        data={checkIns ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={prompt}
        ListEmptyComponent={
          <Text className="text-center mt-4" style={{ color: colors.text.secondary }}>
            No check-ins yet.
          </Text>
        }
        showsVerticalScrollIndicator={false}
        onRefresh={() => refetch()}
        refreshing={isRefetching}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />
    );
  };

  return (
    <Screen>
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)}>
        <ScreenHeader title="Check-ins" showBackButton />
      </Animated.View>

      <View className="flex-1 pt-3">{renderBody()}</View>
    </Screen>
  );
}
