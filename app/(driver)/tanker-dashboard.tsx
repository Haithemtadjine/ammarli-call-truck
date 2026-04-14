import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverOrder, useAppStore } from '../../src/store/useAppStore';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const NAVY        = '#003366';
const YELLOW      = '#F3CD0D';
const BG          = '#F0F4FA';
const WHITE       = '#FFFFFF';
const CAPTION     = '#64748B';
const BLUE_BAR    = '#2563EB';
const GREEN       = '#22C55E';
const RED         = '#EF4444';
const BORDER      = '#E2E8F0';
const LIGHT_BLUE  = '#EFF6FF';

// ─── Shadow helper (cross-platform) ───────────────────────────────────────────
const shadow = (elevation = 4, color = '#003366') =>
    Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
        },
        android: {
            elevation,
            shadowColor: color,      // respected on newer Android
        },
        default: {},
    });

// ─── Mock data ─────────────────────────────────────────────────────────────────
const TANKER_DATA = {
    earnings : 8500,
    completed: 5,
    orders   : [
        {
            id      : '1',
            customer: 'Yassine',
            initial : 'Y',
            distance: '4.2 km away',
            item    : '3000L Spring Water',
            earnings: 2500,
            payment : 'CASH',
            volume  : '3000L',
            type    : 'Spring Water',
        },
        {
            id      : '2',
            customer: 'Meriem',
            initial : 'M',
            distance: '1.8 km away',
            item    : '1500L Purified Water',
            earnings: 1200,
            payment : 'WALLET',
            volume  : '1500L',
            type    : 'Purified Water',
            pending : true,
        },
    ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ── TANK CAPACITY CARD ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function TankCapacityCard() {
    const inventory  = useAppStore(s => s.inventory);
    const refillStock = useAppStore(s => s.refillStock);
    const { remaining, total, waterType } = inventory.tanker;
    const pct      = remaining / total;

    const [showModal, setShowModal]   = useState(false);
    const [addAmount, setAddAmount]   = useState(1000);
    const maxAdd = total - remaining;

    const handleRefill = () => {
        if (addAmount > 0) refillStock('tanker', addAmount);
        setShowModal(false);
    };

    return (
        // Shadow wrapper — NO overflow hidden here!
        <View style={[styles.cardShadowWrap, shadow(4)]}>
            <View style={styles.cardInner}>

                {/* Header row */}
                <View style={styles.row}>
                    <View>
                        <Text style={styles.cardTitle}>Tank Capacity</Text>
                        <Text style={styles.cardSubtitle}>Type: {waterType === 'SPRING WATER' ? 'Mineral Spring Water' : waterType}</Text>
                    </View>
                    <View style={styles.tankIconCircle}>
                        <Ionicons name="water" size={20} color={BLUE_BAR} />
                    </View>
                </View>

                {/* Remaining row */}
                <View style={[styles.row, { marginTop: 16, marginBottom: 8 }]}>
                    <Text style={styles.remainingText}>
                        Remaining:{' '}
                        <Text style={{ fontWeight: '700', color: NAVY }}>{remaining.toLocaleString()}L</Text>
                    </Text>
                    <Text style={styles.totalText}>/ {total.toLocaleString()}L</Text>
                </View>

                {/* Progress bar — overflow hidden only on inner track */}
                <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
                </View>

                {/* Refill button — outlined navy pill */}
                <TouchableOpacity
                    style={styles.refillBtn}
                    onPress={() => { setAddAmount(Math.min(1000, maxAdd)); setShowModal(true); }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.refillBtnText}>REFILL TANK</Text>
                </TouchableOpacity>
            </View>

            {/* Refill Bottom Sheet */}
            <Modal transparent visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
                <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={() => setShowModal(false)}>
                    <TouchableOpacity style={sheet.container} activeOpacity={1}>
                        <View style={sheet.handle} />
                        <Text style={sheet.title}>Refill Tank</Text>
                        <Text style={sheet.sub}>Current: {remaining.toLocaleString()}L / {total.toLocaleString()}L</Text>

                        <View style={sheet.amountRow}>
                            <TouchableOpacity style={sheet.stepBtn} onPress={() => setAddAmount(a => Math.max(500, a - 500))}>
                                <Ionicons name="remove" size={22} color={NAVY} />
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center', minWidth: 120 }}>
                                <Text style={sheet.amountValue}>{addAmount.toLocaleString()}</Text>
                                <Text style={sheet.amountUnit}>Litres</Text>
                            </View>
                            <TouchableOpacity style={sheet.stepBtn} onPress={() => setAddAmount(a => Math.min(maxAdd || total, a + 500))}>
                                <Ionicons name="add" size={22} color={NAVY} />
                            </TouchableOpacity>
                        </View>

                        <Text style={sheet.afterLabel}>
                            After refill: {Math.min(total, remaining + addAmount).toLocaleString()}L
                        </Text>

                        <TouchableOpacity style={sheet.confirmBtn} onPress={handleRefill}>
                            <Text style={sheet.confirmText}>CONFIRM REFILL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginTop: 12 }}>
                            <Text style={sheet.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── REQUEST CARD ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function RequestCard({
    order,
    onAccept,
}: {
    order: typeof TANKER_DATA.orders[0];
    onAccept: () => void;
}) {
    const isPending = (order as any).pending;
    return (
        // Shadow wrapper — NO overflow hidden here!
        <View style={[styles.cardShadowWrap, shadow(4), { marginBottom: 16 }]}>
            <View style={styles.cardInner}>
                {/* Top row */}
                <View style={styles.row}>
                    {/* Initial circle */}
                    <View style={styles.initialCircle}>
                        <Text style={styles.initialText}>{order.initial}</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.reqCustomerName}>{order.customer}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <Ionicons name="navigate" size={11} color={CAPTION} />
                            <Text style={styles.reqDistance}> {order.distance}</Text>
                        </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.reqPrice}>{order.earnings.toLocaleString()} DA</Text>
                        <Text style={[styles.paymentBadge, { color: isPending ? CAPTION : GREEN }]}>
                            {order.payment}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.thinDivider} />

                {/* Package + action */}
                <View style={styles.row}>
                    <View style={styles.packageBox}>
                        <Ionicons name="water" size={16} color={BLUE_BAR} style={{ marginBottom: 2 }} />
                        <Text style={styles.packageLabel}>Package</Text>
                        <Text style={styles.packageValue}>
                            {order.volume} {order.type}
                        </Text>
                    </View>

                    {isPending ? (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>PENDING</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
                            <Text style={styles.acceptBtnText}>ACCEPT</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── GPS PERMISSION MODAL ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function GpsPermissionModal({
    visible,
    onAllow,
    onLater,
    loading,
}: {
    visible: boolean;
    onAllow: () => void;
    onLater: () => void;
    loading: boolean;
}) {
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 900 }),
                    withTiming(1, { duration: 900 }),
                ),
                -1,
                true,
            );
        }
    }, [visible]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={modal.overlay}>
                <View style={[modal.card, shadow(20)]}>
                    <View style={modal.iconOuter}>
                        <Animated.View style={[modal.iconInner, animStyle]}>
                            <Ionicons name="location" size={32} color={WHITE} />
                        </Animated.View>
                    </View>
                    <Text style={modal.title}>تفعيل خدمات الموقع</Text>
                    <Text style={modal.body}>
                        لتزويدك بأفضل طلبات التوصيل القريبة منك، تحتاج أمارلي إلى الوصول لموقعك.
                    </Text>
                    <TouchableOpacity
                        style={[modal.allowBtn, loading && { opacity: 0.75 }]}
                        onPress={onAllow}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={NAVY} />
                            : <Text style={modal.allowText}>السماح بالوصول</Text>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onLater} style={{ marginTop: 14 }}>
                        <Text style={modal.laterText}>ربما لاحقاً</Text>
                    </TouchableOpacity>
                    <View style={modal.dotsRow}>
                        <View style={modal.dotInactive} />
                        <View style={modal.dotActive} />
                        <View style={modal.dotInactive} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── INCOMING ORDER BOTTOM SHEET ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function IncomingOrderModal({
    visible,
    order,
    timer,
    onAccept,
    onDecline,
}: {
    visible: boolean;
    order: any;
    timer: number;
    onAccept: () => void;
    onDecline: () => void;
}) {
    if (!order) return null;
    const pct = timer / 15;
    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={incoming.overlay}>
                <View style={incoming.sheet}>
                    {/* Customer + Price */}
                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={incoming.avatarBox}>
                                <Ionicons name="person" size={24} color={WHITE} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={incoming.name}>{order.customer}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <Ionicons name="star" size={12} color={YELLOW} />
                                    <Text style={incoming.rating}>4.8</Text>
                                    <Text style={{ color: CAPTION }}> • </Text>
                                    <Text style={incoming.dist}>{order.distance}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={incoming.badge}>NEW ORDER</Text>
                            <Text style={incoming.price}>
                                {order.earnings.toLocaleString()} <Text style={{ fontSize: 16 }}>DA</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.thinDivider} />

                    {/* Tanker details */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={incoming.dropBox}>
                            <Ionicons
                                name={order.tankerDetails?.waterType === 'SPRING' ? 'water' : 'construct'}
                                size={26}
                                color={order.tankerDetails?.waterType === 'SPRING' ? BLUE_BAR : '#F97316'}
                            />
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={incoming.itemName}>{order.tankerDetails?.waterType} WATER</Text>
                            <Text style={incoming.itemSub}>
                                {order.tankerDetails?.quantity.toLocaleString()} Liters • Floor{' '}
                                {order.tankerDetails?.floorNumber === 0 ? 'G' : order.tankerDetails?.floorNumber}
                            </Text>
                            <Text style={incoming.hose}>
                                Required Hose: {order.tankerDetails?.hoseLength}m
                            </Text>
                        </View>
                    </View>

                    {/* Timer */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16, gap: 8 }}>
                        <Ionicons name="time-outline" size={16} color={CAPTION} />
                        <Text style={incoming.timerText}>REQUEST EXPIRES IN {timer}S</Text>
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flex: 1, alignItems: 'center', paddingLeft: 60 }}>
                            <TouchableOpacity style={incoming.acceptCircle} onPress={onAccept} activeOpacity={0.8}>
                                <View style={[StyleSheet.absoluteFill, { borderRadius: 60, borderWidth: 4, borderColor: NAVY, opacity: 0.1 }]} />
                                <View style={[StyleSheet.absoluteFill, { borderRadius: 60, borderWidth: 4, borderTopColor: NAVY, borderRightColor: pct > 0.25 ? NAVY : 'transparent', borderBottomColor: pct > 0.5 ? NAVY : 'transparent', borderLeftColor: pct > 0.75 ? NAVY : 'transparent', transform: [{ rotate: '-90deg' }] }]} />
                                <Text style={incoming.acceptText}>ACCEPT</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onDecline} style={{ padding: 16 }}>
                            <Text style={incoming.declineText}>DECLINE</Text>
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
        <View style={[styles.cardShadowWrap, shadow(2), { alignItems: 'center', paddingVertical: 40 }]}>
            <View style={[styles.cardInner, { alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: BORDER }]}>
                <Ionicons name="moon-outline" size={44} color="#9CA3AF" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginTop: 14, marginBottom: 6 }}>You are offline</Text>
                <Text style={{ fontSize: 14, color: CAPTION, textAlign: 'center', lineHeight: 20 }}>
                    Go online to receive delivery requests.
                </Text>
            </View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DriverHomeScreen() {
    const insets  = useSafeAreaInsets();
    const router  = useRouter();

    const {
        registeredDriver,
        showRatingModal,
        setShowRatingModal,
        driverStatus,
        setDriverStatus,
        activeDriverOrder,
    } = useAppStore();

    const isOnline = driverStatus !== 'OFFLINE';
    const setIsOnline = (online: boolean) => setDriverStatus(online ? 'AVAILABLE' : 'OFFLINE');

    // ── State ─────────────────────────────────────────────────────────────────
    const [showGpsModal, setShowGpsModal] = useState(false);
    const [gpsLoading, setGpsLoading]     = useState(false);
    const [userLoc, setUserLoc]           = useState<Location.LocationObject | null>(null);
    const [cityName, setCityName]         = useState('Batna');
    const [incomingOrder, setIncomingOrder] = useState<any>(null);
    const [timer, setTimer]               = useState(15);

    const modalTimerRef       = useRef<any>(null);
    const singleOrderTimeoutRef = useRef<any>(null);
    const gpsWatcherRef       = useRef<any>(null);

    const nameStr  = registeredDriver?.name || 'Ahmed';
    const firstName = nameStr.split(' ')[0];

    const earnings  = TANKER_DATA.earnings;
    const completed = TANKER_DATA.completed;

    // ── GPS Setup ─────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status: existing } = await Location.getForegroundPermissionsAsync();
            if (existing !== 'granted') { setShowGpsModal(true); return; }
            const provider = await Location.getProviderStatusAsync();
            if (!provider.locationServicesEnabled) { setShowGpsModal(true); return; }
            await fetchLocation();
        })();

        gpsWatcherRef.current = setInterval(async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                const provider    = await Location.getProviderStatusAsync();
                if (status !== 'granted' || !provider.locationServicesEnabled) {
                    setShowGpsModal(true);
                    setIsOnline(false);
                }
            } catch (_) {}
        }, 5000);

        return () => clearInterval(gpsWatcherRef.current);
    }, []);

    const fetchLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setUserLoc(loc);
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&format=json`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'AmmarliApp/1.0' } },
            );
            if (res.ok) {
                const data = await res.json();
                const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || 'My City';
                setCityName(city);
            }
        } catch (_) {}
    };

    const handleGpsAllow = async () => {
        setGpsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const provider = await Location.getProviderStatusAsync();
            setGpsLoading(false);
            if (provider.locationServicesEnabled) {
                setShowGpsModal(false);
                setIsOnline(true);
                await fetchLocation();
            }
        } else {
            setGpsLoading(false);
        }
    };

    const handleGpsLater = () => setShowGpsModal(false);

    // ── Smart Order Generation ─────────────────────────────────────────────────
    const generateSmartOrder = async () => {
        const names = ['Mohamed', 'Lamine', 'Yassine', 'Sami', 'Hichem', 'Abdou'];
        const state = useAppStore.getState();
        const maxCapacity = state.registeredDriver?.capacity || state.inventory.tanker.total || 5000;
        const driverWaterType = state.registeredDriver?.waterType || state.inventory.tanker.waterType || 'SPRING';
        const wt = driverWaterType.toUpperCase();

        let realLoc = userLoc;
        if (!realLoc) {
            try {
                realLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                setUserLoc(realLoc);
            } catch (_) {
                realLoc = { coords: { latitude: 35.55597, longitude: 6.17366 } } as any;
            }
        }

        const latBase   = realLoc!.coords.latitude;
        const lngBase   = realLoc!.coords.longitude;
        const distanceKm = Math.random() * 2.5 + 0.5;
        const angleRad   = (Math.random() * 360 * Math.PI) / 180;
        const destLat    = latBase + (distanceKm / 111) * Math.cos(angleRad);
        const destLng    = lngBase + (distanceKm / (111 * Math.cos((latBase * Math.PI) / 180))) * Math.sin(angleRad);

        let quantity = maxCapacity;
        if (wt === 'SPRING') quantity = Math.floor(Math.random() * (maxCapacity - 80) + 80);

        const hoseLength  = Math.floor(Math.random() * 90) + 10;
        const floorNumber = Math.floor(Math.random() * 6);

        let locationLabel = `${cityName} - Centre`;
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${destLat}&lon=${destLng}&format=json`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'AmmarliApp/1.0' } },
            );
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const neighbourhood = geoData?.address?.neighbourhood || geoData?.address?.suburb || geoData?.address?.road;
                const city = geoData?.address?.city || geoData?.address?.town || cityName;
                locationLabel = neighbourhood ? `${neighbourhood}, ${city}` : city;
            }
        } catch (_) {}

        return {
            id          : String(Math.floor(Math.random() * 90000) + 10000),
            customer    : names[Math.floor(Math.random() * names.length)],
            distance    : `${distanceKm.toFixed(1)} km`,
            locationName: locationLabel,
            earnings    : 2500,
            coords      : { lat: destLat, lng: destLng },
            type        : 'TANKER',
            tankerDetails: { waterType: wt, quantity, hoseLength, floorNumber },
        };
    };

    // ── Order Polling ──────────────────────────────────────────────────────────
    useEffect(() => {
        clearInterval(singleOrderTimeoutRef.current);

        if (isOnline && !incomingOrder) {
            singleOrderTimeoutRef.current = setInterval(async () => {
                const state = useAppStore.getState();
                if (state.activeDriverOrder || incomingOrder) return;
                if (!state.user) { clearInterval(singleOrderTimeoutRef.current); return; }
                if (state.driverStatus !== 'AVAILABLE') return;
                const hasLocation = userLoc || state.registeredDriver?.location;
                if (!hasLocation) return;
                const maxCapacity = state.registeredDriver?.capacity || state.inventory.tanker.total || 5000;
                if (maxCapacity <= 0) return;

                const newOrder = await generateSmartOrder();
                if (newOrder) { setIncomingOrder(newOrder); setTimer(15); }
            }, 15000);
        } else if (!isOnline) {
            setIncomingOrder(null);
        }

        return () => clearInterval(singleOrderTimeoutRef.current);
    }, [isOnline, userLoc, incomingOrder]);

    useEffect(() => {
        if (incomingOrder) {
            modalTimerRef.current = setInterval(() => {
                setTimer(t => {
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
            orderId : order.id,
            customer: { name: order.customer, phone: '+213 555 00 00 00' },
            deliveryAddress: {
                label   : order.locationName,
                distance: order.distance,
                lat     : order.coords.lat,
                lng     : order.coords.lng,
            },
            driverLat: userLoc?.coords.latitude  || 35.56,
            driverLng: userLoc?.coords.longitude || 6.17,
            items: [{
                icon       : 'water',
                description: `${order.tankerDetails?.waterType} WATER - ${order.tankerDetails?.quantity?.toLocaleString()}L`,
                detail     : `Floor: ${order.tankerDetails?.floorNumber === 0 ? 'G' : order.tankerDetails?.floorNumber} • Hose: ${order.tankerDetails?.hoseLength}m`,
                price      : order.earnings,
            }],
            subtotal   : order.earnings,
            deliveryFee: 150,
            total      : order.earnings + 150,
            status     : 'accepted',
            createdAt  : new Date().toLocaleDateString('fr-DZ') + ' • ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
        };
        useAppStore.getState().acceptDriverOrder(driverOrder);
        setIncomingOrder(null);
        router.push('/driver-order-review');
    };

    const handleRatingSubmit = () => useAppStore.getState().setShowRatingModal(false);

    // Time-based greeting
    const h        = new Date().getHours();
    const greeting = h < 12 ? 'Good Morning,' : h < 18 ? 'Good Afternoon,' : 'Good Evening,';

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* ── HEADER (safe-area top padding) ───────────────────────────── */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, STATUSBAR_HEIGHT, 8) }]}>

                {/* Brand Logo + Bell */}
                <View style={styles.row}>
                    {/* Logo placeholder */}
                    <View style={styles.brandLogoCircle}>
                        <Ionicons name="water" size={22} color={NAVY} />
                    </View>
                    <Text style={styles.brandName}>Hydration Concierge</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.bellBtn} activeOpacity={0.75}>
                        <Ionicons name="notifications-outline" size={22} color={NAVY} />
                    </TouchableOpacity>
                </View>

                {/* Greeting + Toggle */}
                <View style={[styles.row, { marginTop: 20 }]}>
                    <View>
                        <Text style={styles.greetingText}>{greeting}</Text>
                        <Text style={styles.nameText}>Welcome, {firstName}</Text>
                    </View>
                    <View style={styles.onlinePill}>
                        <Text style={[styles.onlinePillLabel, { color: isOnline ? GREEN : CAPTION }]}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                        <Switch
                            value={isOnline}
                            onValueChange={setIsOnline}
                            trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                            thumbColor={isOnline ? GREEN : WHITE}
                            ios_backgroundColor="#D1D5DB"
                            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                        />
                    </View>
                </View>
            </View>

            {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 96 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ════ HERO STATS ════ */}
                <View style={styles.statsRow}>
                    {/* Earnings — Dark Navy */}
                    <View style={[styles.statShadowWrap, shadow(5)]}>
                        <View style={[styles.statCard, { backgroundColor: NAVY }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="card-outline" size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.75)' }]}>Earnings Today</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 4 }}>
                                <Text style={[styles.statValue, { color: WHITE }]}>{earnings.toLocaleString()}</Text>
                                <Text style={[styles.statUnit, { color: 'rgba(255,255,255,0.8)' }]}>DA</Text>
                            </View>
                        </View>
                    </View>

                    {/* Completed — Brand Yellow */}
                    <View style={[styles.statShadowWrap, shadow(5)]}>
                        <View style={[styles.statCard, { backgroundColor: YELLOW }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="car-outline" size={16} color={NAVY} />
                                <Text style={[styles.statLabel, { color: NAVY }]}>Completed</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 4 }}>
                                <Text style={[styles.statValue, { color: NAVY }]}>{completed}</Text>
                                <Text style={[styles.statUnit, { color: NAVY }]}>TRIPS</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ════ TANK CAPACITY ════ */}
                <TankCapacityCard />

                {/* ════ REQUESTS SECTION ════ */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>New Requests ({cityName})</Text>
                    <View style={styles.activeZoneBadge}>
                        <Text style={styles.activeZoneText}>ACTIVE ZONE</Text>
                    </View>
                </View>

                {isOnline ? (
                    <>
                        {/* Dynamic incoming order (from polling) */}
                        {incomingOrder && (
                            <View style={[styles.cardShadowWrap, shadow(4), { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: GREEN, borderRadius: 24 }]}>
                                <View style={styles.cardInner}>
                                    <View style={styles.row}>
                                        <View style={styles.initialCircle}>
                                            <Text style={styles.initialText}>{incomingOrder.customer[0].toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.reqCustomerName}>{incomingOrder.customer}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                <Ionicons name="navigate" size={11} color={CAPTION} />
                                                <Text style={styles.reqDistance}> {incomingOrder.distance}</Text>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.reqPrice}>{incomingOrder.earnings.toLocaleString()} DA</Text>
                                            <Text style={[styles.paymentBadge, { color: GREEN }]}>CASH</Text>
                                        </View>
                                    </View>
                                    <View style={styles.thinDivider} />
                                    <View style={styles.row}>
                                        <View style={styles.packageBox}>
                                            <Ionicons name="water" size={16} color={BLUE_BAR} style={{ marginBottom: 2 }} />
                                            <Text style={styles.packageLabel}>Package</Text>
                                            <Text style={styles.packageValue}>
                                                {incomingOrder.tankerDetails?.quantity.toLocaleString()}L {incomingOrder.tankerDetails?.waterType} Water
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                                            <Text style={styles.acceptBtnText}>ACCEPT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Static mock requests from TANKER_DATA */}
                        {TANKER_DATA.orders.map(ord => (
                            <RequestCard
                                key={ord.id}
                                order={ord}
                                onAccept={handleAccept}
                            />
                        ))}

                        {!incomingOrder && (
                            <View style={[styles.cardShadowWrap, shadow(2)]}>
                                <View style={[styles.cardInner, { alignItems: 'center', paddingVertical: 28 }]}>
                                    <Ionicons name="time-outline" size={32} color={CAPTION} />
                                    <Text style={{ fontSize: 15, color: CAPTION, marginTop: 10, textAlign: 'center' }}>
                                        Stay online — new requests will appear here every few minutes.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <OfflineState />
                )}
            </ScrollView>

            {/* ── GPS Modal ──────────────────────────────────────────────────── */}
            <GpsPermissionModal
                visible={showGpsModal}
                onAllow={handleGpsAllow}
                onLater={handleGpsLater}
                loading={gpsLoading}
            />

            {/* ── Incoming Order Bottom Sheet ────────────────────────────────── */}
            <IncomingOrderModal
                visible={!!incomingOrder}
                order={incomingOrder}
                timer={timer}
                onAccept={handleAccept}
                onDecline={() => {
                    clearInterval(modalTimerRef.current);
                    setIncomingOrder(null);
                    router.push('/driver-decline-order');
                }}
            />

            {/* ── Rating Modal ───────────────────────────────────────────────── */}
            {showRatingModal && (
                <View style={styles.ratingOverlay}>
                    <View style={[styles.ratingCard, shadow(20)]}>
                        <View style={styles.ratingIconBox}>
                            <Ionicons name="star" size={32} color={YELLOW} />
                        </View>
                        <Text style={styles.ratingTitle}>Rate the Customer</Text>
                        <Text style={styles.ratingBody}>How was your experience delivering this order?</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star}>
                                    <Ionicons name="star-outline" size={40} color={CAPTION} style={{ marginHorizontal: 4 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.ratingBtn} onPress={handleRatingSubmit}>
                            <Text style={styles.ratingBtnText}>Submit Rating</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Main Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Header
    header: {
        backgroundColor: WHITE,
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    brandLogoCircle: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: LIGHT_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    brandName: {
        fontSize: 16,
        fontWeight: '700',
        color: NAVY,
        letterSpacing: -0.3,
    },
    bellBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: LIGHT_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greetingText: { fontSize: 15, color: CAPTION, fontWeight: '500' },
    nameText: {
        fontSize: 24,
        fontWeight: '800',
        color: NAVY,
        letterSpacing: -0.5,
        marginTop: 2,
    },
    onlinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: BORDER,
        gap: 4,
    },
    onlinePillLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.4,
    },

    // Scroll body
    scroll: { paddingHorizontal: 24, paddingTop: 24 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    statShadowWrap: {
        flex: 1,
        borderRadius: 24,
        // No overflow:hidden here so shadow shows on Android
    },
    statCard: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden', // only inner clips
    },
    statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    statUnit:  { fontSize: 14, fontWeight: '700', marginBottom: 2 },

    // Generic card (shadow wrapper + inner)
    cardShadowWrap: {
        borderRadius: 24,
        backgroundColor: WHITE,
        marginBottom: 16,
        // overflow: 'hidden' is INTENTIONALLY ABSENT to protect Android shadow
    },
    cardInner: {
        borderRadius: 24,
        backgroundColor: WHITE,
        padding: 20,
        overflow: 'hidden', // only clip border-radius visually here
    },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    thinDivider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },

    // Card title
    cardTitle:    { fontSize: 18, fontWeight: '700', color: NAVY, letterSpacing: -0.3 },
    cardSubtitle: { fontSize: 13, color: CAPTION, marginTop: 2 },

    // Tank Capacity card
    tankIconCircle: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: LIGHT_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingText: { fontSize: 14, color: CAPTION, fontWeight: '500' },
    totalText:     { fontSize: 13, color: '#94A3B8' },
    barTrack: {
        height: 10,
        backgroundColor: '#E2E8F0',
        borderRadius: 5,
        marginBottom: 18,
        overflow: 'hidden', // only the TRACK clips, not the outer card
    },
    barFill: {
        height: 10,
        borderRadius: 5,
        backgroundColor: BLUE_BAR,
    },
    refillBtn: {
        height: 56,
        borderWidth: 1.5,
        borderColor: NAVY,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    refillBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: NAVY,
        letterSpacing: 1.2,
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: NAVY, letterSpacing: -0.3 },
    activeZoneBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    activeZoneText: { fontSize: 10, fontWeight: '800', color: '#16A34A', letterSpacing: 0.5 },

    // Request cards
    initialCircle: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: LIGHT_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialText: { fontSize: 18, fontWeight: '800', color: NAVY },
    reqCustomerName: { fontSize: 16, fontWeight: '700', color: NAVY },
    reqDistance:     { fontSize: 12, color: CAPTION },
    reqPrice:        { fontSize: 18, fontWeight: '800', color: NAVY },
    paymentBadge:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginTop: 2 },

    packageBox: { flex: 1, paddingRight: 12 },
    packageLabel: { fontSize: 11, color: CAPTION, fontWeight: '600', marginBottom: 2 },
    packageValue: { fontSize: 14, fontWeight: '700', color: NAVY },

    acceptBtn: {
        backgroundColor: YELLOW,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptBtnText: { fontSize: 13, fontWeight: '800', color: NAVY, letterSpacing: 0.5 },

    pendingBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    pendingText: { fontSize: 13, fontWeight: '700', color: CAPTION, letterSpacing: 0.5 },

    // Rating modal
    ratingOverlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        padding: 24, zIndex: 1000,
    },
    ratingCard: {
        backgroundColor: WHITE,
        borderRadius: 24, padding: 24, width: '100%',
        alignItems: 'center',
    },
    ratingIconBox: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#FEF9C3', justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    ratingTitle: { fontSize: 22, fontWeight: '800', color: NAVY, marginBottom: 8 },
    ratingBody : { fontSize: 14, color: CAPTION, textAlign: 'center', marginBottom: 24 },
    ratingBtn  : { backgroundColor: YELLOW, paddingVertical: 16, width: '100%', borderRadius: 16, alignItems: 'center' },
    ratingBtnText: { fontSize: 16, fontWeight: '800', color: NAVY },
});

