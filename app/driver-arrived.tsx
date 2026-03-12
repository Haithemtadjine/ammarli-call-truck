import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Marker, PROVIDER_GOOGLE } from '../components/MapComponent';
import { customMapStyle } from '../constants/customMapStyle';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderLight: '#E5E7EB',
    green: '#5CB85C',
    bgGray: '#F9FAFB',
};

export default function DriverArrivedScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<any>(null);
    const { t } = useTranslation();
    const { activeOrder, driver, completeOrder } = useAppStore();

    const isBottledWater = activeOrder?.waterType === 'Bottled Water' || activeOrder?.type === 'Bottled Water';
    // Rich summary for bottled water, generic label for tanker orders
    const orderDisplaySummary = isBottledWater
        ? (activeOrder?.orderSummary || activeOrder?.quantity || 'Bottled Water')
        : (activeOrder?.waterType || activeOrder?.type || 'Water Delivery');

    // Fallback location
    const orderLat = activeOrder?.location?.latitude || 35.55597;
    const orderLng = activeOrder?.location?.longitude || 6.17366;

    const [region] = useState({
        latitude: orderLat,
        longitude: orderLng,
        latitudeDelta: 0.002,
        longitudeDelta: 0.001,
    });

    const handlePhoneCall = () => {
        Linking.openURL(`tel:${driver?.phone || '0770000000'}`);
    };

    const handleConfirm = () => {
        router.push('/delivery-completed' as any);
    };

    return (
        <View style={styles.container}>
            {/* Map View */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={customMapStyle}
                initialRegion={region}
                region={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* YOU Marker */}
                <Marker coordinate={{ latitude: orderLat, longitude: orderLng }}>
                    <View style={styles.markerGroup}>
                        <View style={styles.homeMarker}>
                            <Ionicons name="home" size={16} color={COLORS.white} />
                        </View>
                        <View style={styles.labelWrapper}>
                            <Text style={styles.labelText}>{t('YOU')}</Text>
                        </View>
                    </View>
                </Marker>

                {/* DRIVER Marker */}
                <Marker coordinate={{ latitude: orderLat + 0.0001, longitude: orderLng + 0.0001 }}>
                    <View style={styles.markerGroup}>
                        <View style={styles.truckMarker}>
                            <Ionicons name="bus" size={18} color={COLORS.navy} />
                        </View>
                        <View style={[styles.labelWrapper, { backgroundColor: COLORS.navy }]}>
                            <Text style={[styles.labelText, { color: COLORS.white }]}>{t('DRIVER')}</Text>
                        </View>
                    </View>
                </Marker>
            </MapView>

            {/* Back Button Overlay */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => router.back()}
            >
                <Ionicons name="chevron-back" size={24} color={COLORS.navy} />
            </TouchableOpacity>

            {/* Bottom Sheet UI */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />

                {/* Green Banner */}
                <View style={styles.greenBanner}>
                    <Ionicons name="pin" size={16} color="red" style={styles.pinIcon} />
                    <Text style={styles.bannerText}>{t('THE DRIVER IS OUTSIDE!')}</Text>
                </View>

                <View style={styles.sheetContent}>
                    {/* Main Instructions */}
                    <Text style={styles.mainInstructions}>
                        {isBottledWater
                            ? t('Please go outside to receive your bottled water.')
                            : t('Please go outside to guide the hose placement.')}
                    </Text>

                    {/* ── Order Summary Chip (prominent) ── */}
                    <View style={styles.orderSummaryChip}>
                        <Ionicons name={isBottledWater ? 'water-outline' : 'cube-outline'} size={18} color={COLORS.navy} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.orderSummaryLabel}>{t('YOUR ORDER')}</Text>
                            <Text style={styles.orderSummaryText} numberOfLines={2}>{orderDisplaySummary}</Text>
                        </View>
                    </View>

                    {/* Sleek Driver Card */}
                    <View style={styles.driverCard}>
                        <View style={styles.driverAvatarContainer}>
                            <Image
                                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineDot} />
                        </View>

                        <View style={styles.driverDetailsContainer}>
                            <Text style={styles.driverSubtitle}>{t('YOUR PROFESSIONAL DRIVER')}</Text>
                            <Text style={styles.driverName}>{driver?.name || 'Ahmed R.'}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={COLORS.yellow} />
                                <Text style={styles.ratingText}>{driver?.rating || '4.9'}</Text>
                                <Text style={styles.deliveriesText}>(2.4k deliveries)</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.callButtonOutline} onPress={handlePhoneCall}>
                            <Ionicons name="call" size={20} color={COLORS.navy} />
                        </TouchableOpacity>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity style={styles.actionButton} onPress={handleConfirm} activeOpacity={0.9}>
                        <Text style={styles.actionButtonText}>{t('I AM GOING OUT NOW')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    map: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        left: 20,
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
        zIndex: 10,
    },
    markerGroup: {
        alignItems: 'center',
    },
    homeMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#404040',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    truckMarker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    labelWrapper: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    labelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.borderLight,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    greenBanner: {
        backgroundColor: COLORS.green,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    pinIcon: {
        marginRight: 8,
    },
    bannerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.navy,
        letterSpacing: 1,
    },
    sheetContent: {
        paddingHorizontal: 25,
        paddingTop: 25,
        paddingBottom: 40,
    },
    mainInstructions: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 30,
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgGray,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: 30,
    },
    driverAvatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.green,
        borderWidth: 2,
        borderColor: COLORS.bgGray,
    },
    driverDetailsContainer: {
        flex: 1,
    },
    driverSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textGray,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginLeft: 4,
    },
    deliveriesText: {
        fontSize: 11,
        color: COLORS.textGray,
        marginLeft: 4,
    },
    callButtonOutline: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 15,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        letterSpacing: 1,
    },
    // ── Order summary chip ──
    orderSummaryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    orderSummaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textGray,
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    orderSummaryText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.navy,
        lineHeight: 20,
    },
});
