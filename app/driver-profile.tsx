import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DriverBottomNav from '../src/components/DriverBottomNav';
import { useAppStore } from '../src/store/useAppStore';

// ─── Theme: EXACT Mockup Colors ────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA'; // Precise light gray background
const WHITE = '#FFFFFF';
const TEXT_GRAY = '#8E98A8'; // Precise subtitle gray
const BORDER = '#EAEDF2';
const GREEN = '#10B981'; // Vibrant Green
const RED = '#E53935'; // Bold Red
const ICON_BG = '#FFF8D6'; // Light yellow/beige
const LOGOUT_BG = '#FFF0F0'; // Faint red/pink

// ─── Reusable Settings Card Component ─────────────────────────────────────────
interface SettingsCardProps {
    iconName: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
    isLogout?: boolean;
}

function SettingsCard({ iconName, title, subtitle, onPress, isLogout }: SettingsCardProps) {
    return (
        <TouchableOpacity
            style={[
                styles.itemCard,
                isLogout && styles.logoutCard,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Icon Container */}
            <View style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}>
                <Ionicons 
                    name={iconName as any} 
                    size={24} 
                    color={isLogout ? WHITE : NAVY} 
                />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isLogout && styles.logoutText]}>{title}</Text>
                <Text style={styles.itemSubtitle}>{subtitle}</Text>
            </View>

            {/* Chevron (hidden for logout) */}
            {!isLogout && (
                <Ionicons name="chevron-forward" size={20} color="#C5CBD7" />
            )}
        </TouchableOpacity>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DriverProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const registeredDriver = useAppStore((s) => s.registeredDriver);
    const logout           = useAppStore((s) => s.logout);
    const driverRating     = useAppStore((s) => s.driverRating);

    const fullName   = registeredDriver?.name ?? 'Ahmed';
    const driverType = registeredDriver?.driverType ?? 'Tanker';
    const roleLabel  = driverType === 'Tanker'
        ? t('Premium Tanker Operator')
        : t('Bottled Water Distributor');

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={NAVY} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{t('Profile')}</Text>

                {/* Bell with red dot */}
                <TouchableOpacity style={styles.headerIconBtn}>
                    <Ionicons name="notifications-outline" size={22} color={NAVY} />
                    <View style={styles.headerRedDot} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ─────────────────────────────── AVATAR SECTION ────────────────────────── */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        {/* Massive Avatar with Thick Yellow Border */}
                        <View style={styles.avatarBorder}>
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarText}>
                                    {fullName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Perfect Verified Badge Positioning */}
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={28} color="#0EA5E9" />
                        </View>
                    </View>

                    <Text style={styles.driverName}>{fullName}</Text>

                    {/* Rating & Verified Row */}
                    <View style={styles.metaRow}>
                        <Text style={styles.ratingText}>{driverRating.toFixed(1)}</Text>
                        <Ionicons name="star" size={16} color="#F59E0B" style={styles.starIcon} />
                        <View style={styles.separatorDot} />
                        <Text style={styles.verifiedText}>{t('VERIFIED')}</Text>
                    </View>

                    <Text style={styles.driverRole}>{roleLabel}</Text>
                </View>

                {/* ─────────────────────────────── SETTINGS LIST ─────────────────────────── */}
                <Text style={styles.sectionTitle}>{t('ACCOUNT SETTINGS')}</Text>

                <SettingsCard
                    iconName="time"
                    title={t('My Orders')}
                    subtitle={t('View trip history')}
                    onPress={() => router.push('/driver-trips')}
                />
                <SettingsCard
                    iconName="wallet"
                    title={t('Wallet')}
                    subtitle={t('Earnings and transactions')}
                    onPress={() => router.push('/driver-wallet')}
                />
                <SettingsCard
                    iconName="stats-chart"
                    title={t('Statistics')}
                    subtitle={t('Daily and weekly performance')}
                    onPress={() => router.push('/driver-wallet')}
                />
                <SettingsCard
                    iconName="person"
                    title={t('Personal Information')}
                    subtitle={t('Name, Email, Phone')}
                    onPress={() => router.push('/edit-profile')}
                />
                <SettingsCard
                    iconName="help-circle"
                    title={t('Help & Support')}
                    subtitle={t('FAQs and Contact us')}
                    onPress={() => router.push('/help')}
                />

                {/* ─────────────────────────────── LOGOUT BUTTON ─────────────────────────── */}
                <SettingsCard
                    iconName="exit"
                    title={t('Logout')}
                    subtitle=""
                    isLogout
                    onPress={handleLogout}
                />
            </ScrollView>

            <DriverBottomNav activeTab="profile" />
        </View>
    );
}

// ─── Styles: Precise Specs from Mockup ───────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        // Subtle shadow matching dashboard style
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
    },
    headerRedDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30', // Vibrant Red
        borderWidth: 1.5,
        borderColor: WHITE,
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarBorder: {
        width: 120, // Increased size
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: YELLOW,
        padding: 4, // spacing between yellow border and avatar
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: WHITE,
    },
    avatarInner: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: WHITE,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: WHITE,
        borderRadius: 15,
    },
    driverName: {
        fontSize: 26, // Larger name
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: NAVY,
    },
    starIcon: {
        marginHorizontal: 4,
    },
    separatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 10,
    },
    verifiedText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: GREEN,
        letterSpacing: 0.5,
    },
    driverRole: {
        fontSize: 15,
        color: TEXT_GRAY,
        fontWeight: '500',
    },

    // Section Title
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: TEXT_GRAY,
        letterSpacing: 1.2,
        marginBottom: 15,
        marginTop: 10,
        marginLeft: 5,
    },

    // Item Card (Single Row)
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 12,
        // Subtle Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: ICON_BG,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: NAVY,
    },
    itemSubtitle: {
        fontSize: 13,
        color: TEXT_GRAY,
        marginTop: 4,
        fontWeight: '500',
    },

    // Logout Overrides
    logoutCard: {
        backgroundColor: LOGOUT_BG,
        shadowOpacity: 0, // Flat look for logout
        marginTop: 10,
    },
    logoutIconContainer: {
        backgroundColor: RED,
        borderRadius: 12,
    },
    logoutText: {
        color: RED,
    },
});
