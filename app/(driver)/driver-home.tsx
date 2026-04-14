import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import {
    ActivityIndicator,
    Image,
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

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DriverOrder, useAppStore } from '../../src/store/useAppStore';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const NAVY      = '#003366';
const YELLOW    = '#F3CD0D';
const BG        = '#F0F4FA';
const WHITE     = '#FFFFFF';
const CAPTION   = '#64748B';
const BLUE      = '#3B82F6';
const GREEN     = '#22C55E';
const BORDER    = '#E2E8F0';
const LIGHT_BLUE = '#EFF6FF';

// ─── Cross-platform shadow helper ─────────────────────────────────────────────
const mkShadow = (elevation = 4, color = '#003366') =>
    Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
        },
        android: { elevation, shadowColor: color },
        default: {},
    });

// ─── Brand data ────────────────────────────────────────────────────────────────
type BrandStock = { '0.5L': number; '1.5L': number; '5L': number };
type BrandEntry = { name: string; stock: BrandStock };

const INITIAL_BRANDS: BrandEntry[] = [
    { name: 'Ifri',           stock: { '0.5L': 25, '1.5L': 15, '5L': 10 } },
    { name: 'Guedila',        stock: { '0.5L': 30, '1.5L': 8,  '5L': 22 } },
    { name: 'Saida',          stock: { '0.5L': 12, '1.5L': 20, '5L': 5  } },
    { name: 'Lalla Khedidja', stock: { '0.5L': 40, '1.5L': 18, '5L': 3  } },
    { name: 'Youkous',        stock: { '0.5L': 9,  '1.5L': 25, '5L': 14 } },
    { name: 'Hayat',          stock: { '0.5L': 35, '1.5L': 12, '5L': 28 } },
    { name: 'Mansourah',      stock: { '0.5L': 7,  '1.5L': 6,  '5L': 19 } },
    { name: 'Texanna',        stock: { '0.5L': 22, '1.5L': 30, '5L': 11 } },
    { name: 'Toudja',         stock: { '0.5L': 16, '1.5L': 9,  '5L': 24 } },
    { name: 'Messerghine',    stock: { '0.5L': 4,  '1.5L': 17, '5L': 8  } },
];

const BRAND_LOGOS: Record<string, any> = {
    'Ifri':           require('../../assets/brands/ifri.png'),
    'Guedila':        require('../../assets/brands/guedila.png'),
    'Saida':          require('../../assets/brands/saida.png'),
    'Lalla Khedidja': require('../../assets/brands/lalla-khedidja.png'),
    'Youkous':        require('../../assets/brands/youkous.png'),
    'Hayat':          require('../../assets/brands/hayat.jpg'),
    'Mansourah':      require('../../assets/brands/mansourah.png'),
    'Texanna':        require('../../assets/brands/texanna.png'),
    'Toudja':         require('../../assets/brands/toudja.png'),
    'Messerghine':    require('../../assets/brands/messerghine.png'),
};

const SIZE_META: { size: keyof BrandStock; label: string; desc: string }[] = [
    { size: '0.5L', label: '0.5L Bottle', desc: 'Standard pack' },
    { size: '1.5L', label: '1.5L Bottle', desc: 'Popular size'  },
    { size: '5L',   label: '5L Gallon',   desc: 'Large volume'  },
];

