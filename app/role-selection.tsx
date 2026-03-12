import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                {/* Icon/Logo Placeholder */}
                <View style={styles.iconContainer}>
                    <Ionicons name="water" size={80} color="#003366" />
                </View>

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{t('roleSelectionTitle')}</Text>
                    <Text style={styles.subtitle}>{t('roleSelectionSubtitle')}</Text>
                    <Text style={styles.subtitleArabic}>مرحباً بك في عمارلي، اختر دورك للمتابعة</Text>
                </View>

                {/* Buttons Section */}
                <View style={styles.buttonContainer}>
                    {/* Customer Button */}
                    <TouchableOpacity
                        style={[styles.roleButton, styles.customerButton]}
                        onPress={() => router.push('/login')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="cart" size={32} color="#003366" style={styles.buttonIcon} />
                        <Text style={styles.customerButtonText}>{t('customerButton')}</Text>
                    </TouchableOpacity>

                    {/* Driver Button */}
                    <TouchableOpacity
                        style={[styles.roleButton, styles.driverButton]}
                        onPress={() => router.push('/driver-login')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="bus" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                        <Text style={styles.driverButtonText}>{t('driverButton')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Footer Branding */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Ammarli Premium Service • 2024</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F3F4F6',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitleArabic: {
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    roleButton: {
        width: '100%',
        height: 100,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonIcon: {
        marginRight: 15,
    },
    customerButton: {
        backgroundColor: '#F3CD0D', // Yellow
    },
    customerButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#003366', // Navy
    },
    driverButton: {
        backgroundColor: '#003366', // Navy
    },
    driverButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF', // White
    },
    footer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        letterSpacing: 1,
    }
});
