import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingModal from '../../components/RatingModal';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/theme/ThemeContext';

export default function MainDashboardScreen() {
    const { colors } = useTheme();
    const COLORS = {
        ...colors,
        navy: colors.textPrimary,
        white: '#FFFFFF',
        yellow: colors.accent,
        red: '#EF4444',
        blueGradientStart: '#004080',
        blueGradientEnd: '#002244',
    };
    const styles = getStyles(COLORS);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Zustand Data
    const { userProfile, activeOrder, cancelOrder, updateOrder } = useAppStore();
    const userName = userProfile?.name || 'Guest';
    const hasScheduledOrder = activeOrder !== null;

    return (
        <View style={styles.container}>
            <RatingModal />
            <ScrollView
                contentContainerStyle={{ paddingTop: Math.max(insets.top, 20), paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Sequence */}
                <View style={styles.headerRow}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.greetingText}>{t('Hello')}, {userName} 👋</Text>
                            <Text style={styles.subGreetingText}>{t('Ready for a refill?')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.bellButton}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications" size={24} color={COLORS.navy} />
                    </TouchableOpacity>
                </View>

                {/* Scheduled Reminder Pill (Moved Above Hero Banner) */}
                {hasScheduledOrder && (
                    <View style={styles.reminderPill}>
                        <View style={styles.reminderIconBox}>
                            <Ionicons name="calendar-outline" size={22} color={COLORS.navy} />
                        </View>
                        <Text style={styles.reminderText}>
                            {t('Reminder:')} 3000L{'\n'}{t('Delivery for')}{'\n'}{t('Tomorrow at')} 10:00{'\n'}AM
                        </Text>
                        <TouchableOpacity style={styles.actionBtnCancel} onPress={cancelOrder}>
                            <Text style={styles.cancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtnEdit}
                            onPress={() => {
                                // Placeholder for backend update logic
                                updateOrder({ ...activeOrder!, status: 'updated' });
                                router.push('/tank-details');
                            }}
                        >
                            <Ionicons name="pencil" size={12} color={COLORS.navy} style={{ marginRight: 4 }} />
                            <Text style={styles.editText}>{t('Edit')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Hero Banner */}
                <LinearGradient
                    colors={[COLORS.blueGradientStart, COLORS.blueGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroBanner}
                >
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{t('Pure Water,\nDelivered Fast. 💧')}</Text>
                        <TouchableOpacity
                            style={styles.orderNowBtn}
                            onPress={() => router.push('/tank-details')}
                        >
                            <Text style={styles.orderNowText}>{t('Order Now')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Ionicons name="water" size={120} color="rgba(255,255,255,0.05)" style={styles.heroBgIcon} />
                </LinearGradient>

                {/* Selection Section */}
                <Text style={styles.sectionTitle}>{t('Select Water Source')}</Text>

                {/* 2x2 Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        <ServiceCard
                            title={t('Spring Water')}
                            customImage={require('../../assets/images/spring-water-icon.png')}
                            onPress={() => {
                                updateOrder({ id: Date.now(), type: 'Spring Water', waterType: 'Spring Water', status: 'pending' });
                                router.push('/tank-details');
                            }}
                        />
                        <ServiceCard
                            title={t('Well Water')}
                            customImage={require('../../assets/images/well-water-icon.png')}
                            onPress={() => {
                                updateOrder({ id: Date.now(), type: 'Well Water', waterType: 'Well Water', status: 'pending' });
                                router.push('/tank-details');
                            }}
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <ServiceCard
                            title={t('Ashghal')}
                            customImage={require('../../assets/images/ashghal-icon.png')}
                            onPress={() => {
                                updateOrder({ id: Date.now(), type: 'Ashghal', waterType: 'Ashghal', status: 'pending' });
                                router.push('/tank-details');
                            }}
                        />
                        <ServiceCard
                            title={t('Bottled Water')}
                            icon="water-outline"
                            iconFamily="Ionicons"
                            onPress={() => {
                                updateOrder({ id: Date.now(), type: 'Bottled Water', waterType: 'Bottled Water', status: 'pending' });
                                router.push('/bottled-water-details' as any);
                            }}
                        />
                    </View>
                </View>

                {/* Recent Orders Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{t('Recent Orders')}</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>{t('See All')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentOrdersScroll}>
                    <View style={styles.recentOrderCard}>
                        <View style={styles.recentOrderIcon}>
                            <MaterialCommunityIcons name="history" size={20} color={COLORS.navy} />
                        </View>
                        <View style={styles.recentOrderInfo}>
                            <Text style={styles.recentOrderTitle}>{t('5000L Well Water')}</Text>
                            <Text style={styles.recentOrderDate}>{t('2 days ago')}</Text>
                        </View>
                        <TouchableOpacity style={styles.reorderBtn}>
                            <Ionicons name="refresh" size={16} color={COLORS.navy} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.recentOrderCard}>
                        <View style={styles.recentOrderIcon}>
                            <MaterialCommunityIcons name="history" size={20} color={COLORS.navy} />
                        </View>
                        <View style={styles.recentOrderInfo}>
                            <Text style={styles.recentOrderTitle}>{t('3000L Spring Water')}</Text>
                            <Text style={styles.recentOrderDate}>{t('1 week ago')}</Text>
                        </View>
                        <TouchableOpacity style={styles.reorderBtn}>
                            <Ionicons name="refresh" size={16} color={COLORS.navy} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </ScrollView>
        </View>
    );
}

function ServiceCard({ title, icon, iconFamily, customImage, onPress }: any) {
    const { colors } = useTheme();
    const COLORS = {
        ...colors,
        navy: colors.textPrimary,
        white: '#FFFFFF',
        yellow: colors.accent,
        red: '#EF4444',
        blueGradientStart: '#004080',
        blueGradientEnd: '#002244',
    };
    const styles = getStyles(COLORS);
    const IconComponent: any = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    if (customImage) {
        return (
            <TouchableOpacity style={[styles.serviceCard, { paddingVertical: 15 }]} onPress={onPress} activeOpacity={0.8}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Image
                        source={customImage}
                        style={{ width: 60, height: 60, marginBottom: 12 }}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.serviceTitle}>{title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.iconCircleBg}>
                <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.iconGradient}
                >
                    <IconComponent name={icon} size={28} color={'#FFFFFF'} />
                    {/* Tiny yellow sparkle accent component matching the design */}
                    <View style={styles.sparkleAccent} />
                </LinearGradient>
            </View>
            <Text style={styles.serviceTitle}>{title}</Text>
        </TouchableOpacity>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E6A88F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    greetingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subGreetingText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    bellButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    heroBanner: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 20,
    },
    heroContent: {
        zIndex: 2,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF', // Heroes usually stay white even in dark mode for contrast over gradients
        lineHeight: 32,
        marginBottom: 20,
    },
    orderNowBtn: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    orderNowText: {
        color: '#003366', // Keep explicitly navy for the yellow button contrast
        fontWeight: 'bold',
        fontSize: 14,
    },
    heroBgIcon: {
        position: 'absolute',
        right: -20,
        bottom: -30,
        zIndex: 1,
    },
    reminderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.iconContainer,
        marginHorizontal: 20,
        padding: 16,
        paddingVertical: 18,
        borderRadius: 40,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reminderIconBox: {
        marginRight: 10,
    },
    reminderText: {
        flex: 1,
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    actionBtnCancel: {
        paddingHorizontal: 8,
        marginRight: 8,
    },
    cancelText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
    actionBtnEdit: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    editText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    gridContainer: {
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    serviceCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingVertical: 25,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconCircleBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F8FF', // Light blue background behind gradient
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    sparkleAccent: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.accent,
        borderWidth: 1,
        borderColor: COLORS.surface,
        borderStyle: 'solid',
    },
    serviceTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 20,
        marginBottom: 15,
    },
    seeAllText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    recentOrdersScroll: {
        paddingHorizontal: 20,
    },
    recentOrderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 20,
        marginRight: 15,
        minWidth: 260,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recentOrderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.iconContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recentOrderTitle: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontSize: 14,
        marginBottom: 4,
    },
    recentOrderInfo: {
        flex: 1,
    },
    recentOrderDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    reorderBtn: {
        backgroundColor: COLORS.accent,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
