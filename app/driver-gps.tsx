import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppStore } from '../src/store/useAppStore';

export default function DriverGPSScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const registeredDriver = useAppStore((state) => state.registeredDriver);
    const updateDriverLocation = useAppStore((state) => state.updateDriverLocation);

    const [loading, setLoading] = useState(false);

    const handleEnableGPS = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('Permission Denied'),
                    t('Please enable location services to use the driver app.')
                );
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            updateDriverLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });

            // Success animation/delay
            setTimeout(() => {
                setLoading(false);
                router.replace('/driver-home');
            }, 1000);
        } catch (error) {
            console.error(error);
            Alert.alert(t('Error'), t('Could not retrieve your location. Please try again.'));
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Blurred/Abstract Background Concept using a Navy Gradient Overlay */}
            <View style={styles.background}>
                <View style={styles.gradient} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeText}>
                            {t('Welcome back,')}
                        </Text>
                        <Text style={styles.nameText}>
                            {registeredDriver?.name || 'Driver'}! 👋
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="location" size={40} color="#003366" />
                        </View>

                        <Text style={styles.cardTitle}>{t('Location Access')}</Text>
                        <Text style={styles.cardSubtitle}>
                            {t('To receive nearby delivery requests, we need to track your GPS location.')}
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleEnableGPS}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#003366" />
                            ) : (
                                <>
                                    <Ionicons name="navigate" size={20} color="#003366" style={{ marginRight: 8 }} />
                                    <Text style={styles.buttonText}>{t('Enable GPS')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#001A33',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 51, 102, 0.8)',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    welcomeSection: {
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        color: '#FACC15',
        fontWeight: '500',
    },
    nameText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3CD0D20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 10,
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#F3CD0D',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366',
    },
});
