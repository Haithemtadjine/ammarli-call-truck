import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// import { createUserWithEmailAndPassword } from 'firebase/auth'; // TEMPORARILY DISABLED
// import { doc, serverTimestamp, setDoc } from 'firebase/firestore'; // TEMPORARILY DISABLED
import React, { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
// import { auth, db } from '../src/firebaseConfig'; // TEMPORARILY DISABLED
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';
import { saveUserSession } from '../src/utils/storage';

const ALGERIA_PROVINCES = [
    "1 - Adrar", "2 - Chlef", "3 - Laghouat", "4 - Oum El Bouaghi", "5 - Batna", "6 - Béjaïa", "7 - Biskra", "8 - Béchar", "9 - Blida", "10 - Bouira",
    "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
    "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar",
    "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

export default function RegisterScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [province, setProvince] = useState('');
    const [loading, setLoading] = useState(false);

    const [isProvinceModalVisible, setProvinceModalVisible] = useState(false);
    const { t } = useTranslation();

    const handleRegister = async () => {
        if (!firstName || !lastName || !phone || !password || !confirmPassword || !province) {
            alert(t('Please fill all fields'));
            return;
        }
        if (password !== confirmPassword) {
            alert(t('Passwords do not match'));
            return;
        }

        setLoading(true);
        try {
            // --- TEMPORARY BYPASS FOR UI DEVELOPMENT ---
            // We simulate a successful registration to see the next screens

            // 1. Generate a dummy UID
            const dummyUid = `dev_user_${phone}_${Date.now()}`;

            // Save session locally
            await saveUserSession(dummyUid);

            // Save user profile dynamically to Zustand
            useAppStore.getState().setUserProfile({ name: `${firstName} ${lastName}`.trim(), phone });

            router.replace('/success');
        } catch (error: any) {
            alert(t('Registration error: ') + error.message);
        } finally {
            setLoading(false);
        }
    };

    const selectProvince = (selectedProvince: string) => {
        setProvince(selectedProvince);
        setProvinceModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0B2545" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Create Account')}</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{t('Join Our Service')}</Text>
                    <Text style={styles.subtitle}>{t('Enter your details to get started with reliable water delivery.')}</Text>

                    {/* Form */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('First Name')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Enter your first name')}
                            placeholderTextColor="#9CA3AF"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Last Name')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Enter your last name')}
                            placeholderTextColor="#9CA3AF"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Phone Number')}</Text>
                        <View style={styles.phoneInputContainer}>
                            <Ionicons name="call" size={20} color="#9CA3AF" style={styles.phoneIcon} />
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="123-456-7890"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Confirm Password')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('Confirm your password')}
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Province')}</Text>
                        <TouchableOpacity
                            style={styles.provinceContainer}
                            onPress={() => setProvinceModalVisible(true)}
                        >
                            <Text style={[styles.provinceText, !province && styles.placeholderText]}>
                                {province || t("Select your province")}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#0B2545" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.spacer} />

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.registerButtonText}>{loading ? t('Registering...') : t('Register Now')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.termsText}>
                        {t('By registering, you agree to our ')}<Text style={styles.linkText}>{t('Terms of Service')}</Text>{t(' and ')}<Text style={styles.linkText}>{t('Privacy Policy')}</Text>{t('.')}
                    </Text>

                    {/* Change Role link */}
                    <TouchableOpacity
                        onPress={() => router.replace('/role-selection')}
                        style={styles.changeRoleBtn}
                    >
                        <Ionicons name="arrow-back-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.changeRoleText}> {t('Change Role')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Province Selection Modal */}
            <Modal
                visible={isProvinceModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setProvinceModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setProvinceModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('Select Province')}</Text>
                                <TouchableOpacity onPress={() => setProvinceModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#0B2545" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={ALGERIA_PROVINCES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.provinceItem}
                                        onPress={() => selectProvince(item)}
                                    >
                                        <Text style={[
                                            styles.provinceItemText,
                                            province === item && styles.provinceItemTextSelected
                                        ]}>
                                            {item}
                                        </Text>
                                        {province === item && (
                                            <Ionicons name="checkmark" size={20} color="#FACC15" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
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
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
        width: 34,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0B2545',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
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
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    phoneIcon: {
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    provinceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    provinceText: {
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    spacer: {
        height: 10,
    },
    registerButton: {
        backgroundColor: '#FACC15',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B2545',
    },
    termsText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    linkText: {
        color: '#0B2545',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B2545',
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    provinceItemText: {
        fontSize: 16,
        color: '#111827',
    },
    provinceItemTextSelected: {
        fontWeight: 'bold',
        color: '#0B2545',
    },
    changeRoleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    changeRoleText: { fontSize: 13, color: '#9CA3AF' },
});
