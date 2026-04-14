import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const CREAM = '#FAFAF0';
const GRAY = '#6B7280';
const WHITE = '#FFFFFF';

type Role = 'customer' | 'driver' | null;

export default function RoleSelectionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedRole, setSelectedRole] = useState<Role>(null);

    const handleContinue = () => {
        if (!selectedRole) return;
        if (selectedRole === 'customer') {
            router.push('/login');
        } else {
            router.push('/driver-login');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.brandText}>AMMARLI</Text>
            </View>

            {/* ── Body ── */}
            <View style={styles.body}>
                <Text style={styles.title}>Choose Your{'\n'}Experience</Text>
                <Text style={styles.subtitle}>How would you like to use Ammarli today?</Text>

                {/* Customer Card */}
                <TouchableOpacity
                    style={[
                        styles.card,
                        styles.cardCustomer,
                        selectedRole === 'customer' && styles.cardSelected,
                    ]}
                    onPress={() => setSelectedRole('customer')}
                    activeOpacity={0.85}
                >
                    <View style={styles.cardLeft}>
                        <View style={styles.iconWrapCustomer}>
                            <Ionicons name="water" size={28} color="#1E6FD9" />
                        </View>
                        <View style={{ marginTop: 18 }}>
                            <Text style={styles.cardTitleDark}>Order Water</Text>
                            <Text style={styles.cardSubDark}>Get premium hydration{'\n'}delivered.</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.arrowCircle,
                        selectedRole === 'customer' && styles.arrowCircleSelected,
                    ]}>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={selectedRole === 'customer' ? WHITE : NAVY}
                        />
                    </View>
                </TouchableOpacity>

                {/* Driver Card */}
                <TouchableOpacity
                    style={[
                        styles.card,
                        styles.cardDriver,
                        selectedRole === 'driver' && styles.cardDriverSelected,
                    ]}
                    onPress={() => setSelectedRole('driver')}
                    activeOpacity={0.85}
                >
                    <View style={styles.cardLeft}>
                        <View style={styles.iconWrapDriver}>
                            <Ionicons name="bus" size={28} color={WHITE} />
                        </View>
                        <View style={{ marginTop: 18 }}>
                            <Text style={styles.cardTitleLight}>Work as a Driver</Text>
                            <Text style={styles.cardSubLight}>Join our elite delivery fleet.</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.arrowCircle,
                        styles.arrowCircleDriver,
                        selectedRole === 'driver' && styles.arrowCircleDriverSelected,
                    ]}>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={WHITE}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity
                    style={[styles.continueBtn, !selectedRole && styles.continueBtnDisabled]}
                    onPress={handleContinue}
                    activeOpacity={selectedRole ? 0.85 : 1}
                >
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    BY CONTINUING, YOU AGREE TO OUR TERMS OF{'\n'}SERVICE AND PRIVACY POLICY.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: WHITE,
    },

    // ── Header
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    brandText: {
        fontSize: 15,
        fontWeight: '900',
        color: NAVY,
        letterSpacing: 3,
    },

    // ── Body
    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: NAVY,
        lineHeight: 42,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: GRAY,
        lineHeight: 22,
        marginBottom: 36,
    },

    // ── Cards
    card: {
        borderRadius: 22,
        padding: 24,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardSelected: {
        borderWidth: 2.5,
        borderColor: '#1E6FD9',
    },
    cardCustomer: {
        backgroundColor: CREAM,
        minHeight: 160,
    },
    cardDriver: {
        backgroundColor: NAVY,
        minHeight: 160,
    },
    cardDriverSelected: {
        borderWidth: 2.5,
        borderColor: YELLOW,
    },
    cardLeft: {
        flex: 1,
    },
    iconWrapCustomer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapDriver: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleDark: {
        fontSize: 20,
        fontWeight: '800',
        color: NAVY,
        marginBottom: 4,
    },
    cardSubDark: {
        fontSize: 14,
        color: GRAY,
        lineHeight: 20,
    },
    cardTitleLight: {
        fontSize: 20,
        fontWeight: '800',
        color: WHITE,
        marginBottom: 4,
    },
    cardSubLight: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 20,
    },

    // Arrow circle
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    arrowCircleSelected: {
        backgroundColor: NAVY,
    },
    arrowCircleDriver: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    arrowCircleDriverSelected: {
        backgroundColor: YELLOW,
    },

    // ── Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        alignItems: 'center',
    },
    continueBtn: {
        width: '100%',
        backgroundColor: YELLOW,
        paddingVertical: 20,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    continueBtnDisabled: {
        opacity: 0.45,
        shadowOpacity: 0,
        elevation: 0,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '900',
        color: NAVY,
        letterSpacing: 2,
    },
    termsText: {
        fontSize: 10,
        color: '#9CA3AF',
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 16,
    },
});
