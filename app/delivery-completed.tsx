import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    lightYellow: '#FEF9E7',
    white: '#FFFFFF',
    textGray: '#6B7280',
    lightGray: '#F9FAFB',
    borderGray: '#E5E7EB',
    textDark: '#1F2937',
};

export default function DeliveryCompletedScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Zustand Data
    const { activeOrder, completeOrder, setPendingRating } = useAppStore();

    // Debugging
    console.log('Invoice Data:', { params, activeOrder });

    // Mapping dynamic data with fallbacks from multiple sources (Params or Store)
    const serviceName = params.type || activeOrder?.waterType || activeOrder?.type || 'Spring Water';
    const volumeLiters = params.qty || activeOrder?.quantity || '20';
    const totalPrice = params.price || activeOrder?.price || 0;
    const locationDisplayName = params.loc || activeOrder?.locationName || 'N/A';
    const completionTime = params.time || activeOrder?.orderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Bottled Water extras
    const isBottledWater = serviceName === 'Bottled Water';
    const brandName = activeOrder?.bottledWaterItems?.brand || null;
    const orderSummary = activeOrder?.orderSummary || null;

    const handleBackToHome = () => {
        // Finalize order in store (saves to history and clears active)
        completeOrder();
        // Set pending rating to true to show the modal on Home
        setPendingRating(true);
        // Navigate back home
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.content}>

                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.successCircleOuter}>
                        <Ionicons name="checkmark-sharp" size={40} color={COLORS.yellow} />
                    </View>
                </View>

                {/* Main Text */}
                <Text style={styles.successTitle}>{t('Order Completed\nSuccessfully!')}</Text>

                {/* Subtext */}
                <Text style={styles.subText}>
                    {t('Your water is on its way to you.')}
                </Text>

                {/* Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardHeader}>{t('ORDER DETAILS')}</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Service')}</Text>
                        <Text style={styles.detailValue}>{t(serviceName as string)}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{isBottledWater ? t('Items') : t('Volume')}</Text>
                        <Text style={styles.detailValue}>
                            {isBottledWater
                                ? (orderSummary ? orderSummary.split('|')[1]?.trim() : volumeLiters)
                                : `${volumeLiters}${` ${t('Liters')}`}`}
                        </Text>
                    </View>
                    <View style={styles.divider} />

                    {/* Brand row — only for Bottled Water */}
                    {isBottledWater && brandName ? (
                        <>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('Brand')}</Text>
                                <View style={styles.brandBadge}>
                                    <Text style={styles.brandBadgeText}>{brandName}</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                        </>
                    ) : null}

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Destination')}</Text>
                        <Text style={styles.detailValue}>{locationDisplayName as string}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Order Time')}</Text>
                        <Text style={styles.detailValue}>{completionTime}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Total Price')}</Text>
                        <Text style={styles.detailValue}>{totalPrice} DA</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.backHomeButton}
                    onPress={handleBackToHome}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backHomeText}>{t('Back to Home')}</Text>
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
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 80,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    successCircleOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.lightYellow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 10,
    },
    subText: {
        fontSize: 15,
        color: COLORS.textGray,
        textAlign: 'center',
        marginBottom: 40,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: COLORS.lightGray,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    cardHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4B5563',
        letterSpacing: 0.5,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderGray,
        width: '100%',
    },
    // ── Brand badge (Bottled Water only)
    brandBadge: {
        backgroundColor: '#FEF3C7',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    brandBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    footer: {
        paddingTop: 20,
        paddingHorizontal: 25,
        backgroundColor: COLORS.white,
    },
    backHomeButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    backHomeText: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
