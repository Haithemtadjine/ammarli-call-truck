import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#FFFFFF';
const GRAY = '#6B7280';
const LIGHT_BG = '#F9FAFB'; // Soft grey for cards
const RED = '#EF4444';

export default function DriverProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const driver = useAppStore(s => s.registeredDriver);
    const userRole = useAppStore(s => s.userRole);
    const logout = useAppStore(s => s.logout);

    const name = driver?.name || 'Ahmed';
    const rating = '4.9';
    const title = driver?.driverType === 'Tanker' ? 'Premium Tanker Operator' : 'Premium Delivery Driver';

    const handleLogout = () => {
        logout();
        router.replace('/driver-login');
    };

    const handleGoBack = () => {
        if (userRole === 'DRIVER_TANKER') {
            router.replace('/(driver)/tanker-dashboard');
        } else if (userRole === 'DRIVER_BOTTLED') {
            router.replace('/(driver)/driver-home');
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, STATUSBAR_HEIGHT), paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.bellBtn}>
                    <Ionicons name="notifications" size={24} color={NAVY} />
                    <View style={styles.notificationDot} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image 
                            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                            style={styles.avatarImage} 
                        />
                        {/* Verified Checkmark */}
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={NAVY} />
                        </View>
                    </View>
                    
                    <Text style={styles.nameText}>{name}</Text>
                    
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingText}>{rating}</Text>
                        <Ionicons name="star" size={14} color={YELLOW} style={{ marginLeft: 4 }} />
                        <Text style={styles.dotSeparator}> · </Text>
                        <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                    
                    <Text style={styles.subtitleText}>{title}</Text>
                </View>

                {/* Account Settings */}
                <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>

                <View style={styles.menuList}>
                    <MenuRow 
                        icon="person" 
                        title="Personal Information" 
                        subtitle="Name, Email, Phone" 
                        onPress={() => router.push('/driver-personal-info')}
                    />
                    <MenuRow 
                        icon="bus" 
                        title="Vehicle Details" 
                        subtitle={driver?.driverType === 'Tanker' ? 'Tanker/Truck information' : 'Van/Truck information'}
                        onPress={() => router.push('/driver-vehicle-details')}
                    />
                    <MenuRow 
                        icon="document-text" 
                        title="Documents & License" 
                        subtitle="Status: Valid until 2025" 
                        onPress={() => router.push('/driver-documents')}
                    />
                    <MenuRow 
                        icon="settings" 
                        title="App Settings" 
                        subtitle="Theme, Notifications, Language" 
                        onPress={() => router.push('/driver-settings')}
                    />
                    <MenuRow 
                        icon="help-circle" 
                        title="Help & Support" 
                        subtitle="FAQs and Contact us" 
                        onPress={() => router.push('/driver-help')}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <View style={styles.logoutIconBox}>
                        <Ionicons name="log-out-outline" size={24} color={WHITE} />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

// ── Reusable Menu Row Component ──
const WHITE = '#FFFFFF';
function MenuRow({ icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
                <Ionicons name={icon} size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: NAVY,
    },
    bellBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: LIGHT_BG,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: RED,
        borderWidth: 1,
        borderColor: LIGHT_BG,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for bottom nav
    },
    // ── Avatar
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 35,
    },
    avatarWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: YELLOW,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: 106,
        height: 106,
        borderRadius: 53,
        backgroundColor: '#E2E8F0',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: WHITE,
    },
    nameText: {
        fontSize: 24,
        fontWeight: '900',
        color: NAVY,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    dotSeparator: {
        fontSize: 16,
        color: '#94A3B8',
        marginHorizontal: 8,
    },
    verifiedText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#10B981', // Green
        letterSpacing: 0.5,
    },
    subtitleText: {
        fontSize: 15,
        color: '#64748B',
    },
    // ── Menu List
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1.5,
        marginBottom: 15,
        marginLeft: 5,
    },
    menuList: {
        gap: 12,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: LIGHT_BG,
        borderRadius: 20,
        padding: 16,
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FEF08A', // Light yellow tint matching mockup
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#94A3B8',
    },
    // ── Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2', // Light red tint
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
    },
    logoutIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: RED,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    logoutText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: RED,
    },
});
