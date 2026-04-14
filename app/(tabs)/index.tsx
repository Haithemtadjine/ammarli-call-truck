import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingModal from '../../components/RatingModal';
import LocationPermissionModal from '../../src/components/LocationPermissionModal';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/theme/ThemeContext';
import { getGridColumns } from '../../src/utils/responsive';

// ─── Responsive Service Grid Data ──────────────────────────────────────────────
const WATER_SOURCES = [
    { 
        key: 'spring', 
        labelKey: 'Spring Water', 
        subtitleKey: 'Natural source',
        image: require('../../assets/images/spring-water-icon.png'), 
        type: 'Spring Water', 
        route: '/tank-details',
        bgColor: '#DDE9FA',
    },
    { 
        key: 'well', 
        labelKey: 'Well Water', 
        subtitleKey: 'Deep extraction',
        image: require('../../assets/images/well-water-icon.png'), 
        type: 'Well Water', 
        route: '/tank-details',
        bgColor: '#FDE46D',
    },
    { 
        key: 'ashghal', 
        labelKey: 'Ashghal', 
        subtitleKey: 'Municipal supply',
        image: require('../../assets/images/ashghal-icon.png'), 
        type: 'Ashghal', 
        route: '/tank-details',
        bgColor: '#DDE9FA',
    },
    { 
        key: 'bottled', 
        labelKey: 'Bottled Water', 
        subtitleKey: 'Premium packs',
        image: require('../../assets/images/bottled_icon.png'), 
        type: 'Bottled Water', 
        route: '/bottled-water-details',
        bgColor: '#EAECEE',
    },
];

