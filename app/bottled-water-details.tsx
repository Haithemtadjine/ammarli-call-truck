import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/theme/ThemeContext';

// ─── Brand list ────────────────────────────────────────────────────────────────
const BRANDS = [
    'Ifri', 'Guedila', 'Saida', 'Lalla Khedidja',
    'Youkous', 'Hayat', 'Mansourah', 'Texanna',
    'Toudja', 'Messerghine',
];

const BRAND_LOGOS: Record<string, any> = {
    'Ifri':           require('../assets/brands/ifri.png'),
    'Guedila':        require('../assets/brands/guedila.png'),
    'Saida':          require('../assets/brands/saida.png'),
    'Lalla Khedidja': require('../assets/brands/lalla-khedidja.png'),
    'Youkous':        require('../assets/brands/youkous.png'),
    'Hayat':          require('../assets/brands/hayat.jpg'),
    'Mansourah':      require('../assets/brands/mansourah.png'),
    'Texanna':        require('../assets/brands/texanna.png'),
    'Toudja':         require('../assets/brands/toudja.png'),
    'Messerghine':    require('../assets/brands/messerghine.png'),
};

// ─── Pricing ───────────────────────────────────────────────────────────────────
const PRICES = {
    small: 150,   // DA per 0.5L pack
    medium: 250,  // DA per 1.5L pack
    large: 120,   // DA per 5L jug
};

// ─── Item card colours (tinted backgrounds) ────────────────────────────────────
const ITEM_TINTS = ['#D6EAF8', '#D1E8E4', '#1C2540'];

