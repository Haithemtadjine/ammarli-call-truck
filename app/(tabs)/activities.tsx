import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/theme/ThemeContext';

export default function ActivitiesScreen() {
    const { colors } = useTheme();
    const COLORS = {
        ...colors,
        navy: colors.textPrimary,
        yellow: colors.accent,
        white: colors.surface,
        graySubText: colors.textSecondary,
        grayTab: colors.textSecondary,
        grayCircleBg: colors.iconContainer,
        grayBorder: colors.border,
        background: colors.background,
    };
    const styles = getStyles(COLORS);
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('Past');
    const { setPendingRating, pastOrders: storePastOrders } = useAppStore();

    const pastOrders = storePastOrders
        .filter(o => o.status !== 'scheduled')
        .map(o => ({
            id: String(o.id),
            type: o.waterType ? `${t(o.waterType)} - ${o.quantity || 'Bulk'}` : t('Water Delivery'),
            date: o.orderTime || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: o.price ? `${o.price} DA` : t('Paid'),
        })).reverse();

    const upcomingOrders = storePastOrders
        .filter(o => o.status === 'scheduled')
        .map(o => ({
            id: String(o.id),
            type: o.waterType ? `${t(o.waterType)} - ${o.quantity || 'Bulk'}` : t('Water Delivery'),
            date: o.schedulingInfo ? `${o.schedulingInfo.date} ${o.schedulingInfo.time}` : t('Scheduled'),
            price: o.price ? `${o.price} DA` : t('Pending'),
        })).reverse();

    const displayOrders = activeTab === 'Past' ? pastOrders : upcomingOrders;

    return (
        <SafeAreaView style={styles.container}>
            {/* Main Header Area */}
            <View style={[styles.headerContainer, { paddingTop: 20 }]}>
                <Text style={styles.headerTitle}>{t('My Activities')}</Text>

                {/* Custom Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Past' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Past')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>
                            {t('Past')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Upcoming' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Upcoming')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
                            {t('Upcoming')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Scrollable List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {displayOrders.length > 0 ? (
                    displayOrders.map((order) => (
                        <View key={order.id} style={styles.cardContainer}>
                            {/* Left: Icon */}
                            <View style={styles.cardLeft}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="car" size={20} color={COLORS.navy} />
                                </View>
                            </View>

                            {/* Middle: Text Stack */}
                            <View style={styles.cardMiddle}>
                                <Text style={styles.cardType}>{order.type}</Text>
                                <Text style={styles.cardDate}>{order.date}</Text>
                                <Text style={styles.cardPrice}>{order.price}</Text>
                            </View>

                            {/* Right: Pill Button */}
                            <View style={styles.cardRight}>
                                <TouchableOpacity 
                                    style={[styles.reorderButton, { marginBottom: 8, backgroundColor: COLORS.grayCircleBg, borderWidth: 1, borderColor: COLORS.grayBorder }]} 
                                    activeOpacity={0.8}
                                    onPress={() => setPendingRating(true)}
                                >
                                    <Text style={[styles.reorderButtonText, { color: COLORS.navy }]}>{t('Rate')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.reorderButton} activeOpacity={0.8}>
                                    <Text style={styles.reorderButtonText}>{t('REORDER')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('No upcoming activities')}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        backgroundColor: COLORS.background,
        // The bottom border of the header is drawn by the tabs container below
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 30, // spacing between title and tabs
        letterSpacing: -0.5,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayBorder,
    },
    tabButton: {
        flex: 1,
        paddingBottom: 15,
        alignItems: 'center',
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.navy,
    },
    tabText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.grayTab,
    },
    activeTabText: {
        color: COLORS.navy,
    },
    scrollView: {
        flex: 1,
        backgroundColor: COLORS.background, // VERY faint off-white to make white cards pop softly
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        gap: 15, // spacing between cards
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2, // for android subtle shadow
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)', // super subtle border as fallback
    },
    cardLeft: {
        marginRight: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.grayCircleBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardMiddle: {
        flex: 1,
        justifyContent: 'center',
    },
    cardType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 13,
        color: COLORS.graySubText,
        marginBottom: 8,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.navy,
    },
    cardRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    reorderButton: {
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // pill shape
    },
    reorderButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003366', // explicit hex color for visibility on yellow
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.graySubText,
    }
});
