import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import '../src/localization/i18n';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { getUserSession } from "../src/utils/storage";

export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');

      if (!hasLaunched) {
        setTimeout(() => {
          router.replace('/onboarding');
        }, 100);
        setLoading(false);
        return;
      }

      const session = await getUserSession();
      if (session) {
        // User logged in mسبقاً, wait for layout to mount then redirect to success/main
        // Using setTimeout to ensure navigation happens after layout mounts
        setTimeout(async () => {
          try {
            let { status } = await Location.getForegroundPermissionsAsync();
            let providerStatus = await Location.getProviderStatusAsync();

            if (status === 'granted' && providerStatus.locationServicesEnabled) {
              router.replace('/(tabs)');
            } else {
              router.replace('/gps');
            }
          } catch {
            router.replace('/gps');
          }
        }, 100);
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#FACC15" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="success" />
        <Stack.Screen name="gps" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
