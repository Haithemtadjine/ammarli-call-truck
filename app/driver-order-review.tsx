import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const NAVY = '#003366';
const YELLOW = '#FACC15';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F3F4F6';
const BORDER = '#E5E7EB';

export default function DriverOrderReviewScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, updateDriverOrderStatus, acceptDriverOrder } = useAppStore();

    // Mock data matching the new specific mockup
    const order = activeDriverOrder || {
        orderId: '28491',
        customer: { name: 'Ahmed Benali', phone: '+213 555 12 34 56', rating: 4.8 },
        deliveryAddress: { label: 'Batna', distance: '2.5 km', lat: 0, lng: 0 },
        driverLat: 0, driverLng: 0,
        items: [{ icon: 'cube', description: '1.5L Packs (Ifri)', detail: 'Quantity: 5 Units', price: 750 }],
        subtotal: 750, deliveryFee: 50, total: 800,
        status: 'accepted', createdAt: 'Oct 24, 2023 • 14:20'
    };

    const handleCallCustomer = () => {
        const phone = order.customer.phone.replace(/\s/g, '');
        Linking.openURL(`tel:${phone}`).catch(() =>
            Alert.alert('Error', 'Could not open phone dialer.')
        );
    };

    const handleConfirmAndStart = () => {
        // Change status to driving and navigate to active delivery
        updateDriverOrderStatus('driving');
        router.replace('/driver-active-delivery');
    };

    const handleCancelOrder = () => {
        router.push('/driver-decline-order');
    };

    return (
        <View style={styles.overlayContainer}>
            {/* Background Blur */}
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

            {/* Main Content Centered */}
            <View style={[styles.contentWrapper, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) }]}>
                
                {/* Top Floating Bar */}
                <View style={styles.topFloatingBar}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarBorder}>
                            <Image 
                                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                                style={styles.avatarImg} 
                            />
                        </View>
                        <View style={styles.onlineDot} />
                    </View>
                    
                    <View style={styles.topFloatingTextCol}>
                        <Text style={styles.newOrderAcceptedText}>NEW ORDER ACCEPTED</Text>
                        <Text style={styles.customerNameTitle}>{order.customer.name}</Text>
                    </View>

                    <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={WHITE} />
                    </View>
                </View>

                {/* Central Invoice Card */}
                <View style={styles.invoiceCard}>
                    
                    {/* Header: Order ID & Receipt Icon */}
                    <View style={styles.invoiceHeaderRow}>
                        <View style={styles.orderIdPill}>
                            <Text style={styles.orderIdText}>ORDER #{order.orderId}</Text>
                        </View>
                        <Ionicons name="receipt-outline" size={28} color="#CBD5E1" />
                    </View>

                    <Text style={styles.invoiceMainTitle}>Invoice</Text>

                    {/* Items */}
                    <View style={styles.itemsList}>
                        {order.items.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemTitle}>{item.description}</Text>
                                    <Text style={styles.itemSubtitle}>{item.detail}</Text>
                                </View>
                                <Text style={styles.itemPriceText}>{item.price} DZD</Text>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Fee */}
                    <View style={[styles.itemRow, { marginTop: 16 }]}>
                        <Text style={styles.feeLabel}>Delivery Fee</Text>
                        <Text style={styles.feeValue}>{order.deliveryFee} DZD</Text>
                    </View>

                    {/* Dashed Divider */}
                    <View style={styles.dashedDivider}>
                        <View style={styles.dashLine} />
                    </View>

                    {/* Total Section */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.totalAmountValue}>{order.total} DZD</Text>
                            <Text style={styles.paidMethodText}>PAID VIA WALLET</Text>
                        </View>
                    </View>

                </View>

                {/* Primary Action Button */}
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAndStart} activeOpacity={0.8}>
                    <Text style={styles.confirmBtnText}>CONFIRM ACCEPTANCE</Text>
                </TouchableOpacity>

                {/* Secondary Action Button */}
                <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer} activeOpacity={0.8}>
                    <Ionicons name="call" size={18} color={WHITE} />
                    <Text style={styles.callBtnText}>Call Customer</Text>
                </TouchableOpacity>

                {/* Cancel Link */}
                <TouchableOpacity onPress={handleCancelOrder} style={styles.cancelLinkBox}>
                    <Text style={styles.cancelLinkText}>Cancel Order</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slight white tint overlay
    },
    contentWrapper: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    
    // --- Top Floating Bar ---
    topFloatingBar: {
        backgroundColor: WHITE,
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 24,
        // Fancy Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 10,
    },
    avatarWrap: { position: 'relative' },
    avatarBorder: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: YELLOW,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: LIGHT_GRAY, overflow: 'hidden'
    },
    avatarImg: { width: '100%', height: '100%' },
    onlineDot: {
        position: 'absolute', bottom: 2, right: 2,
        width: 14, height: 14, borderRadius: 7, 
        backgroundColor: '#10B981', borderWidth: 2, borderColor: WHITE,
    },
    topFloatingTextCol: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center'
    },
    newOrderAcceptedText: {
        fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5, marginBottom: 2
    },
    customerNameTitle: {
        fontSize: 18, fontWeight: '900', color: NAVY
    },
    verifiedBadge: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: NAVY,
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 12
    },

    // --- Central Invoice Card ---
    invoiceCard: {
        backgroundColor: WHITE,
        borderRadius: 24,
        width: '100%',
        padding: 24,
        marginBottom: 24,
        // Fancy Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 15,
    },
    invoiceHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    orderIdPill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 12
    },
    orderIdText: {
        fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1
    },
    invoiceMainTitle: {
        fontSize: 24, fontWeight: '900', color: NAVY, marginBottom: 24
    },
    itemsList: {
        marginBottom: 8
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    itemTitle: {
        fontSize: 16, fontWeight: '700', color: NAVY, marginBottom: 4
    },
    itemSubtitle: {
        fontSize: 13, color: '#94A3B8'
    },
    itemPriceText: {
        fontSize: 16, fontWeight: '800', color: NAVY
    },
    feeLabel: {
        fontSize: 15, fontWeight: '600', color: '#94A3B8'
    },
    feeValue: {
        fontSize: 16, fontWeight: '800', color: NAVY
    },
    dashedDivider: {
        height: 1, width: '100%',
        overflow: 'hidden',
        marginVertical: 24
    },
    dashLine: {
        height: 2, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 1
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    totalLabel: {
        fontSize: 18, fontWeight: '900', color: NAVY, paddingBottom: 6
    },
    totalAmountValue: {
        fontSize: 32, fontWeight: '900', color: YELLOW, marginBottom: 4
    },
    paidMethodText: {
        fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase'
    },

    // --- Buttons ---
    confirmBtn: {
        backgroundColor: YELLOW,
        width: '100%',
        borderRadius: 20,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: YELLOW, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    confirmBtnText: {
        fontSize: 16, fontWeight: '900', color: NAVY, letterSpacing: 0.5
    },
    callBtn: {
        backgroundColor: NAVY,
        width: '100%',
        borderRadius: 20,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        shadowColor: NAVY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    callBtnText: {
        fontSize: 16, fontWeight: 'bold', color: WHITE
    },
    cancelLinkBox: {
        paddingVertical: 8, paddingHorizontal: 16,
    },
    cancelLinkText: {
        fontSize: 14, fontWeight: '700', color: '#64748B' // Gray color for cancel
    }
});
