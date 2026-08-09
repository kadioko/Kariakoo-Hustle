import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SplashScreen } from '@/screens/SplashScreen';
import { MainMenuScreen } from '@/screens/MainMenuScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { MarketScreen } from '@/screens/MarketScreen';
import { InventoryScreen } from '@/screens/InventoryScreen';
import { UpgradesScreen } from '@/screens/UpgradesScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { SellScreen } from '@/screens/SellScreen';
import { WorkersScreen } from '@/screens/WorkersScreen';
import { LocationsScreen } from '@/screens/LocationsScreen';
import { ReportScreen } from '@/screens/ReportScreen';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { MonetizationScreen } from '@/screens/MonetizationScreen';
import { BankScreen } from '@/screens/BankScreen';
import { TravelScreen } from '@/screens/TravelScreen';
import { PropertyScreen } from '@/screens/PropertyScreen';
import { LessonsScreen } from '@/screens/LessonsScreen';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { colors } from '@/theme';

export type RootStackParamList = {
  Splash: undefined;
  Menu: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  Sell: undefined;
  Workers: undefined;
  Locations: undefined;
  Reports: undefined;
  Achievements: undefined;
  Settings: undefined;
  Monetization: undefined;
  Bank: undefined;
  Travel: undefined;
  Property: undefined;
  Lessons: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </View>
  );
}

function MainTabs() {
  const { language } = useGame();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 56 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('tab_dashboard', language),
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          title: t('tab_market', language),
          tabBarIcon: ({ focused }) => <TabIcon icon="🛍️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: t('tab_inventory', language),
          tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Upgrades"
        component={UpgradesScreen}
        options={{
          title: t('tab_upgrades', language),
          tabBarIcon: ({ focused }) => <TabIcon icon="🛠️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: t('tab_more', language),
          tabBarIcon: ({ focused }) => <TabIcon icon="⋯" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Menu" component={MainMenuScreen} />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen
          name="Sell"
          component={SellScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Workers" component={WorkersScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Locations" component={LocationsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Reports" component={ReportScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Monetization" component={MonetizationScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Bank" component={BankScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Travel" component={TravelScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Property" component={PropertyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Lessons" component={LessonsScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: '#E2F4EC' },
});
