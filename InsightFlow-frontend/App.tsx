import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/theme/colors';
import { Platform } from 'react-native';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { UploadScreen } from './src/screens/UploadScreen';
import { ContradictionScreen } from './src/screens/ContradictionScreen';
import { StrategyScreen } from './src/screens/StrategyScreen';
import { CampaignReviewScreen } from './src/screens/CampaignReviewScreen';
import { PublishScreen } from './src/screens/PublishScreen';
import { TraceScreen } from './src/screens/TraceScreen';
import { AppTour } from './src/components/AppTour';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { useUserStore } from './src/store/userStore';
import AdCreativeScreen from './src/screens/AdCreativeScreen';
import EmailOutreachScreen from './src/screens/EmailOutreachScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.surface,
    shadowColor: 'transparent',
    elevation: 0,
  },
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    fontSize: 17,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: Colors.background },
};

const UploadStack = () => (
  <Stack.Navigator id="upload-stack" screenOptions={{ ...stackScreenOptions, headerShown: false }}>
    <Stack.Screen name="UploadSource" component={UploadScreen} />
    <Stack.Screen name="Contradiction" component={ContradictionScreen} />
    <Stack.Screen name="Strategy" component={StrategyScreen} />
    <Stack.Screen name="CampaignReview" component={CampaignReviewScreen} />
    <Stack.Screen name="AdCreative" component={AdCreativeScreen} />
    <Stack.Screen name="EmailOutreach" component={EmailOutreachScreen} />
    <Stack.Screen name="Publish" component={PublishScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  const themeColor = useUserStore(state => state.themeColor);
  const activeColor = themeColor();

  return (
    <Tab.Navigator
      id="main-tab"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { on: any; off: any }> = {
            Dashboard: { on: 'home', off: 'home-outline' },
            Upload:    { on: 'cloud-upload', off: 'cloud-upload-outline' },
            Trace:     { on: 'terminal', off: 'terminal-outline' },
          };
          const ic = icons[route.name] ?? { on: 'apps', off: 'apps-outline' };
          return <Ionicons name={focused ? ic.on : ic.off} size={size} color={color} />;
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 62,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Upload" component={UploadStack} options={{ title: 'Analyze' }} />
      <Tab.Screen name="Trace" component={TraceScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const [showWelcome, setShowWelcome] = useState(true);

  // Step 1: Welcome screen
  if (showWelcome) {
    return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  }

  // Step 2: Auth screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Step 3: Main app
  return (
    <>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
      <AppTour />
    </>
  );
}
