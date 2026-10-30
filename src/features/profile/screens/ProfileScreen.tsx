import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';
import { ScreenHeader } from '@/shared/components/navigation/ScreenHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { usePartnerProfile, useProfile, useUpdatePreferences } from '../api/useProfile';
import { SettingsGroup, SettingsRow } from '../components/SettingsGroup';

interface ProfileScreenProps {
  /** Account actions (e.g. log out), supplied by the route so this feature stays independent of auth */
  accountAction?: React.ReactNode;
}

export function ProfileScreen({ accountAction }: ProfileScreenProps) {
  const router = useRouter();
  const { currentTheme, currentThemeId, setTheme, availableThemes } = useTheme();
  const { colors } = currentTheme;
  const reducedMotion = useReducedMotion();

  const { data: profile, isLoading } = useProfile();
  const { data: partner } = usePartnerProfile();
  const updatePreferences = useUpdatePreferences();
  const preferences = profile?.preferences;

  const enter = (index: number) =>
    reducedMotion ? undefined : FadeInUp.delay(80 + index * 60).duration(400);

  const connectedSince = profile?.partner_connected_at
    ? new Date(profile.partner_connected_at).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleInvite = (): void => {
    Alert.alert(
      'Invite your partner',
      'Partner invites aren’t available in this demo yet.'
    );
  };

  return (
    <Screen>
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(500)}>
        <ScreenHeader title="Profile" largeTitle />
      </Animated.View>

      {isLoading || !profile || !preferences ? (
        <LoadingSpinner message="Loading profile..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 32,
          }}
        >
          <Animated.View entering={enter(0)}>
            <View
              className="items-center rounded-3xl px-5 py-6 mb-6"
              style={{
                backgroundColor: `${colors.surface}CC`,
                borderWidth: 0.5,
                borderColor: `${colors.text.primary}10`,
              }}
            >
              <PressableScale
                onPress={() => router.push('/edit-profile')}
                haptic="light"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                className="absolute top-4 right-4 flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: colors.surfaceVariant }}
              >
                <Feather name="edit-2" size={12} color={colors.primaryDark} />
                <Text
                  className="text-xs font-sans-semibold ml-1"
                  style={{ color: colors.primaryDark }}
                >
                  Edit
                </Text>
              </PressableScale>
              <View className="flex-row mb-3">
                <Avatar name={profile.name} uri={profile.avatar_url} size={64} ring />
                {partner && (
                  <View style={{ marginLeft: -16 }}>
                    <Avatar
                      name={partner.name}
                      uri={partner.avatar_url}
                      size={64}
                      tone="secondary"
                      ring
                    />
                  </View>
                )}
              </View>
              <Text
                className="text-xl font-sans-bold"
                style={{ color: colors.text.primary }}
              >
                {partner ? `${profile.name} & ${partner.name}` : profile.name}
              </Text>
              <Text className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                {partner && connectedSince
                  ? `Together on Smushy since ${connectedSince}`
                  : 'Not connected to a partner yet'}
              </Text>
              {profile.bio && (
                <Text
                  className="text-sm text-center mt-3"
                  style={{ color: colors.text.primary }}
                >
                  {profile.bio}
                </Text>
              )}
              {!partner && (
                <View className="mt-4 w-full">
                  <Button onPress={handleInvite} fullWidth>
                    Invite your partner
                  </Button>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={enter(1)}>
            <SettingsGroup title="Private">
              <SettingsRow
                icon="feather"
                accent="secondary"
                label="Check-ins"
                detail="Only you see them, unless you share"
                onPress={() => router.push('/(tabs)/profile/check-ins')}
                isLast
              />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <SettingsGroup title="Reminders">
              <SettingsRow
                icon="wind"
                accent="sage"
                label="Nudges"
                detail="An occasional poke to plan something. No streaks."
                value={preferences.nudges_enabled}
                onValueChange={(nudges_enabled) =>
                  updatePreferences.mutate({ nudges_enabled })
                }
              />
              {preferences.nudges_enabled && (
                <View
                  className="flex-row px-4 py-3"
                  style={{
                    borderBottomWidth: 0.5,
                    borderBottomColor: `${colors.text.primary}10`,
                  }}
                >
                  {(['daily', 'weekly'] as const).map((frequency) => {
                    const selected = preferences.nudge_frequency === frequency;
                    return (
                      <PressableScale
                        key={frequency}
                        onPress={() =>
                          updatePreferences.mutate({ nudge_frequency: frequency })
                        }
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
                          style={{
                            color: selected ? colors.text.inverse : colors.text.primary,
                          }}
                        >
                          {frequency === 'daily' ? 'Daily' : 'Weekly'}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              )}
              <SettingsRow
                icon="bell"
                accent="mist"
                label="Notifications"
                detail="When your partner shares a moment or check-in"
                value={preferences.notifications_enabled}
                onValueChange={(notifications_enabled) =>
                  updatePreferences.mutate({ notifications_enabled })
                }
                isLast
              />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={enter(3)}>
            <SettingsGroup title="Appearance">
              <View className="flex-row p-3">
                {availableThemes.map((theme) => {
                  const selected = currentThemeId === theme.id;
                  return (
                    <PressableScale
                      key={theme.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setTheme(theme.id);
                        updatePreferences.mutate({ theme_id: theme.id });
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${theme.name} theme`}
                      className="flex-1 items-center py-3 rounded-xl mx-1"
                      style={{
                        backgroundColor: selected
                          ? `${colors.primaryLight}40`
                          : 'transparent',
                        borderWidth: 1.5,
                        borderColor: selected
                          ? colors.primary
                          : `${colors.text.primary}12`,
                      }}
                    >
                      <View className="flex-row mb-2">
                        {[
                          theme.colors.primary,
                          theme.colors.secondary,
                          theme.colors.primaryLight,
                        ].map((swatch, index) => (
                          <View
                            key={swatch}
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              backgroundColor: swatch,
                              marginLeft: index === 0 ? 0 : -4,
                              borderWidth: 1.5,
                              borderColor: colors.surface,
                            }}
                          />
                        ))}
                      </View>
                      <Text
                        className="text-sm font-sans-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        {theme.name}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </SettingsGroup>
          </Animated.View>

          {accountAction && (
            <Animated.View entering={enter(4)}>{accountAction}</Animated.View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