// ─── Refill Bottom Sheet Styles ────────────────────────────────────────────────
const sheet = StyleSheet.create({
    overlay  : { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    container: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40,
    },
    handle      : { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 },
    title       : { fontSize: 22, fontWeight: '800', color: NAVY, marginBottom: 6 },
    sub         : { fontSize: 14, color: CAPTION, marginBottom: 28 },
    amountRow   : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
    stepBtn     : {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#F0F4FA', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: BORDER,
    },
    amountValue : { fontSize: 36, fontWeight: '900', color: NAVY },
    amountUnit  : { fontSize: 13, color: CAPTION, fontWeight: '600', marginTop: 2 },
    afterLabel  : { fontSize: 14, color: CAPTION, textAlign: 'center', marginBottom: 28 },
    confirmBtn  : {
        backgroundColor: YELLOW,
        paddingVertical: 18, borderRadius: 18, alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: YELLOW, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
            android: { elevation: 5 },
        }),
    },
    confirmText : { fontSize: 16, fontWeight: '900', color: NAVY, letterSpacing: 1 },
    cancelText  : { fontSize: 15, fontWeight: '700', color: CAPTION, textAlign: 'center' },
});

// ─── GPS Modal Styles ──────────────────────────────────────────────────────────
const modal = StyleSheet.create({
    overlay : { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 28 },
    card    : { backgroundColor: WHITE, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 36, width: '100%', alignItems: 'center' },
    iconOuter: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FEF9C3', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    iconInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center' },
    title : { fontSize: 22, fontWeight: '800', color: NAVY, textAlign: 'center', marginBottom: 12 },
    body  : { fontSize: 15, color: CAPTION, textAlign: 'center', lineHeight: 23, marginBottom: 28 },
    allowBtn: {
        backgroundColor: YELLOW, width: '100%', paddingVertical: 18,
        borderRadius: 18, alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: YELLOW, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 },
            android: { elevation: 6 },
        }),
    },
    allowText  : { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3 },
    laterText  : { fontSize: 15, fontWeight: '700', color: NAVY },
    dotsRow    : { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
    dotInactive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
    dotActive  : { width: 22, height: 8, borderRadius: 4, backgroundColor: YELLOW },
});

// ─── Incoming Order Sheet Styles ───────────────────────────────────────────────
const incoming = StyleSheet.create({
    overlay : { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet   : {
        backgroundColor: WHITE,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 20 },
        }),
    },
    avatarBox    : { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
    name         : { fontSize: 20, fontWeight: '800', color: NAVY },
    rating       : { fontSize: 13, color: '#F59E0B', fontWeight: 'bold', marginLeft: 4 },
    dist         : { fontSize: 13, color: CAPTION },
    badge        : { fontSize: 10, fontWeight: '800', color: '#F97316', letterSpacing: 1, marginBottom: 4 },
    price        : { fontSize: 24, fontWeight: '900', color: NAVY },
    dropBox      : { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    itemName     : { fontSize: 18, fontWeight: '700', color: NAVY },
    itemSub      : { fontSize: 13, color: CAPTION, marginTop: 4 },
    hose         : { fontSize: 13, color: CAPTION, fontWeight: '600', marginTop: 6 },
    timerText    : { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 0.5 },
    acceptCircle : {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center',
    },
    acceptText   : { fontSize: 18, fontWeight: '900', color: NAVY },
    declineText  : { fontSize: 14, fontWeight: 'bold', color: CAPTION },
});
