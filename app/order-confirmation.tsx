import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    lightGray: '#F9FAFB',
    borderGray: '#E5E7EB',
    textDark: '#1F2937',
    successGreen: '#28A745',
};

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Order Confirmation')}</Text>
                <View style={{ width: 40 }} /> {/* Spacer for alignment */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={50} color={COLORS.white} />
                    </View>
                </View>

                {/* Main Text */}
                <Text style={styles.successTitle}>{t('Your order has been\nsuccessfully scheduled')}</Text>

                {/* Subtext */}
                <Text style={styles.subText}>
                    {t('Thank you for choosing our services.\nOur driver will arrive at the\nscheduled time you selected.')}
                </Text>

                {/* Details Card */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Order ID')}</Text>
                        <Text style={styles.detailValue}>#88234</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Expected Time')}</Text>
                        <Text style={styles.detailValue}>{t('October 12, 10:00 AM')}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('Service Type')}</Text>
                        <Text style={styles.detailValue}>{t('Home Water Delivery')}</Text>
                    </View>
                </View>

                {/* Image Placeholder */}
                <View style={styles.imagePlaceholderContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=600&h=300' }}
                        style={styles.placeholderImage}
                        resizeMode="cover"
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={styles.backHomeButton}
                    onPress={() => router.replace('/')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backHomeText}>{t('Back to Home')}</Text>
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                    {t('You can track your order status from the "My Activities"\nlist')}
                </Text>
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
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: COLORS.white,
    },
    closeButton: {
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
        marginRight: 20, // offset for the back button
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
        // Optional soft glow behind the success circle
        shadowColor: COLORS.successGreen,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.successGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: 15,
    },
    subText: {
        fontSize: 15,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: COLORS.lightGray,
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textDark, // Darker text for the labels
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderGray,
        width: '100%',
    },
    imagePlaceholderContainer: {
        width: '100%',
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
    },
    footer: {
        paddingTop: 20,
        paddingHorizontal: 25,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    backHomeButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30, // Fully rounded pill
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    backHomeText: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 11,
        color: COLORS.textGray,
        lineHeight: 16,
    },
});
