import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
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

// ─── Theme ─────────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const GREEN = '#10B981';
const BORDER = '#E5E7EB';
const BLUE = '#3B82F6';

export default function DriverActiveDeliveryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, updateDriverOrderStatus, completeDriverOrder } = useAppStore();

    // Fallback mock — screen always renders during dev
    const order: DriverOrder = activeDriverOrder ?? {
        orderId: '84291',
        customer: { name: 'Ahmed Benali', phone: '+213 555 12 34 56' },
        deliveryAddress: {
            label: '2.5 km away — Batna, Algeria',
            distance: '2.5 km',
            lat: 35.5596,
            lng: 6.1740,
        },
        driverLat: 35.5620,
        driverLng: 6.1700,
        items: [
            { icon: 'cube', description: '5x 1.5L Packs (Ifri)', detail: 'Mineral Water', price: 1100 },
        ],
        subtotal: 1100,
        deliveryFee: 150,
        total: 1250,
        status: 'accepted',
        createdAt: 'Oct 24, 2023 • 14:20',
    };

    // ── 10-second completion animation ─────────────────────────────────────────
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

    // ── Open Google Maps with driver→customer route ─────────────────────────────
    const openGoogleMaps = () => {
        const { lat, lng } = order.deliveryAddress;
        const origin = `${order.driverLat},${order.driverLng}`;
        const destination = `${lat},${lng}`;
        // Google Maps deep-link: shows turn-by-turn driving directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        Linking.openURL(url).catch(() =>
            Alert.alert('خطأ', 'تعذّر فتح خرائط Google.')
        );
    };

    // ── Call customer ──────────────────────────────────────────────────────────
    const callCustomer = () => {
        const phone = order.customer.phone.replace(/\s/g, '');
        Linking.openURL(`tel:${phone}`).catch(() =>
            Alert.alert('خطأ', 'تعذّر فتح تطبيق الاتصال.')
        );
    };

    // ── 10-second success overlay ──────────────────────────────────────────────
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

    // ── Main screen ────────────────────────────────────────────────────────────
    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── ORDER ID BANNER */}
                <View style={styles.orderBanner}>
                    <View>
                        <Text style={styles.orderIdLabel}>Order ID</Text>
                        <Text style={styles.orderIdValue}>#{order.orderId}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.65)" />
                            <Text style={styles.orderDate}> {order.createdAt}</Text>
                        </View>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>IN PROGRESS</Text>
                    </View>
                </View>

                {/* ── CUSTOMER INFORMATION */}
                <SectionLabel text="CUSTOMER INFORMATION" />

                {/* Customer name + phone */}
                <View style={styles.infoCard}>
                    <View style={styles.avatarBox}>
                        <Ionicons name="person" size={22} color={NAVY} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.customerName}>{order.customer.name}</Text>
                        <Text style={styles.customerPhone}>{order.customer.phone}</Text>
                    </View>
                </View>

                {/* Delivery address — tappable → Google Maps */}
                <TouchableOpacity style={styles.infoCard} onPress={openGoogleMaps} activeOpacity={0.8}>
                    <View style={[styles.avatarBox, { backgroundColor: '#EFF6FF' }]}>
                        <Ionicons name="navigate" size={20} color={BLUE} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.customerName}>Delivery Address</Text>
                        <Text style={styles.customerPhone}>{order.deliveryAddress.label}</Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color={GRAY} />
                </TouchableOpacity>

                {/* Map card — tappable → Google Maps (no native MapView) */}
                <TouchableOpacity
                    style={styles.mapCard}
                    onPress={openGoogleMaps}
                    activeOpacity={0.88}
                >
                    {/* Decorative map-like background */}
                    <View style={styles.mapPlaceholder}>
                        {/* Grid lines */}
                        {[...Array(5)].map((_, i) => (
                            <View key={`h${i}`} style={[styles.mapGridH, { top: `${20 * i}%` as any }]} />
                        ))}
                        {[...Array(5)].map((_, i) => (
                            <View key={`v${i}`} style={[styles.mapGridV, { left: `${20 * i}%` as any }]} />
                        ))}
                        {/* Blue route line */}
                        <View style={styles.routeLine} />
                        {/* Destination pin */}
                        <View style={styles.pinContainer}>
                            <View style={styles.pin}>
                                <Ionicons name="location" size={20} color={WHITE} />
                            </View>
                        </View>
                    </View>
                    {/* Overlay label */}
                    <View style={styles.mapOverlayBadge}>
                        <Ionicons name="map" size={14} color={WHITE} />
                        <Text style={styles.mapOverlayText}>Open in Google Maps</Text>
                    </View>
                </TouchableOpacity>

                {/* ── ORDER ITEMS */}
                <SectionLabel text="ORDER ITEMS" />

                <View style={styles.itemsCard}>
                    {order.items.map((item, i) => (
                        <View
                            key={i}
                            style={[
                                styles.itemRow,
                                i > 0 && { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 14, marginTop: 14 },
                            ]}
                        >
                            <View style={styles.itemIconBox}>
                                <Ionicons name={item.icon as any} size={22} color={NAVY} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={styles.itemDesc}>{item.description}</Text>
                                <Text style={styles.itemDetail}>{item.detail}</Text>
                            </View>
                            <Text style={styles.itemPrice}>{item.price.toLocaleString()} DA</Text>
                        </View>
                    ))}

                    {/* Pricing */}
                    <View style={styles.priceDivider} />
                    <PricingRow label="Subtotal" value={order.subtotal} />
                    <PricingRow label="Delivery Fee" value={order.deliveryFee} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{order.total.toLocaleString()} DA</Text>
                    </View>
                </View>
            </ScrollView>

            {/* ── STICKY ACTION BUTTONS */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.callBtn} onPress={callCustomer} activeOpacity={0.85}>
                    <Ionicons name="call" size={18} color={NAVY} style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Call Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
                    <Ionicons name="checkmark-circle" size={18} color={NAVY} style={{ marginRight: 8 }} />
                    <Text style={styles.completeBtnText}>Complete Delivery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
    return <Text style={styles.sectionLabel}>{text}</Text>;
}