export default function MainDashboardScreen() {
    const { colors } = useTheme();
    // Custom navy override to match design precisely
    const COLORS = {
        ...colors,
        navy: '#001E3C', // Deep dark blue for texts
        white: '#FFFFFF',
        yellow: '#FFD700', // Yellow accent from mockup
        red: '#EF4444',
        blueGradientStart: '#002855', // Solid dark blue banner
        blueGradientEnd: '#001E3C',
        background: '#F8F9FA', // Off-white clean background (matches picture better)
        grayText: '#6C757D',
    };
    const styles = getStyles(COLORS);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Zustand Data
    const { userProfile, updateOrder, userRole, pastOrders: storePastOrders } = useAppStore();
    const userName = userProfile?.name || 'Guest';

    // Role-aware redirect guard
    useEffect(() => {
        if (userRole === 'DRIVER_TANKER') {
            router.replace('/(driver)/tanker-dashboard');
        } else if (userRole === 'DRIVER_BOTTLED') {
            router.replace('/(driver)/driver-home');
        }
    }, [userRole]);

    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        const checkLocationStatus = async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                const gpsEnabled = await Location.hasServicesEnabledAsync();
                
                if (status === 'granted' && gpsEnabled) {
                    setShowLocationModal(false);
                } else {
                    setShowLocationModal(true);
                }
            } catch (error) {
                console.warn("Location check error:", error);
                setShowLocationModal(true);
            }
        };
        checkLocationStatus();
    }, []);

    const handleAllowLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const gpsEnabled = await Location.hasServicesEnabledAsync();
                if (gpsEnabled) {
                    setShowLocationModal(false);
                } else {
                    alert(t('Please enable GPS services in your device settings.'));
                }
            }
        } catch (error) {
             console.warn(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <RatingModal />
            <LocationPermissionModal 
                visible={showLocationModal} 
                onClose={() => setShowLocationModal(false)} 
                onAllow={handleAllowLocation} 
            />
            
            {/* Header Sequence */}
            <View style={styles.headerRow}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="face-man" size={28} color="#8D6242" />
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>WELCOME</Text>
                        <Text style={styles.greetingText}>Hello, {userName}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.bellButton}
                    onPress={() => router.push('/notifications')}
                >
                    <Ionicons name="notifications" size={24} color={COLORS.navy} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Full-width Hero Banner container with horizontal padding */}
                <View style={{ paddingHorizontal: 16 }}>
                    <LinearGradient
                        colors={[COLORS.blueGradientStart, COLORS.blueGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBanner}
                    >
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle}>{t('Pure Water,\nDelivered Fast')}</Text>
                            <TouchableOpacity
                                style={styles.orderNowBtn}
                                onPress={() => router.push('/tank-details')}
                            >
                                <Text style={styles.orderNowText}>{t('Order Now')}</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Selection Section Header */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>{t('Select Water Source')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>{t('See all')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Responsive Water Source Grid */}
                    <WaterSourceGrid router={router} updateOrder={updateOrder} t={t} styles={styles} />

                    {/* Recent Orders Section Header */}
                    <View style={[styles.sectionHeaderRow, { marginTop: 8 }]}>
                        <Text style={styles.sectionTitle}>{t('Recent Orders')}</Text>
                    </View>

                    {/* Vertical List of Recent Orders */}
                    <View style={styles.recentOrdersList}>
                        {storePastOrders.length > 0 ? (
                            storePastOrders.slice().reverse().slice(0, 3).map((order: any, idx) => (
                                <RecentOrderCard
                                    key={`order-${order.id}-${idx}`}
                                    title={t(order.waterType || 'Water Delivery')}
                                    volume={order.quantity || 'Bulk'}
                                    date={order.schedulingInfo ? `${t('Scheduled for')} ${order.schedulingInfo.date}` : (order.orderTime || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                                    status={(order.status || 'COMPLETED').toUpperCase()}
                                    styles={styles}
                                />
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: COLORS.grayText, marginVertical: 20 }}>
                                {t('No recent orders found.')}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Utility Components ────────────────────────────────────────────────────────

function WaterSourceGrid({ router, updateOrder, t, styles }: any) {
    const cols = getGridColumns();
    const rows: (typeof WATER_SOURCES[number])[][] = [];
    for (let i = 0; i < WATER_SOURCES.length; i += cols) {
        rows.push(WATER_SOURCES.slice(i, i + cols));
    }
    return (
        <View style={styles.gridContainer}>
            {rows.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                    {row.map((item) => (
                        <ServiceCard
                            key={item.key}
                            title={t(item.labelKey)}
                            subtitle={t(item.subtitleKey)}
                            image={item.image}
                            bgColor={item.bgColor}
                            styles={styles}
                            onPress={() => {
                                updateOrder({ id: Date.now(), type: item.type, waterType: item.type, status: 'pending' });
                                router.push(item.route as any);
                            }}
                        />
                    ))}
                    {row.length < cols && Array.from({ length: cols - row.length }).map((_, pi) => (
                        <View key={`pad-${pi}`} style={{ flex: 1, marginHorizontal: 6 }} />
                    ))}
                </View>
            ))}
        </View>
    );
}

function ServiceCard({ title, subtitle, image, bgColor, styles, onPress }: any) {
    return (
        <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                <Image source={image} style={{ width: 38, height: 38 }} resizeMode="contain" />
            </View>
            <Text style={styles.serviceTitle}>{title}</Text>
            <Text style={styles.serviceSubtitle}>{subtitle}</Text>
        </TouchableOpacity>
    );
}

function RecentOrderCard({ title, volume, date, status, styles }: any) {
    return (
        <View style={styles.recentOrderCard}>
            <View style={styles.recentOrderIconContainer}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#001E3C" />
            </View>
            <View style={styles.recentOrderInfo}>
                <Text style={styles.recentOrderTitle}>{title}</Text>
                <Text style={styles.recentOrderDate}>{date}</Text>
            </View>
            <View style={styles.recentOrderRight}>
                <Text style={styles.recentOrderVolume}>{volume}</Text>
                <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>{status}</Text>
                </View>
            </View>
        </View>
    );
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
        marginTop: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5E6E0', // Light peach background as mock
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    welcomeText: {
        fontSize: 10,
        color: COLORS.grayText,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    greetingText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.navy,
    },
    bellButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroBanner: {
        width: '100%',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    heroContent: {
        zIndex: 2,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 34,
        marginBottom: 16,
    },
    orderNowBtn: {
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        alignSelf: 'flex-start',
    },
    orderNowText: {
        color: '#001E3C', // Deep dark blue
        fontWeight: 'bold',
        fontSize: 15,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.navy,
    },
    seeAllText: {
        color: COLORS.grayText,
        fontSize: 14,
        fontWeight: '500',
    },
    gridContainer: {
        marginBottom: 16,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    serviceCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        alignItems: 'flex-start',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    serviceSubtitle: {
        fontSize: 12,
        color: COLORS.grayText,
    },
    recentOrdersList: {
        marginTop: 4,
    },
    recentOrderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    recentOrderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F5F7FA', // Matches mockup gray
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    recentOrderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    recentOrderTitle: {
        fontWeight: 'bold',
        color: COLORS.navy,
        fontSize: 15,
        marginBottom: 4,
    },
    recentOrderDate: {
        color: COLORS.grayText,
        fontSize: 12,
    },
    recentOrderRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    recentOrderVolume: {
        fontWeight: 'bold',
        fontSize: 15,
        color: COLORS.navy,
        marginBottom: 8,
    },
    completedBadge: {
        backgroundColor: '#D1FADF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    completedBadgeText: {
        color: '#027A48',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
