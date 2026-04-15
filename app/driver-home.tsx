import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriverBottomNav from '../src/components/DriverBottomNav';
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
    const inventory = useAppStore((s) => s.inventory.tanker);
    const refillStock = useAppStore((s) => s.refillStock);
    const { remaining, total, waterType } = inventory;
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
            <TouchableOpacity 
                style={styles.refillOutlinedBtn}
                onPress={() => refillStock('tanker', 5000)}
            >
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
    const refillStock = useAppStore((s) => s.refillStock);
    const stock = BOTTLED_DATA.stock;

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.cardTitle}>Current Stock</Text>
                <TouchableOpacity 
                    style={styles.refillSmallBtn}
                    onPress={() => refillStock('bottled', { brand: 'Ifri', size: '1.5L', qty: 50 })}
                >
                    <Text style={styles.refillSmallText}>Refill Stock</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.row, { justifyContent: 'space-around', marginTop: 18 }]}>
                {stock.map((item) => (
                    <View key={item.size} style={styles.stockCol}>
                        <View style={styles.stockIconBox}>
                            <Ionicons name={item.icon as any} size={26} color={NAVY} />
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
// ─── Incoming Order Overlay (The Modal) ──────────────────────────────────────────
function IncomingOrderOverlay({
    order,
    onAccept,
    onDecline,
    visible,
    timer,
}: {
    order: any;
    onAccept: () => void;
    onDecline: () => void;
    visible: boolean;
    timer: number;
}) {
    if (!order) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.incomingOverlay}>
                <View style={styles.incomingCard}>
                    {/* Row 1: Customer & Price */}
                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={styles.orangeAvatarBox}>
                                <Ionicons name="person" size={24} color={WHITE} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.incomingName}>{order.customer}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <Text style={styles.incomingRating}>⭐️ 4.8</Text>
                                    <Text style={styles.dotSeparator}> · </Text>
                                    <Text style={styles.incomingDist}>{order.distance} away</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.newOrderBadge}>NEW ORDER</Text>
                            <Text style={styles.incomingPrice}>{order.earnings.toLocaleString()} DA</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Row 2: Order Detail */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.dropIconBox}>
                            <Ionicons name="water" size={20} color="#F97316" />
                        </View>
                        <View style={{ marginLeft: 14 }}>
                            <Text style={styles.incomingItemName}>{order.item}</Text>
                            <Text style={styles.incomingSubtitle}>{order.locationName}</Text>
                        </View>
                    </View>

                    {/* Row 3: Timer Text */}
                    <View style={styles.timerRow}>
                        <Ionicons name="time-outline" size={16} color={GRAY} />
                        <Text style={styles.timerText}>REQUEST EXPIRES IN {timer}S</Text>
                    </View>

                    {/* Row 4: Actions */}
                    <View style={styles.incomingActions}>
                        <TouchableOpacity style={styles.acceptCircularBtn} onPress={onAccept}>
                            <View style={styles.acceptInner}>
                                <Text style={styles.acceptText}>ACCEPT</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onDecline}>
                            <Text style={styles.declineTextBtn}>DECLINE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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

    // ── Smart Logic State ───────────────────────────────────────────────────
    const [userLoc, setUserLoc] = useState<Location.LocationObject | null>(null);
    const [cityName, setCityName] = useState('Batna');
    const [incomingOrder, setIncomingOrder] = useState<any>(null);
    const [timer, setTimer] = useState(15);
    const orderIntervalRef = useRef<any>(null);
    const modalTimerRef = useRef<any>(null);

    const driverType = registeredDriver?.driverType ?? 'Tanker';
    const waterType = registeredDriver?.waterType ?? 'Spring';
    const driverName = registeredDriver?.name || 'Driver';
    const firstName = driverName.split(' ')[0];
    const isTanker = driverType === 'Tanker';

    const data = isTanker ? TANKER_DATA : BOTTLED_DATA;
    const earnings = data.earnings;
    const completed = data.completed;

    // ── 1. Setup Location & Geocoding ───────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            
            const loc = await Location.getCurrentPositionAsync({});
            setUserLoc(loc);
            
            const geo = await Location.reverseGeocodeAsync(loc.coords);
            if (geo.length > 0) {
                setCityName(geo[0].city || geo[0].district || geo[0].region || 'Batna');
            }
        })();
    }, []);

    // ── 2. Smart Order Generation Helper ────────────────────────────────────
    const generateSmartOrder = () => {
        const names = ['Mohamed', 'Lamine', 'Yassine', 'Sami', 'Hichem', 'Abdou'];
        const districts = ['Sector 4', 'North District', 'Cité Azhar', 'El Mouradia', 'Downtown'];
        
        const latBase = userLoc?.coords.latitude || 35.55;
        const lngBase = userLoc?.coords.longitude || 6.17;
        
        // Offset 1-3km
        const latOff = (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
        const lngOff = (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1);

        const distKm = Math.sqrt(Math.pow(latOff * 111, 2) + Math.pow(lngOff * 111, 2)).toFixed(1);
        
        let itemLabel = '';
        if (isTanker) {
            itemLabel = `3000L ${waterType} Water`;
        } else {
            const bottledItems = [
                '10x 1.5L Packs (Ifri)',
                '20x 0.5L Packs (Lalla Khedidja)',
                '5x 5L Jerrycans (Saida)',
                '12x 2L Bottles (Guedila)'
            ];
            itemLabel = bottledItems[Math.floor(Math.random() * bottledItems.length)];
        }

        return {
            id: String(Math.floor(Math.random() * 90000) + 10000),
            customer: names[Math.floor(Math.random() * names.length)],
            distance: `${distKm} km`,
            item: itemLabel,
            locationName: `${cityName} - ${districts[Math.floor(Math.random() * districts.length)]}`,
            earnings: isTanker ? 2500 : 1250,
            coords: { lat: latBase + latOff, lng: lngBase + lngOff }
        };
    };

    // ── 3. Interval & Timer Logic ───────────────────────────────────────────
    useEffect(() => {
        if (isOnline) {
            // Check once every 60s
            orderIntervalRef.current = setInterval(() => {
                if (!incomingOrder) {
                    const newOrder = generateSmartOrder();
                    setIncomingOrder(newOrder);
                    setTimer(15);
                }
            }, 60000); // 1 minute
        } else {
            clearInterval(orderIntervalRef.current);
            setIncomingOrder(null);
        }
        return () => clearInterval(orderIntervalRef.current);
    }, [isOnline, incomingOrder, userLoc, cityName]);

    useEffect(() => {
        if (incomingOrder) {
            modalTimerRef.current = setInterval(() => {
                setTimer((t) => {
                    if (t <= 1) {
                        clearInterval(modalTimerRef.current);
                        setIncomingOrder(null);
                        return 15;
                    }
                    return t - 1;
                });
            }, 1000);
        } else {
            clearInterval(modalTimerRef.current);
        }
        return () => clearInterval(modalTimerRef.current);
    }, [incomingOrder]);

    const handleAccept = () => {
        const order = incomingOrder;
        const driverOrder: DriverOrder = {
            orderId: order.id,
            customer: { name: order.customer, phone: '+213 555 00 00 00' },
            deliveryAddress: {
                label: order.locationName,
                distance: order.distance,
                lat: order.coords.lat,
                lng: order.coords.lng,
            },
            driverLat: userLoc?.coords.latitude || 35.56,
            driverLng: userLoc?.coords.longitude || 6.17,
            items: [{
                icon: isTanker ? 'car' : 'cube',
                description: order.item,
                detail: isTanker ? 'Bulk Delivery' : 'Mineral Water',
                price: order.earnings,
            }],
            subtotal: order.earnings,
            deliveryFee: 150,
            total: order.earnings + 150,
            status: 'accepted',
            createdAt: new Date().toLocaleDateString('fr-DZ') + ' • ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
        };
        useAppStore.getState().acceptDriverOrder(driverOrder);
        setIncomingOrder(null);
        router.push('/driver-order-review');
    };

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

                {/* ════════════════ CHART PLACEHOLDER ════════════════ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Daily Performance</Text>
                    <View style={{ height: 180, backgroundColor: '#F9FAFB', borderRadius: 16, marginTop: 15, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="stats-chart" size={40} color="#E5E7EB" />
                        <Text style={{ color: GRAY, fontSize: 13, marginTop: 10 }}>Chart visualization available in production</Text>
                    </View>
                </View>

                {!isOnline && <OfflineState />}

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
            <DriverBottomNav activeTab="dashboard" />

            {/* ════════════════ OVERLAYS ════════════════ */}
            <IncomingOrderOverlay 
                order={incomingOrder}
                visible={!!incomingOrder}
                timer={timer}
                onAccept={handleAccept}
                onDecline={() => setIncomingOrder(null)}
            />

            {/* ════════════════ RATING MODAL ════════════════ */}
            <RatingModal />
        </View>
    );
}

