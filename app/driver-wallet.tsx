import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import DriverBottomNav from '../src/components/DriverBottomNav';
import { useAppStore, WeeklyStatDay } from '../src/store/useAppStore';

// ─── Theme ───────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const BORDER = '#E5E7EB';
const GREEN = '#4CAF50';
const RED = '#FF4D4D';
const ORANGE = '#FF9800';
const LIGHT_GRAY_BAR = '#D1D5DB';

// Day index helper — matches store logic (0=MON..6=SUN, JS getDay 0=Sun..6=Sat)
function todayIndexInWeek(): number {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}

// ─── Bar colour logic ─────────────────────────────────────────────────────────
function barColor(idx: number, todayIdx: number, amount: number): string {
    if (idx === todayIdx) return YELLOW;                        // Today → yellow
    if (idx > todayIdx) return LIGHT_GRAY_BAR;                  // Future → muted
    if (amount === 0) return RED;                               // Past, no work → red
    if (amount > 3000) return GREEN;                            // High earnings → green
    return ORANGE;                                              // Average → orange
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
const BAR_MAX_HEIGHT = 80;

function WeeklyBarChart({ stats }: { stats: WeeklyStatDay[] }) {
    const todayIdx = todayIndexInWeek();
    const maxAmount = Math.max(...stats.map((s) => s.amount), 1);

    return (
        <View style={chartStyles.container}>
            <View style={chartStyles.barsRow}>
                {stats.map((stat, idx) => {
                    const heightPct = stat.amount / maxAmount;
                    const barH = Math.max(heightPct * BAR_MAX_HEIGHT, stat.amount === 0 && idx <= todayIdx ? 6 : 4);
                    const color = barColor(idx, todayIdx, stat.amount);
                    const isToday = idx === todayIdx;
                    return (
                        <View key={stat.day} style={chartStyles.barCol}>
                            <View style={chartStyles.barTrack}>
                                <View
                                    style={[
                                        chartStyles.bar,
                                        {
                                            height: barH,
                                            backgroundColor: color,
                                            borderRadius: isToday ? 6 : 4,
                                            // Today bar is slightly wider
                                            width: isToday ? 22 : 18,
                                        },
                                    ]}
                                />
                            </View>
                            <Text
                                style={[
                                    chartStyles.dayLabel,
                                    isToday && chartStyles.dayLabelActive,
                                ]}
                            >
                                {stat.day}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const chartStyles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    barCol: {
        alignItems: 'center',
        flex: 1,
    },
    barTrack: {
        height: BAR_MAX_HEIGHT,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        minHeight: 4,
    },
    dayLabel: {
        marginTop: 8,
        fontSize: 10,
        fontWeight: '600',
        color: GRAY,
    },
    dayLabelActive: {
        color: NAVY,
        fontWeight: '800',
    },
});

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DriverWalletScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const totalEarnings  = useAppStore((s) => s.totalEarnings);
    const completedTrips = useAppStore((s) => s.completedTrips);
    const driverRating   = useAppStore((s) => s.driverRating);
    const appCommission  = useAppStore((s) => s.appCommission);
    const transactions   = useAppStore((s) => s.transactions);
    const weeklyStats    = useAppStore((s) => s.weeklyStats);

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Earnings')}</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="help-circle-outline" size={22} color={NAVY} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Balance card ── */}
                <View style={styles.balanceCard}>
                    {/* Decorative circle */}
                    <View style={styles.decorCircle} />

                    <Text style={styles.balanceLabel}>{t('Current Balance')}</Text>
                    <View style={styles.balanceAmountRow}>
                        <Text style={styles.balanceValue}>{totalEarnings.toLocaleString()}</Text>
                        <Text style={styles.balanceCurrency}>DA</Text>
                    </View>

                    <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85}>
                        <Ionicons name="wallet-outline" size={18} color={NAVY} style={{ marginRight: 8 }} />
                        <Text style={styles.withdrawText}>{t('Withdraw Funds')}</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Stats row ── */}
                <View style={styles.statsRow}>
                    {/* Total trips */}
                    <View style={styles.statCard}>
                        <View style={styles.statIconWrap}>
                            <Ionicons name="car" size={22} color={NAVY} />
                        </View>
                        <Text style={styles.statLabel}>{t('TOTAL TRIPS')}</Text>
                        <Text style={styles.statValue}>{completedTrips}</Text>
                    </View>

                    {/* Rating */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconWrap, { backgroundColor: '#FEF9E7' }]}>
                            <Ionicons name="star" size={22} color="#F59E0B" />
                        </View>
                        <Text style={styles.statLabel}>{t('RATING')}</Text>
                        <Text style={styles.statValue}>{driverRating.toFixed(1)}</Text>
                    </View>
                </View>

                {/* ── Commission card ── */}
                <View style={styles.commissionCard}>
                    <View style={styles.commissionLeft}>
                        <View style={styles.commissionIconWrap}>
                            <Ionicons name="receipt-outline" size={20} color={RED} />
                        </View>
                        <View>
                            <Text style={styles.commissionTitle}>{t('APP COMMISSION')}</Text>
                            <Text style={styles.commissionSubtitle}>المبالغ المستحقة للتطبيق</Text>
                        </View>
                    </View>
                    <View style={styles.commissionRight}>
                        <Text style={styles.commissionAmount}>{appCommission.toLocaleString()} DA</Text>
                        <View style={styles.payableBadge}>
                            <Text style={styles.payableBadgeText}>● PAYABLE</Text>
                        </View>
                    </View>
                </View>

                {/* ── Weekly stats ── */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>{t('Weekly Stats')}</Text>
                        <Text style={styles.sectionSubtitle}>{t('Last 7 Days')}</Text>
                    </View>
                    <WeeklyBarChart stats={weeklyStats} />
                </View>

                {/* ── Recent transactions ── */}
                <View style={styles.txSection}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>{t('Recent Transactions')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>{t('See All')}</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyTx}>
                            <Ionicons name="receipt-outline" size={36} color={GRAY} />
                            <Text style={styles.emptyTxText}>{t('No transactions yet')}</Text>
                        </View>
                    ) : (
                        transactions.map((tx) => (
                            <View key={tx.id} style={styles.txCard}>
                                {/* Green circle + icon */}
                                <View style={styles.txIconWrap}>
                                    <Ionicons name="add" size={22} color={WHITE} />
                                </View>

                                {/* Info */}
                                <View style={styles.txInfo}>
                                    <Text style={styles.txName}>{tx.customerName}</Text>
                                    <Text style={styles.txDate}>{tx.date}</Text>
                                </View>

                                {/* Amount + badge */}
                                <View style={styles.txRight}>
                                    <Text style={styles.txAmount}>+{tx.amount.toLocaleString()} DA</Text>
                                    <View style={styles.completedBadge}>
                                        <Text style={styles.completedBadgeText}>{t('COMPLETED')}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <DriverBottomNav activeTab="wallet" />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { paddingHorizontal: 16, paddingTop: 16 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BG,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    headerBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
    },

    // Balance card
    balanceCard: {
        backgroundColor: NAVY,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    decorCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -40,
        right: -40,
    },
    balanceLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    balanceValue: {
        fontSize: 42,
        fontWeight: 'bold',
        color: WHITE,
        letterSpacing: -0.5,
    },
    balanceCurrency: {
        fontSize: 20,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 8,
        marginBottom: 4,
    },
    withdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: YELLOW,
        borderRadius: 14,
        paddingVertical: 14,
    },
    withdrawText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: NAVY,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: GRAY,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: NAVY,
    },

    // Commission
    commissionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: RED,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    commissionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    commissionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commissionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: NAVY,
        letterSpacing: 0.3,
    },
    commissionSubtitle: {
        fontSize: 11,
        color: GRAY,
        marginTop: 2,
    },
    commissionRight: {
        alignItems: 'flex-end',
    },
    commissionAmount: {
        fontSize: 17,
        fontWeight: 'bold',
        color: RED,
    },
    payableBadge: {
        marginTop: 4,
    },
    payableBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: RED,
        letterSpacing: 0.5,
    },

    // Section card (weekly stats)
    sectionCard: {
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: NAVY,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: GRAY,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '700',
        color: NAVY,
    },

    // Transactions
    txSection: {
        marginBottom: 8,
    },
    emptyTx: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 10,
    },
    emptyTxText: {
        fontSize: 14,
        color: GRAY,
    },
    txCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    txIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    txInfo: {
        flex: 1,
    },
    txName: {
        fontSize: 15,
        fontWeight: '700',
        color: NAVY,
        marginBottom: 3,
    },
    txDate: {
        fontSize: 12,
        color: GRAY,
    },
    txRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    txAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: GREEN,
    },
    completedBadge: {
        backgroundColor: '#F0FDF4',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    completedBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: GREEN,
        letterSpacing: 0.5,
    },
});
