import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriverBottomNav from '../src/components/DriverBottomNav';
import { useAppStore, PastTrip } from '../src/store/useAppStore';

// ─── Theme ───────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY = '#8A94A8';
const BORDER = '#EAEDF2';
const GREEN_BG = '#E8F6F1';
const GREEN_TEXT = '#10B981';
const RED_BG = '#FEF2F2';
const RED_TEXT = '#EF4444';
const ICON_BG = '#FEF9E3';

// ─── Trip Card Component ──────────────────────────────────────────────────────
function TripCard({ trip }: { trip: PastTrip }) {
    const isCompleted = trip.status === 'Completed';

    return (
        <View style={styles.card}>
            {/* Top Row: Date & Status */}
            <View style={styles.cardHeader}>
                <Text style={styles.dateTimeText}>
                    {trip.date} • {trip.time}
                </Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: isCompleted ? GREEN_BG : RED_BG },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            { color: isCompleted ? GREEN_TEXT : RED_TEXT },
                        ]}
                    >
                        {trip.status}
                    </Text>
                </View>
            </View>

            {/* Middle: Order Summary & Customer */}
            <View style={styles.cardMiddle}>
                <Text style={styles.orderSummary}>{trip.orderSummary}</Text>
                <View style={styles.customerRow}>
                    <Ionicons name="person" size={12} color={GRAY} />
                    <Text style={styles.customerName}>{trip.customerName}</Text>
                </View>
            </View>

            {/* Bottom Row: Delivery Type & Price */}
            <View style={styles.cardFooter}>
                <View style={styles.deliveryInfo}>
                    <View style={styles.truckIconWrap}>
                        <Ionicons name="bus" size={14} color={NAVY} />
                    </View>
                    <Text style={styles.deliveryTypeText}>{trip.deliveryType}</Text>
                </View>
                <Text style={styles.priceText}>
                    {trip.amount.toFixed(2)} DA
                </Text>
            </View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function DriverTripsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Past' | 'Scheduled'>('Past');

    const pastTrips = useAppStore((s) => s.pastTrips);

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trips History</Text>
                <View style={{ width: 40 }} /> {/* Spacer for balance */}
            </View>

            {/* ── Tabs ── */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
                    onPress={() => setActiveTab('Past')}
                >
                    <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>
                        Past
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Scheduled' && styles.activeTab]}
                    onPress={() => setActiveTab('Scheduled')}
                >
                    <Text style={[styles.tabText, activeTab === 'Scheduled' && styles.activeTabText]}>
                        Scheduled
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── List ── */}
            <FlatList
                data={activeTab === 'Past' ? pastTrips : []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <TripCard trip={item} />}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 100 },
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color={GRAY} />
                        <Text style={styles.emptyText}>No trips found</Text>
                    </View>
                }
            />

            <DriverBottomNav activeTab="trips" />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: WHITE,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
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

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    tab: {
        paddingVertical: 14,
        marginRight: 24,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: NAVY,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: GRAY,
    },
    activeTabText: {
        color: NAVY,
        fontWeight: 'bold',
    },

    // List
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FAFAFA',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateTimeText: {
        fontSize: 11,
        fontWeight: '700',
        color: GRAY,
        letterSpacing: 0.5,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    cardMiddle: {
        marginBottom: 16,
    },
    orderSummary: {
        fontSize: 20,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 6,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    customerName: {
        fontSize: 13,
        fontWeight: '500',
        color: GRAY,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    truckIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: ICON_BG,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deliveryTypeText: {
        fontSize: 13,
        color: GRAY,
        fontWeight: '600',
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: NAVY,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: GRAY,
        fontWeight: '500',
    },
});
