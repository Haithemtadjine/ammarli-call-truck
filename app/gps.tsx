import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GPSScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleEnableGPS = async () => {
        setLoading(true);
        try {
            // Request foreground permissions
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    t('Permission Denied'),
                    t('Location permission is required to use this app. Please enable it in your device settings.'),
                    [{ text: t('OK') }]
                );
                setLoading(false);
                return;
            }

            // Check if location services are actually enabled
            const providerStatus = await Location.getProviderStatusAsync();
            if (!providerStatus.locationServicesEnabled) {
                Alert.alert(
                    t('GPS is Disabled'),
                    t('Please turn on your device GPS/Location services to continue.'),
                    [{ text: t('OK') }]
                );
                setLoading(false);
                return;
            }

            // Permission granted and GPS is on!
            // @ts-ignore: bypass strict route typing for tabs
            router.replace('/(tabs)');

        } catch (error: any) {
            Alert.alert(t('Error'), error.message || t('An error occurred while requesting location.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Icon Container with subtle border ring */}
                <View style={styles.iconRingContainer}>
                    <View style={styles.pinContainer}>
                        <Ionicons name="location" size={56} color="#0B2545" style={styles.pinIcon} />
                        {/* Sun flare dot (approximated with another small icon or view) */}
                        <View style={styles.sunFlare}>
                            <Ionicons name="sunny" size={24} color="#FACC15" />
                        </View>
                    </View>
                </View>

                {/* Text Content */}
                <Text style={styles.title}>{t('Enable Your GPS')}</Text>
                <Text style={styles.subtitle}>
                    {t('To provide you with the most\naccurate delivery service, we need\naccess to your location.')}
                </Text>

            </View>

            {/* Bottom Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEnableGPS}
                    disabled={loading}
                >
                    <Text style={styles.actionButtonText}>{loading ? t('Checking...') : t('Enable GPS')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconRingContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    pinContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinIcon: {
        marginTop: 10,
    },
    sunFlare: {
        position: 'absolute',
        top: -8,
        right: -8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0B2545',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 26,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    actionButton: {
        backgroundColor: '#FACC15',
        borderRadius: 8,
        paddingVertical: 18,
        alignItems: 'center',
        width: '100%',
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B2545',
    },
});
