import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ToastAndroid,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { saveUserSession } from '../src/utils/storage';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (!phone || !password) {
            alert(t('Please fill all fields'));
            return;
        }
        setLoading(true);
        try {
            // --- TEMPORARY BYPASS FOR UI DEVELOPMENT ---
            // We simulate a successful login to see the next screens

            // 1. Generate a dummy UID
            const dummyUid = `dev_user_${phone}_${Date.now()}`;

            // 2. Save it to AsyncStorage so the app remembers you
            await saveUserSession(dummyUid);

            // 3. Navigate directly to Home
            if (Platform.OS === 'android') {
                ToastAndroid.show(t('Login successful. Welcome back!'), ToastAndroid.SHORT);
            } else {
                Alert.alert(t('Success'), t('Login successful. Welcome back!'));
            }
            router.replace('/(tabs)');
        } catch (error: any) {
            alert(t('Login processing error: ') + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>{t('Welcome Back')}</Text>
                        <Text style={styles.subtitle}>{t('Log in to manage your water deliveries.')}</Text>

                        {/* Form */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('Phone Number')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('Enter your phone number')}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('Password')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('Enter your password')}
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/forgot-password' as any)}>
                            <Text style={styles.forgotPasswordText}>{t('Forgot Password?')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>{loading ? t('Logging in...') : t('Login')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>{t("Don't have an account? ")}</Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.createAccountText}>{t('Create Account')}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.replace('/role-selection')}
                            style={styles.changeRoleBtn}
                        >
                            <Ionicons name="arrow-back-outline" size={14} color="#9CA3AF" />
                            <Text style={styles.changeRoleText}> {t('Change Role')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0B2545',
    },
    headerPlaceholder: {
        width: 34, // Matches back button width to center the title
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    scrollContent: {
        flexGrow: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0B2545',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0B2545',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0B2545',
    },
    loginButton: {
        backgroundColor: '#FACC15',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B2545',
    },
    footer: {
        marginTop: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 20,
        gap: 10,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#6B7280',
    },
    createAccountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0B2545',
    },
    changeRoleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    changeRoleText: { fontSize: 13, color: '#9CA3AF' },
});
