import React, { useCallback, useMemo, useState } from 'react';
import { View, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ScreenHeader } from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { useStory } from '../api/useStory';
import { StoryControls } from '../components/StoryControls';
import { StoryTimelineRow } from '../components/StoryTimelineRow';
import { StoryMomentCard } from '../components/StoryMomentCard';
import { StoryCheckInCard } from '../components/StoryCheckInCard';
import { StoryThrowbackCard } from '../components/StoryThrowbackCard';
import {
  applyStoryView,
  findThrowback,
  getStoryYears,
  groupStoryByMonth,
} from '../utils';
import type { StoryItem, StoryOrder, StorySection } from '../types';

export function StoryScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const reducedMotion = useReducedMotion();

  const { data: items, isLoading, isError, error, refetch, isRefetching } = useStory();

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [order, setOrder] = useState<StoryOrder>('newest');

  const years = useMemo(() => getStoryYears(items ?? []), [items]);
  const sections = useMemo(
    () => groupStoryByMonth(applyStoryView(items ?? [], selectedYear, order)),
    [items, selectedYear, order]
  );
  const throwback = useMemo(
    () => (selectedYear === null ? findThrowback(items ?? []) : null),
    [items, selectedYear]
  );

  const handleMomentPress = useCallback(
    (item: StoryItem): void => {
      router.push(`/(tabs)/story/moment/${item.source_id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: StoryItem;
      index: number;
      section: StorySection;
    }) => {
      const shouldAnimate = !reducedMotion && index < 6;
      const entering = shouldAnimate
        ? FadeInUp.delay(index * 60).duration(400)
        : undefined;

      return (
        <Animated.View entering={entering}>
          <StoryTimelineRow
            emphasis={item.type === 'moment'}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
          >
            {item.type === 'moment' ? (
              <StoryMomentCard item={item} onPress={handleMomentPress} />
            ) : (
              <StoryCheckInCard item={item} />
            )}
          </StoryTimelineRow>
        </Animated.View>
      );
    },
    [handleMomentPress, reducedMotion]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: StorySection }) => (
      <Text
        className="text-sm font-sans-semibold uppercase tracking-wider mt-2 mb-3"
        style={{ color: colors.primaryDark }}
      >
        {section.title}
      </Text>
    ),
    [colors.primaryDark]
  );

  const headerEntering = reducedMotion ? undefined : FadeIn.duration(600);
  const controlsEntering = reducedMotion ? undefined : FadeInUp.delay(200).duration(400);

  const renderBody = (): React.ReactElement => {
    if (isLoading) {
      return <LoadingSpinner message="Loading your story..." />;
    }

    if (isError) {
      return (
        <EmptyState
          title="Something went wrong"
          message={error?.message || 'Failed to load your story. Please try again.'}
          actionLabel="Retry"
          onAction={() => refetch()}
          icon={<Feather name="alert-circle" size={48} color={colors.error} />}
        />
      );
    }

    if (sections.length === 0) {
      return (
        <EmptyState
          title="Nothing to look back on yet"
          message="Shared moments land here once they've happened."
          actionLabel="Add a moment"
          onAction={() => router.push('/(tabs)/moments/create')}
          icon={<Feather name="book-open" size={48} color={colors.primary} />}
          variant="warm"
        />
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          throwback ? (
            <StoryThrowbackCard throwback={throwback} onPress={handleMomentPress} />
          ) : undefined
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onRefresh={() => refetch()}
        refreshing={isRefetching}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />
    );
  };

  return (
    <Screen>
      <Animated.View entering={headerEntering}>
        <ScreenHeader title="Our Story" largeTitle />
      </Animated.View>

      {years.length > 0 && (
        <Animated.View entering={controlsEntering}>
          <StoryControls
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            order={order}
            onOrderChange={setOrder}
          />
        </Animated.View>
      )}

      <View className="flex-1">{renderBody()}</View>
    </Screen>
  );
}