function getStockTheme(qty: number) {
    if (qty >= 20) return { bg: '#E8F5E9', text: '#1B5E20', status: 'FULL'  };
    if (qty >= 11) return { bg: '#FFF8E1', text: '#E65100', status: 'LOW'   };
    return             { bg: '#FFEBEE', text: '#B71C1C', status: 'EMPTY' };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BOTTLED INVENTORY CARD ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function BottledInventory() {
    const registeredDriver  = useAppStore(s => s.registeredDriver);
    const liveBottledStock  = useAppStore(s => s.inventory.bottled.stock);
    const refillStock       = useAppStore(s => s.refillStock);

    const carriedBrandNames: string[] =
        registeredDriver?.brands && registeredDriver.brands.length > 0
            ? registeredDriver.brands
            : INITIAL_BRANDS.map(b => b.name);

    const filteredBrands = INITIAL_BRANDS.filter(b => carriedBrandNames.includes(b.name));
    const extraBrands: BrandEntry[] = carriedBrandNames
        .filter(n => !INITIAL_BRANDS.some(b => b.name === n))
        .map(n => ({ name: n, stock: { '0.5L': 0, '1.5L': 0, '5L': 0 } }));
    const allBrands: BrandEntry[] = [...filteredBrands, ...extraBrands];
    const firstBrand = allBrands[0]?.name ?? 'Ifri';

    const inventoryData: BrandEntry[] = allBrands.map(b => ({
        ...b,
        stock: liveBottledStock[b.name] || { '0.5L': 0, '1.5L': 0, '5L': 0 },
    }));

    const liveStock = {
        '0.5L': Object.values(liveBottledStock).reduce((s, b) => s + (b['0.5L'] || 0), 0),
        '1.5L': Object.values(liveBottledStock).reduce((s, b) => s + (b['1.5L'] || 0), 0),
        '5L':   Object.values(liveBottledStock).reduce((s, b) => s + (b['5L']   || 0), 0),
    };

    const [selectedBrand, setSelectedBrand] = useState(firstBrand);
    const [showModal, setShowModal]         = useState(false);
    const [refillBrand, setRefillBrand]     = useState(firstBrand);
    const ZERO: BrandStock = { '0.5L': 0, '1.5L': 0, '5L': 0 };
    const [refillAmounts, setRefillAmounts] = useState<BrandStock>({ ...ZERO });

    const openModal = () => { setRefillBrand(selectedBrand); setRefillAmounts({ ...ZERO }); setShowModal(true); };

    const handleUpdateInventory = () => {
        (['0.5L', '1.5L', '5L'] as (keyof BrandStock)[]).forEach(size => {
            if (refillAmounts[size] > 0) refillStock('bottled', { brand: refillBrand, size, qty: refillAmounts[size] });
        });
        setSelectedBrand(refillBrand);
        setRefillAmounts({ ...ZERO });
        setShowModal(false);
    };

    const stepAmount = (size: keyof BrandStock, delta: number) =>
        setRefillAmounts(prev => ({ ...prev, [size]: Math.max(0, prev[size] + delta) }));

    const activeBrand = inventoryData.find(b => b.name === selectedBrand) ?? inventoryData[0];

    return (
        // ── Double-Layer: outer = shadow, inner = clipping ──────────────────
        <View style={[S.cardShadowWrap, mkShadow(4)]}>
            <View style={S.cardInner}>
                {/* Header */}
                <View style={S.row}>
                    <Text style={S.cardTitle}>Current Inventory</Text>
                    <View style={S.bottledBadge}>
                        <Text style={S.bottledBadgeText}>BOTTLED</Text>
                    </View>
                </View>

                {/* Brand Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 16 }}
                    contentContainerStyle={{ gap: 12, paddingHorizontal: 2 }}
                >
                    {inventoryData.map(brand => {
                        const isActive = selectedBrand === brand.name;
                        const logo = BRAND_LOGOS[brand.name];
                        const total = brand.stock['0.5L'] + brand.stock['1.5L'] + brand.stock['5L'];
                        return (
                            // Brand card: also needs double-layer for active shadow
                            <View
                                key={brand.name}
                                style={[S.brandCardWrap, isActive && mkShadow(3, NAVY)]}
                            >
                                <TouchableOpacity
                                    onPress={() => setSelectedBrand(brand.name)}
                                    activeOpacity={0.8}
                                    style={[S.brandCardInner, isActive && S.brandCardInnerActive]}
                                >
                                    <View style={S.brandLogoCircle}>
                                        {logo
                                            ? <Image source={logo} style={S.brandLogoImg} />
                                            : <Ionicons name="water" size={22} color={isActive ? NAVY : BLUE} />
                                        }
                                    </View>
                                    <Text style={[S.brandCardName, isActive && { color: NAVY }]}>
                                        {brand.name}
                                    </Text>
                                    <Text style={S.brandCardTotal}>Total: {total}</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Divider */}
                <View style={S.thinDivider} />

                {/* Stock status subtitle */}
                <Text style={S.stockSubtitle}>STOCK STATUS - {selectedBrand.toUpperCase()}</Text>

                {/* 3-column stock breakdown */}
                <View style={S.stockRow}>
                    {(['0.5L', '1.5L', '5L'] as (keyof BrandStock)[]).map(size => {
                        const qty   = activeBrand?.stock[size] ?? 0;
                        const theme = getStockTheme(qty);
                        return (
                            <View key={size} style={[S.stockCell, { backgroundColor: theme.bg }]}>
                                <Text style={[S.stockSize,   { color: theme.text }]}>{size}</Text>
                                <Text style={[S.stockQty,    { color: theme.text }]}>{qty}</Text>
                                <View style={[S.stockStatus, { backgroundColor: theme.bg }]}>
                                    <Text style={[S.stockStatusText, { color: theme.text }]}>{theme.status}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Total row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 }}>
                    {(['0.5L', '1.5L', '5L'] as const).map(size => (
                        <Text key={size} style={{ fontSize: 11, color: CAPTION }}>
                            {size} total: <Text style={{ fontWeight: 'bold', color: NAVY }}>{liveStock[size]}</Text>
                        </Text>
                    ))}
                </View>

                {/* Refill button — outlined pill */}
                <TouchableOpacity style={S.refillBtn} onPress={openModal} activeOpacity={0.8}>
                    <Ionicons name="archive" size={18} color={NAVY} style={{ marginRight: 8 }} />
                    <Text style={S.refillBtnText}>REFILL STOCK</Text>
                </TouchableOpacity>
            </View>

            {/* ── Add Stock Bottom Sheet ── */}
            <Modal transparent visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
                <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={() => setShowModal(false)}>
                    <TouchableOpacity style={sheet.container} activeOpacity={1}>
                        <View style={sheet.handle} />
                        <View style={sheet.headerRow}>
                            <Text style={sheet.title}>Add New Stock</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Step 1 */}
                        <View style={sheet.stepRow}>
                            <View style={sheet.stepBadge}><Text style={sheet.stepBadgeText}>1</Text></View>
                            <Text style={sheet.stepLabel}>Select Brand</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 2, paddingVertical: 4 }}>
                            {inventoryData.map(brand => {
                                const active = refillBrand === brand.name;
                                const logo   = BRAND_LOGOS[brand.name];
                                return (
                                    <TouchableOpacity
                                        key={brand.name}
                                        onPress={() => setRefillBrand(brand.name)}
                                        activeOpacity={0.8}
                                        style={[sheet.brandPill, active && sheet.brandPillActive]}
                                    >
                                        {logo && <Image source={logo} style={sheet.miniLogo} />}
                                        <Text style={[sheet.brandPillText, active && sheet.brandPillTextActive]}>{brand.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Step 2 */}
                        <View style={sheet.stepRow}>
                            <View style={[sheet.stepBadge, { backgroundColor: '#FFF3E0' }]}><Text style={[sheet.stepBadgeText, { color: '#E65100' }]}>2</Text></View>
                            <Text style={sheet.stepLabel}>Enter Quantities</Text>
                        </View>
                        {SIZE_META.map(({ size, label, desc }) => {
                            const val = refillAmounts[size];
                            return (
                                <View key={size} style={sheet.qtyRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={sheet.qtyLabel}>{label}</Text>
                                        <Text style={sheet.qtyDesc}>{desc}</Text>
                                    </View>
                                    <View style={sheet.stepper}>
                                        <TouchableOpacity onPress={() => stepAmount(size, -1)} disabled={val === 0} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <Ionicons name="remove" size={20} color={val > 0 ? '#E65100' : '#D1D5DB'} />
                                        </TouchableOpacity>
                                        <Text style={sheet.stepperValue}>{val}</Text>
                                        <TouchableOpacity onPress={() => stepAmount(size, 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <Ionicons name="add" size={20} color="#E65100" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}

                        <TouchableOpacity style={sheet.updateBtn} onPress={handleUpdateInventory} activeOpacity={0.85}>
                            <Ionicons name="archive" size={18} color={WHITE} style={{ marginRight: 10 }} />
                            <Text style={sheet.updateBtnText}>Update Inventory</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── GPS MODAL ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function GpsPermissionModal({ visible, onAllow, onLater, loading }: { visible: boolean; onAllow: () => void; onLater: () => void; loading: boolean }) {
    const pulse = useSharedValue(1);
    useEffect(() => {
        if (visible) pulse.value = withRepeat(withSequence(withTiming(1.15, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
    }, [visible]);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <View style={gpsModal.overlay}>
                <View style={[gpsModal.card, mkShadow(20)]}>
                    <View style={gpsModal.iconOuter}>
                        <Animated.View style={[gpsModal.iconInner, animStyle]}>
                            <Ionicons name="location" size={32} color={WHITE} />
                        </Animated.View>
                    </View>
                    <Text style={gpsModal.title}>تفعيل خدمات الموقع</Text>
                    <Text style={gpsModal.body}>لتزويدك بأفضل طلبات التوصيل القريبة منك، تحتاج أمارلي إلى الوصول لموقعك.</Text>
                    <TouchableOpacity style={[gpsModal.allowBtn, loading && { opacity: 0.75 }]} onPress={onAllow} activeOpacity={0.85} disabled={loading}>
                        {loading ? <ActivityIndicator color={NAVY} /> : <Text style={gpsModal.allowText}>السماح بالوصول</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onLater} style={{ marginTop: 14 }}>
                        <Text style={gpsModal.laterText}>ربما لاحقاً</Text>
                    </TouchableOpacity>
                    <View style={gpsModal.dotsRow}>
                        <View style={gpsModal.dotInactive} />
                        <View style={gpsModal.dotActive}   />
                        <View style={gpsModal.dotInactive} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── INCOMING ORDER BOTTOM SHEET ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function IncomingOrderModal({ visible, order, timer, onAccept, onDecline }: { visible: boolean; order: any; timer: number; onAccept: () => void; onDecline: () => void }) {
    if (!order) return null;
    const pct = timer / 15;
    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={incomingS.overlay}>
                <View style={incomingS.sheet}>
                    <View style={S.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={incomingS.avatarBox}><Ionicons name="person" size={24} color={WHITE} /></View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={incomingS.name}>{order.customer}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <Ionicons name="star" size={12} color={YELLOW} />
                                    <Text style={incomingS.rating}>4.8</Text>
                                    <Text style={{ color: CAPTION }}> • </Text>
                                    <Text style={incomingS.dist}>{order.distance}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={incomingS.badge}>NEW ORDER</Text>
                            <Text style={incomingS.price}>{order.earnings.toLocaleString()} <Text style={{ fontSize: 16 }}>DA</Text></Text>
                        </View>
                    </View>
                    <View style={S.thinDivider} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="water" size={26} color="#F97316" />
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={incomingS.itemName}>{order.item}</Text>
                            <Text style={incomingS.itemSub}>Delivery to {order.locationName}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16, gap: 8 }}>
                        <Ionicons name="time-outline" size={16} color={CAPTION} />
                        <Text style={incomingS.timerText}>REQUEST EXPIRES IN {timer}S</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flex: 1, alignItems: 'center', paddingLeft: 60 }}>
                            <TouchableOpacity style={incomingS.acceptCircle} onPress={onAccept} activeOpacity={0.8}>
                                <View style={[StyleSheet.absoluteFill, { borderRadius: 60, borderWidth: 4, borderColor: NAVY, opacity: 0.1 }]} />
                                <View style={[StyleSheet.absoluteFill, { borderRadius: 60, borderWidth: 4, borderTopColor: NAVY, borderRightColor: pct > 0.25 ? NAVY : 'transparent', borderBottomColor: pct > 0.5 ? NAVY : 'transparent', borderLeftColor: pct > 0.75 ? NAVY : 'transparent', transform: [{ rotate: '-90deg' }] }]} />
                                <Text style={incomingS.acceptText}>ACCEPT</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onDecline} style={{ padding: 16 }}>
                            <Text style={incomingS.declineText}>DECLINE</Text>
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
        <View style={[S.cardShadowWrap, mkShadow(2)]}>
            <View style={[S.cardInner, { alignItems: 'center', paddingVertical: 40, borderStyle: 'dashed', borderWidth: 2, borderColor: BORDER }]}>
                <Ionicons name="moon-outline" size={44} color="#9CA3AF" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginTop: 14, marginBottom: 6 }}>You are offline</Text>
                <Text style={{ fontSize: 14, color: CAPTION, textAlign: 'center', lineHeight: 20 }}>Go online to receive delivery requests.</Text>
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
    const { registeredDriver, showRatingModal, setShowRatingModal, driverStatus, setDriverStatus } = useAppStore();

    const isOnline = driverStatus !== 'OFFLINE';
    const setIsOnline = (online: boolean) => setDriverStatus(online ? 'AVAILABLE' : 'OFFLINE');

    const [showGpsModal,   setShowGpsModal]   = useState(false);
    const [gpsLoading,     setGpsLoading]     = useState(false);
    const [userLoc,        setUserLoc]        = useState<Location.LocationObject | null>(null);
    const [cityName,       setCityName]       = useState('Batna');
    const [incomingOrder,  setIncomingOrder]  = useState<any>(null);
    const [timer,          setTimer]          = useState(15);

    const modalTimerRef        = useRef<any>(null);
    const singleOrderTimeoutRef = useRef<any>(null);
    const gpsWatcherRef        = useRef<any>(null);

    const nameStr  = registeredDriver?.name || 'Ahmed';
    const firstName = nameStr.split(' ')[0];

    // ── GPS Setup ─────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') { setShowGpsModal(true); return; }
            const provider = await Location.getProviderStatusAsync();
            if (!provider.locationServicesEnabled) { setShowGpsModal(true); return; }
            await fetchLocation();
        })();
        gpsWatcherRef.current = setInterval(async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                const provider   = await Location.getProviderStatusAsync();
                if (status !== 'granted' || !provider.locationServicesEnabled) { setShowGpsModal(true); setIsOnline(false); }
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
                setCityName(data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || 'My City');
            }
        } catch (_) {}
    };

    const handleGpsAllow = async () => {
        setGpsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const provider = await Location.getProviderStatusAsync();
            setGpsLoading(false);
            if (provider.locationServicesEnabled) { setShowGpsModal(false); setIsOnline(true); await fetchLocation(); }
        } else { setGpsLoading(false); }
    };

    // ── Smart Order Generation ─────────────────────────────────────────────────
    const generateSmartOrder = async () => {
        const names = ['Mohamed', 'Lamine', 'Yassine', 'Sami', 'Hichem', 'Abdou'];
        let realLoc = userLoc;
        if (!realLoc) {
            try { realLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }); setUserLoc(realLoc); }
            catch (_) { realLoc = { coords: { latitude: 35.55597, longitude: 6.17366 } } as any; }
        }
        const latBase    = realLoc!.coords.latitude;
        const lngBase    = realLoc!.coords.longitude;
        const distanceKm = Math.random() * 2.5 + 0.5;
        const angleRad   = (Math.random() * 360 * Math.PI) / 180;
        const destLat    = latBase + (distanceKm / 111) * Math.cos(angleRad);
        const destLng    = lngBase + (distanceKm / (111 * Math.cos((latBase * Math.PI) / 180))) * Math.sin(angleRad);

        let locationLabel = `${cityName} - Centre`;
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${destLat}&lon=${destLng}&format=json`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'AmmarliApp/1.0' } },
            );
            if (geoRes.ok) {
                const d = await geoRes.json();
                const nb = d?.address?.neighbourhood || d?.address?.suburb || d?.address?.road;
                const city = d?.address?.city || d?.address?.town || cityName;
                locationLabel = nb ? `${nb}, ${city}` : city;
            }
        } catch (_) {}

        const state = useAppStore.getState();
        const brands = state.registeredDriver?.brands?.length ? state.registeredDriver.brands : ['Ifri', 'Guedila', 'Saida'];
        const brand  = brands[Math.floor(Math.random() * brands.length)];
        const items  = [`10x 1.5L Packs (${brand})`, `20x 0.5L Packs (${brand})`, `5x 5L Jerrycans (${brand})`];

        return {
            id: String(Math.floor(Math.random() * 90000) + 10000),
            customer: names[Math.floor(Math.random() * names.length)],
            distance: `${distanceKm.toFixed(1)} km`,
            item: items[Math.floor(Math.random() * items.length)],
            locationName: locationLabel,
            earnings: 1250,
            coords: { lat: destLat, lng: destLng },
        };
    };

    // ── Order Polling ──────────────────────────────────────────────────────────
    useEffect(() => {
        clearInterval(singleOrderTimeoutRef.current);
        if (isOnline && !incomingOrder) {
            singleOrderTimeoutRef.current = setInterval(async () => {
                const state = useAppStore.getState();
                if (state.activeDriverOrder || incomingOrder) return;
                if (!state.user || state.driverStatus !== 'AVAILABLE') return;
                if (!userLoc && !state.registeredDriver?.location) return;
                if (!state.registeredDriver?.brands?.length) return;
                const o = await generateSmartOrder();
                if (o) { setIncomingOrder(o); setTimer(15); }
            }, 15000);
        } else if (!isOnline) { setIncomingOrder(null); }
        return () => clearInterval(singleOrderTimeoutRef.current);
    }, [isOnline, userLoc, incomingOrder]);

    useEffect(() => {
        if (incomingOrder) {
            modalTimerRef.current = setInterval(() => {
                setTimer(t => { if (t <= 1) { clearInterval(modalTimerRef.current); setIncomingOrder(null); return 15; } return t - 1; });
            }, 1000);
        } else { clearInterval(modalTimerRef.current); }
        return () => clearInterval(modalTimerRef.current);
    }, [incomingOrder]);

    const handleAccept = () => {
        const order = incomingOrder;
        const driverOrder: DriverOrder = {
            orderId: order.id,
            customer: { name: order.customer, phone: '+213 555 00 00 00' },
            deliveryAddress: { label: order.locationName, distance: order.distance, lat: order.coords.lat, lng: order.coords.lng },
            driverLat: userLoc?.coords.latitude  || 35.56,
            driverLng: userLoc?.coords.longitude || 6.17,
            items: [{ icon: 'cube', description: order.item, detail: 'Mineral Water', price: order.earnings }],
            subtotal: order.earnings, deliveryFee: 150, total: order.earnings + 150,
            status: 'accepted',
            createdAt: new Date().toLocaleDateString('fr-DZ') + ' • ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
        };
        useAppStore.getState().acceptDriverOrder(driverOrder);
        setIncomingOrder(null);
        router.push('/driver-order-review');
    };

    const h        = new Date().getHours();
    const greeting = h < 12 ? 'Good Morning,' : h < 18 ? 'Good Afternoon,' : 'Good Evening,';
    const earnings  = 4500;
    const completed = 3;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <View style={S.root}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* ── HEADER — paddingTop: Math.max(insets.top, STATUSBAR_HEIGHT, 16) ────────────── */}
            <View style={[S.header, { paddingTop: Math.max(insets.top, STATUSBAR_HEIGHT, 16) }]}>
                <View style={S.row}>
                    <View style={S.brandLogoCircle}>
                        <Ionicons name="water" size={22} color={NAVY} />
                    </View>
                    <Text style={S.brandName}>Hydration Concierge</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={S.bellBtn} activeOpacity={0.75}>
                        <Ionicons name="notifications-outline" size={22} color={NAVY} />
                    </TouchableOpacity>
                </View>

                <View style={[S.row, { marginTop: 20 }]}>
                    <View>
                        <Text style={S.greetingText}>{greeting}</Text>
                        <Text style={S.nameText}>Welcome, {firstName}</Text>
                    </View>
                    <View style={S.onlinePill}>
                        <Text style={[S.onlinePillLabel, { color: isOnline ? GREEN : CAPTION }]}>
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

            {/* ── SCROLL BODY — paddingBottom: insets.bottom + 100 ─────────── */}
            <ScrollView
                contentContainerStyle={[S.scroll, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ════ HERO STATS (double-layer) ════ */}
                <View style={S.statsRow}>
                    <View style={[S.statShadowWrap, mkShadow(5)]}>
                        <View style={[S.statCard, { backgroundColor: NAVY }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="card-outline" size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={[S.statLabel, { color: 'rgba(255,255,255,0.75)' }]}>EARNINGS TODAY</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 4 }}>
                                <Text style={[S.statValue, { color: WHITE }]}>{earnings.toLocaleString()}</Text>
                                <Text style={[S.statUnit,  { color: 'rgba(255,255,255,0.8)' }]}>DA</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[S.statShadowWrap, mkShadow(5)]}>
                        <View style={[S.statCard, { backgroundColor: YELLOW }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="car-outline" size={16} color={NAVY} />
                                <Text style={[S.statLabel, { color: NAVY }]}>COMPLETED</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10, gap: 4 }}>
                                <Text style={[S.statValue, { color: NAVY }]}>{completed}</Text>
                                <Text style={[S.statUnit,  { color: NAVY }]}>TRIPS</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ════ BOTTLED INVENTORY ════ */}
                <BottledInventory />

                {/* ════ NEW REQUESTS ════ */}
                <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>New Requests ({cityName})</Text>
                    <View style={S.activeZoneBadge}>
                        <Text style={S.activeZoneText}>ACTIVE ZONE</Text>
                    </View>
                </View>

                {isOnline ? (
                    <>
                        {incomingOrder && (
                            <View style={[S.cardShadowWrap, mkShadow(4), { borderLeftWidth: 4, borderLeftColor: GREEN }]}>
                                <View style={S.cardInner}>
                                    <View style={S.row}>
                                        <View style={S.initialCircle}>
                                            <Text style={S.initialText}>{incomingOrder.customer[0].toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={S.reqName}>{incomingOrder.customer}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                <Ionicons name="navigate" size={11} color={CAPTION} />
                                                <Text style={S.reqDist}> {incomingOrder.distance}</Text>
                                            </View>
                                        </View>
                                        <Text style={S.reqPrice}>{incomingOrder.earnings.toLocaleString()} DA</Text>
                                    </View>
                                    <View style={S.thinDivider} />
                                    <View style={S.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={S.packageLabel}>Package</Text>
                                            <Text style={S.packageValue}>{incomingOrder.item}</Text>
                                        </View>
                                        <TouchableOpacity style={S.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                                            <Text style={S.acceptBtnText}>ACCEPT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {!incomingOrder && (
                            <View style={[S.cardShadowWrap, mkShadow(2)]}>
                                <View style={[S.cardInner, { alignItems: 'center', paddingVertical: 28 }]}>
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
            <GpsPermissionModal visible={showGpsModal} onAllow={handleGpsAllow} onLater={() => setShowGpsModal(false)} loading={gpsLoading} />

            {/* ── Incoming Order Sheet ───────────────────────────────────────── */}
            <IncomingOrderModal
                visible={!!incomingOrder}
                order={incomingOrder}
                timer={timer}
                onAccept={handleAccept}
                onDecline={() => { clearInterval(modalTimerRef.current); setIncomingOrder(null); router.push('/driver-decline-order'); }}
            />

            {/* ── Rating Modal ───────────────────────────────────────────────── */}
            {showRatingModal && (
                <View style={S.ratingOverlay}>
                    <View style={[S.ratingCard, mkShadow(20)]}>
                        <View style={S.ratingIconBox}><Ionicons name="star" size={32} color={YELLOW} /></View>
                        <Text style={S.ratingTitle}>Rate the Customer</Text>
                        <Text style={S.ratingBody}>How was your experience delivering this order?</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                            {[1,2,3,4,5].map(star => (
                                <TouchableOpacity key={star}>
                                    <Ionicons name="star-outline" size={40} color={CAPTION} style={{ marginHorizontal: 4 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={S.ratingBtn} onPress={() => useAppStore.getState().setShowRatingModal(false)}>
                            <Text style={S.ratingBtnText}>Submit Rating</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Main Styles ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Header
    header: { backgroundColor: WHITE, paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: BORDER },
    brandLogoCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT_BLUE, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    brandName: { fontSize: 16, fontWeight: '700', color: NAVY, letterSpacing: -0.3 },
    bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT_BLUE, justifyContent: 'center', alignItems: 'center' },
    greetingText: { fontSize: 15, color: CAPTION, fontWeight: '500' },
    nameText: { fontSize: 24, fontWeight: '800', color: NAVY, letterSpacing: -0.5, marginTop: 2 },
    onlinePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 30, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: BORDER, gap: 4 },
    onlinePillLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

    // Scroll
    scroll: { paddingHorizontal: 24, paddingTop: 24 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    statShadowWrap: { flex: 1, borderRadius: 24 }, // NO overflow:hidden
    statCard: { borderRadius: 24, padding: 20, overflow: 'hidden' },
    statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
    statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    statUnit:  { fontSize: 14, fontWeight: '700', marginBottom: 2 },

    // Double-layer card
    cardShadowWrap: { borderRadius: 24, backgroundColor: WHITE, marginBottom: 16 }, // NO overflow:hidden
    cardInner: { borderRadius: 24, backgroundColor: WHITE, padding: 20, overflow: 'hidden' },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    thinDivider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },

    cardTitle: { fontSize: 18, fontWeight: '700', color: NAVY, letterSpacing: -0.3 },

    // Bottled badge
    bottledBadge: { backgroundColor: LIGHT_BLUE, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    bottledBadgeText: { fontSize: 11, fontWeight: '800', color: BLUE, letterSpacing: 0.4 },

    // Brand cards — double-layer
    brandCardWrap:        { width: 110, borderRadius: 16 },                         // outer: shadow, NO overflow
    brandCardInner:       { borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
    brandCardInnerActive: { borderColor: NAVY, backgroundColor: LIGHT_BLUE },
    brandLogoImg:         { width: 32, height: 32, resizeMode: 'contain' },
    brandCardName:        { fontSize: 13, fontWeight: '700', color: CAPTION, marginTop: 6 },
    brandCardTotal:       { fontSize: 11, color: CAPTION, marginTop: 2 },

    // Stock breakdown
    stockSubtitle: { fontSize: 11, fontWeight: '800', color: '#7F8C8D', letterSpacing: 0.6, marginBottom: 12 },
    stockRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    stockCell: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    stockSize: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
    stockQty:  { fontSize: 36, fontWeight: '900', lineHeight: 40 },
    stockStatus: { marginTop: 6, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    stockStatusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

    // Refill button
    refillBtn: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: NAVY, borderRadius: 16, marginTop: 8 },
    refillBtnText: { fontSize: 14, fontWeight: '800', color: NAVY, letterSpacing: 1.2 },

    // Section header
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: NAVY, letterSpacing: -0.3 },
    activeZoneBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    activeZoneText: { fontSize: 10, fontWeight: '800', color: '#16A34A', letterSpacing: 0.5 },

    // Request cards
    initialCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: LIGHT_BLUE, justifyContent: 'center', alignItems: 'center' },
    initialText:   { fontSize: 18, fontWeight: '800', color: NAVY },
    reqName:  { fontSize: 16, fontWeight: '700', color: NAVY },
    reqDist:  { fontSize: 12, color: CAPTION },
    reqPrice: { fontSize: 18, fontWeight: '800', color: NAVY },
    packageLabel: { fontSize: 11, color: CAPTION, fontWeight: '600', marginBottom: 2 },
    packageValue: { fontSize: 14, fontWeight: '700', color: NAVY },
    acceptBtn:     { backgroundColor: YELLOW, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    acceptBtnText: { fontSize: 13, fontWeight: '800', color: NAVY, letterSpacing: 0.5 },

    // Rating modal
    ratingOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000 },
    ratingCard:    { backgroundColor: WHITE, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
    ratingIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF9C3', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    ratingTitle:   { fontSize: 22, fontWeight: '800', color: NAVY, marginBottom: 8 },
    ratingBody:    { fontSize: 14, color: CAPTION, textAlign: 'center', marginBottom: 24 },
    ratingBtn:     { backgroundColor: YELLOW, paddingVertical: 16, width: '100%', borderRadius: 16, alignItems: 'center' },
    ratingBtnText: { fontSize: 16, fontWeight: '800', color: NAVY },
});

// ─── Add Stock Bottom Sheet Styles ─────────────────────────────────────────────
const sheet = StyleSheet.create({
    overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    container: { backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36 },
    handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    title:     { fontSize: 22, fontWeight: '800', color: NAVY },
    stepRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' },
    stepBadgeText: { fontSize: 13, fontWeight: '900', color: '#E65100' },
    stepLabel:     { fontSize: 16, fontWeight: '700', color: NAVY },
    brandPill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, backgroundColor: '#F8F9FA' },
    brandPillActive:    { backgroundColor: YELLOW },
    brandPillText:      { fontSize: 14, fontWeight: '700', color: CAPTION },
    brandPillTextActive:{ color: NAVY },
    miniLogo: { width: 18, height: 18, marginRight: 6, resizeMode: 'contain' },
    qtyRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    qtyLabel: { fontSize: 15, fontWeight: '700', color: NAVY },
    qtyDesc:  { fontSize: 12, color: CAPTION, marginTop: 2, fontStyle: 'italic' },
    stepper:  { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 8, gap: 14 },
    stepperValue: { fontSize: 18, fontWeight: '800', color: NAVY, minWidth: 28, textAlign: 'center' },
    updateBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: NAVY, borderRadius: 18, paddingVertical: 18, marginTop: 20,
        ...Platform.select({ ios: { shadowColor: NAVY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 }, android: { elevation: 6 } }),
    },
    updateBtnText: { fontSize: 16, fontWeight: '900', color: WHITE, letterSpacing: 0.5 },
});

// ─── GPS Modal Styles ──────────────────────────────────────────────────────────
const gpsModal = StyleSheet.create({
    overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 28 },
    card:       { backgroundColor: WHITE, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 36, width: '100%', alignItems: 'center' },
    iconOuter:  { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FEF9C3', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    iconInner:  { width: 64, height: 64, borderRadius: 32, backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center' },
    title:      { fontSize: 22, fontWeight: '800', color: NAVY, textAlign: 'center', marginBottom: 12 },
    body:       { fontSize: 15, color: CAPTION, textAlign: 'center', lineHeight: 23, marginBottom: 28 },
    allowBtn:   { backgroundColor: YELLOW, width: '100%', paddingVertical: 18, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: YELLOW, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 }, android: { elevation: 6 } }) },
    allowText:  { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3 },
    laterText:  { fontSize: 15, fontWeight: '700', color: NAVY },
    dotsRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
    dotInactive:{ width: 8,  height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
    dotActive:  { width: 22, height: 8, borderRadius: 4, backgroundColor: YELLOW },
});

// ─── Incoming Order Sheet Styles ───────────────────────────────────────────────
const incomingS = StyleSheet.create({
    overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet:       { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 20 } }) },
    avatarBox:   { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
    name:        { fontSize: 20, fontWeight: '800', color: NAVY },
    rating:      { fontSize: 13, color: '#F59E0B', fontWeight: 'bold', marginLeft: 4 },
    dist:        { fontSize: 13, color: CAPTION },
    badge:       { fontSize: 10, fontWeight: '800', color: '#F97316', letterSpacing: 1, marginBottom: 4 },
    price:       { fontSize: 24, fontWeight: '900', color: NAVY },
    itemName:    { fontSize: 18, fontWeight: '700', color: NAVY },
    itemSub:     { fontSize: 13, color: CAPTION, marginTop: 4 },
    timerText:   { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 0.5 },
    acceptCircle:{ width: 120, height: 120, borderRadius: 60, backgroundColor: YELLOW, justifyContent: 'center', alignItems: 'center' },
    acceptText:  { fontSize: 18, fontWeight: '900', color: NAVY },
    declineText: { fontSize: 14, fontWeight: 'bold', color: CAPTION },
});
