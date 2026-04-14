import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#666666',
    lightGray: '#F0F4F8',
    borderGray: '#CBD5E1', // slightly darker border as in design
};

export default function VerifyOtpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // State for the 4 digits
    const [otp, setOtp] = useState(['', '', '', '']);

    // Refs to programmatically focus inputs
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (text: string, index: number) => {
        // Allow only numbers
        if (text && !/^\d+$/.test(text)) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus to next input if text is entered
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Auto focus to previous input on backspace if current is empty
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        // const otpCode = otp.join('');
        // Navigate forward
        router.replace('/reset-password' as any);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
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
                            <View style={styles.phoneContainer}>
                                <Ionicons name="phone-portrait" size={60} color={COLORS.navy} />
                                {/* Notification Bubble overlapping top right */}
                                <View style={styles.bubbleContainer}>
                                    <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.navy} style={styles.bubbleIcon} />
                                </View>
                            </View>
                        </View>

                        {/* Title & Subtitle */}
                        <Text style={styles.title}>{t('Verify Your Number')}</Text>
                        <Text style={styles.subtitle}>
                            {t('Enter the 4-digit code sent to +971 XX XXX XXXX')}
                        </Text>

                        {/* OTP Inputs */}
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        digit ? styles.otpInputActive : null
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Resend Link */}
                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>{t("Didn't receive code? ")}</Text>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.resendButtonText}>{t('Resend Code')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleVerify}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>{t('Verify & Continue')}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
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
        paddingBottom: 40,
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
    phoneContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleContainer: {
        position: 'absolute',
        top: -5,
        right: -10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.yellow,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.lightGray, // matches background
    },
    bubbleIcon: {
        marginTop: 2,
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
        paddingHorizontal: 15,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 40,
    },
    otpInput: {
        width: 65,
        height: 65,
        borderWidth: 1.5,
        borderColor: COLORS.borderGray,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
    },
    otpInputActive: {
        borderColor: COLORS.navy, // slightly highlight when filled
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resendText: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    resendButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    actionButton: {
        marginTop: 'auto',
        backgroundColor: COLORS.yellow,
        borderRadius: 30,
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
