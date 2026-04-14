import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface LocationPermissionModalProps {
    visible: boolean;
    onClose: () => void;
    onAllow: () => void;
}

export default function LocationPermissionModal({ visible, onClose, onAllow }: LocationPermissionModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Icon Container with Glow */}
                    <View style={styles.iconGlowLayer}>
                        <View style={styles.iconInnerCircle}>
                            <Ionicons name="location" size={32} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Typography */}
                    <Text style={styles.title}>{t('Enable Location Services')}</Text>
                    <Text style={styles.subtitle}>
                        {t('To provide the best delivery routes and accurate ETAs, Ammarli needs access to your location.')}
                    </Text>

                    {/* Primary Button */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onAllow}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>{t('Allow Access')}</Text>
                    </TouchableOpacity>

                    {/* Secondary Button */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onClose}
                    >
                        <Text style={styles.secondaryButtonText}>{t('Maybe Later')}</Text>
                    </TouchableOpacity>

                    {/* Pagination Dots */}
                    <View style={styles.paginationContainer}>
                        <View style={styles.dotSmall} />
                        <View style={styles.dotWide} />
                        <View style={styles.dotSmall} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    iconGlowLayer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(243, 205, 13, 0.2)', // Soft yellow glow
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconInnerCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3CD0D', // Solid Yellow
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F3CD0D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#003366', // Dark Navy
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280', // Gray
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#F3CD0D', // Solid Yellow
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366', // Dark Navy
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#003366', // Dark Navy
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    dotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FBE886', // Lighter soft yellow/grayish
    },
    dotWide: {
        width: 20,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F3CD0D', // Solid Yellow
    },
});