// ─── Rating Modal Component ───────────────────────────────────────────────────
function RatingModal() {
    const { showRatingModal, setShowRatingModal } = useAppStore();
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Selection Required', 'Please select a star rating first.');
            return;
        }
        setShowRatingModal(false);
        setRating(0);
        Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
    };

    return (
        <Modal
            visible={showRatingModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRatingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.modalIconBox}>
                        <Ionicons name="star" size={32} color={YELLOW} />
                    </View>
                    <Text style={styles.modalTitle}>Rate the Customer</Text>
                    <Text style={styles.modalSub}>How was your experience with this delivery?</Text>

                    {/* Star Rating Row */}
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setRating(s)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={rating >= s ? 'star' : 'star-outline'}
                                    size={42}
                                    color={rating >= s ? YELLOW : '#D1D5DB'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[styles.modalSubmitBtn, rating === 0 && { opacity: 0.5 }]} 
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.modalSubmitText}>Submit Rating</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.modalCloseBtn} 
                        onPress={() => setShowRatingModal(false)}
                    >
                        <Text style={styles.modalCloseText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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

    // ── Incoming Order Overlay
    incomingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    incomingCard: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginHorizontal: 15,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    orangeAvatarBox: {
        width: 60, height: 60,
        borderRadius: 30,
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
    },
    incomingName: { fontSize: 22, fontWeight: 'bold', color: NAVY },
    incomingRating: { fontSize: 14, color: '#F97316', fontWeight: 'bold' },
    dotSeparator: { fontSize: 14, color: GRAY },
    incomingDist: { fontSize: 14, color: GRAY, fontWeight: '500' },
    newOrderBadge: { fontSize: 10, fontWeight: '900', color: '#F97316', letterSpacing: 1, marginBottom: 5 },
    incomingPrice: { fontSize: 26, fontWeight: 'bold', color: NAVY },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
    dropIconBox: {
        width: 48, height: 48,
        borderRadius: 16,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    incomingItemName: { fontSize: 18, fontWeight: 'bold', color: NAVY },
    incomingSubtitle: { fontSize: 14, color: GRAY, marginTop: 2 },
    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    timerText: { fontSize: 12, fontWeight: 'bold', color: GRAY, letterSpacing: 1 },
    incomingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 35,
    },
    acceptCircularBtn: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptInner: {
        width: 124,
        height: 124,
        borderRadius: 62,
        backgroundColor: YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptText: { fontSize: 22, fontWeight: '900', color: NAVY },
    declineTextBtn: { fontSize: 16, fontWeight: 'bold', color: GRAY, marginRight: 20 },

    // ── Rating Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: WHITE,
        borderRadius: 28,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconBox: {
        width: 70, height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: NAVY, marginBottom: 8 },
    modalSub: { fontSize: 14, color: GRAY, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    starsRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
    modalSubmitBtn: {
        backgroundColor: NAVY,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    modalSubmitText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
    modalCloseBtn: { paddingVertical: 8 },
    modalCloseText: { fontSize: 14, fontWeight: '600', color: GRAY },
});
