import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#666666',
    borderLight: '#F3F4F6', // Very faint line
    radioInactive: '#D1D5DB', // Light gray border for empty circle
};

export default function CancelReasonScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const { t } = useTranslation();

    const CANCEL_REASONS = [
        t('Driver is too far'),
        t('Ordered by mistake'),
        t('Driver asked to cancel'),
        t('Long wait time')
    ];

    const handleCancelTrip = () => {
        if (!selectedReason) {
            Alert.alert('Selection Required', 'Please select a reason for cancelling your trip.');
            return;
        }

        Alert.alert(
            'Trip Cancelled',
            'Your request has been cancelled successfully.',
            [
                {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)')
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 40) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Cancel Trip')}</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>{t('Why are you cancelling?')}</Text>
            </View>

            {/* List of Reasons */}
            <View style={styles.listContainer}>
                {CANCEL_REASONS.map((reason, index) => {
                    const isSelected = selectedReason === reason;

                    return (
                        <View key={reason}>
                            <TouchableOpacity
                                style={styles.row}
                                activeOpacity={0.7}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <Text style={styles.rowText}>{reason}</Text>

                                {/* Custom Radio Button */}
                                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Thin divider line, except for the last item */}
                            {index !== CANCEL_REASONS.length - 1 && (
                                <View style={styles.divider} />
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Footer / Action Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.cancelButton, !selectedReason && { opacity: 0.7 }]}
                    onPress={handleCancelTrip}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelButtonText}>{t('CANCEL TRIP')}</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    backButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    titleContainer: {
        paddingHorizontal: 25,
        marginTop: 10,
        marginBottom: 30,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    listContainer: {
        paddingHorizontal: 25,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
    },
    rowText: {
        fontSize: 16,
        color: COLORS.navy,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: COLORS.radioInactive,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    radioOuterSelected: {
        borderColor: COLORS.navy,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.navy,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        width: '100%',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight, // Optional faint border above button area
        backgroundColor: COLORS.white,
    },
    cancelButton: {
        backgroundColor: COLORS.yellow,
        width: '100%',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    }
});

