import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/contexts/AuthContext';
import { DateProvider } from './src/contexts/DateContext';
import './src/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CharacterCustomizationScreen from './src/screens/CharacterCustomizationScreen';
import DigestiveScreen from './src/screens/DigestiveScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LevelsScreen from './src/screens/LevelsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Tracking': iconName = focused ? 'calendar' : 'calendar-outline'; break;
            case 'Analytics': iconName = focused ? 'bar-chart' : 'bar-chart-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'ellipse';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const v = await AsyncStorage.getItem('onboarding_complete');
      setOnboardingComplete(v === 'true');
    };
    check();
  }, []);

  if (onboardingComplete === null) {
    return null; // splash
  }

  const initial = onboardingComplete ? 'Login' : 'Onboarding';

  return (
    <SafeAreaProvider>
      <DateProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={initial}>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="CharacterCustomization" component={CharacterCustomizationScreen} options={{ title: 'Customize Your Lotus', headerBackTitle: 'Back' }} />
              <Stack.Screen name="DigestiveScreen" component={DigestiveScreen} options={{ title: 'Digestive Tracker', headerBackTitle: 'Back' }} />
              <Stack.Screen name="Levels" component={LevelsScreen} options={{ title: 'Levels & Rewards' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </DateProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 