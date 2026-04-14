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
    lightBlueBg: '#F0F4F8',
};

export default function NoDriverFoundScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const handleBackHome = () => {
        router.push('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Container */}
            <View style={styles.modalCard}>

                {/* Truck Icon Circle */}
                <View style={styles.iconCircle}>
                    <Ionicons name="bus" size={40} color={COLORS.navy} style={styles.icon} />
                </View>

                {/* Typography */}
                <Text style={styles.title}>{t('No Drivers Nearby')}</Text>
                <Text style={styles.subtitle}>
                    {t('Sorry, there are no water trucks available in your area at the moment. Please try again in a few minutes.')}
                </Text>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={handleBackHome}
                    activeOpacity={0.8}
                >
                    <Text style={styles.homeButtonText}>{t('Back to Home')}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.25)', // Semi-transparent overlay to simulate blurred map
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.lightBlueBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    icon: {
        marginLeft: 4, // slight visual center adjustment for the bus icon
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.navy,
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
        marginBottom: 35,
    },
    homeButton: {
        backgroundColor: COLORS.yellow,
        width: '100%',
        paddingVertical: 18,
        borderRadius: 12, // softer pill/rounded rectangle
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    }
});