function PricingRow({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{label}</Text>
            <Text style={styles.pricingValue}>{value.toLocaleString()} DA</Text>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: NAVY },

    scroll: { paddingHorizontal: 16, paddingTop: 16 },

    // ── Order banner
    orderBanner: {
        backgroundColor: NAVY,
        borderRadius: 20,
        padding: 22,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 22,
    },
    orderIdLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.4 },
    orderIdValue: { fontSize: 26, fontWeight: 'bold', color: WHITE, marginTop: 2 },
    orderDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
    statusBadge: { backgroundColor: YELLOW, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    statusBadgeText: { fontSize: 11, fontWeight: 'bold', color: NAVY, letterSpacing: 0.5 },

    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: NAVY,
        letterSpacing: 0.8, marginBottom: 10, marginTop: 4,
    },

    // ── Info cards
    infoCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarBox: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F4FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerName: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    customerPhone: { fontSize: 13, color: GRAY, marginTop: 2 },

    // ── Map card (no native MapView — opens Google Maps on tap)
    mapCard: {
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 22,
        backgroundColor: '#D4E4F7',
    },
    mapPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#C8DFF5',
        overflow: 'hidden',
    },
    mapGridH: {
        position: 'absolute', left: 0, right: 0,
        height: 1, backgroundColor: 'rgba(255,255,255,0.4)',
    },
    mapGridV: {
        position: 'absolute', top: 0, bottom: 0,
        width: 1, backgroundColor: 'rgba(255,255,255,0.4)',
    },
    routeLine: {
        position: 'absolute',
        top: '30%', left: '20%',
        width: '60%', height: 4,
        backgroundColor: BLUE,
        borderRadius: 2,
        transform: [{ rotate: '-15deg' }],
    },
    pinContainer: {
        position: 'absolute',
        top: '25%', left: '55%',
    },
    pin: {
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayBadge: {
        position: 'absolute',
        bottom: 10, right: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    mapOverlayText: { fontSize: 12, color: WHITE, fontWeight: '600' },

    // ── Items card
    itemsCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemIconBox: {
        width: 44, height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F4FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDesc: { fontSize: 15, fontWeight: 'bold', color: NAVY },
    itemDetail: { fontSize: 12, color: GRAY, marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: NAVY },

    priceDivider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },
    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    pricingLabel: { fontSize: 14, color: GRAY },
    pricingValue: { fontSize: 14, color: GRAY },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: NAVY },

    // ── Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 10,
    },
    callBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: NAVY,
        borderRadius: 16,
        paddingVertical: 14,
    },
    callBtnText: { fontSize: 16, fontWeight: 'bold', color: NAVY },

    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: YELLOW,
        borderRadius: 16,
        paddingVertical: 16,
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    completeBtnText: { fontSize: 16, fontWeight: 'bold', color: NAVY },

    // ── 10-second success overlay
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    successTitle: { fontSize: 28, fontWeight: 'bold', color: NAVY },
    successSub: { fontSize: 16, color: NAVY, opacity: 0.75 },
});
