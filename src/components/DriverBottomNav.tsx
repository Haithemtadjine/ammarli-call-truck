import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Theme: matches the dark bottom nav in the mockup ────────────────────────
const NAVY = '#003366';
const NAV_BG = '#002855';      // slightly darker navy for the nav bar
const YELLOW = '#F3CD0D';
const INACTIVE = '#8B9BB8';    // muted blue-gray for inactive tabs

export type DriverTab = 'dashboard' | 'trips' | 'wallet' | 'profile';

interface DriverBottomNavProps {
    activeTab: DriverTab;
}

const TABS: {
    key: DriverTab;
    label: string;
    icon: string;
    activeIcon: string;
    route: string;
}[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'grid-outline',
        activeIcon: 'grid',
        route: '/driver-home',
    },
    {
        key: 'trips',
        label: 'Trips',
        icon: 'git-branch-outline',
        activeIcon: 'git-branch',
        route: '/driver-trips',
    },
    {
        key: 'wallet',
        label: 'Earnings',
        icon: 'wallet-outline',
        activeIcon: 'wallet',
        route: '/driver-wallet',
    },
    {
        key: 'profile',
        label: 'Profile',
        icon: 'person-outline',
        activeIcon: 'person',
        route: '/driver-profile',
    },
];

export default function DriverBottomNav({ activeTab }: DriverBottomNavProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {TABS.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.navTab}
                        onPress={() => {
                            if (!isActive) {
                                router.replace(tab.route as any);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        {/* Active tab shows yellow icon inside a slightly lighter rounded pill */}
                        {isActive ? (
                            <View style={styles.activePill}>
                                <Ionicons
                                    name={tab.activeIcon as any}
                                    size={22}
                                    color={YELLOW}
                                />
                            </View>
                        ) : (
                            <Ionicons
                                name={tab.icon as any}
                                size={22}
                                color={INACTIVE}
                            />
                        )}
                        <Text
                            style={[
                                styles.navLabel,
                                isActive && styles.navLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: NAV_BG,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 14,
    },
    navTab: {
        flex: 1,
        alignItems: 'center',
        gap: 5,
    },
    activePill: {
        width: 44,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(243, 205, 13, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: INACTIVE,
        letterSpacing: 0.2,
    },
    navLabelActive: {
        color: YELLOW,
        fontWeight: '700',
    },
});
