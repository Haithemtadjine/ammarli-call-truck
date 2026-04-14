import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';

const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const INACTIVE = '#9CA3AF';

export default function DriverTabLayout() {
    const userRole = useAppStore((s) => s.userRole);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: YELLOW,
                tabBarInactiveTintColor: INACTIVE,
                tabBarStyle: {
                    backgroundColor: NAVY,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 10,
                    position: 'absolute', // Ensures rounded corners show cleanly over background
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: 4,
                },
            }}>
            <Tabs.Screen
                name="driver-home"
                options={{
                    title: 'Bottled Dash',
                    href: userRole === 'DRIVER_BOTTLED' ? '/driver-home' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tanker-dashboard"
                options={{
                    title: 'Tanker Dash',
                    href: userRole === 'DRIVER_TANKER' ? '/tanker-dashboard' : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="water-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="driver-trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="swap-horizontal-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="driver-wallet"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="driver-profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
