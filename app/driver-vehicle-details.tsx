import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DriverVehicleDetailsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vehicle Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <Ionicons name="bus-outline" size={80} color="#CBD5E1" style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>
                    View and manage your registered truck or van details, license plate, and capacity.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 60,
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#003366' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#003366', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
});
