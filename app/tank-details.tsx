import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/theme/ThemeContext';

const TANK_LOCATIONS = [
    { id: 'ground', title: 'Ground', iconFamily: 'Ionicons', icon: 'home' },
    { id: 'underground', title: 'Underground', iconFamily: 'Ionicons', icon: 'layers' },
    { id: 'rooftop', title: 'Rooftop', iconFamily: 'Ionicons', icon: 'business' },
];

const HOSE_OPTIONS = [
    { id: 'standard', title: 'Standard (Up to 20m)' },
    { id: 'long', title: 'Long (Up to 40m)' },
    { id: 'extra', title: 'Extra Long (60m+)' },
];

export default function TankDetailsScreen() {
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
    const { activeOrder, updateOrder, draftOrder, updateDraftOrder } = useAppStore();

    // Unchanged Params Logic
    const params = useLocalSearchParams();
    const { address, lockedAddress, quantity: initialQty } = params;

    // UX Logic: Check Categories
    const currentType = String(activeOrder?.waterType || '');
    const isSpringWater = currentType.toLowerCase().includes('spring') || currentType.includes('ينابيع');
    const isWellWater = currentType.toLowerCase().includes('well') || currentType.includes('آبار') || currentType.includes('ابار');
    const isConstruction = currentType.toLowerCase().includes('construction') || currentType.includes('أشغال') || currentType.includes('اشغال');
    const isLargeTanker = currentType.toLowerCase().includes('large') || currentType.includes('صهاريج') || currentType.includes('كبيرة');

    const [finalAddress, setFinalAddress] = useState<string>(
        draftOrder.location?.address || (params.address as string) || ''
    );

    // New UI States
    let defaultQty = 3000;
    if (isSpringWater) defaultQty = 20;
    else if (isWellWater || isConstruction) defaultQty = 1000;
    else if (isLargeTanker) defaultQty = 3000;

    const [tankLocation, setTankLocation] = useState(draftOrder.tankerDetails.tankLocation);
    const [floorNumber, setFloorNumber] = useState(draftOrder.tankerDetails.floorNumber);
    const [quantity, setQuantity] = useState(draftOrder.tankerDetails.quantity);
    const [hoseLength, setHoseLength] = useState(draftOrder.tankerDetails.hoseLength);

    // Sync state to draftOrder
    useEffect(() => {
        updateDraftOrder({
            tankerDetails: {
                quantity,
                hoseLength,
                tankLocation,
                floorNumber,
            }
        });
    }, [quantity, hoseLength, tankLocation, floorNumber]);

    useEffect(() => {
        if (lockedAddress) {
            setFinalAddress(lockedAddress as string);
        }
    }, [lockedAddress]);

    useEffect(() => {
        if (params.lockedLat && params.lockedLng) {
            updateDraftOrder({
                location: {
                    latitude: Number(params.lockedLat),
                    longitude: Number(params.lockedLng),
                    address: lockedAddress as string,
                }
            });
        }
    }, [params.lockedLat, params.lockedLng, lockedAddress]);
    const [showLocationError, setShowLocationError] = useState(false);

    // Animation: Shake
    const shakeAnimation = React.useRef(new Animated.Value(0)).current;

    const triggerShake = () => {
        setShowLocationError(true);
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        if (lockedAddress) {
            setFinalAddress(lockedAddress as string);
        }
    }, [lockedAddress]);

    // Dynamic Price Logic
    let waterCost = 0;
    if (isSpringWater) {
        waterCost = quantity * 2.5;
    } else if (isConstruction) {
        waterCost = quantity * 0.4;
    } else if (isWellWater || isLargeTanker) {
        waterCost = quantity * 0.6;
    } else {
        waterCost = quantity * 0.6; // fallback
    }

    let floorCost = 0;
    if (tankLocation === 'rooftop' && !isSpringWater) {
        floorCost = floorNumber * 180;
    }

    let hoseCost = 0;
    // Ground floor -> 0 DA hose cost regardless of length based on logic

    const computedPrice = waterCost + floorCost + hoseCost;
    const totalPriceText = computedPrice.toLocaleString();

    const handleConfirm = () => {
        // Validation: Location must be locked/selected in store or params
        const currentLat = params.lockedLat || draftOrder.location?.latitude;
        const currentLng = params.lockedLng || draftOrder.location?.longitude;

        if (!currentLat || !currentLng) {
            triggerShake();
            return;
        }

        const finalQuantity = isSpringWater ? `${quantity}L` : String(quantity);
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Save exactly to Zustand
        updateOrder({
            ...activeOrder,
            id: Date.now(),
            type: currentType || 'Spring Water',
            waterType: currentType || 'Spring Water',
            status: 'searching',
            quantity: finalQuantity,
            price: computedPrice,
            locationName: finalAddress || 'Unknown Location',
            orderTime: currentTime,
            location: {
                latitude: Number(currentLat),
                longitude: Number(currentLng),
            }
        } as any);

        const orderDetails = {
            ...params,
            tankLocation,
            floorNumber: tankLocation === 'rooftop' ? floorNumber : null,
            hoseLength,
            quantity: finalQuantity,
            qty: finalQuantity, // fallback for searching-driver
            price: computedPrice,
        };
        // Unchanged navigation destination
        router.push({
            pathname: '/searching-driver',
            params: orderDetails as any,
        });
    };

    const handleSchedule = () => {
        const currentLat = params.lockedLat || draftOrder.location?.latitude;
        if (quantity === 0 || !currentLat) {
            Alert.alert(
                t('Alert'),
                'يرجى تحديد الكمية ومكان التوصيل أولاً قبل جدولة الطلب'
            );
            return;
        }
        router.push('/schedule-delivery');
    };

    const increaseQty = () => setQuantity(prev => {
        if (isSpringWater) return prev + 5;
        return prev + 500;
    });
    const decreaseQty = () => setQuantity(prev => {
        if (isSpringWater) return Math.max(5, prev - 5);
        return Math.max(500, prev - 500);
    });

    // Debugging current mode
    console.log('Type:', currentType, '| isSpringWater:', isSpringWater, '| isWell:', isWellWater, '| isConst:', isConstruction, '| isLarge:', isLargeTanker);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: 20 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Delivery Details')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Location Preview Card */}
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                    <TouchableOpacity
                        style={[styles.locationCard, showLocationError && { borderColor: '#EF4444', borderWidth: 1.5 }]}
                        activeOpacity={0.9}
                        onPress={() => {
                            setShowLocationError(false);
                            router.push('/map-picker');
                        }}
                    >
                        <View style={styles.mapImageContainer}>
                            {/* Static map representation matching design */}
                            <Image
                                source={{ uri: 'https://i.stack.imgur.com/HILmr.png' }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            {/* Custom Map Pin Overlay */}
                            <View style={styles.mapPinContainer}>
                                <View style={styles.mapPinOuter}>
                                    <View style={styles.mapPinInner} />
                                </View>
                                <View style={styles.mapPinTail} />
                            </View>
                        </View>
                        <View style={styles.locationDetails}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.locationTitle} numberOfLines={1}>{finalAddress || t('Select delivery location')}</Text>
                                <Text style={styles.locationSubtitle}>{t('Primary Delivery Address')}</Text>
                            </View>
                            <Ionicons name="pencil" size={20} color={showLocationError ? '#EF4444' : COLORS.textGray} />
                        </View>
                    </TouchableOpacity>
                    {showLocationError && (
                        <Text style={styles.errorText}>{t('Please select your location first')}</Text>
                    )}
                </Animated.View>

                {/* 2. Tank Location Pills */}
                <Text style={styles.sectionTitle}>{t('Tank Location')}</Text>
                <View style={{ position: 'relative' }}>
                    <View style={[styles.pillContainer, isSpringWater && { opacity: 0.4 }]}>
                        {TANK_LOCATIONS.map((loc) => {
                            const isSelected = tankLocation === loc.id;
                            const IconComponent: any = loc.iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

                            return (
                                <TouchableOpacity
                                    key={loc.id}
                                    style={[styles.pillButton, isSelected && styles.pillButtonSelected]}
                                    onPress={() => setTankLocation(loc.id)}
                                >
                                    <IconComponent
                                        name={loc.icon}
                                        size={20}
                                        color={isSelected ? COLORS.navy : COLORS.textGray}
                                        style={{ marginBottom: 4 }}
                                    />
                                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                                        {t(loc.title)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {isSpringWater && (
                        <View style={styles.disabledOverlay} />
                    )}
                </View>

                {/* Conditional Floors */}
                {tankLocation === 'rooftop' && (
                    <View style={{ position: 'relative' }}>
                        <View style={[styles.floorSelectorRow, isSpringWater && { opacity: 0.4 }]}>
                            <Text style={styles.floorLabel}>{t('FLOOR')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.floorScroll}>
                                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                                    const isSelected = floorNumber === num;
                                    return (
                                        <TouchableOpacity
                                            key={num}
                                            style={[styles.floorChip, isSelected && styles.floorChipSelected]}
                                            onPress={() => setFloorNumber(num)}
                                        >
                                            <Text style={[styles.floorChipText, isSelected && styles.floorChipTextSelected]}>
                                                {num}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                        {isSpringWater && (
                            <View style={styles.disabledOverlay} />
                        )}
                    </View>
                )}

                {/* 3. Quantity (Liters) Counter */}
                <Text style={styles.sectionTitle}>{t('Quantity (Liters)')}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
                        <Ionicons name="remove" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <View style={styles.qtyInputRow}>
                        <TextInput
                            style={styles.qtyValueText}
                            keyboardType="numeric"
                            value={String(quantity)}
                            onChangeText={(text) => {
                                const clean = text.replace(/[^0-9]/g, '');
                                const num = parseInt(clean, 10);
                                setQuantity(isNaN(num) ? 0 : num);
                            }}
                            selectTextOnFocus
                        />
                        <Text style={styles.qtyValueUnit}>L</Text>
                    </View>

                    <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}>
                        <Ionicons name="add" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* 4. Hose Length Sleek Cards */}
                <Text style={styles.sectionTitle}>{t('Hose Length')}</Text>
                <View style={{ position: 'relative' }}>
                    <View style={[styles.hoseContainer, isSpringWater && { opacity: 0.4 }]}>
                        {HOSE_OPTIONS.map((option) => {
                            const isSelected = hoseLength === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[styles.hoseCard, isSelected && styles.hoseCardSelected]}
                                    onPress={() => setHoseLength(option.id)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name="waves" // Placeholder hose-like icon
                                        size={20}
                                        color={isSelected ? COLORS.navy : COLORS.textGray}
                                        style={{ marginRight: 15 }}
                                    />
                                    <Text style={[styles.hoseCardTitle, isSelected && styles.hoseCardTitleSelected]}>
                                        {t(option.title)}
                                    </Text>

                                    {/* Sleek Radio Indicator */}
                                    <View style={[styles.customRadioOuter, isSelected && styles.customRadioOuterSelected]}>
                                        {isSelected && <View style={styles.customRadioInner} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {isSpringWater && (
                        <View style={styles.disabledOverlay} />
                    )}
                </View>
            </ScrollView>

            {/* 5. Fixed Bottom Footer */}
            <View style={[styles.fixedFooter, { paddingBottom: 20 }]}>
                {/* Price Row */}
                <View style={styles.priceRow}>
                    <View>
                        <Text style={styles.priceLabel}>{t('TOTAL PRICE')}</Text>
                        <Text style={styles.vatText}>{t('VAT Included')}</Text>
                    </View>
                    <Text style={styles.priceValue}>
                        {totalPriceText} <Text style={styles.currencyText}>DZD</Text>
                    </Text>
                </View>

                {/* Actions Row */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.btnSchedule} onPress={handleSchedule}>
                        <Text style={styles.btnScheduleText}>Schedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnOrder} onPress={handleConfirm}>
                        <Text style={styles.btnOrderText}>Order Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
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
    scrollContent: {
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginTop: 25,
        marginBottom: 15,
    },
    disabledOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(250,250,250,0.6)',
        zIndex: 10,
    },

    /* 1. Location Card */
    locationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.bgGray,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 5,
    },
    mapImageContainer: {
        height: 120,
        width: '100%',
        backgroundColor: '#E5E7EB',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
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
        padding: 16,
        backgroundColor: COLORS.white,
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: 13,
        color: COLORS.textGray,
    },

    /* 2. Tank Location Pills */
    pillContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pillButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 40, // very rounded pill
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        marginHorizontal: 4,
    },
    pillButtonSelected: {
        borderColor: COLORS.yellow,
        backgroundColor: COLORS.dimYellow,
        borderWidth: 1.5,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textGray,
        marginTop: 2,
    },
    pillTextSelected: {
        color: COLORS.navy,
        fontWeight: 'bold',
    },

    // Floors
    floorSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    floorLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textGray,
        marginRight: 15,
    },
    floorScroll: {
        alignItems: 'center',
    },
    floorChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    floorChipSelected: {
        backgroundColor: COLORS.navy,
        borderColor: COLORS.navy,
    },
    floorChipText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    floorChipTextSelected: {
        color: COLORS.white,
    },

    /* 3. Quantity Counter */
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bgGray,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qtyBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.navy,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyValueText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.navy,
        width: 80,
        textAlign: 'center',
        padding: 0,
    },
    qtyValueUnit: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginLeft: 4,
    },

    /* 4. Hose Length Cards */
    hoseContainer: {
        marginBottom: 20,
    },
    hoseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 40, // very rounded pill shape
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        marginBottom: 12,
    },
    hoseCardSelected: {
        borderColor: COLORS.yellow,
        borderWidth: 1.5,
        backgroundColor: COLORS.dimYellow,
    },
    hoseCardTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textGray,
    },
    hoseCardTitleSelected: {
        color: COLORS.navy,
        fontWeight: 'bold',
    },
    customRadioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customRadioOuterSelected: {
        borderColor: COLORS.yellow,
        backgroundColor: COLORS.yellow,
    },
    customRadioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.navy,
    },

    /* 5. Fixed Bottom Footer */
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 20,
        paddingTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textGray,
        fontWeight: '600',
    },
    vatText: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    priceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    currencyText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 10,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12, // React Native handles gap in newer versions for flexDirection
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
