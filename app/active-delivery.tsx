import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
};

export default function ActiveDeliveryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Animation value for pulsing effect
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [pulseAnim]);

    const handleEndOrder = () => {
        router.push('/delivery-completed' as any);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 50) }]}>
                <Text style={styles.headerTitle}>{t('Delivery in Progress')}</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="water" size={100} color={COLORS.navy} />
                </Animated.View>

                <Text style={styles.pumpingText}>{t('Pumping water...')}</Text>
            </View>

            {/* Bottom Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 10, 30) }]}>
                <TouchableOpacity style={styles.submitButton} onPress={handleEndOrder} activeOpacity={0.8}>
                    <Text style={styles.submitButtonText}>{t('END ORDER')}</Text>
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
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: COLORS.navy,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    pumpingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    footer: {
        paddingHorizontal: 20,
    },
    submitButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    }
});
