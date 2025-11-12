import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Hides tab bar UI completely
        tabBarStyle: {
          display: 'none',
        },
        // Makes tabs non-interactive
        tabBarButton: () => null,
        // You can still keep these if needed for consistency
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarBackground: TabBarBackground,
      }}
    >
      {/* Screens can stay here or be removed */}
    </Tabs>
  );
}
