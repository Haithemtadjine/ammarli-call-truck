import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#666666',
};

export default function SuccessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const handleContinue = () => {
        // Navigate forward to GPS permission screen, disabling swipe back
        router.replace('/gps');
    };

    return (
        <View style={styles.container}>
            {/* Main Content Centered */}
            <View style={styles.contentContainer}>
                {/* Large Checkmark Icon in Yellow Circle */}
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={60} color={COLORS.navy} />
                </View>

                {/* Text Content */}
                <Text style={styles.title}>{t('Account Created\nSuccessfully')}</Text>

                <Text style={styles.subtitle}>
                    {t('Your account has been created successfully. You can now start ordering water delivery to your location.')}
                </Text>
            </View>

            {/* Bottom Button */}
            <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>{t('Continue')}</Text>
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
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.yellow,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        paddingHorizontal: 20,
    },
    actionButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 8,
        paddingVertical: 18,
        alignItems: 'center',
        width: '100%',
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
});
