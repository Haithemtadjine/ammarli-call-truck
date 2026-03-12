import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/theme/ThemeContext';

// ─── Brand list ────────────────────────────────────────────────────────────────
const BRANDS = [
    'Guedila',
    'Ifri',
    'Lalla Khedidja',
    'Saïda',
    'Youkous',
    'Toudja',
    'Messerghine',
    'Mansoura',
];

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
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const { activeOrder, updateOrder } = useAppStore();

    // ── Location state ────────────────────────────────────────────────────────
    const [finalAddress, setFinalAddress] = useState<string>(
        (params.address as string) || 'Bouzouran, Batna'
    );
    const [showLocationError, setShowLocationError] = useState(false);

    useEffect(() => {
        if (params.lockedAddress) {
            setFinalAddress(params.lockedAddress as string);
        }
    }, [params.lockedAddress]);

    // ── Counters ──────────────────────────────────────────────────────────────
    const [smallPacks, setSmallPacks] = useState(0);
    const [mediumPacks, setMediumPacks] = useState(0);
    const [largePacks, setLargePacks] = useState(0);

    // ── Brand selection ───────────────────────────────────────────────────────
    const [selectedBrand, setSelectedBrand] = useState('Guedila');

    // ── Dynamic price ─────────────────────────────────────────────────────────
    const totalPrice =
        smallPacks * PRICES.small + mediumPacks * PRICES.medium + largePacks * PRICES.large;

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
        if (!params.lockedLat || !params.lockedLng) {
            triggerShake();
            return;
        }
        if (totalPrice === 0) {
            // No items selected — shake without changing error text
            triggerShake();
            return;
        }

        // Build a human-readable quantity summary
        const parts: string[] = [];
        if (smallPacks > 0) parts.push(`${smallPacks}x 0.5L Pack`);
        if (mediumPacks > 0) parts.push(`${mediumPacks}x 1.5L Pack`);
        if (largePacks > 0) parts.push(`${largePacks}x 5L Jug`);
        const quantitySummary = parts.join(', ');
        const orderSummary = `Brand: ${selectedBrand} | ${quantitySummary}`;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        updateOrder({
            ...(activeOrder as any),
            id: Date.now(),
            type: 'Bottled Water',
            waterType: 'Bottled Water',
            status: 'searching',
            quantity: quantitySummary,
            price: totalPrice,
            locationName: finalAddress || 'Selected Location',
            orderTime: currentTime,
            location: {
                latitude: Number(params.lockedLat),
                longitude: Number(params.lockedLng),
            },
            bottledWaterItems: {
                smallPacks,
                mediumPacks,
                largePacks,
                brand: selectedBrand,
            },
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
        if (!params.lockedLat || !params.lockedLng) {
            triggerShake();
            return;
        }
        router.push('/schedule-delivery' as any);
    };

    // ── Counter helpers ───────────────────────────────────────────────────────
    const clampInc = (setter: React.Dispatch<React.SetStateAction<number>>) =>
        () => setter(v => v + 1);
    const clampDec = (setter: React.Dispatch<React.SetStateAction<number>>) =>
        () => setter(v => Math.max(0, v - 1));

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* ── Header ── */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
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
                        {/* Address row */}
                        <View style={styles.locationDetails}>
                            <Ionicons name="map-outline" size={18} color={COLORS.navy} style={{ marginRight: 10 }} />
                            <Text style={styles.locationTitle} numberOfLines={1}>
                                {t('Delivery to:')} {finalAddress}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {showLocationError && (
                        <Text style={styles.errorText}>{t('Please select your location first')}</Text>
                    )}
                </Animated.View>

                {/* ── 2. Select Size ── */}
                <Text style={styles.sectionTitle}>{t('Select Size')}</Text>

                <View style={styles.itemGrid}>
                    {/* 0.5L Pack */}
                    <ItemCard
                        tint={ITEM_TINTS[0]}
                        label={t('0.5L Pack')}
                        sub={t('6 bottles')}
                        price={`${PRICES.small} DA`}
                        count={smallPacks}
                        onInc={clampInc(setSmallPacks)}
                        onDec={clampDec(setSmallPacks)}
                        COLORS={COLORS}
                        styles={styles}
                    />
                    {/* 1.5L Pack */}
                    <ItemCard
                        tint={ITEM_TINTS[1]}
                        label={t('1.5L Pack')}
                        sub={t('6 bottles')}
                        price={`${PRICES.medium} DA`}
                        count={mediumPacks}
                        onInc={clampInc(setMediumPacks)}
                        onDec={clampDec(setMediumPacks)}
                        COLORS={COLORS}
                        styles={styles}
                    />
                    {/* 5L Jug */}
                    <ItemCard
                        tint={ITEM_TINTS[2]}
                        label={t('5L Jug')}
                        sub={t('Single jug')}
                        price={`${PRICES.large} DA`}
                        count={largePacks}
                        onInc={clampInc(setLargePacks)}
                        onDec={clampDec(setLargePacks)}
                        COLORS={COLORS}
                        styles={styles}
                        darkBg
                    />
                </View>

                {/* ── 3. Choose Brand ── */}
                <Text style={styles.sectionTitle}>{t('Choose Brand')}</Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.brandScroll}
                >
                    {BRANDS.map((brand) => {
                        const isSelected = selectedBrand === brand;
                        return (
                            <TouchableOpacity
                                key={brand}
                                style={[
                                    styles.brandPill,
                                    isSelected && styles.brandPillSelected,
                                ]}
                                onPress={() => setSelectedBrand(brand)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.brandPillText,
                                        isSelected && styles.brandPillTextSelected,
                                    ]}
                                >
                                    {t(brand)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </ScrollView>

            {/* ── Fixed Footer ── */}
            <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
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
                        <Ionicons name="time-outline" size={18} color={COLORS.white} />
                        <Text style={styles.btnScheduleText}>{t('Schedule')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOrder} onPress={handleOrderNow}>
                        <Text style={styles.btnOrderText}>{t('Order Now')} 🛒</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Sub-component: ItemCard ────────────────────────────────────────────────────
interface ItemCardProps {
    tint: string;
    label: string;
    sub: string;
    price: string;
    count: number;
    onInc: () => void;
    onDec: () => void;
    COLORS: any;
    styles: any;
    darkBg?: boolean;
}

function ItemCard({ tint, label, sub, price, count, onInc, onDec, COLORS, styles, darkBg }: ItemCardProps) {
    return (
        <View style={styles.itemCard}>
            {/* Image placeholder with brand tint */}
            <View style={[styles.itemImageBox, { backgroundColor: tint }]}>
                <Ionicons
                    name="water"
                    size={36}
                    color={darkBg ? '#A8D8EA' : COLORS.navy}
                />
            </View>
            {/* Info */}
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemSub}>{sub}</Text>
            <Text style={styles.itemPrice}>{price}</Text>
            {/* Counter */}
            <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={onDec}>
                    <Ionicons name="remove" size={16} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{count}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={onInc}>
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
        // ── Item Grid (3 equal columns)
        itemGrid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
        },
        itemCard: {
            flex: 1,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 4,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
        },
        itemImageBox: {
            width: '100%',
            height: 80,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        itemLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: COLORS.navy,
            textAlign: 'center',
            marginBottom: 2,
        },
        itemSub: {
            fontSize: 10,
            color: COLORS.textGray,
            textAlign: 'center',
            marginBottom: 4,
        },
        itemPrice: {
            fontSize: 13,
            fontWeight: 'bold',
            color: '#E67E22',  // Orange accent for price — matches reference image
            marginBottom: 10,
        },
        counterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 20,
            overflow: 'hidden',
        },
        counterBtn: {
            width: 28,
            height: 28,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.bgGray,
        },
        counterValue: {
            width: 28,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            color: COLORS.navy,
        },
        // ── Brand Pills scroll
        brandScroll: {
            paddingRight: 16,
            paddingBottom: 4,
            alignItems: 'center',
        },
        brandPill: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 30,
            borderWidth: 1.5,
            borderColor: COLORS.border,
            backgroundColor: COLORS.white,
            marginRight: 10,
        },
        brandPillSelected: {
            backgroundColor: COLORS.yellow,
            borderColor: COLORS.yellow,
        },
        brandPillText: {
            fontSize: 14,
            fontWeight: '600',
            color: COLORS.navy,
        },
        brandPillTextSelected: {
            fontWeight: 'bold',
            color: COLORS.navy,
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
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
            width: '35%',
            backgroundColor: COLORS.navy,
            borderRadius: 30,
            paddingVertical: 14,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        },
        btnScheduleText: {
            color: COLORS.white,
            fontSize: 12,
            fontWeight: '600',
            marginTop: 3,
        },
        btnOrder: {
            flex: 1,
            backgroundColor: COLORS.yellow,
            borderRadius: 30,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 14,
        },
        btnOrderText: {
            color: '#003366',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
