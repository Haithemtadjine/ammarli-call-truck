import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// ─── Theme ─────────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const GREEN = '#10B981';
const BORDER = '#E5E7EB';

export default function DriverInvoiceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeDriverOrder, completeDriverOrder } = useAppStore();

    // Fallback mock so the screen is always previewable during development
    const order = activeDriverOrder ?? {
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
        status: 'completed' as const,
        createdAt: new Date().toLocaleDateString('fr-DZ') + ' • ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    const handleShare = async () => {
        const lines = [
            `🧾 Delivery Invoice — Ammarli`,
            `Order #${order.orderId} | ${order.createdAt}`,
            `Customer: ${order.customer.name} | ${order.customer.phone}`,
            `Address: ${order.deliveryAddress.label}`,
            ``,
            ...order.items.map((i) => `• ${i.description} — ${i.price.toLocaleString()} DA`),
            ``,
            `Subtotal:     ${order.subtotal.toLocaleString()} DA`,
            `Delivery Fee: ${order.deliveryFee.toLocaleString()} DA`,
            `TOTAL:        ${order.total.toLocaleString()} DA`,
        ].join('\n');
        await Share.share({ message: lines });
    };

    const handleDone = () => {
        completeDriverOrder();
        router.replace('/driver-home');
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.headerTitle}>Invoice</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                    <Ionicons name="share-social-outline" size={22} color={NAVY} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── SUCCESS BANNER */}
                <View style={styles.successBanner}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-sharp" size={40} color={NAVY} />
                    </View>
                    <Text style={styles.successTitle}>Delivered Successfully!</Text>
                    <Text style={styles.successSub}>Payment confirmed • Thank you</Text>
                </View>

                {/* ── ORDER META */}
                <View style={styles.metaCard}>
                    <MetaRow label="Order ID" value={`#${order.orderId}`} />
                    <MetaRow label="Date" value={order.createdAt} />
                    <MetaRow label="Status" value="Completed" green />
                    <MetaRow label="Customer" value={order.customer.name} />
                    <MetaRow label="Phone" value={order.customer.phone} />
                    <MetaRow label="Drop-off" value={order.deliveryAddress.label} last />
                </View>

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
                                <Ionicons name={item.icon as any} size={20} color={NAVY} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.itemDesc}>{item.description}</Text>
                                <Text style={styles.itemDetail}>{item.detail}</Text>
                            </View>
                            <Text style={styles.itemPrice}>{item.price.toLocaleString()} DA</Text>
                        </View>
                    ))}
                </View>

                {/* ── PRICING BREAKDOWN */}
                <View style={styles.pricingCard}>
                    <PricingRow label="Subtotal" value={order.subtotal} />
                    <PricingRow label="Delivery Fee" value={order.deliveryFee} />
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{order.total.toLocaleString()} DA</Text>
                    </View>
                </View>
            </ScrollView>

            {/* ── STICKY BOTTOM */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
                    <Text style={styles.doneBtnText}>Back to Dashboard</Text>
                    <Ionicons name="home" size={18} color={NAVY} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
    return <Text style={styles.sectionLabel}>{text}</Text>;
}

function MetaRow({ label, value, green = false, last = false }: {
    label: string; value: string; green?: boolean; last?: boolean;
}) {
    return (
        <View style={[styles.metaRow, !last && { borderBottomWidth: 1, borderBottomColor: BORDER }]}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={[styles.metaValue, green && { color: GREEN }]}>{value}</Text>
        </View>
    );
}

function PricingRow({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{label}</Text>
            <Text style={styles.pricingValue}>{value.toLocaleString()} DA</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: NAVY },
    shareBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

    scroll: { paddingHorizontal: 16, paddingTop: 20 },

    // ── Success banner
    successBanner: {
        backgroundColor: NAVY,
        borderRadius: 22,
        paddingVertical: 32,
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    successIconCircle: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: WHITE },
    successSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)' },

    // ── Meta card
    metaCard: {
        backgroundColor: WHITE,
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    metaLabel: { fontSize: 13, color: GRAY },
    metaValue: { fontSize: 14, fontWeight: '600', color: NAVY, flex: 1, textAlign: 'right' },

    // Section label
    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: NAVY,
        letterSpacing: 0.8, marginBottom: 10,
    },

    // Items card
    itemsCard: {
        backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemIconBox: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#F0F4FA', justifyContent: 'center', alignItems: 'center',
    },
    itemDesc: { fontSize: 14, fontWeight: 'bold', color: NAVY },
    itemDetail: { fontSize: 12, color: GRAY, marginTop: 1 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: NAVY },

    // Pricing card
    pricingCard: {
        backgroundColor: WHITE, borderRadius: 16, padding: 18, marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    pricingLabel: { fontSize: 14, color: GRAY },
    pricingValue: { fontSize: 14, color: GRAY },
    totalDivider: { height: 1, backgroundColor: BORDER, marginVertical: 10 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: NAVY },

    // Bottom bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: BORDER,
        paddingHorizontal: 16, paddingTop: 12,
    },
    doneBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: YELLOW, borderRadius: 16, paddingVertical: 16,
        shadowColor: YELLOW, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    doneBtnText: { fontSize: 16, fontWeight: 'bold', color: NAVY },
});
