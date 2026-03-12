import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#666666',
    lightGray: '#F9FAFB',
    borderGray: '#E5E7EB',
};

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [phone, setPhone] = useState('');
    const { t } = useTranslation();

    const handleSendCode = () => {
        // Navigate to OTP verification
        router.push('/verify-otp' as any);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.innerContainer, { paddingTop: Math.max(insets.top + 10, 50), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content Centered vertically */}
                    <View style={styles.contentContainer}>
                        {/* Icon */}
                        <View style={styles.iconBackground}>
                            <View style={styles.lockContainer}>
                                <Ionicons name="lock-closed" size={70} color={COLORS.navy} />
                                {/* Small Yellow Keyhole Dot overriding the lock center */}
                                <View style={styles.keyholeDot} />
                            </View>
                        </View>

                        {/* Text Content */}
                        <Text style={styles.title}>{t('Forgot Password?')}</Text>
                        <Text style={styles.subtitle}>
                            {t('Enter your registered phone number and we will send you a code to reset your password.')}
                        </Text>

                        {/* Input Field */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>{t('Phone Number')}</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('(555) 000-0000')}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Bottom Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSendCode}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>{t('Send Reset Code')}</Text>
                    </TouchableOpacity>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 25,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40, // offset slightly visually
    },
    iconBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 35,
    },
    lockContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyholeDot: {
        position: 'absolute',
        bottom: 15, // positioned over the lock's center
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.yellow,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    inputSection: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.navy,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 56,
        borderWidth: 1.5,
        borderColor: COLORS.navy,
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: COLORS.white,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.navy,
    },
    actionButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 30, // massive pill shape matching design
        paddingVertical: 18,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
});
