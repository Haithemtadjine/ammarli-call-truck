import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#002952',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#999999',
    lightGray: '#F5F5F5',
    borderGray: '#EEEEEE',
    bgLight: '#FBFBFB',
};

// Pricing for calculations (consistency with details screen)
const PRICES = {
    small: 150,   // DA per 0.5L pack
    medium: 250,  // DA per 1.5L pack
    large: 120,   // DA per 5L jug
};

const DELIVERY_FEE = 150;

export default function DeliveryCompletedScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const isScheduled = params.isScheduled === 'true';

    const { activeOrder, completeOrder, setPendingRating } = useAppStore();

    // Mapping dynamic data
    const cart: Record<string, { small: number, medium: number, large: number }> = activeOrder?.bottledWaterCart || {};
    const invoiceId = `INV-2026-${String(activeOrder?.id || Date.now()).slice(-4)}`;
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Calculate subtotal from cart
    const subtotal = Object.values(cart).reduce((acc: number, counts: { small: number, medium: number, large: number }) => {
        return acc + 
            (counts.small * PRICES.small) + 
            (counts.medium * PRICES.medium) + 
            (counts.large * PRICES.large);
    }, 0);

    const grandTotal = subtotal + DELIVERY_FEE;

    const handleBackToHome = () => {
        if (isScheduled) {
            completeOrder();
            setPendingRating(false);
            router.replace('/(tabs)');
        } else {
            // Go to rating screen first; rating screen calls completeOrder() itself
            router.replace('/customer-rating' as any);
        }
    };

    // Helper to render rows
    const renderReceiptRows = () => {
        const rows: React.ReactNode[] = [];
        Object.entries(cart).forEach(([brand, counts]) => {
            if (counts.small > 0) {
                rows.push(
                    <ReceiptRow 
                        key={`${brand}-small`}
                        brand={brand} 
                        size="0.5L" 
                        qty={counts.small} 
                        unitPrice={PRICES.small} 
                    />
                );
            }
            if (counts.medium > 0) {
                rows.push(
                    <ReceiptRow 
                        key={`${brand}-medium`}
                        brand={brand} 
                        size="1.5L" 
                        qty={counts.medium} 
                        unitPrice={PRICES.medium} 
                    />
                );
            }
            if (counts.large > 0) {
                rows.push(
                    <ReceiptRow 
                        key={`${brand}-large`}
                        brand={brand} 
                        size="5L" 
                        qty={counts.large} 
                        unitPrice={PRICES.large} 
                    />
                );
            }
        });
        return rows;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.mainScroll, { paddingTop: insets.top + 20 }]}>
                {/* ── Receipt Card ── */}
                <View style={styles.receiptCard}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color={COLORS.white} />
                        </View>
                        <Text style={styles.successTitle}>
                            {isScheduled ? t('Order scheduled successfully') : t('Order completed successfully')}
                        </Text>
                        {isScheduled && (
                            <View style={styles.scheduledBadge}>
                                <Ionicons name="calendar-outline" size={10} color={COLORS.white} style={{ marginRight: 4 }} />
                                <Text style={styles.scheduledBadgeText}>{t('SCHEDULED')}</Text>
                            </View>
                        )}
                        <Text style={styles.invoiceSubtitle}>
                            {invoiceId} • {currentDate}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Table Section */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerLabel, { flex: 2 }]}>BRAND</Text>
                        <Text style={[styles.headerLabel, { textAlign: 'center', flex: 1.2 }]}>SIZE</Text>
                        <Text style={[styles.headerLabel, { textAlign: 'center', flex: 0.8 }]}>QTY</Text>
                        <Text style={[styles.headerLabel, { textAlign: 'right', flex: 1.5 }]}>UNIT PRICE</Text>
                        <Text style={[styles.headerLabel, { textAlign: 'right', flex: 1.8 }]}>SUBTOTAL</Text>
                    </View>
                    
                    <View style={[styles.divider, { marginVertical: 10 }]} />

                    <View style={styles.rowsContainer}>
                        {renderReceiptRows()}
                    </View>

                    <View style={[styles.divider, { marginTop: 20, marginBottom: 15 }]} />

                    {/* Summary Section */}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{subtotal.toLocaleString()}.00 DA</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        <Text style={styles.summaryValue}>{DELIVERY_FEE.toLocaleString()}.00 DA</Text>
                    </View>

                    {/* Total Paid Card */}
                    <View style={styles.totalCard}>
                        <Text style={styles.totalCardLabel}>TOTAL PRICE PAID</Text>
                        <View style={styles.totalValueRow}>
                            <Text style={styles.totalValue}>{grandTotal.toLocaleString()}.00</Text>
                            <Text style={styles.totalCurrency}>DA</Text>
                        </View>
                    </View>

                    {/* Driver Section */}
                    {!isScheduled && (
                        <View style={styles.driverSection}>
                            <Text style={styles.driverLabel}>DELIVERED BY</Text>
                            <Text style={styles.driverName}>{activeOrder?.driver?.name || 'Assigned Driver'}</Text>
                        </View>
                    )}

                    {/* Receipt Footer */}
                    <Text style={styles.receiptFooterText}>
                        AMMARLI PREMIUM WATER • FAST & PURE DELIVERY
                    </Text>
                </View>
            </View>

            {/* Bottom Action Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={styles.btnHome} onPress={handleBackToHome}>
                    <Text style={styles.btnHomeText}>
                        {isScheduled ? t('BACK TO HOME') : `${t('Rate Driver')} ⭐`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── Receipt Row Component ──
function ReceiptRow({ brand, size, qty, unitPrice }: { brand: string, size: string, qty: number, unitPrice: number }) {
    return (
        <View style={styles.row}>
            <Text style={[styles.rowBrand, { flex: 2 }]} numberOfLines={1}>{brand}</Text>
            <Text style={[styles.rowText, { textAlign: 'center', flex: 1.2 }]}>{size}</Text>
            <Text style={[styles.rowQty, { textAlign: 'center', flex: 0.8 }]}>{qty}</Text>
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                <Text style={styles.rowText}>{unitPrice.toFixed(2)}</Text>
                <Text style={styles.rowCurrency}>DA</Text>
            </View>
            <View style={{ flex: 1.8, alignItems: 'flex-end' }}>
                <Text style={styles.rowSubtotal}>{(qty * unitPrice).toFixed(2)}</Text>
                <Text style={styles.rowCurrencyBold}>DA</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light gray background
    },
    mainScroll: {
        flex: 1,
        paddingHorizontal: 20,
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4, // More square physical receipt look
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 100,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    checkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3CD0D',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#F3CD0D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#002952',
        textAlign: 'center',
        marginBottom: 8,
    },
    invoiceSubtitle: {
        fontSize: 12,
        color: '#AAAAAA',
        textAlign: 'center',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        width: '100%',
        marginVertical: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 2,
    },
    headerLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#002952',
        letterSpacing: 0.5,
    },
    rowsContainer: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    rowBrand: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#002952',
    },
    rowText: {
        fontSize: 12,
        color: '#999999',
    },
    rowQty: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#002952',
    },
    rowSubtotal: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#002952',
    },
    rowCurrency: {
        fontSize: 8,
        color: '#999999',
    },
    rowCurrencyBold: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#002952',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#999999',
    },
    summaryValue: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '500',
    },
    totalCard: {
        backgroundColor: '#002952',
        borderRadius: 12,
        padding: 20,
        marginTop: 15,
        alignItems: 'center',
    },
    totalCardLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#F3CD0D',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    totalValueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    totalValue: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    totalCurrency: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
        marginBottom: 6,
    },
    receiptFooterText: {
        marginTop: 30,
        fontSize: 8,
        color: '#BBBBBB',
        textAlign: 'center',
        letterSpacing: 1,
    },
    driverSection: {
        marginTop: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
    },
    driverLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#999999',
        letterSpacing: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002952',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
    },
    btnHome: {
        backgroundColor: '#F3CD0D',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    btnHomeText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#002952',
    },
    scheduledBadge: {
        backgroundColor: '#002952',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
    },
    scheduledBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
