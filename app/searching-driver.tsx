import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Marker, PROVIDER_GOOGLE } from '../components/MapComponent';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderGray: '#F3F4F6',
    lightGrayBg: '#F9FAFB',
};

// Simulated truck locations around the user relative to center
// We will generate these dynamically based on the actual region below
const TRUCK_COUNT = 3;

export default function SearchingDriverScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Extract passed params
    const waterType = params.waterType || 'Spring';
    const qty = params.qty || '5';
    const price = params.price || '1.00';
    const address = params.address || 'Jumeirah Village Circle, Dubai';

    const [region, setRegion] = useState<any>(null);
    const [dynamicTrucks, setDynamicTrucks] = useState<any[]>([]);
    const mapRef = useRef<any>(null);

    // Animations
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Simulation Timer
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Fetch Location
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Fallback to Batna
                setRegion({
                    latitude: 35.55597,
                    longitude: 6.17366,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                });
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            const lat = currentLocation.coords.latitude || 35.55597;
            const lng = currentLocation.coords.longitude || 6.17366;

            setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.01,
            });

            // Generate 3 random trucks near this specific location
            const generatedTrucks = Array.from({ length: TRUCK_COUNT }).map((_, i) => ({
                id: String(i),
                lat: lat + (Math.random() - 0.5) * 0.01,
                lng: lng + (Math.random() - 0.5) * 0.01,
            }));
            setDynamicTrucks(generatedTrucks);
        })();

        // Start pulse animation for map radar
        Animated.loop(
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
            })
        ).start();

        // Start progress bar infinite animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: false,
                }),
                Animated.timing(progressAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: false,
                }),
            ])
        ).start();

        // Randomly route after 5 seconds to simulate search success/fail
        searchTimerRef.current = setTimeout(() => {
            const isSuccess = Math.random() > 0.3; // 70% chance of finding a driver
            if (isSuccess) {
                router.replace({
                    pathname: '/track-delivery',
                    params: { waterType, qty }
                });
            } else {
                router.replace('/no-driver-found');
            }
        }, 5000);

        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [progressAnim, pulseAnim, qty, router, waterType]);

    const handleCancel = () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        router.push('/(tabs)');
    };

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 6],
    });

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.6, 0.3, 0],
    });

    const progressTranslateX = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '200%'], // Move relative to container
    });

    return (
        <View style={styles.container}>
            {/* Map View */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: 35.55597,
                    longitude: 6.17366,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                region={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* User Center Pulsing Marker */}
                {region && (
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
                        <View style={styles.radarContainer}>
                            <Animated.View
                                style={[
                                    styles.pulseRing,
                                    {
                                        transform: [{ scale: pulseScale }],
                                        opacity: pulseOpacity,
                                    },
                                ]}
                            />
                            <View style={styles.centerDot}>
                                <Ionicons name="location" size={16} color={COLORS.white} />
                            </View>
                        </View>
                    </Marker>
                )}

                {/* Dummy Truck Markers */}
                {region && dynamicTrucks.map((truck) => (
                    <Marker
                        key={truck.id}
                        coordinate={{
                            latitude: truck.lat,
                            longitude: truck.lng
                        }}
                    >
                        <View style={styles.truckMarker}>
                            <Ionicons name="bus" size={16} color={COLORS.navy} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Top Back Pill & Location Overlay */}
            <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top + 10, 50) }]}>
                <TouchableOpacity style={styles.backPill} onPress={handleCancel}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>

                <View style={styles.locationPill}>
                    <Ionicons name="location" size={16} color={COLORS.navy} />
                    <Text style={styles.locationPillText} numberOfLines={1}>{address}</Text>
                </View>
            </View>

            {/* Bottom Sheet */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />

                {/* Searching Title & Spinner */}
                <View style={styles.searchingRow}>
                    <Text style={styles.searchingTitle}>{t('Searching for nearest driver...')}</Text>
                    <ActivityIndicator size="small" color={COLORS.navy} />
                </View>

                {/* Animated Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBarActive,
                            { transform: [{ translateX: progressTranslateX }] }
                        ]}
                    />
                </View>

                {/* Dynamic Service Card */}
                <View style={styles.serviceCard}>
                    <View style={styles.serviceIconFrame}>
                        <Ionicons name="water" size={24} color={COLORS.yellow} />
                    </View>

                    <View style={styles.serviceMiddle}>
                        <Text style={styles.serviceLabel}>{t('SELECTED SERVICE')}</Text>
                        <Text style={styles.serviceValue}>
                            {waterType === 'Bottled Water'
                                ? t('Bottled Water')
                                : `${t(waterType as string)}${t(' Water - ')}${qty}L`}
                        </Text>
                    </View>

                    <View style={styles.serviceRight}>
                        <Text style={styles.priceValue}>{t('AED ')}{price}</Text>
                        <Text style={styles.priceLabel}>{t('ESTIMATED')}</Text>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle" size={16} color={COLORS.navy} />
                    <Text style={styles.infoText}>
                        {waterType === 'Bottled Water'
                            ? t('Searching for the best delivery...')
                            : `${t(waterType as string)}${t(' tankers usually accept within 2 mins.')}`}
                    </Text>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>{t('CANCEL REQUEST')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backPill: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginRight: 10,
    },
    locationPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    locationPillText: {
        fontSize: 14,
        color: COLORS.navy,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    radarContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 51, 102, 0.2)', // very faint navy
        borderWidth: 1,
        borderColor: 'rgba(0, 51, 102, 0.4)',
    },
    centerDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.navy,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    truckMarker: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: COLORS.yellow,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 25,
        paddingBottom: 40,
        paddingTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    searchingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    searchingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: COLORS.borderGray,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 30,
        width: '100%',
    },
    progressBarActive: {
        height: '100%',
        width: '30%', // width of the moving segment
        backgroundColor: COLORS.navy,
        borderRadius: 3,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.borderGray,
        borderRadius: 16,
        padding: 16,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceIconFrame: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.navy,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    serviceMiddle: {
        flex: 1,
    },
    serviceLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    serviceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    serviceRight: {
        alignItems: 'flex-end',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textGray,
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    }
});
