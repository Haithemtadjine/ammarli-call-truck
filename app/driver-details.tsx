import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

export default function DriverDetailsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { driver } = useAppStore();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Text style={styles.text}>{t('Driver Found!')}: {driver?.name}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.btn}>
                <Text style={styles.btnText}>{t('Back to Home')}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 20 },
    btn: { backgroundColor: '#F3CD0D', padding: 15, borderRadius: 10 },
    btnText: { color: '#003366', fontWeight: 'bold' }
});
