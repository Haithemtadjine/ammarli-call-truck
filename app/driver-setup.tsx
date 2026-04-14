import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriverSetupPlaceholder() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Ionicons name="construct-outline" size={100} color="#003366" />
                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>
                    The driver recruitment and setup flow is currently under development.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#003366',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});
