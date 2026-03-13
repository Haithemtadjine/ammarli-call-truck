import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverOrder, useAppStore } from '../src/store/useAppStore';

// ─── Theme Constants ───────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#8E98A8'; // Subtle gray for secondary text
const BORDER = '#E5E7EB';

export default function DriverActiveDeliveryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, updateDriverOrderStatus } = useAppStore();

    // Fallback data for preview/safety
    const order: DriverOrder = activeDriverOrder ?? {
        orderId: '84291',
        customer: { name: 'Ahmed Benali', phone: '+213 555 12 34 56' },
        deliveryAddress: {
            label: '2.5 km away - Batna, Algeria',
            distance: '2.5 km',
            lat: 35.5596,
            lng: 6.1740,
        },
        driverLat: 35.5620,
        driverLng: 6.1700,
        items: [
            { icon: 'water', description: '5x 1.5L Packs (Ifri)', detail: 'Mineral Water', price: 1100 },
        ],
        subtotal: 1100,
        deliveryFee: 150,
        total: 1250,
        status: 'accepted',
        createdAt: 'Oct 24, 2023 • 14:20',
    };

    // ── 10-second completion animation logic ───────────────────────────────────
    const [completing, setCompleting] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const handleComplete = () => {
        setCompleting(true);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 6,
        }).start();
        let secs = 10;
        setCountdown(secs);
        const interval = setInterval(() => {
            secs -= 1;
            setCountdown(secs);
            if (secs <= 0) {
                clearInterval(interval);
                updateDriverOrderStatus('completed');
                router.replace('/driver-invoice');
            }
        }, 1000);
    };

    // ── Live GPS & Routing Logic (The Wow Factor) ─────────────────────────────
    const openLiveGoogleMaps = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to calculate the route.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // The Math Trick: Offset roughly 2.5km to 3km
            const destLat = latitude + 0.022;
            const destLng = longitude + 0.022;

            // Google Maps Deep Link
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
            
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                Linking.openURL(url);
            } else {
                // Fallback to web search if app not found (unlikely on mobile)
                Linking.openURL(`https://www.google.com/search?q=${url}`);
            }
        } catch (err) {
            Alert.alert('Error', 'Unable to fetch location or open maps.');
        }
    };

    const callCustomer = () => {
        const phone = order.customer.phone.replace(/\s/g, '');
        Linking.openURL(`tel:${phone}`).catch(() =>
            Alert.alert('Error', 'Could not open phone dialer.')
        );
    };

    // ── Success Animation Overlay ─────────────────────────────────────────────
    if (completing) {
        return (
            <View style={styles.successOverlay}>
                <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="checkmark-sharp" size={70} color={NAVY} />
                </Animated.View>
                <Text style={styles.successTitle}>Delivery Complete!</Text>
                <Text style={styles.successSub}>Redirecting to invoice in {countdown}s…</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Top Navy Card */}
                <View style={styles.topCard}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardOrderIdLabel}>Order ID</Text>
                        <Text style={styles.cardOrderIdValue}>#{order.orderId}</Text>
                        
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.cardDate}>{order.createdAt}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.cardRight}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>IN PROGRESS</Text>
                        </View>
                        {/* Faint circle graphic */}
                        <View style={styles.graphicCircle} />
                    </View>
                </View>

                {/* 2. Customer Information Section */}
                <Text style={styles.sectionTitle}>CUSTOMER INFORMATION</Text>
                
                <View style={styles.infoRowCard}>
                    <View style={styles.avatarBox}>
                        <Ionicons name="person" size={24} color={NAVY} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoName}>{order.customer.name}</Text>
                        <Text style={styles.infoSubtitle}>{order.customer.phone}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.infoRowCard} 
                    onPress={openLiveGoogleMaps}
                    activeOpacity={0.7}
                >
                    <View style={[styles.avatarBox, { backgroundColor: '#E0E7FF' }]}>
                        <Ionicons name="location" size={24} color="#4F46E5" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoName}>Delivery Address</Text>
                        <Text style={styles.infoSubtitle}>{order.deliveryAddress.label}</Text>
                    </View>
                </TouchableOpacity>

                {/* 3. Map Preview Placeholder */}
                <TouchableOpacity 
                    onPress={openLiveGoogleMaps} 
                    activeOpacity={0.9}
                    style={styles.mapContainer}
                >
                    {/* Placeholder colored view with a pin */}
                    <View style={styles.mapPlaceholder}>
                        {/* Grid/Line pattern mock */}
                        <View style={styles.mapGridLine1} />
                        <View style={styles.mapGridLine2} />
                        <View style={styles.mapPin}>
                            <View style={styles.pinCircle}>
                                <Ionicons name="location" size={20} color={WHITE} />
                            </View>
                            <View style={styles.pinShadow} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* 4. Order Items Section */}
                <Text style={styles.sectionTitle}>ORDER ITEMS</Text>
                
                <View style={styles.whiteCard}>
                    <View style={styles.itemRow}>
                        <View style={styles.itemIconBox}>
                            <Ionicons name="water" size={24} color={NAVY} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.itemName}>5x 1.5L Packs (Ifri)</Text>
                            <Text style={styles.itemSubText}>Mineral Water</Text>
                        </View>
                        <Text style={styles.itemPrice}>1,100 DA</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Subtotal</Text>
                        <Text style={styles.pricingValue}>1,100 DA</Text>
                    </View>
                    <View style={styles.pricingRow}>
                        <Text style={styles.pricingLabel}>Delivery Fee</Text>
                        <Text style={styles.pricingValue}>150 DA</Text>
                    </View>

                    <View style={[styles.pricingRow, { marginTop: 10 }]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>1,250 DA</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Actions */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity 
                    style={styles.callButton} 
                    onPress={callCustomer}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={18} color={NAVY} style={{ marginRight: 8 }} />
                    <Text style={styles.callButtonText}>Call Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.completeButton} 
                    onPress={handleComplete}
                    activeOpacity={0.85}
                >
                    <Ionicons name="checkmark-circle" size={20} color={NAVY} style={{ marginRight: 8 }} />
                    <Text style={styles.completeButtonText}>Complete Delivery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: WHITE,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: NAVY },
    scrollContent: { padding: 20 },

    // Top Card
    topCard: {
        backgroundColor: NAVY,
        borderRadius: 24,
        padding: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        marginBottom: 25,
    },
    cardOrderIdLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    cardOrderIdValue: { fontSize: 28, fontWeight: 'bold', color: WHITE, marginTop: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    cardDate: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginLeft: 6 },
    cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
    statusBadge: { backgroundColor: YELLOW, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
    statusBadgeText: { fontSize: 11, fontWeight: 'bold', color: NAVY },
    graphicCircle: {
        width: 100, height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        position: 'absolute',
        bottom: -40, right: -30,
        borderWidth: 15,
        borderColor: 'rgba(255,255,255,0.03)',
    },

    // Sections
    sectionTitle: {
        fontSize: 12, fontWeight: '800', color: NAVY,
        letterSpacing: 1, marginBottom: 12, marginTop: 10,
    },
    infoRowCard: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    avatarBox: {
        width: 48, height: 48,
        borderRadius: 16,
        backgroundColor: '#F0F4FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: { marginLeft: 16, flex: 1 },
    infoName: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    infoSubtitle: { fontSize: 13, color: GRAY, marginTop: 2 },

    // Map Preview
    mapContainer: {
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        marginVertical: 15,
        borderWidth: 1,
        borderColor: BORDER,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapGridLine1: { position: 'absolute', width: '100%', height: 2, backgroundColor: WHITE, top: '40%', opacity: 0.5 },
    mapGridLine2: { position: 'absolute', width: 2, height: '100%', backgroundColor: WHITE, left: '60%', opacity: 0.5 },
    mapPin: { alignItems: 'center' },
    pinCircle: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    pinShadow: { 
        width: 10, height: 4, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.1)', marginTop: -2, zIndex: 1 
    },

    // Items Section
    whiteCard: {
        backgroundColor: WHITE,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    itemIconBox: {
        width: 44, height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F4FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    itemSubText: { fontSize: 12, color: GRAY, marginTop: 2 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    divider: { height: 1, backgroundColor: BORDER, marginVertical: 18 },
    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    pricingLabel: { fontSize: 14, color: GRAY, fontWeight: '500' },
    pricingValue: { fontSize: 14, color: NAVY, fontWeight: 'bold' },
    totalLabel: { fontSize: 17, fontWeight: 'bold', color: NAVY },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: NAVY },

    // Bottom Bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: WHITE,
        padding: 20,
        borderTopWidth: 1, borderTopColor: BORDER,
        gap: 12,
    },
    callButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: NAVY,
        paddingVertical: 15, borderRadius: 18,
    },
    callButtonText: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    completeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: YELLOW,
        paddingVertical: 18, borderRadius: 20,
        shadowColor: YELLOW, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    completeButtonText: { fontSize: 17, fontWeight: 'bold', color: NAVY },

    // Completion Animation
    successOverlay: {
        flex: 1,
        backgroundColor: YELLOW,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    successCircle: {
        width: 140, height: 140,
        borderRadius: 70,
        backgroundColor: WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    },
    successTitle: { fontSize: 28, fontWeight: 'bold', color: NAVY },
    successSub: { fontSize: 16, color: NAVY, opacity: 0.75 },
});
