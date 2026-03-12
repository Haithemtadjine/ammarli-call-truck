import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveAppointment } from '../src/utils/storage'; // We will create this next

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderGray: '#F3F4F6',
    background: '#FFFFFF',
};

// Dummy dates for the next 5 days
const getDummyDates = () => {
    const dates = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            id: d.toISOString(),
            dayName: days[d.getDay()],
            dayNumber: d.getDate().toString(),
            monthName: months[d.getMonth()]
        });
    }
    return dates;
};

// Dummy time slots
const timeSlots = [
    { id: '1', time: '08:00 AM - 10:00 AM', isPopular: true },
    { id: '2', time: '10:00 AM - 12:00 PM', isPopular: false },
    { id: '3', time: '01:00 PM - 03:00 PM', isPopular: false },
    { id: '4', time: '04:00 PM - 06:00 PM', isPopular: false },
];

export default function ScheduleDeliveryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const paddingTopWithSafeArea = Math.max(insets.top + 20, 60);
    const { t } = useTranslation();

    const dates = getDummyDates();

    // Default select first items
    const [selectedDate, setSelectedDate] = useState(dates[0].id);
    const [selectedTime, setSelectedTime] = useState(timeSlots[0].id);

    const handleConfirm = async () => {
        // Find the actual date and time strings selected
        const dateObj = dates.find(d => d.id === selectedDate);
        const timeObj = timeSlots.find(t => t.id === selectedTime);

        if (dateObj && timeObj) {
            const appointmentStr = `${dateObj.dayName}, ${dateObj.monthName} ${dateObj.dayNumber} at ${timeObj.time}`;
            await saveAppointment(appointmentStr);
            router.push('/order-confirmation'); // Pushing to the new success screen
        }
    };

    return (
        <View style={[styles.container, { paddingTop: paddingTopWithSafeArea }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('Schedule Delivery')}</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Location Card */}
                <TouchableOpacity style={styles.locationCard} activeOpacity={0.8}>
                    <View style={styles.locationIconContainer}>
                        <Ionicons name="location" size={20} color={COLORS.navy} />
                    </View>
                    <View style={styles.locationTextContainer}>
                        <Text style={styles.locationTitle}>{t('Jumeirah Village Circle, Dubai')}</Text>
                        <Text style={styles.locationSubtitle}>{t('Delivery to your home')}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.navy} />
                </TouchableOpacity>

                {/* Select Date Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{t('Select Date')}</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dateListContainer}
                    >
                        {dates.map((item) => {
                            const isActive = selectedDate === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.dateCard, isActive && styles.dateCardActive]}
                                    onPress={() => setSelectedDate(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.dateDayName, isActive && styles.textWhite]}>{t(item.dayName)}</Text>
                                    <Text style={[styles.dateDayNumber, isActive && styles.textWhite]}>{item.dayNumber}</Text>
                                    <Text style={[styles.dateMonthName, isActive && styles.textWhite]}>{t(item.monthName)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Select Time Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{t('Select Time')}</Text>

                    <View style={styles.timeListContainer}>
                        {timeSlots.map((slot) => {
                            const isActive = selectedTime === slot.id;
                            return (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[styles.timeSlotCard, isActive && styles.timeSlotCardActive]}
                                    onPress={() => setSelectedTime(slot.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.timeSlotLeft}>
                                        <Ionicons
                                            name="time"
                                            size={20}
                                            color={isActive ? COLORS.navy : COLORS.textGray}
                                            style={styles.timeIcon}
                                        />
                                        <View>
                                            <Text style={styles.timeText}>{t(slot.time)}</Text>
                                            {slot.isPopular && (
                                                <Text style={styles.popularText}>{t('Most popular time')}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {isActive && (
                                        <Ionicons name="checkmark-circle" size={24} color={COLORS.yellow} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>{t('Confirm Appointment \u2714\u2714')}</Text>
                    {/* Double check unicode: ✔✔ */}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
        width: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.borderGray, // very faint gray background
        marginHorizontal: 20,
        padding: 18,
        borderRadius: 16,
        marginBottom: 30,
    },
    locationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    locationTextContainer: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
        lineHeight: 20,
    },
    locationSubtitle: {
        fontSize: 13,
        color: COLORS.textGray,
    },
    sectionContainer: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    dateListContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    dateCard: {
        width: 75,
        height: 100,
        backgroundColor: COLORS.borderGray,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderGray,
    },
    dateCardActive: {
        backgroundColor: COLORS.navy,
        borderColor: COLORS.navy,
    },
    dateDayName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 5,
    },
    dateDayNumber: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.navy,
        marginBottom: 5,
    },
    dateMonthName: {
        fontSize: 11,
        color: COLORS.textGray,
    },
    textWhite: {
        color: COLORS.white,
    },
    timeListContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    timeSlotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#F9FAFB',
    },
    timeSlotCardActive: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.yellow,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    timeSlotLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeIcon: {
        marginRight: 15,
    },
    timeText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    popularText: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderGray,
    },
    confirmButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
    }
});
