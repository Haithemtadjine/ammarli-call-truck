import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import '../src/localization/i18n';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getUserSession } from "../src/utils/storage";

// Prevent auto-hide so splash stays while we resolve route
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const prepareApp = async () => {
      // Small delay just to let UI render initial frames, but generally immediate
      await SplashScreen.hideAsync();
    };

    prepareApp();
  }, []);

  // Stack is ALWAYS rendered so the navigator is mounted before router.replace() fires
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="success" />
          <Stack.Screen name="gps" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="driver-order-review" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
          <Stack.Screen name="driver-invoice" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
