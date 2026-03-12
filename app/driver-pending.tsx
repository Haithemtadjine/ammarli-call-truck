import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverPendingScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="time-outline" size={80} color="#F3CD0D" />
                </View>

                <Text style={styles.title}>{t('Account Created!')}</Text>

                <View style={styles.messageBox}>
                    <Text style={styles.message}>
                        {t('We will contact you soon to verify your truck.')}
                    </Text>
                    <Text style={styles.messageArabic}>
                        تم تسجيل حسابك، سنتصل بك قريباً للتحقق من شاحنتك.
                    </Text>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color="#003366" />
                    <Text style={styles.infoText}>
                        {t('This process usually takes 24-48 hours. Keep your phone reachable.')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/driver-login')}
                >
                    <Text style={styles.buttonText}>{t('Back to Login')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Ammarli Driver Support • support@ammarli.dz</Text>
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
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#003366',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 20,
        textAlign: 'center',
    },
    messageBox: {
        alignItems: 'center',
        marginBottom: 30,
    },
    message: {
        fontSize: 18,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 26,
    },
    messageArabic: {
        fontSize: 18,
        color: '#4B5563',
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 10,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#003366',
        marginLeft: 12,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#F3CD0D',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366',
    },
    footer: {
        paddingBottom: 25,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    }
});
