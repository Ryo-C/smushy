import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

import { Screen } from '@/shared/components/layout/Screen';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ScreenHeader } from '@/shared/components/navigation/ScreenHeader';
import { Text } from '@/shared/components/ui/Text';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { getMomentTypeLabel } from '../utils';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useMoments } from '../api/useMoments';
import { MomentCard } from '../components/MomentCard';
import { MomentFilterSheet } from '../components/MomentFilterSheet';
import { MomentSearchBar } from '../components/MomentSearchBar';
import type {
  Moment,
  MomentType,
  MomentTimeframe,
  MomentFilters as MomentFiltersData,
} from '../types';

export function MomentsListScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuthStore();
  const reducedMotion = useReducedMotion();

  const [selectedType, setSelectedType] = useState<MomentType | null>(null);
  const [timeframe, setTimeframe] = useState<MomentTimeframe | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Debounce search so each keystroke doesn't trigger a fetch
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const filters = useMemo((): MomentFiltersData => {
    const next: MomentFiltersData = {};
    if (selectedType) next.type = selectedType;
    if (timeframe) next.when = timeframe;
    if (search) next.search = search;
    return next;
  }, [selectedType, timeframe, search]);
  const hasFilters = Object.keys(filters).length > 0;
  const activeFilterCount = (selectedType ? 1 : 0) + (timeframe ? 1 : 0);
  const filterSummary = [
    timeframe === 'upcoming' ? 'Upcoming' : timeframe === 'past' ? 'Past' : null,
    selectedType ? getMomentTypeLabel(selectedType) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const clearFilters = (): void => {
    setSelectedType(null);
    setTimeframe(null);
  };

  const { data: moments, isLoading, isError, error, refetch } = useMoments(filters);

  const currentUserId = user?.id || '';
  // TODO: Get partner name from user/couple data
  const partnerName = 'Partner';

  const handleMomentPress = useCallback(
    (moment: Moment): void => {
      router.push(`/(tabs)/moments/${moment.id}`);
    },
    [router]
  );

  const handleCreatePress = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/moments/create');
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Moment; index: number }) => {
      // Stagger animation - only animate first 10 items to avoid performance issues
      const shouldAnimate = !reducedMotion && index < 10;
      const enteringAnimation = shouldAnimate
        ? FadeInUp.delay(index * 50)
            .duration(400)
            .springify()
        : undefined;

      return (
        <Animated.View entering={enteringAnimation}>
          <MomentCard
            moment={item}
            currentUserId={currentUserId}
            partnerName={partnerName}
            onPress={handleMomentPress}
          />
        </Animated.View>
      );
    },
    [currentUserId, partnerName, handleMomentPress, reducedMotion]
  );

  const renderEmptyState = (): React.ReactElement => {
    if (isLoading) {
      return <LoadingSpinner message="Loading moments..." />;
    }

    if (isError) {
      return (
        <EmptyState
          title="Something went wrong"
          message={error?.message || 'Failed to load moments. Please try again.'}
          actionLabel="Retry"
          onAction={() => refetch()}
          icon={<Feather name="alert-circle" size={48} color={colors.error} />}
        />
      );
    }

    if (hasFilters) {
      return (
        <EmptyState
          title="Nothing matches"
          message={
            search ? `No moments match "${search}".` : 'No moments match these filters.'
          }
          actionLabel="Clear filters"
          onAction={() => {
            clearFilters();
            setSearchText('');
          }}
          icon={<Feather name="search" size={48} color={colors.primary} />}
          variant="warm"
        />
      );
    }

    return (
      <EmptyState
        title="Nothing here yet"
        message="Add the first one. Coffee runs count."
        actionLabel="Create Moment"
        onAction={handleCreatePress}
        icon={<Feather name="heart" size={48} color={colors.primary} />}
        variant="warm"
      />
    );
  };

  const headerEntering = reducedMotion ? undefined : FadeIn.duration(600);
  const filterBarEntering = reducedMotion ? undefined : FadeInUp.delay(200).duration(400);
  const emptyStateEntering = reducedMotion ? undefined : FadeIn.delay(300).duration(600);

  return (
    <Screen>
      <Animated.View entering={headerEntering}>
        <ScreenHeader title="Moments" largeTitle />
      </Animated.View>

      <View className="flex-1">
        <Animated.View entering={filterBarEntering}>
          <View className="flex-row items-center px-4 pt-1">
            <MomentSearchBar value={searchText} onChangeText={setSearchText} />
            <PressableScale
              onPress={() => setFiltersOpen(true)}
              haptic="light"
              scaleTo={0.92}
              accessibilityRole="button"
              accessibilityLabel={
                activeFilterCount ? `Filters, ${activeFilterCount} on` : 'Filters'
              }
              className="ml-2 items-center justify-center rounded-2xl"
              style={{
                width: 44,
                height: 44,
                backgroundColor: activeFilterCount
                  ? `${colors.primaryLight}55`
                  : 'rgba(255, 255, 255, 0.55)',
                borderWidth: 1,
                borderColor: activeFilterCount
                  ? colors.primaryLight
                  : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Feather
                name="sliders"
                size={18}
                color={activeFilterCount ? colors.primaryDark : colors.text.secondary}
              />
              {activeFilterCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: colors.secondaryDark,
                  }}
                />
              )}
            </PressableScale>
          </View>

          {activeFilterCount > 0 && (
            <View className="flex-row px-4 pt-3">
              <PressableScale
                onPress={clearFilters}
                haptic="light"
                accessibilityRole="button"
                accessibilityLabel="Clear filters"
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${colors.primaryLight}40` }}
              >
                <Text className="text-sm" style={{ color: colors.primaryDark }}>
                  {filterSummary}
                </Text>
                <Feather
                  name="x"
                  size={14}
                  color={colors.primaryDark}
                  style={{ marginLeft: 6 }}
                />
              </PressableScale>
            </View>
          )}
          <View className="h-3" />
        </Animated.View>

        <MomentFilterSheet
          visible={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          type={selectedType}
          onTypeChange={setSelectedType}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onClear={() => {
            setSelectedType(null);
            setTimeframe(null);
          }}
        />

        <View className="flex-1 px-4">
          {isLoading ? (
            <LoadingSpinner message="Loading moments..." />
          ) : !moments || moments.length === 0 ? (
            <Animated.View entering={emptyStateEntering} className="flex-1">
              {renderEmptyState()}
            </Animated.View>
          ) : (
            <FlatList
              data={moments}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              onRefresh={() => refetch()}
              refreshing={isLoading}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
