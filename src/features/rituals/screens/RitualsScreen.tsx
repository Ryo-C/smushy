import React, { useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ScreenHeader } from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { useRituals, useMarkRitualDone, useSetRitualActive } from '../api/useRituals';
import { useRouter } from 'expo-router';
import { RitualCard } from '../components/RitualCard';
import { getNextOccurrence } from '../utils';
import type { Ritual } from '../types';

/** No streaks or completion counts, on purpose. */
export function RitualsScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const reducedMotion = useReducedMotion();

  const {
    data: rituals,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useRituals();
  const markDone = useMarkRitualDone();
  const setActive = useSetRitualActive();

  const { active, paused } = useMemo(() => {
    const all = rituals ?? [];
    return {
      active: all
        .filter((r) => r.is_active)
        .sort((a, b) => getNextOccurrence(a).getTime() - getNextOccurrence(b).getTime()),
      paused: all.filter((r) => !r.is_active),
    };
  }, [rituals]);

  const isUpdating = markDone.isPending || setActive.isPending;
  const handleDone = (ritual: Ritual): void => markDone.mutate(ritual.id);
  const handleToggle = (ritual: Ritual): void =>
    setActive.mutate({ id: ritual.id, isActive: !ritual.is_active });

  const renderList = (items: Ritual[], offset: number): React.ReactNode =>
    items.map((ritual, index) => (
      <Animated.View
        key={ritual.id}
        entering={
          reducedMotion ? undefined : FadeInUp.delay((offset + index) * 60).duration(400)
        }
      >
        <RitualCard
          ritual={ritual}
          onDone={handleDone}
          onToggleActive={handleToggle}
          onEdit={(item) => router.push(`/ritual/${item.id}`)}
          isUpdating={isUpdating}
        />
      </Animated.View>
    ));

  const renderBody = (): React.ReactElement => {
    if (isLoading) {
      return <LoadingSpinner message="Loading rituals..." />;
    }

    if (isError) {
      return (
        <EmptyState
          title="Something went wrong"
          message={error?.message || 'Failed to load rituals. Please try again.'}
          actionLabel="Retry"
          onAction={() => refetch()}
          icon={<Feather name="alert-circle" size={48} color={colors.error} />}
        />
      );
    }

    if (active.length === 0 && paused.length === 0) {
      return (
        <EmptyState
          title="No rituals yet"
          message="The stuff you two keep doing on repeat. Sunday breakfast, Friday takeaway, that kind of thing."
          icon={<Feather name="repeat" size={48} color={colors.primary} />}
          variant="warm"
        />
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        {active.length > 0 && (
          <>
            <Text
              className="text-sm font-sans-semibold uppercase tracking-wider mt-2 mb-3"
              style={{ color: colors.primaryDark }}
            >
              Coming up
            </Text>
            {renderList(active, 0)}
          </>
        )}

        {paused.length > 0 && (
          <>
            <Text
              className="text-sm font-sans-semibold uppercase tracking-wider mt-4 mb-3"
              style={{ color: colors.text.secondary }}
            >
              Paused
            </Text>
            {renderList(paused, active.length)}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <Screen>
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(600)}>
        <ScreenHeader title="Rituals" largeTitle />
      </Animated.View>

      <View className="flex-1 pt-2">{renderBody()}</View>
    </Screen>
  );
}
