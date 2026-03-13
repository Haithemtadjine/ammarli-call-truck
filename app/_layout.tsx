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
      try {
        console.log('[RootLayout] Checking session...');
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        console.log('[RootLayout] hasLaunched:', hasLaunched);

        if (!hasLaunched) {
          console.log('[RootLayout] First launch, redirecting to onboarding');
          setTimeout(() => {
            router.replace('/onboarding');
          }, 100);
          setLoading(false);
          return;
        }

        const session = await getUserSession();
        console.log('[RootLayout] Session found:', session);
        
        if (session) {
          setTimeout(async () => {
            try {
              console.log('[RootLayout] Checking GPS permissions...');
              let { status } = await Location.getForegroundPermissionsAsync();
              let providerStatus = await Location.getProviderStatusAsync();
              console.log('[RootLayout] GPS Status:', status, 'Enabled:', providerStatus.locationServicesEnabled);

              if (status === 'granted' && providerStatus.locationServicesEnabled) {
                router.replace('/(tabs)');
              } else {
                router.replace('/gps');
              }
            } catch (err) {
              console.log('[RootLayout] GPS check error:', err);
              router.replace('/gps');
            }
          }, 100);
        } else {
          console.log('[RootLayout] No session, staying on index/auth');
        }
      } catch (err) {
        console.error('[RootLayout] checkSession error:', err);
      } finally {
        console.log('[RootLayout] Setting loading to false');
        setLoading(false);
      }
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
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="success" />
        <Stack.Screen name="gps" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="driver-order-review" 
          options={{ 
            presentation: 'transparentModal',
            animation: 'fade',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="driver-invoice" 
          options={{ 
            presentation: 'transparentModal',
            animation: 'fade',
            headerShown: false
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
