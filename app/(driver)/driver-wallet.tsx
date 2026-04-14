import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

const { width } = Dimensions.get('window');

// Colors matching the mockup
const BG = '#F5F7FA';
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const RED_ICON = '#FF4D4D';
const GREEN_ICON = '#4CAF50';
const WHITE = '#FFFFFF';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F3F4F6';

function WeeklyBarChart() {
    const weeklyStats = useAppStore((state) => state.weeklyStats);
    
    // Find the max value to scale heights dynamically
    const maxAmount = Math.max(...weeklyStats.map(s => s.amount), 1); // fallback to 1 to avoid div by 0

    // Today's index to color yellow
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return (
        <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
                Weekly Stats 
                <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '400' }}>     Last 7 Days</Text>
            </Text>
            
            <View style={styles.chartContainer}>
                {weeklyStats.map((stat, idx) => {
                    // Logic for dynamic bar heights (Max height = 120px)
                    const heightPct = (stat.amount / maxAmount) * 120;
                    const finalHeight = Math.max(heightPct, 30); // Minimum 30px height so we see something

                    // Strict colors requirement
                    let barColor = '#E5E7EB'; // Default future/unworked days light gray
                    if (idx === todayIndex) {
                        barColor = YELLOW;
                    } else if (idx < todayIndex && stat.amount === 0) {
                        barColor = '#FEF2F2'; // light gray for empty past days (or #FF4D4D if strict)
                    } else if (idx < todayIndex && stat.amount > 3000) {
                        barColor = '#D1FAE5'; // light green
                    } else if (idx < todayIndex && stat.amount > 0 && stat.amount <= 3000) {
                        barColor = '#E2E8F0'; // light gray-blue
                    }

                    return (
                        <View key={stat.day} style={styles.barColumn}>
                            <View style={[styles.bar, { height: finalHeight, backgroundColor: barColor }]} />
                            <Text style={styles.barLabel}>{stat.day}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export default function DriverWalletScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // Global State Selectors
    const totalEarnings = useAppStore(s => s.totalEarnings);
    const completedTrips = useAppStore(s => s.completedTrips);
    const rating = useAppStore(s => s.driverRating);
    const appCommission = useAppStore(s => s.appCommission);
    const transactions = useAppStore(s => s.transactions);

    return (
        <View style={[styles.root, { paddingTop: Math.max(insets.top, STATUSBAR_HEIGHT) }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Earnings</Text>
                <TouchableOpacity style={styles.helpBtn}>
                    <Ionicons name="help" size={18} color={WHITE} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View style={[styles.balanceCard, { overflow: 'hidden' }]}>
                    {/* Decorative Circle from mockup */}
                    <View style={styles.decorCircle} />
                    
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceAmount}>{totalEarnings.toLocaleString()}</Text>
                        <Text style={styles.balanceCurrency}> DA</Text>
                    </View>

                    <TouchableOpacity style={styles.withdrawBtn}>
                        <Ionicons name="wallet-outline" size={20} color={NAVY} style={{ marginRight: 8 }} />
                        <Text style={styles.withdrawText}>Withdraw Funds</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Ionicons name="car" size={18} color={NAVY} />
                        </View>
                        <Text style={styles.statLabel}>TOTAL TRIPS</Text>
                        <Text style={styles.statValue}>{completedTrips}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEF9C3' }]}>
                            <Ionicons name="star" size={18} color="#EAB308" />
                        </View>
                        <Text style={styles.statLabel}>RATING</Text>
                        <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
                    </View>
                </View>

                {/* Commission Card */}
                <View style={styles.commissionCard}>
                    {/* Left Decorative edge */}
                    <View style={styles.commissionRedEdge} />
                    <View style={styles.commissionContent}>
                        <View style={styles.commissionIconBox}>
                            <Ionicons name="cash-outline" size={22} color={RED_ICON} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.commissionTitle}>APP COMMISSION</Text>
                            <Text style={styles.commissionSub}>المبالغ المستحقة للتطبيق</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.commissionTotal}>{appCommission.toLocaleString()} DA</Text>
                            <View style={styles.payableBadge}>
                                <View style={styles.payableDot} />
                                <Text style={styles.payableText}>PAYABLE</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bar Graph Component */}
                <WeeklyBarChart />

                {/* Transactions Header */}
                <View style={styles.txHeaderRow}>
                    <Text style={styles.txHeader}>Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text style={styles.txSeeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                {transactions.map((tx) => (
                    <View key={tx.id} style={styles.txCard}>
                        <View style={styles.txIconBox}>
                            <Ionicons name="add-circle" size={24} color={GREEN_ICON} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.txName}>{tx.customerName}</Text>
                            <Text style={styles.txDate}>{tx.date}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.txAmount}>+{tx.amount.toLocaleString()} DA</Text>
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>COMPLETED</Text>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { paddingHorizontal: 20 },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 44, height: 44,
        borderRadius: 12,
        backgroundColor: WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: NAVY },
    helpBtn: {
        width: 28, height: 28,
        borderRadius: 14,
        backgroundColor: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Navy Balance Card
    balanceCard: {
        backgroundColor: NAVY,
        borderRadius: 24,
        padding: 24,
        marginTop: 10,
        position: 'relative',
        shadowColor: NAVY, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10,
    },
    decorCircle: {
        position: 'absolute',
        top: -30, right: -40,
        width: 150, height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.06)'
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 },
    balanceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
    balanceAmount: { fontSize: 36, fontWeight: 'bold', color: WHITE },
    balanceCurrency: { fontSize: 16, fontWeight: 'bold', color: YELLOW },
    withdrawBtn: {
        backgroundColor: YELLOW,
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    withdrawText: { fontSize: 16, fontWeight: 'bold', color: NAVY },

    // Stats Row
    statsRow: { flexDirection: 'row', gap: 14, marginTop: 20 },
    statBox: {
        flex: 1, backgroundColor: WHITE, borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    statLabel: { fontSize: 11, color: GRAY, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    statValue: { fontSize: 26, fontWeight: 'bold', color: NAVY },

    // Commission Card
    commissionCard: {
        backgroundColor: WHITE,
        borderRadius: 24,
        marginTop: 20,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2,
    },
    commissionRedEdge: { width: 5, backgroundColor: '#FECACA' },
    commissionContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 20 },
    commissionIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
    commissionTitle: { fontSize: 13, fontWeight: 'bold', color: NAVY, letterSpacing: 0.5 },
    commissionSub: { fontSize: 11, color: GRAY, marginTop: 4 },
    commissionTotal: { fontSize: 20, fontWeight: 'bold', color: RED_ICON },
    payableBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'center' },
    payableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RED_ICON, marginRight: 6 },
    payableText: { fontSize: 11, fontWeight: '700', color: RED_ICON, letterSpacing: 0.5 },

    // Chart
    chartCard: {
        backgroundColor: WHITE, borderRadius: 24, padding: 24, marginTop: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    chartTitle: { fontSize: 18, fontWeight: 'bold', color: NAVY, marginBottom: 20, flexDirection: 'row' },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingHorizontal: 5 },
    barColumn: { alignItems: 'center', width: '12%', borderTopEndRadius: 10 },
    bar: { width: '100%', borderRadius: 10, marginBottom: 12 },
    barLabel: { fontSize: 11, color: GRAY, fontWeight: '700' },

    // Transactions Header
    txHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 18 },
    txHeader: { fontSize: 18, fontWeight: 'bold', color: NAVY },
    txSeeAll: { fontSize: 14, fontWeight: 'bold', color: '#6366F1' },

    // Transaction List
    txCard: {
        flexDirection: 'row', backgroundColor: WHITE, borderRadius: 24, padding: 18, alignItems: 'center', marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
    },
    txIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
    txName: { fontSize: 16, fontWeight: 'bold', color: NAVY },
    txDate: { fontSize: 13, color: GRAY, marginTop: 4 },
    txAmount: { fontSize: 16, fontWeight: 'bold', color: GREEN_ICON },
    completedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 6 },
    completedBadgeText: { fontSize: 10, fontWeight: '900', color: '#166534', letterSpacing: 0.5 },
});
