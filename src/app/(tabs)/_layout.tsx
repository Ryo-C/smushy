import { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { TabBar, TabBarItem, TabBarFAB } from '@/shared/components/navigation/TabBar';
import {
  CreateMenu,
  type CreateMenuItem,
} from '@/shared/components/navigation/CreateMenu';

type TabConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  moments: { icon: 'heart', label: 'Moments' },
  story: { icon: 'time', label: 'Story' },
  rituals: { icon: 'refresh', label: 'Rituals' },
  profile: { icon: 'person', label: 'Profile' },
};

const LEFT_TABS = ['moments', 'story'];
const RIGHT_TABS = ['rituals', 'profile'];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const createItems: CreateMenuItem[] = [
    {
      key: 'moment',
      icon: 'image',
      label: 'Moment',
      detail: 'Something you did, or something coming up',
      onPress: () => router.push('/(tabs)/moments/create'),
    },
    {
      key: 'check-in',
      icon: 'feather',
      label: 'Check-in',
      accent: 'secondary',
      detail: 'How you\u2019re doing. Private unless you share',
      onPress: () => router.push('/new-check-in'),
    },
    {
      key: 'ritual',
      icon: 'repeat',
      label: 'Ritual',
      accent: 'sage',
      detail: 'Something you two do on repeat',
      onPress: () => router.push('/new-ritual'),
    },
  ];

  const renderTabItem = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return null;

    const index = state.routes.findIndex((r) => r.name === routeName);
    const isFocused = state.index === index;
    const config = TAB_CONFIG[routeName];

    if (!config) return null;

    const onPress = (): void => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    return (
      <TabBarItem
        key={route.key}
        icon={config.icon}
        label={config.label}
        isFocused={isFocused}
        onPress={onPress}
      />
    );
  };

  return (
    <>
      <TabBar fab={<TabBarFAB onPress={() => setMenuOpen(true)} />}>
        {LEFT_TABS.map(renderTabItem)}

        <View style={{ width: 56 }} />

        {RIGHT_TABS.map(renderTabItem)}
      </TabBar>
      <CreateMenu
        visible={menuOpen}
        items={createItems}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="moments"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="moments" options={{ title: 'Moments' }} />
      <Tabs.Screen name="story" options={{ title: 'Story' }} />
      <Tabs.Screen name="rituals" options={{ title: 'Rituals' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
