import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const { width, height } = Dimensions.get('window');

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F8F9FA';
const BORDER = '#E5E7EB';

export default function DriverInvoiceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, completeDriverOrder, userRole } = useAppStore();

    const [rating, setRating] = useState(0);

    // Fallback data for exact UI rendering
    const order = activeDriverOrder || {
        orderId: '28491',
        customer: { name: 'Yassine', phone: '' },
        deliveryAddress: { label: '', distance: '4.2 km' },
        items: [{ description: '3000L Spring Water', detail: '', price: 2450, icon: '' }],
        subtotal: 2450,
        deliveryFee: 50,
        total: 2500,
    };

    // Determine primary item description
    const primaryItem = order.items && order.items.length > 0 
        ? order.items[0].description 
        : 'Water Delivery';

    const handleGoHome = () => {
        if (userRole === 'DRIVER_TANKER') {
            router.replace('/(driver)/tanker-dashboard');
        } else if (userRole === 'DRIVER_BOTTLED') {
            router.replace('/(driver)/driver-home');
        } else if (userRole === 'CUSTOMER') {
            router.replace('/(tabs)'); // Default to correct customer layout mapping
        } else {
            router.replace('/');
        }
    };

    const handleDone = () => {
        completeDriverOrder();
        handleGoHome();
    };

    return (
        <BlurView intensity={90} tint="light" style={styles.overlayContainer}>
            
            {/* ── Main White Card ── */}
            <View style={styles.mainCard}>
                
                {/* Header Checkmark */}
                <View style={styles.checkCircleWrap}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark-sharp" size={36} color={WHITE} />
                    </View>
                </View>

                {/* Title & Subtitle */}
                <Text style={styles.titleText}>Trip Completed{'\n'}Successfully!</Text>
                <Text style={styles.subtitleText}>Your delivery has been safely handed over.</Text>
                
                {/* Horizontal Divider */}
                <View style={styles.faintDivider} />

                {/* ── INVOICE DETAILS ── */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailsHeader}>
                        <Ionicons name="receipt-outline" size={14} color={GRAY} />
                        <Text style={styles.detailsHeaderText}>INVOICE DETAILS</Text>
                    </View>

                    <DetailRow label="Order ID" value={`#${order.orderId}`} />
                    <DetailRow label="Customer" value={order.customer.name} />
                    <DetailRow label="Item" value={primaryItem} />
                    <DetailRow label="Distance" value={order.deliveryAddress.distance || '4.2 km'} />
                </View>

                {/* ── EARNINGS BOX ── */}
                <View style={styles.earningsBox}>
                    <DetailRow label="Subtotal" value={`${order.subtotal.toLocaleString()} DA`} />
                    <DetailRow label="Delivery Fee" value={`${order.deliveryFee.toLocaleString()} DA`} />
                    <View style={styles.boxDivider} />
                    
                    <View style={styles.totalRow}>
                        <Text style={styles.totalEarningsLabel}>TOTAL EARNINGS</Text>
                        <Text style={styles.totalPriceText}>{order.total.toLocaleString()} DA</Text>
                    </View>
                </View>

                {/* ── RATE CUSTOMER ── */}
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingTitle}>Rate the Customer</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                            <TouchableOpacity
                                key={starIndex}
                                activeOpacity={0.7}
                                onPress={() => setRating(starIndex)}
                                style={styles.starBtn}
                            >
                                <Ionicons
                                    name={starIndex <= rating ? "star" : "star-outline"}
                                    size={36}
                                    color={starIndex <= rating ? YELLOW : '#D1D5DB'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── ACTION BUTTON ── */}
                <TouchableOpacity style={styles.backBtn} activeOpacity={0.88} onPress={handleDone}>
                    <Text style={styles.backBtnText}>BACK TO DASHBOARD</Text>
                    <Ionicons name="arrow-forward" size={20} color={WHITE} />
                </TouchableOpacity>

            </View>

            {/* ── FOOTER TEXT ── */}
            <View style={[styles.footerWrap, { bottom: Math.max(insets.bottom + 20, 30) }]}>
                <Text style={styles.footerText}>POWERED BY AMMARLI</Text>
            </View>
            
        </BlurView>
    );
}

// ─── Sub-Component ─────────────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    
    // Main Card
    mainCard: {
        width: '100%',
        backgroundColor: WHITE,
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingBottom: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },

    // Checkmark Header
    checkCircleWrap: {
        marginTop: -35, // Pull it up to overflow the top
        marginBottom: 20,
        backgroundColor: WHITE,
        borderRadius: 40,
        padding: 6, // White border illusion
    },
    checkCircle: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: YELLOW,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    titleText: {
        fontSize: 22, fontWeight: '900', color: NAVY,
        textAlign: 'center', lineHeight: 30, marginBottom: 8,
    },
    subtitleText: {
        fontSize: 14, color: GRAY, textAlign: 'center', marginBottom: 24,
    },
    faintDivider: {
        width: '100%', height: 1, backgroundColor: '#F1F5F9', marginBottom: 24,
    },

    // Invoice Details
    detailsSection: { width: '100%', marginBottom: 24 },
    detailsHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: 16,
    },
    detailsHeaderText: { fontSize: 12, fontWeight: '800', color: '#475569', letterSpacing: 1 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
    detailLabel: { fontSize: 15, color: '#64748B' },
    detailValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },

    // Earnings Box
    earningsBox: {
        width: '100%',
        backgroundColor: LIGHT_GRAY,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    boxDivider: { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    totalEarningsLabel: { fontSize: 12, fontWeight: '800', color: NAVY, letterSpacing: 1 },
    totalPriceText: { fontSize: 24, fontWeight: '900', color: NAVY },

    // Rating Section
    ratingSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    ratingTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: NAVY,
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    starBtn: {
        padding: 4,
    },

    // Action Button
    backBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: NAVY,
        borderRadius: 16,
        paddingVertical: 18,
        shadowColor: NAVY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    backBtnText: { fontSize: 15, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },

    // Footer Wrap
    footerWrap: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 2,
    },
});
