import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'true');
            router.push('/role-selection');
        } catch (error) {
            console.error('Error saving onboard state:', error);
            router.push('/role-selection');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Navy Section */}
            <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
                {/* Logo Image Placeholder */}
                <Image
                    // Using logo from assets, fallback logic usually is needed but this is a placeholder per prompt
                    source={require('../assets/images/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.brandTitle}>Ammarli</Text>
                <Text style={styles.brandSubtitle}>{t("Pure Water,\nDelivered Fast. 💧").replace('\n', ' ').replace(' 💧', '')}</Text>
            </View>

            {/* Bottom White Container */}
            <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.textContent}>
                    <Text style={styles.title}>{t('Welcome to Ammarli!')}</Text>
                    <Text style={styles.subtitle}>
                        {t('The easiest way to order fresh water for your home in Algeria.')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={handleGetStarted}
                >
                    <Text style={styles.buttonText}>{t('Get Started')}</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    {t('SUPPORTING TRADITIONAL WELLS AND MODERN TANKERS')}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366', // Brand Navy
    },
    topSection: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    brandSubtitle: {
        fontSize: 16,
        color: '#F3CD0D', // Yellow/Gold from the image
        textAlign: 'center',
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
        // Slight shadow to separate from background
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    textContent: {
        alignItems: 'center',
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#003366', // Navy
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280', // Blue-gray
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#F3CD0D', // Yellow
        width: '100%',
        paddingVertical: 18,
        borderRadius: 30, // Pill shape
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366', // Navy
    },
    footerText: {
        fontSize: 10,
        color: '#9CA3AF', // Tiny Gray
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    }
});
