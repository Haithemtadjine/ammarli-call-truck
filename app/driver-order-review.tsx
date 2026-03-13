import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// ─── Theme Constants ───────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const WHITE = '#FFFFFF';
const GRAY = '#8E98A8'; // Subtle gray for secondary text
const BORDER = '#E5E7EB';

export default function DriverOrderReviewModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, updateDriverOrderStatus } = useAppStore();

    // Fallback data for preview/safety
    const order = activeDriverOrder ?? {
        orderId: '28491',
        customer: { name: 'Ahmed Benali', phone: '+213 555 12 34 56' },
        items: [{ description: '1.5L Packs (Ifri)', detail: 'Quantity: 5 Units', price: 750 }],
        deliveryFee: 50,
        total: 800,
    };

    const handleConfirm = () => {
        updateDriverOrderStatus('accepted'); 
        router.push('/driver-active-delivery');
    };

    const handleCancel = () => {
        useAppStore.setState({ activeDriverOrder: null });
        router.back(); // Effectively closes the modal
    };

    const callCustomer = () => {
        const phone = order.customer.phone.replace(/\s/g, '');
        Linking.openURL(`tel:${phone}`).catch(() =>
            Alert.alert('Error', 'Could not open phone dialer.')
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />
            
            {/* 1. Foggy Background Effect */}
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

            <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
                
                {/* 2. Top Floating Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarContainer}>
                        {/* Using a placeholder avatar style */}
                        <View style={styles.avatarInner}>
                            <Ionicons name="person" size={28} color={NAVY} />
                        </View>
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerSmallTitle}>NEW ORDER ACCEPTED</Text>
                        <Text style={styles.headerName}>{order.customer.name}</Text>
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={20} color={WHITE} />
                    </View>
                </View>

                {/* 3. Main Floating Invoice Card */}
                <View style={styles.invoiceCard}>
                    {/* Top yellow border accent */}
                    <View style={styles.invoiceYellowTop} />
                    
                    <View style={styles.invoicePadding}>
                        <View style={styles.invoiceHeaderRow}>
                            <View style={styles.orderIdBadge}>
                                <Text style={styles.orderIdText}>ORDER #{order.orderId}</Text>
                            </View>
                            <Ionicons name="receipt-outline" size={28} color="#C1C9D2" />
                        </View>

                        <Text style={styles.invoiceTitle}>Invoice</Text>

                        {/* Order Item */}
                        <View style={styles.itemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{order.items[0]?.description}</Text>
                                <Text style={styles.itemSub}>{order.items[0]?.detail}</Text>
                            </View>
                            <Text style={styles.itemPrice}>{order.items[0]?.price} DZD</Text>
                        </View>

                        {/* Delivery Fee */}
                        <View style={styles.itemRow}>
                            <Text style={styles.feeLabel}>Delivery Fee</Text>
                            <Text style={styles.feePrice}>{order.deliveryFee} DZD</Text>
                        </View>

                        {/* Dashed Divider */}
                        <View style={styles.dashedDivider}>
                            <View style={styles.dashLine} />
                        </View>

                        {/* TOTAL */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.totalPrice}>{order.total} DZD</Text>
                                <Text style={styles.paidMethod}>PAID VIA WALLET</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 4. Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity 
                        style={styles.confirmBtn} 
                        onPress={handleConfirm}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.confirmText}>CONFIRM ACCEPTANCE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.callBtn} 
                        onPress={callCustomer}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="call" size={18} color={WHITE} style={{ marginRight: 10 }} />
                        <Text style={styles.callText}>Call Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
                        <Text style={styles.cancelText}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.4)', // Base transparency for BlurView
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: 'center',
    },
    // Top Card
    headerCard: {
        backgroundColor: WHITE,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingHorizontal: 20,
        marginBottom: 35,
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: YELLOW,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    headerSmallTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: GRAY,
        letterSpacing: 0.5,
    },
    headerName: {
        fontSize: 19,
        fontWeight: 'bold',
        color: NAVY,
        marginTop: 2,
    },
    verifiedBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Main Invoice Card
    invoiceCard: {
        backgroundColor: WHITE,
        borderRadius: 35,
        overflow: 'hidden',
        marginBottom: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
    },
    invoiceYellowTop: {
        height: 6,
        backgroundColor: YELLOW,
    },
    invoicePadding: {
        padding: 25,
        paddingTop: 20,
    },
    invoiceHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderIdBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    orderIdText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: GRAY,
        letterSpacing: 0.5,
    },
    invoiceTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 25,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    itemName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: NAVY,
    },
    itemSub: {
        fontSize: 13,
        color: GRAY,
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 17,
        fontWeight: 'bold',
        color: NAVY,
    },
    feeLabel: {
        fontSize: 15,
        color: GRAY,
        fontWeight: '500',
    },
    feePrice: {
        fontSize: 15,
        color: NAVY,
        fontWeight: 'bold',
    },
    dashedDivider: {
        marginVertical: 15,
    },
    dashLine: {
        height: 1,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
        letterSpacing: 1,
    },
    totalPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: YELLOW,
    },
    paidMethod: {
        fontSize: 9,
        color: '#94A3B8',
        fontWeight: 'bold',
        marginTop: 4,
    },

    // Bottom Actions
    bottomActions: {
        gap: 15,
        alignItems: 'center',
    },
    confirmBtn: {
        width: '100%',
        backgroundColor: YELLOW,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: NAVY,
        letterSpacing: 1,
    },
    callBtn: {
        width: '100%',
        backgroundColor: NAVY,
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    callText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: WHITE,
    },
    cancelLink: {
        marginTop: 10,
    },
    cancelText: {
        fontSize: 14,
        color: GRAY,
        fontWeight: '600',
    },
});
