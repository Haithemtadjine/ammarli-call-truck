import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ── Safe-render guard: returns true only when ALL coordinate fields are finite numbers
const isValidRegion = (r: any): boolean =>
    !!r &&
    typeof r.latitude === 'number' && isFinite(r.latitude) &&
    typeof r.longitude === 'number' && isFinite(r.longitude);
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { MapView, Marker, UrlTile } from '../components/MapComponent';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderGray: '#F3F4F6',
    lightGrayBg: '#F9FAFB',
};

const TRUCK_COUNT = 3;

export default function SearchingDriverScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const waterType = params.waterType || 'Spring';
    const qty = params.qty || '5';
    const price = params.price || '1.00';
    const address = params.address || 'Jumeirah Village Circle, Dubai';

    const [region, setRegion] = useState<any>(null);
    const [dynamicTrucks, setDynamicTrucks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<any>(null);

    const pulseAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { activeOrder, updateOrder, setDriver, driver: mockDriver } = useAppStore();

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setRegion({ latitude: 36.7538, longitude: 3.0588, latitudeDelta: 0.02, longitudeDelta: 0.01 });
                    setLoading(false);
                    return;
                }
                let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const lat = currentLocation.coords.latitude;
                const lng = currentLocation.coords.longitude;
                const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 };
                setRegion(newRegion);
                const generatedTrucks = Array.from({ length: TRUCK_COUNT }).map((_, i) => ({
                    id: String(i),
                    lat: lat + (Math.random() - 0.5) * 0.015,
                    lng: lng + (Math.random() - 0.5) * 0.015,
                }));
                setDynamicTrucks(generatedTrucks);
            } catch (error) {
                console.warn(error);
            } finally {
                setLoading(false);
            }
        })();

        Animated.loop(
            Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
                Animated.timing(progressAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
            ])
        ).start();

        searchTimerRef.current = setTimeout(() => {
            const isBottled = waterType === 'Bottled Water';
            const isSuccess = isBottled ? true : Math.random() > 0.3; 
            
            if (isSuccess) {
                const assignedDriver = mockDriver || { name: 'Khaled', phone: '0770000000', truck: 'Scania 15L', rating: 4.9, location: { lat: 0, lng: 0 } };
                
                updateOrder({
                    ...activeOrder,
                    status: 'accepted',
                    driver: assignedDriver,
                } as any);
                setDriver(assignedDriver);

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
        outputRange: ['0%', '200%'],
    });

    return (
        <View style={styles.container}>
            {/* ── Native Map Guard: NEVER mount MapView until we have verified finite coordinates ── */}
            {isValidRegion(region) ? (
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    mapType="none"
                    initialRegion={{
                        latitude: Number(region.latitude),
                        longitude: Number(region.longitude),
                        latitudeDelta: Number(region.latitudeDelta) || 0.05,
                        longitudeDelta: Number(region.longitudeDelta) || 0.05,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    <UrlTile
                        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                        flipY={false}
                    />
                    <Marker coordinate={{
                        latitude: Number(region.latitude),
                        longitude: Number(region.longitude),
                    }}>
                        <View style={styles.radarContainer}>
                            <Animated.View
                                style={[
                                    styles.pulseRing,
                                    { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                                ]}
                            />
                            <View style={styles.centerDot}>
                                <Ionicons name="location" size={16} color={COLORS.white} />
                            </View>
                        </View>
                    </Marker>

                    {dynamicTrucks.map((truck) => (
                        <Marker
                            key={truck.id}
                            coordinate={{
                                latitude: Number(truck.lat),
                                longitude: Number(truck.lng),
                            }}
                        >
                            <View style={styles.truckMarker}>
                                <MaterialCommunityIcons name="truck" size={16} color={COLORS.navy} />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }]}>
                    <ActivityIndicator size="large" color={COLORS.navy} />
                    <Text style={{ marginTop: 12, color: COLORS.navy, fontWeight: '600' }}>Fetching precise GPS...</Text>
                </View>
            )}

            <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top + 10, 50) }]}>
                <TouchableOpacity style={styles.backPill} onPress={handleCancel}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>

                <View style={styles.locationPill}>
                    <Ionicons name="location" size={16} color={COLORS.navy} />
                    <Text style={styles.locationPillText} numberOfLines={1}>{address}</Text>
                </View>
            </View>

            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.searchingRow}>
                    <Text style={styles.searchingTitle}>{t('Searching for nearest driver...')}</Text>
                    <ActivityIndicator size="small" color={COLORS.navy} />
                </View>

                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBarActive,
                            { transform: [{ translateX: progressTranslateX }] }
                        ]}
                    />
                </View>

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

                <View style={styles.infoRow}>
                    <Ionicons name="information-circle" size={16} color={COLORS.navy} />
                    <Text style={styles.infoText}>
                        {waterType === 'Bottled Water'
                            ? t('Searching for the best delivery...')
                            : `${t(waterType as string)}${t(' tankers usually accept within 2 mins.')}`}
                    </Text>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>{t('CANCEL REQUEST')}</Text>
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.fullLoadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.navy} />
                    <Text style={styles.loadingText}>{t('Fetching precise GPS...')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center' },
    backPill: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 3, marginRight: 10 },
    locationPill: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, height: 44, borderRadius: 22, paddingHorizontal: 15, elevation: 3 },
    locationPillText: { fontSize: 14, color: COLORS.navy, fontWeight: '500', marginLeft: 8, flex: 1 },
    radarContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
    pulseRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0, 51, 102, 0.2)', borderWidth: 1, borderColor: 'rgba(0, 51, 102, 0.4)' },
    centerDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    truckMarker: { width: 34, height: 34, borderRadius: 8, backgroundColor: COLORS.yellow, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white, elevation: 4 },
    bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 40, paddingTop: 15, elevation: 20 },
    sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    searchingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    searchingTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.navy },
    progressBarContainer: { height: 6, backgroundColor: COLORS.borderGray, borderRadius: 3, overflow: 'hidden', marginBottom: 30, width: '100%' },
    progressBarActive: { height: '100%', width: '30%', backgroundColor: COLORS.navy, borderRadius: 3 },
    serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderGray, borderRadius: 16, padding: 16, marginBottom: 25 },
    serviceIconFrame: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    serviceMiddle: { flex: 1 },
    serviceLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5 },
    serviceValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.navy },
    serviceRight: { alignItems: 'flex-end' },
    priceValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.navy, marginBottom: 4 },
    priceLabel: { fontSize: 10, color: '#9CA3AF' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    infoText: { fontSize: 13, color: COLORS.textGray, marginLeft: 8 },
    cancelButton: { backgroundColor: COLORS.yellow, borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.navy },
    fullLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    loadingText: { marginTop: 15, fontSize: 16, fontWeight: '600', color: COLORS.navy },
});
