import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import '../src/localization/i18n';
import { applyStoredRTL } from '../src/localization/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/theme/ThemeContext';

// Prevent auto-hide so splash stays while we resolve route
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // 1. Apply RTL direction BEFORE rendering anything
      await applyStoredRTL();

      // 2. Hide splash
      await SplashScreen.hideAsync();

      setReady(true);
    };
    prepare();
  }, []);

  // Don't render until RTL is applied — prevents layout flash
  if (!ready) return null;

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
