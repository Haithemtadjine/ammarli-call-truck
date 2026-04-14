import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Marker, UrlTile } from '../components/MapComponent';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/theme/ThemeContext';

export default function ScheduleDeliveryScreen() {
    const { colors } = useTheme();
    const COLORS = {
        navy: '#002952',
        yellow: '#F3CD0D',
        white: '#FFFFFF',
        textGray: '#6B7280',
        borderGray: '#F1F5F9',
        lightBg: '#F8FAFC',
        green: '#10B981',
    };

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { draftOrder, activeOrder } = useAppStore();

    // Local State for Pickers (Reformulated as per user request)
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Local State for Switches
    const [isFavorite, setIsFavorite] = useState(false);
    const [isDraft, setIsDraft] = useState(false);

    const { scheduleOrder, addToFavorites, saveToDrafts, addNotification } = useAppStore();
    const location = useAppStore(state => state.draftOrder?.location);

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (d: Date) => {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Determine Order Summary
    const renderOrderSummary = () => {
        const cart = draftOrder.bottledWaterCart;
        const tanker = draftOrder.tankerDetails;

        let summary = '';
        let icon = 'water';
        
        // Check bottled water cart first
        const cartEntries = Object.entries(cart).filter(([_, sizes]) => 
            sizes.small > 0 || sizes.medium > 0 || sizes.large > 0
        );

        if (cartEntries.length > 0) {
            const parts: string[] = [];
            cartEntries.forEach(([brand, sizes]) => {
                if (sizes.small > 0) parts.push(`${brand} 0.5L x${sizes.small}`);
                if (sizes.medium > 0) parts.push(`${brand} 1.5L x${sizes.medium}`);
                if (sizes.large > 0) parts.push(`${brand} 5L x${sizes.large}`);
            });
            summary = parts.join(', ');
            icon = 'bottle-wine-outline';
        } else if (tanker.quantity > 0) {
            summary = `${tanker.quantity}L ${t('Tanker Delivery')}`;
            icon = 'truck-outline';
        } else {
            summary = t('Standard Delivery');
        }

        return { summary, icon };
    };

    const { summary, icon } = renderOrderSummary();
    const userAddress = location?.address || 'العنوان غير محدد';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Save Order')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Order Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconBox}>
                        <MaterialCommunityIcons name={icon as any} size={28} color={COLORS.navy} />
                    </View>
                    <View style={styles.summaryInfo}>
                        <View style={styles.summaryTitleRow}>
                            <Text style={styles.summaryLabel}>{t('ORDER SUMMARY')}</Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.editLink}>{t('Edit Items')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.summaryText} numberOfLines={1}>{summary}</Text>
                    </View>
                    <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedText}>{t('CONFIRMED')}</Text>
                    </View>
                </View>

                {/* 2. Scheduling Options */}
                <Text style={styles.sectionTitle}>{t('Schedule Delivery')}</Text>
                <View style={styles.chipsRow}>
                    <TouchableOpacity 
                        style={styles.pickerBtn} 
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={20} color={COLORS.navy} style={{ marginRight: 8 }} />
                        <Text style={styles.pickerBtnText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.pickerBtn} 
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="time-outline" size={20} color={COLORS.navy} style={{ marginRight: 8 }} />
                        <Text style={styles.pickerBtnText}>{formatTime(selectedDate)}</Text>
                    </TouchableOpacity>
                </View>


                {/* 3. Extra Save Options */}
                <View style={styles.optionsContainer}>
                    <View style={styles.optionCard}>
                        <View style={styles.optionIconBox}>
                            <Ionicons name="heart-outline" size={24} color={COLORS.navy} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('Add to Favorites')}</Text>
                            <Text style={styles.optionSub}>{t('Quick re-order later')}</Text>
                        </View>
                        <Switch 
                            value={isFavorite} 
                            onValueChange={setIsFavorite}
                            trackColor={{ false: '#CBD5E1', true: COLORS.yellow }}
                            thumbColor={COLORS.white}
                        />
                    </View>

                    <View style={styles.optionCard}>
                        <View style={styles.optionIconBox}>
                            <Ionicons name="document-text-outline" size={24} color={COLORS.navy} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('Save as Draft')}</Text>
                            <Text style={styles.optionSub}>{t('Finish order later')}</Text>
                        </View>
                        <Switch 
                            value={isDraft} 
                            onValueChange={setIsDraft}
                            trackColor={{ false: '#CBD5E1', true: COLORS.yellow }}
                            thumbColor={COLORS.white}
                        />
                    </View>
                </View>

                {/* 4. Delivery Location Map */}
                <Text style={styles.sectionTitle}>{t('Delivery Location')}</Text>
                <View style={styles.mapContainer}>
    <MapView
                        style={styles.map}
                        mapType="none"
                        region={{
                            // ?? (nullish) not || so that latitude === 0 (equator) is preserved
                            latitude: Number(location?.latitude ?? 36.7528),
                            longitude: Number(location?.longitude ?? 3.0420),
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        scrollEnabled={false}
                        rotateEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                    >
                        <Marker coordinate={{
                            latitude: Number(location?.latitude ?? 36.7528),
                            longitude: Number(location?.longitude ?? 3.0420),
                        }}>
                            <View style={styles.userMarker}>
                                <View style={styles.markerInner} />
                            </View>
                        </Marker>
                        <UrlTile
                            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maximumZ={19}
                            flipY={false}
                        />
                    </MapView>
                    <View style={styles.addressBar}>
                        <Ionicons name="home" size={16} color={COLORS.navy} />
                        <Text style={styles.addressText} numberOfLines={1}>{userAddress}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity 
                    style={styles.mainBtn} 
                    onPress={() => {
                        const order = {
                            ...(activeOrder || {}),
                            id: Date.now(),
                            status: 'scheduled',
                            orderSummary: summary,
                        };
                        
                        scheduleOrder(order as any, formatDate(selectedDate), formatTime(selectedDate));
                        
                        addNotification({
                            title: 'Scheduled Order Reminder',
                            description: `Your scheduled order for ${formatDate(selectedDate)} at ${formatTime(selectedDate)} is confirmed.`,
                            type: 'schedule'
                        });

                        if (isFavorite) {
                            addToFavorites(order as any);
                        }
                        
                        router.push({
                            pathname: '/delivery-completed',
                            params: { isScheduled: 'true' }
                        });
                    }}
                >
                    <Ionicons name="time-outline" size={22} color={COLORS.navy} style={{ marginRight: 10 }} />
                    <Text style={styles.mainBtnText}>{t('CONFIRM SCHEDULE')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.secondaryBtn}
                    onPress={() => {
                        saveToDrafts(activeOrder || ({} as any));
                        addNotification({
                            title: 'Order Saved Successfully',
                            description: 'Your order has been saved successfully in your drafts.',
                            type: 'order'
                        });
                        alert(t('Order saved to drafts'));
                        router.replace('/(tabs)');
                    }}
                >
                    <Text style={styles.secondaryBtnText}>{t('Save to Drafts')}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker 
                    value={selectedDate} 
                    mode="date" 
                    onChange={(event, date) => { 
                        setShowDatePicker(false); 
                        if(date) setSelectedDate(date); 
                    }} 
                />
            )}
            {showTimePicker && (
                <DateTimePicker 
                    value={selectedDate} 
                    mode="time" 
                    onChange={(event, date) => { 
                        setShowTimePicker(false); 
                        if(date) setSelectedDate(date); 
                    }} 
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#002952',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryIconBox: {
        width: 54,
        height: 54,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    editLink: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#F3CD0D',
        textDecorationLine: 'underline',
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#002952',
    },
    confirmedBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    confirmedText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#10B981',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#002952',
        marginBottom: 15,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    pickerBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    pickerBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#002952',
    },
    chip: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chipActive: {
        backgroundColor: '#002952',
        borderColor: '#002952',
    },
    chipText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    recurringBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 25,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    optionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#002952',
    },
    optionSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    mapContainer: {
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    userMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 41, 82, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#002952',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    addressBar: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressText: {
        fontSize: 12,
        color: '#002952',
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    footer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    mainBtn: {
        backgroundColor: '#F3CD0D',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        marginBottom: 10,
        shadowColor: '#F3CD0D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    mainBtnText: {
        color: '#002952',
        fontSize: 16,
        fontWeight: '900',
    },
    secondaryBtn: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