export default function BottledWaterDetailsScreen() {
    const { colors } = useTheme();
    const COLORS = {
        ...colors,
        navy: colors.textPrimary,
        yellow: colors.accent,
        white: colors.surface,
        bgGray: colors.background,
        border: colors.border,
        textDark: colors.textPrimary,
        textGray: colors.textSecondary,
        dimYellow: colors.iconContainer,
    };
    const styles = getStyles(COLORS);

    const router = useRouter();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const { activeOrder, updateOrder, draftOrder, updateDraftOrder } = useAppStore();

    // ── Location state ────────────────────────────────────────────────────────
    const [finalAddress, setFinalAddress] = useState<string>(
        draftOrder.location?.address || (params.address as string) || ''
    );
    const [showLocationError, setShowLocationError] = useState(false);

    useEffect(() => {
        if (params.lockedAddress) {
            setFinalAddress(params.lockedAddress as string);
        }
        if (params.lockedLat && params.lockedLng) {
            updateDraftOrder({
                location: {
                    latitude: Number(params.lockedLat),
                    longitude: Number(params.lockedLng),
                    address: params.lockedAddress as string,
                }
            });
        }
    }, [params.lockedAddress, params.lockedLat, params.lockedLng]);

    // ── Cart state (per-brand) ────────────────────────────────────────────────
    const [cart, setCart] = useState<Record<string, { small: number, medium: number, large: number }>>(draftOrder.bottledWaterCart);

    // Sync local cart to draft store on change
    useEffect(() => {
        updateDraftOrder({ bottledWaterCart: cart });
    }, [cart]);

    // ── Brand selection ───────────────────────────────────────────────────────
    const [selectedBrand, setSelectedBrand] = useState('Guedila');

    // ── Dynamic price ─────────────────────────────────────────────────────────
    const totalPrice = Object.values(cart).reduce((acc, counts) => {
        return acc + 
            (counts.small * PRICES.small) + 
            (counts.medium * PRICES.medium) + 
            (counts.large * PRICES.large);
    }, 0);

    const currentBrandCart = cart[selectedBrand] || { small: 0, medium: 0, large: 0 };

    // ── Shake animation for location error ────────────────────────────────────
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const triggerShake = () => {
        setShowLocationError(true);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleOrderNow = () => {
        const currentLat = params.lockedLat || draftOrder.location?.latitude;
        const currentLng = params.lockedLng || draftOrder.location?.longitude;

        if (!currentLat || !currentLng) {
            triggerShake();
            return;
        }
        // Build a human-readable quantity summary from the entire cart
        const orderParts: string[] = [];
        Object.entries(cart).forEach(([brand, counts]) => {
            const brandParts: string[] = [];
            if (counts.small > 0) brandParts.push(`${counts.small}x 0.5L`);
            if (counts.medium > 0) brandParts.push(`${counts.medium}x 1.5L`);
            if (counts.large > 0) brandParts.push(`${counts.large}x 5L`);
            if (brandParts.length > 0) {
                orderParts.push(`${brand}: ${brandParts.join(', ')}`);
            }
        });
        
        const quantitySummary = orderParts.join(' | ');
        const orderSummary = quantitySummary;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        updateOrder({
            ...(activeOrder as any),
            id: Date.now(),
            type: 'Bottled Water',
            waterType: 'Bottled Water',
            status: 'searching',
            quantity: quantitySummary,
            price: totalPrice,
            locationName: finalAddress || 'Unknown Location',
            orderTime: currentTime,
            location: {
                latitude: Number(currentLat),
                longitude: Number(currentLng),
            },
            bottledWaterCart: cart,
            orderSummary,
        } as any);

        router.push({
            pathname: '/searching-driver',
            params: {
                waterType: 'Bottled Water',
                qty: quantitySummary,
                price: totalPrice,
                address: finalAddress,
                ...params,
            } as any,
        });
    };

    const handleSchedule = () => {
        const totalItems = Object.values(cart).reduce((sum, counts) => 
            sum + counts.small + counts.medium + counts.large, 0
        );

        const currentLat = params.lockedLat || draftOrder.location?.latitude;

        if (totalItems === 0 || !currentLat) {
            Alert.alert(
                t('Alert'),
                'يرجى تحديد الكمية ومكان التوصيل أولاً قبل جدولة الطلب'
            );
            return;
        }
        router.push('/schedule-delivery');
    };

    // ── Cart update helper ────────────────────────────────────────────────────
    const updateQuantity = (brand: string, size: 'small' | 'medium' | 'large', delta: number) => {
        setCart(prev => {
            const current = prev[brand] || { small: 0, medium: 0, large: 0 };
            const nextValue = Math.max(0, current[size] + delta);
            
            // If all counts are zero, optionally clean up the brand key
            if (nextValue === 0) {
                const updatedBrand = { ...current, [size]: 0 };
                if (updatedBrand.small === 0 && updatedBrand.medium === 0 && updatedBrand.large === 0) {
                    const { [brand]: _, ...rest } = prev;
                    return rest;
                }
            }

            return {
                ...prev,
                [brand]: {
                    ...current,
                    [size]: nextValue
                }
            };
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {/* ── Header ── */}
            <View style={[styles.header, { paddingTop: 20 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Order Bottled Water')}</Text>
                <TouchableOpacity style={styles.bellButton} onPress={() => router.push('/notifications' as any)}>
                    <Ionicons name="notifications-outline" size={22} color={COLORS.navy} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── 1. Map / Location Card ── */}
                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                    <TouchableOpacity
                        style={[
                            styles.locationCard,
                            showLocationError && { borderColor: '#EF4444', borderWidth: 1.5 },
                        ]}
                        activeOpacity={0.9}
                        onPress={() => {
                            setShowLocationError(false);
                            router.push({
                                pathname: '/map-picker',
                                params: { returnTo: '/bottled-water-details' },
                            } as any);
                        }}
                    >
                        {/* Mini map view */}
                        <View style={styles.mapImageContainer}>
                            <Image
                                source={{ uri: 'https://i.stack.imgur.com/HILmr.png' }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            {/* Map pin overlay */}
                            <View style={styles.mapPinContainer}>
                                <View style={styles.mapPinOuter}>
                                    <View style={styles.mapPinInner} />
                                </View>
                                <View style={styles.mapPinTail} />
                            </View>
                        </View>
                        <View style={styles.locationDetails}>
                            <Ionicons name="map-outline" size={18} color={COLORS.navy} style={{ marginRight: 10 }} />
                            <Text style={styles.locationTitle} numberOfLines={1}>
                                {finalAddress ? `${t('Delivery to:')} ${finalAddress}` : t('Select delivery location')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {showLocationError && (
                        <Text style={styles.errorText}>{t('Please select your location first')}</Text>
                    )}
                </Animated.View>

                {/* ── 2. Choose Brand ── */}
                <Text style={styles.sectionTitle}>{t('Choose Brand')}</Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.brandScroll}
                >
                    {BRANDS.map((brand) => {
                        const isSelected = selectedBrand === brand;
                        const logo = BRAND_LOGOS[brand];
                        // Total count for THIS brand specifically
                        const brandCounts = cart[brand];
                        const brandTotal = brandCounts 
                            ? (brandCounts.small + brandCounts.medium + brandCounts.large) 
                            : 0;

                        return (
                            <TouchableOpacity
                                key={brand}
                                style={[
                                    styles.brandSquareCard,
                                    isSelected && styles.brandSquareCardSelected,
                                ]}
                                onPress={() => setSelectedBrand(brand)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.brandLogoBox}>
                                    <Image source={logo} style={styles.brandLogoMain} />
                                </View>
                                <Text style={styles.brandCardText}>{brand.toUpperCase()}</Text>

                                {brandTotal > 0 && (
                                    <View style={styles.brandBadge}>
                                        <Text style={styles.brandBadgeText}>{brandTotal}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* ── 3. Select Size ── */}
                <View style={styles.sizeHeader}>
                    <Text style={styles.sectionTitle}>{t('Select Sizes for')} <Text style={{ color: COLORS.navy, fontStyle: 'italic' }}>{selectedBrand}</Text></Text>
                </View>

                <View style={styles.sizeList}>
                    {/* 1.5L Pack */}
                    <SizeRow
                        thumbnailColor="#D69E2E" // Golden/Orange
                        label={t('1.5L Pack')}
                        sub={t('6 bottles')}
                        price={PRICES.medium}
                        count={currentBrandCart.medium}
                        onInc={() => updateQuantity(selectedBrand, 'medium', 1)}
                        onDec={() => updateQuantity(selectedBrand, 'medium', -1)}
                        onSetCount={(n) => {
                            setCart(prev => ({ ...prev, [selectedBrand]: { ...(prev[selectedBrand] || { small: 0, medium: 0, large: 0 }), medium: n } }));
                        }}
                        COLORS={COLORS}
                        styles={styles}
                    />
                    {/* 0.5L Pack */}
                    <SizeRow
                        thumbnailColor="#F6AD55" // Light Orange
                        label={t('0.5L Pack')}
                        sub={t('6 bottles')}
                        price={PRICES.small}
                        count={currentBrandCart.small}
                        onInc={() => updateQuantity(selectedBrand, 'small', 1)}
                        onDec={() => updateQuantity(selectedBrand, 'small', -1)}
                        onSetCount={(n) => {
                            setCart(prev => ({ ...prev, [selectedBrand]: { ...(prev[selectedBrand] || { small: 0, medium: 0, large: 0 }), small: n } }));
                        }}
                        COLORS={COLORS}
                        styles={styles}
                    />
                    {/* 5L Jug */}
                    <SizeRow
                        thumbnailColor="#718096" // Grayish Blue
                        label={t('5L Jug')}
                        sub={t('Single jug')}
                        price={PRICES.large}
                        count={currentBrandCart.large}
                        onInc={() => updateQuantity(selectedBrand, 'large', 1)}
                        onDec={() => updateQuantity(selectedBrand, 'large', -1)}
                        onSetCount={(n) => {
                            setCart(prev => ({ ...prev, [selectedBrand]: { ...(prev[selectedBrand] || { small: 0, medium: 0, large: 0 }), large: n } }));
                        }}
                        COLORS={COLORS}
                        styles={styles}
                    />
                </View>
            </ScrollView>

            {/* ── Fixed Footer ── */}
            <View style={[styles.fixedFooter, { paddingBottom: 20 }]}>
                {/* Price row */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{t('TOTAL PRICE')}</Text>
                    <Text style={styles.priceValue}>
                        {totalPrice.toLocaleString()}{' '}
                        <Text style={styles.currencyText}>DA</Text>
                    </Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.btnSchedule} onPress={handleSchedule}>
                        <Text style={styles.btnScheduleText}>Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOrder} onPress={handleOrderNow}>
                        <Text style={styles.btnOrderText}>Order Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// ─── Sub-component: SizeRow ────────────────────────────────────────────────────
interface SizeRowProps {
    thumbnailColor: string;
    label: string;
    sub: string;
    price: number;
    count: number;
    onInc: () => void;
    onDec: () => void;
    onSetCount: (n: number) => void;
    COLORS: any;
    styles: any;
}

function SizeRow({ thumbnailColor, label, sub, price, count, onInc, onDec, onSetCount, COLORS, styles }: SizeRowProps) {
    return (
        <View style={styles.sizeRow}>
            {/* Colored Thumbnail */}
            <View style={[styles.sizeThumbnail, { backgroundColor: thumbnailColor }]} />

            {/* Info */}
            <View style={styles.sizeInfo}>
                <Text style={styles.sizeLabel}>{label}</Text>
                <Text style={styles.sizeSub}>{sub}</Text>
                <Text style={styles.sizePrice}>{price} DA</Text>
            </View>

            {/* Stepper */}
            <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperBtn} onPress={onDec}>
                    <Ionicons name="remove" size={16} color={COLORS.navy} />
                </TouchableOpacity>
                <TextInput
                    style={styles.stepperValue}
                    keyboardType="numeric"
                    value={String(count)}
                    onChangeText={(text) => {
                        const clean = text.replace(/[^0-9]/g, '');
                        const num = parseInt(clean, 10);
                        onSetCount(isNaN(num) ? 0 : num);
                    }}
                    selectTextOnFocus
                />
                <TouchableOpacity style={[styles.stepperBtn, { backgroundColor: COLORS.yellow }]} onPress={onInc}>
                    <Ionicons name="add" size={16} color={COLORS.navy} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (COLORS: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.white,
        },
        // Header
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 15,
            backgroundColor: COLORS.white,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
        },
        headerTitle: {
            flex: 1,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.navy,
        },
        bellButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'flex-end',
        },
        // Scroll
        scrollContent: {
            paddingTop: 10,
            paddingHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 17,
            fontWeight: 'bold',
            color: COLORS.navy,
            marginTop: 22,
            marginBottom: 14,
        },
        // ── Map / Location Card
        locationCard: {
            backgroundColor: COLORS.white,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 5,
        },
        mapImageContainer: {
            height: 130,
            width: '100%',
            backgroundColor: '#E5E7EB',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
        },
        mapImage: {
            width: '100%',
            height: '100%',
            opacity: 0.85,
        },
        mapPinContainer: {
            position: 'absolute',
            alignItems: 'center',
        },
        mapPinOuter: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.navy,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mapPinInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: COLORS.yellow,
        },
        mapPinTail: {
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: COLORS.navy,
            marginTop: -2,
        },
        locationDetails: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            backgroundColor: COLORS.white,
        },
        locationTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: COLORS.navy,
            flex: 1,
        },
        errorText: {
            color: '#EF4444',
            fontSize: 12,
            fontWeight: 'bold',
            marginTop: 5,
            marginLeft: 6,
        },
        // ── Brand square cards
        brandScroll: {
            paddingRight: 16,
            paddingBottom: 10,
            gap: 12,
        },
        brandSquareCard: {
            width: 100,
            height: 110,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            marginVertical: 4,
            marginLeft: 2,
            position: 'relative',
        },
        brandSquareCardSelected: {
            borderColor: COLORS.yellow,
        },
        brandLogoBox: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#F0F4F8',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        brandLogoMain: {
            width: 32,
            height: 32,
            resizeMode: 'contain',
        },
        brandCardText: {
            fontSize: 10,
            fontWeight: '800',
            color: '#94A3B8',
            textAlign: 'center',
        },
        brandBadge: {
            position: 'absolute',
            top: -6,
            right: -6,
            backgroundColor: COLORS.navy,
            width: 20,
            height: 20,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: COLORS.white,
        },
        brandBadgeText: {
            color: COLORS.white,
            fontSize: 10,
            fontWeight: 'bold',
        },
        // ── Size List Header
        sizeHeader: {
            marginTop: 24,
            marginBottom: 10,
        },
        // ── Size List Rows
        sizeList: {
            gap: 12,
        },
        sizeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.white,
            borderRadius: 12,
            padding: 8,
            marginBottom: 6,
            borderWidth: 1,
            borderColor: '#F1F5F9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        sizeThumbnail: {
            width: 44,
            height: 44,
            borderRadius: 10,
            marginRight: 12,
        },
        sizeInfo: {
            flex: 1,
            justifyContent: 'center',
            paddingRight: 6,
        },
        sizeLabel: {
            fontSize: 14,
            fontWeight: '800',
            color: COLORS.navy,
        },
        sizeSub: {
            fontSize: 11,
            color: '#94A3B8',
            marginBottom: 2,
        },
        sizePrice: {
            fontSize: 13,
            fontWeight: 'bold',
            color: '#E67E22',
        },
        stepperContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: 16,
            padding: 2,
        },
        stepperBtn: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
        },
        stepperValue: {
            fontSize: 13,
            fontWeight: '900',
            color: COLORS.navy,
            paddingHorizontal: 2,
            minWidth: 20,
            textAlign: 'center',
            padding: 0,
        },
        // ── Fixed Footer
        fixedFooter: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
        },
        priceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        priceLabel: {
            fontSize: 12,
            color: COLORS.textGray,
            fontWeight: '600',
            letterSpacing: 0.5,
        },
        priceValue: {
            fontSize: 26,
            fontWeight: 'bold',
            color: COLORS.navy,
        },
        currencyText: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        actionRow: {
            flexDirection: 'row',
            gap: 12,
        },
        btnSchedule: {
            flex: 1,
            backgroundColor: 'transparent',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: COLORS.navy,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 16,
        },
        btnScheduleText: {
            color: COLORS.navy,
            fontSize: 17,
            fontWeight: 'bold',
        },
        btnOrder: {
            flex: 1,
            backgroundColor: COLORS.yellow,
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 16,
            shadowColor: COLORS.yellow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        btnOrderText: {
            color: COLORS.navy,
            fontSize: 17,
            fontWeight: 'bold',
        },
    });
