import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
import { useAppStore } from '../src/store/useAppStore';

// ─── Theme Constants ───────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const WHITE = '#FFFFFF';
const GRAY = '#8E98A8'; 
const BORDER = '#E5E7EB';
const LIGHT_BG = '#F8F9FA';

export default function DriverInvoiceModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, completeDriverOrder, setShowRatingModal } = useAppStore();

    // Fallback data
    const order = activeDriverOrder ?? {
        orderId: '28491',
        customer: { name: 'Yassine' },
        items: [{ description: '3000L Spring Water' }],
        deliveryAddress: { distance: '4.2 km' },
        subtotal: 2450,
        deliveryFee: 50,
        total: 2500,
    };

    const handleBackToDashboard = () => {
        // Execute the exact logical sequence required
        completeDriverOrder();
        useAppStore.getState().completeOrder(); // Also reset customer active order if any
        setShowRatingModal(true);
        router.replace('/driver-home');
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />
            
            {/* 1. Foggy Background Effect */}
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

            <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
                
                <ScrollView 
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 2. Main White Card */}
                    <View style={styles.mainCard}>
                        
                        {/* Header: Success Icon & Titles */}
                        <View style={styles.headerSection}>
                            <View style={styles.successIconOuter}>
                                <View style={styles.successIconCircle}>
                                    <Ionicons name="checkmark" size={40} color={WHITE} />
                                </View>
                            </View>
                            
                            <Text style={styles.titleText}>Trip Completed{"\n"}Successfully!</Text>
                            <Text style={styles.subtitleText}>Your delivery has been safely handed over.</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Invoice Details Section */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="receipt-outline" size={16} color={NAVY} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>INVOICE DETAILS</Text>
                        </View>

                        <View style={styles.detailsList}>
                            <DetailRow label="Order ID" value={`#${order.orderId}`} />
                            <DetailRow label="Customer" value={order.customer.name} />
                            <DetailRow label="Item" value={order.items[0]?.description || 'N/A'} />
                            <DetailRow label="Distance" value={order.deliveryAddress.distance || '4.2 km'} />
                        </View>

                        {/* Earnings Summary Box */}
                        <View style={styles.earningsBox}>
                            <View style={styles.earningsRow}>
                                <Text style={styles.earningsLabel}>Subtotal</Text>
                                <Text style={styles.earningsValue}>{order.subtotal?.toLocaleString()} DA</Text>
                            </View>
                            <View style={styles.earningsRow}>
                                <Text style={styles.earningsLabel}>Delivery Fee</Text>
                                <Text style={styles.earningsValue}>{order.deliveryFee?.toLocaleString()} DA</Text>
                            </View>
                            
                            <View style={styles.innerDivider} />
                            
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>TOTAL EARNINGS</Text>
                                <Text style={styles.totalValue}>{order.total?.toLocaleString()} DA</Text>
                            </View>
                        </View>

                        {/* Big Action Button */}
                        <TouchableOpacity 
                            style={styles.backButton} 
                            onPress={handleBackToDashboard}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.backButtonText}>BACK TO DASHBOARD</Text>
                            <Ionicons name="arrow-forward" size={20} color={WHITE} />
                        </TouchableOpacity>

                    </View>

                    {/* Footer Text */}
                    <Text style={styles.footerText}>POWERED BY AMMARLI</Text>
                </ScrollView>

            </View>
        </View>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainCard: {
        backgroundColor: WHITE,
        borderRadius: 40,
        width: '100%',
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    successIconOuter: {
        marginBottom: 20,
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: NAVY,
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 14,
        color: GRAY,
        textAlign: 'center',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#475569',
        letterSpacing: 1.2,
    },
    detailsList: {
        gap: 14,
        marginBottom: 25,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 14,
        color: GRAY,
        fontWeight: '500',
    },
    rowValue: {
        fontSize: 14,
        color: NAVY,
        fontWeight: '700',
    },
    earningsBox: {
        backgroundColor: LIGHT_BG,
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    earningsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    earningsLabel: {
        fontSize: 13,
        color: GRAY,
        fontWeight: '500',
    },
    earningsValue: {
        fontSize: 13,
        color: NAVY,
        fontWeight: 'bold',
    },
    innerDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: NAVY,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: NAVY,
    },
    backButton: {
        backgroundColor: NAVY,
        paddingVertical: 18,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: NAVY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: WHITE,
        letterSpacing: 0.5,
    },
    footerText: {
        marginTop: 30,
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(71, 85, 105, 0.4)',
        letterSpacing: 4,
        textAlign: 'center',
    },
});
