import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
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
    lightGray: '#F0F4F8',
    borderGray: '#CBD5E1',
};

export default function ResetPasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // State for passwords
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for visibility toggle
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleResetPassword = () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert(t('Error'), t('Please fill in both password fields.'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('Error'), t('Passwords do not match. Please try again.'));
            return;
        }

        // Logic to simulate successful reset
        Alert.alert(
            t('Success'),
            t('Your password has been reset successfully.'),
            [
                { text: t('Log In'), onPress: () => router.replace('/login') }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.innerContainer, { paddingTop: Math.max(insets.top + 10, 40), paddingBottom: Math.max(insets.bottom + 20, 40) }]}>

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
                            <View style={styles.keyContainer}>
                                <Ionicons name="key" size={50} color={COLORS.navy} style={styles.keyIcon} />
                                {/* Notification/Dot over the key */}
                                <View style={styles.dotContainer} />
                            </View>
                        </View>

                        {/* Title & Subtitle */}
                        <Text style={styles.title}>{t('Create New Password')}</Text>
                        <Text style={styles.subtitle}>
                            {t('Your new password must be different from previous passwords.')}
                        </Text>

                        {/* Input 1: New Password */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>{t('New Password')}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('Enter new password')}
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showNew}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowNew(!showNew)}
                                >
                                    <Ionicons
                                        name={showNew ? "eye-off" : "eye"}
                                        size={22}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Input 2: Confirm New Password */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>{t('Confirm New Password')}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('Confirm new password')}
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showConfirm}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirm(!showConfirm)}
                                >
                                    <Ionicons
                                        name={showConfirm ? "eye-off" : "eye"}
                                        size={22}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>

                    {/* Bottom Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleResetPassword}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>{t('Reset Password')}</Text>
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
        paddingBottom: 20,
    },
    iconBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    keyContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyIcon: {
        transform: [{ rotate: '0deg' }], // Keeps it perfectly horizontal based on design
    },
    dotContainer: {
        position: 'absolute',
        bottom: -5,
        right: -10,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.yellow,
        borderWidth: 3,
        borderColor: COLORS.lightGray,
    },
    title: {
        fontSize: 30,
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
        marginBottom: 35,
        paddingHorizontal: 15,
    },
    inputSection: {
        width: '100%',
        marginBottom: 20,
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
        borderColor: COLORS.borderGray,
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: COLORS.white,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.navy,
    },
    eyeIcon: {
        padding: 5,
        marginLeft: 10,
    },
    actionButton: {
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
