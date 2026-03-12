import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverOrder, useAppStore } from '../src/store/useAppStore';

// ─── Theme ─────────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const LIGHT = '#F0F4FA';
const BLUE = '#3B82F6';
const GREEN = '#10B981';
const BORDER = '#E5E7EB';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const TANKER_DATA = {
    earnings: 8500,
    completed: 5,
    tank: { remaining: 3000, total: 5000, waterType: 'SPRING WATER' },
    orders: [
        {
            id: '1',
            customer: 'Yassine',
            distance: '4.2 km away',
            item: '3000L Spring Water',
            detail: 'Standard Bulk Delivery',
            earnings: 2500,
        },
    ],
    nearby: [
        { name: 'Mohamed', distance: '12.5 km away', size: '5000L' },
    ],
};

const BOTTLED_DATA = {
    earnings: 4500,
    completed: 3,
    stock: [
        { size: '0.5L', qty: 50, unit: 'pk', icon: 'water-outline' as const },
        { size: '1.5L', qty: 30, unit: 'pk', icon: 'water' as const },
        { size: '5L', qty: 20, unit: 'jg', icon: 'cube-outline' as const },
    ],
    orders: [
        {
            id: '1',
            customer: 'Ahmed Benali',
            distance: '2.5 km away',
            item: '5x 1.5L Packs (Ifri)',
            detail: 'Mineral Water - Standard Pack',
            earnings: 1250,
        },
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ── TANKER INVENTORY ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function TankerInventory() {
    const { remaining, total, waterType } = TANKER_DATA.tank;
    const pct = remaining / total; // 0-1
    const pctLabel = `${Math.round(pct * 100)}%`;

    return (
        <View style={styles.card}>
            {/* Header row */}
            <View style={styles.row}>
                <Text style={styles.cardTitle}>Tank Capacity</Text>
                <View style={styles.waterTypeBadge}>
                    <Text style={styles.waterTypeBadgeText}>{waterType}</Text>
                </View>
            </View>

            {/* Remaining row */}
            <View style={[styles.row, { marginTop: 14, marginBottom: 10 }]}>
                <Text style={styles.remainingText}>
                    Remaining: {remaining.toLocaleString()}L / {total.toLocaleString()}L
                </Text>
                <Text style={styles.pctText}>{pctLabel}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
            </View>

            {/* Refill button */}
            <TouchableOpacity style={styles.refillOutlinedBtn}>
                <Ionicons name="nuclear-outline" size={18} color={NAVY} style={{ marginRight: 8 }} />
                <Text style={styles.refillOutlinedText}>REFILL TANK</Text>
            </TouchableOpacity>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BOTTLED INVENTORY ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function BottledInventory() {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.cardTitle}>Current Stock</Text>
                <TouchableOpacity style={styles.refillSmallBtn}>
                    <Text style={styles.refillSmallText}>Refill Stock</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.row, { justifyContent: 'space-around', marginTop: 18 }]}>
                {BOTTLED_DATA.stock.map((item) => (
                    <View key={item.size} style={styles.stockCol}>
                        <View style={styles.stockIconBox}>
                            <Ionicons name={item.icon} size={26} color={NAVY} />
                        </View>
                        <Text style={styles.stockSizeLabel}>{item.size}</Text>
                        <Text style={styles.stockQtyText}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: NAVY }}>{item.qty}</Text>
                            {' '}{item.unit}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ORDER CARD ── (wired to store + navigation)
// ══════════════════════════════════════════════════════════════════════════════
function OrderCard({
    order,
    isTanker,
}: {
    order: (typeof TANKER_DATA.orders)[0];
    isTanker: boolean;
}) {
    const router = useRouter();
    const acceptDriverOrder = useAppStore((s) => s.acceptDriverOrder);
    const [declined, setDeclined] = useState(false);

    if (declined) {
        return (
            <View style={[styles.orderCard, { alignItems: 'center', paddingVertical: 32 }]}>
                <Ionicons name="close-circle" size={60} color="#EF4444" />
                <Text style={[styles.cardTitle, { color: '#EF4444', marginTop: 12 }]}>Request Declined</Text>
                <Text style={{ color: GRAY, marginTop: 6 }}>Waiting for next request…</Text>
            </View>
        );
    }

    const handleAccept = () => {
        // Build a DriverOrder from the mock data
        const driverOrder: DriverOrder = {
            orderId: String(Math.floor(80000 + Math.random() * 9999)),
            customer: { name: order.customer, phone: '+213 555 00 00 00' },
            deliveryAddress: {
                label: `${order.distance} — Batna, Algeria`,
                distance: order.distance,
                lat: 35.5596,
                lng: 6.1740,
            },
            driverLat: 35.5620,
            driverLng: 6.1700,
            items: [{
                icon: isTanker ? 'car' : 'cube',
                description: order.item,
                detail: order.detail,
                price: order.earnings,
            }],
            subtotal: order.earnings,
            deliveryFee: 150,
            total: order.earnings + 150,
            status: 'accepted',
            createdAt: new Date().toLocaleDateString('fr-DZ') + ' • ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
        };
        acceptDriverOrder(driverOrder);
        router.push('/driver-active-delivery');
    };

    return (
        <View style={styles.orderCard}>
            {/* Customer row */}
            <View style={styles.orderTopRow}>
                {/* Avatar */}
                <View style={styles.orderAvatar}>
                    <Ionicons name="person" size={22} color={NAVY} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={styles.orderCustomerName}>{order.customer}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Ionicons name="location-outline" size={12} color={GRAY} />
                        <Text style={styles.orderDistance}> {order.distance}</Text>
                    </View>
                </View>
                <View>
                    <Text style={styles.earningsLabel}>EARNINGS</Text>
                    <Text style={styles.earningsGreen}>{order.earnings.toLocaleString()} DA</Text>
                </View>
            </View>

            {/* Item box */}
            <View style={styles.orderItemBox}>
                <View style={styles.orderItemIcon}>
                    <Ionicons
                        name={isTanker ? 'car' : 'cube'}
                        size={22}
                        color={BLUE}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.orderItemTitle}>{order.item}</Text>
                    <Text style={styles.orderItemSub}>{order.detail}</Text>
                </View>
            </View>

            {/* Action row */}
            <View style={styles.orderActionsRow}>
                {/* Decline */}
                <TouchableOpacity
                    style={styles.declineSquare}
                    onPress={() => setDeclined(true)}
                >
                    <Ionicons name="close" size={22} color="#374151" />
                </TouchableOpacity>

                {/* Accept */}
                <TouchableOpacity
                    style={styles.acceptYellowBtn}
                    onPress={handleAccept}
                    activeOpacity={0.85}
                >
                    <Text style={styles.acceptYellowText}>ACCEPT ORDER</Text>
                    <Ionicons name="arrow-forward" size={18} color={NAVY} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── Offline empty state ─────────────────────────────────────────────────────────
function OfflineState() {
    return (
        <View style={styles.offlineBox}>
            <Ionicons name="moon-outline" size={44} color="#9CA3AF" />
            <Text style={styles.offlineTitle}>You are offline</Text>
            <Text style={styles.offlineText}>Go online to receive delivery requests.</Text>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DriverHomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const registeredDriver = useAppStore((s) => s.registeredDriver);
    const [isOnline, setIsOnline] = useState(true);

    const driverType = registeredDriver?.driverType ?? 'Tanker';
    const driverName = registeredDriver?.name || 'Driver';
    const firstName = driverName.split(' ')[0]; // e.g. 'Ahmed' from 'Ahmed Boudiaf'
    const isTanker = driverType === 'Tanker';

    const data = isTanker ? TANKER_DATA : BOTTLED_DATA;
    const earnings = data.earnings;
    const completed = data.completed;
    const orders = data.orders;

    // Time-based greeting
    const h = new Date().getHours();
    const greeting = h < 12 ? 'GOOD MORNING' : h < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ════════════════ HEADER ════════════════ */}
                <View style={styles.headerRow}>
                    {/* Avatar */}
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={26} color={NAVY} />
                        </View>
                        <View style={styles.onlineDotBadge} />
                    </View>

                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.greetingText}>{greeting}</Text>
                        <Text style={styles.nameText}>Welcome, {firstName}</Text>
                    </View>

                    {/* ONLINE toggle pill */}
                    <TouchableOpacity
                        style={[styles.onlinePill, !isOnline && styles.offlinePill]}
                        onPress={() => setIsOnline((v) => !v)}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.onlinePillText, !isOnline && { color: GRAY }]}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                        <Switch
                            value={isOnline}
                            onValueChange={setIsOnline}
                            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                            thumbColor={WHITE}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </TouchableOpacity>
                </View>

                {/* ════════════════ STATS ════════════════ */}
                <View style={styles.statsRow}>
                    {/* Earnings */}
                    <View style={styles.statCard}>
                        <View style={styles.statTopRow}>
                            <Ionicons name="card-outline" size={18} color={GRAY} />
                            <Text style={styles.statCaption}>EARNINGS</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                            <Text style={styles.statBigValue}>{earnings.toLocaleString()}</Text>
                            <Text style={styles.statUnit}> DA</Text>
                        </View>
                    </View>

                    {/* Completed */}
                    <View style={styles.statCard}>
                        <View style={styles.statTopRow}>
                            <Ionicons name="car-outline" size={18} color={GRAY} />
                            <Text style={styles.statCaption}>COMPLETED</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                            <Text style={styles.statBigValue}>{completed}</Text>
                            <Text style={styles.statUnit}> TRIPS</Text>
                        </View>
                    </View>
                </View>

                {/* ════════════════ INVENTORY ════════════════ */}
                {isTanker ? <TankerInventory /> : <BottledInventory />}

                {/* ════════════════ NEW REQUESTS ════════════════ */}
                <View style={styles.requestsHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="notifications" size={20} color={NAVY} />
                        <Text style={styles.requestsTitle}>New Requests </Text>
                        <Text style={styles.requestsCity}>(Batna)</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>SEE ALL</Text>
                    </TouchableOpacity>
                </View>

                {isOnline ? (
                    <>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} isTanker={isTanker} />
                        ))}

                        {/* ── Nearby mini list (Tanker only) */}
                        {isTanker && TANKER_DATA.nearby.map((n, i) => (
                            <TouchableOpacity key={i} style={styles.nearbyRow}>
                                <View style={styles.nearbyAvatar}>
                                    <Ionicons name="person-outline" size={18} color={GRAY} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.nearbyName}>{n.name}</Text>
                                    <Text style={styles.nearbyDetail}>{n.distance} • {n.size}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={GRAY} />
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <OfflineState />
                )}

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => router.replace('/role-selection')}
                >
                    <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                    <Text style={styles.logoutText}> Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ════════════════ BOTTOM NAV ════════════════ */}
            <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                {[
                    { icon: 'grid', label: 'DASH', active: true },
                    { icon: 'car-outline', label: 'TRIPS', active: false },
                    { icon: 'wallet-outline', label: 'WALLET', active: false },
                    { icon: 'person-outline', label: 'PROFILE', active: false },
                ].map((tab) => (
                    <TouchableOpacity key={tab.label} style={styles.navTab}>
                        <Ionicons
                            name={tab.icon as any}
                            size={24}
                            color={tab.active ? NAVY : '#9CA3AF'}
                        />
                        <Text style={[styles.navLabel, tab.active && { color: NAVY }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { paddingHorizontal: 18, paddingTop: 20 },

    // ── Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },
    avatarWrap: { position: 'relative' },
    avatarCircle: {
        width: 52, height: 52,
        borderRadius: 26,
        backgroundColor: LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BORDER,
    },
    onlineDotBadge: {
        position: 'absolute',
        bottom: 2, right: 2,
        width: 12, height: 12,
        borderRadius: 6,
        backgroundColor: GREEN,
        borderWidth: 2,
        borderColor: WHITE,
    },
    greetingText: { fontSize: 11, color: GRAY, fontWeight: '600', letterSpacing: 0.5 },
    nameText: { fontSize: 20, fontWeight: 'bold', color: NAVY, marginTop: 1 },

    // Online pill toggle
    onlinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1.5,
        borderColor: '#D1FAE5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    offlinePill: { borderColor: BORDER },
    onlinePillText: { fontSize: 11, fontWeight: 'bold', color: GREEN, marginRight: 4 },

    // ── Stats
    statsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
    statCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statCaption: { fontSize: 11, color: GRAY, fontWeight: '700', letterSpacing: 0.4 },
    statBigValue: { fontSize: 26, fontWeight: 'bold', color: NAVY },
    statUnit: { fontSize: 14, color: GRAY, fontWeight: '600', marginBottom: 2 },

    // ── Generic card
    card: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: NAVY },

    // ── Tanker inventory
    waterTypeBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    waterTypeBadgeText: { fontSize: 11, fontWeight: 'bold', color: BLUE, letterSpacing: 0.4 },
    remainingText: { fontSize: 14, color: GRAY, fontWeight: '500' },
    pctText: { fontSize: 20, fontWeight: 'bold', color: NAVY },
    barTrack: {
        height: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 18,
    },
    barFill: {
        height: 16,
        borderRadius: 8,
        backgroundColor: BLUE,
    },
    refillOutlinedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: NAVY,
        borderRadius: 14,
        paddingVertical: 14,
    },
    refillOutlinedText: { fontSize: 15, fontWeight: 'bold', color: NAVY, letterSpacing: 1 },

    // ── Bottled inventory
    refillSmallBtn: {
        borderWidth: 1.5,
        borderColor: NAVY,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    refillSmallText: { fontSize: 13, fontWeight: '700', color: NAVY },
    stockCol: { alignItems: 'center', gap: 6 },
    stockIconBox: {
        width: 54, height: 54,
        borderRadius: 16,
        backgroundColor: BG,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stockSizeLabel: { fontSize: 12, color: GRAY, fontWeight: '600' },
    stockQtyText: { fontSize: 14, color: NAVY },

    // ── Requests section header
    requestsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    requestsTitle: { fontSize: 17, fontWeight: 'bold', color: NAVY },
    requestsCity: { fontSize: 15, color: GRAY },
    seeAllText: { fontSize: 13, fontWeight: '700', color: NAVY },

    // ── Order card
    orderCard: {
        backgroundColor: WHITE,
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    orderTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderAvatar: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCustomerName: { fontSize: 17, fontWeight: 'bold', color: NAVY },
    orderDistance: { fontSize: 12, color: GRAY },
    earningsLabel: { fontSize: 10, color: GRAY, letterSpacing: 0.5, fontWeight: '700', marginBottom: 2 },
    earningsGreen: { fontSize: 16, fontWeight: 'bold', color: GREEN },

    orderItemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    orderItemIcon: {
        width: 42, height: 42,
        borderRadius: 12,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderItemTitle: { fontSize: 15, fontWeight: 'bold', color: NAVY },
    orderItemSub: { fontSize: 12, color: GRAY, marginTop: 2 },

    // Action row
    orderActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    declineSquare: {
        width: 52, height: 52,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    acceptYellowBtn: {
        flex: 1,
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
    acceptYellowText: { fontSize: 15, fontWeight: 'bold', color: NAVY, letterSpacing: 0.8 },

    // Nearby mini row (Tanker)
    nearbyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER,
    },
    nearbyAvatar: {
        width: 38, height: 38,
        borderRadius: 19,
        backgroundColor: LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nearbyName: { fontSize: 14, fontWeight: '600', color: NAVY },
    nearbyDetail: { fontSize: 12, color: GRAY, marginTop: 2 },

    // ── Offline state
    offlineBox: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: BORDER,
        borderStyle: 'dashed',
    },
    offlineTitle: { fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginTop: 14, marginBottom: 6 },
    offlineText: { fontSize: 14, color: GRAY, textAlign: 'center', lineHeight: 20 },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    logoutText: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },

    // ── Bottom nav
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 10,
    },
    navTab: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    navLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.3 },
});
