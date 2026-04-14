import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ToastAndroid,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const NAVY = '#003366';
const YELLOW = '#F3CD0D';

export default function DriverLoginScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const loginDriver = useAppStore((s) => s.loginDriver);

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
        setError('');
        if (!phone.trim() || !password.trim()) {
            setError(t('Please fill all fields'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const success = loginDriver(phone.trim(), password.trim());
            setLoading(false);
            if (success) {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(t('Login successful. Welcome back!'), ToastAndroid.SHORT);
                } else {
                    Alert.alert(t('Success'), t('Login successful. Welcome back!'));
                }
                
                const { userRole } = useAppStore.getState();
                if (userRole === 'DRIVER_TANKER') {
                    router.replace('/(driver)/tanker-dashboard');
                } else {
                    router.replace('/(driver)/driver-home');
                }
            } else {
                setError(t('Invalid phone number or password'));
            }
        }, 900);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace('/role-selection')} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={NAVY} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Driver Login')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Icon */}
                        <View style={styles.iconCircle}>
                            <Ionicons name="bus" size={44} color={NAVY} />
                        </View>

                        <Text style={styles.title}>{t('Welcome Back')}</Text>
                        <Text style={styles.subtitle}>{t('Log in to start your shift and accept orders.')}</Text>

                        {/* Phone */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.label}>{t('Phone Number')}</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="05XX XXX XXX"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={(v) => { setPhone(v); setError(''); }}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.label}>{t('Password')}</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPass}
                                    value={password}
                                    onChangeText={(v) => { setPassword(v); setError(''); }}
                                />
                                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass((v) => !v)}>
                                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Inline error */}
                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.loginBtnText}>
                                {loading ? t('Logging in...') : t('Login')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>{t("Don't have an account? ")}</Text>
                            <TouchableOpacity onPress={() => router.push('/driver-register')}>
                                <Text style={styles.footerLink}>{t('Create Account')}</Text>
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
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: NAVY },
    scrollContent: { flexGrow: 1 },
    content: { paddingHorizontal: 30, paddingTop: 30 },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#EFF6FF',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#BFDBFE',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: NAVY,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    fieldWrap: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: NAVY, marginBottom: 7 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 8 },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    eyeBtn: { padding: 8 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: { color: '#DC2626', fontSize: 14, marginLeft: 8, flex: 1 },
    loginBtn: {
        backgroundColor: YELLOW,
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    loginBtnText: { fontSize: 18, fontWeight: 'bold', color: NAVY },
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
    footerText: { fontSize: 15, color: '#6B7280' },
    footerLink: { fontSize: 15, fontWeight: 'bold', color: NAVY },
    changeRoleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    changeRoleText: { fontSize: 13, color: '#9CA3AF' },
});
