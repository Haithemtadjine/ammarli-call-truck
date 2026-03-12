import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderLight: '#E5E7EB',
    bgGray: '#F9FAFB',
};

export default function TrackDeliveryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { driver, activeOrder } = useAppStore();

    // Mapping dynamic data
    const locationName = activeOrder?.locationName || 'Batna';
    const driverPhone = driver?.phone || '0770000000';

    // Animation: Truck moving horizontally
    const truckAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start truck movement animation
        Animated.timing(truckAnim, {
            toValue: 1,
            duration: 8000, // 8 seconds for the demo
            useNativeDriver: false, // Using width/positioning
        }).start();

        // Auto-transition to next screen
        const timer = setTimeout(() => {
            router.push('/driver-arrived' as any);
        }, 9000);

        return () => clearTimeout(timer);
    }, [router, truckAnim]);

    const handlePhoneCall = () => {
        Linking.openURL(`tel:${driverPhone}`);
    };

    const truckLeft = truckAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '75%'], // Stop before the house
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('ORDER STATUS')}</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* ETA Badge */}
                <View style={styles.etaBadge}>
                    <Text style={styles.etaText}>{t('Arriving in 25 mins')}</Text>
                </View>

                {/* Animation Area */}
                <View style={styles.animationArea}>
                    <View style={styles.trackContainer}>
                        <View style={styles.dashedLine} />

                        {/* Animated Truck */}
                        <Animated.View style={[styles.truckWrapper, { left: truckLeft }]}>
                            <View style={styles.truckIconSquare}>
                                <Ionicons name="bus" size={24} color={COLORS.navy} />
                            </View>
                        </Animated.View>

                        {/* House Icon */}
                        <View style={styles.houseIconSquare}>
                            <Ionicons name="home" size={24} color={COLORS.white} />
                        </View>
                    </View>
                </View>

                {/* Main Text */}
                <View style={styles.textStack}>
                    <Text style={styles.mainTitle}>{t('Your water is on the way!')}</Text>
                    <Text style={styles.subtitle}>
                        {t('The driver is heading to your location in ')}
                        <Text style={styles.locationBold}>{locationName}.</Text>
                    </Text>
                </View>
            </View>

            {/* Bottom Driver Card */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.driverCard}>
                    <View style={styles.driverInfoRow}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                style={styles.avatar}
                            />
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{driver?.rating || '4.9'}</Text>
                                <Ionicons name="star" size={10} color={COLORS.yellow} />
                            </View>
                        </View>

                        <View style={styles.driverDetails}>
                            <Text style={styles.driverName}>{driver?.name || 'Ahmed R.'}</Text>
                            <Text style={styles.truckPlate}>{t('Truck Plate: ')}{driver?.truck || '05-1234'}</Text>
                        </View>

                        <TouchableOpacity style={styles.callButton} onPress={handlePhoneCall}>
                            <Ionicons name="call" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        letterSpacing: 0.5,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    etaBadge: {
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 60,
    },
    etaText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    animationArea: {
        width: '100%',
        paddingHorizontal: 40,
        height: 100,
        justifyContent: 'center',
        marginBottom: 60,
    },
    trackContainer: {
        width: '100%',
        height: 60,
        justifyContent: 'center',
        position: 'relative',
    },
    dashedLine: {
        position: 'absolute',
        top: 30,
        left: 20,
        right: 20,
        height: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 1,
    },
    truckWrapper: {
        position: 'absolute',
        top: 0,
        zIndex: 2,
    },
    truckIconSquare: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.yellow,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    houseIconSquare: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 60,
        height: 60,
        backgroundColor: COLORS.navy,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    textStack: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 15,
        fontFamily: 'serif', // Match the abstract look
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 24,
    },
    locationBold: {
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    footer: {
        paddingHorizontal: 20,
    },
    driverCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: COLORS.bgGray,
    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 16,
    },
    ratingBadge: {
        position: 'absolute',
        bottom: -5,
        left: '50%',
        marginLeft: -20,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.bgGray,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginRight: 2,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    truckPlate: {
        fontSize: 13,
        color: COLORS.textGray,
    },
    callButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.navy,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});
