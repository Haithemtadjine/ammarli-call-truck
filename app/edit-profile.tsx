import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// Dummy List from User
const WILAYAS = [
    "16 - Alger",
    "05 - Batna",
    "31 - Oran",
    "30 - Ouargla"
];

const COLORS = {
    navy: '#0B2545',
    yellow: '#FACC15',
    white: '#FFFFFF',
    textDark: '#1F2937',
    border: '#1F2937' // Dark navy/grey for inputs based on design
};

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { userProfile, updateUserName, userRole } = useAppStore();

    // Form state
    const [name, setName] = useState(userProfile?.name || '');
    const [email, setEmail] = useState('jane.doe@example.com'); // Placeholder
    const [phone, setPhone] = useState('+1 (555) 123-4567');
    const [province, setProvince] = useState('Ontario'); // Example pre-filled

    // Simplified Dropdown state for this UI
    const [showDropdown, setShowDropdown] = useState(false);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(tabs)/profile');
        }
    };

    const handleSave = () => {
        updateUserName(name);
        Alert.alert(
            t('Success'),
            t('Profile Updated Successfully!'),
            [{ text: 'OK', onPress: () => handleGoBack() }]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Dark Navy Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Edit Profile')}</Text>
                <View style={{ width: 40 }} /> {/* Spacer for centering */}
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 48) }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        activeOpacity={0.8}
                        onPress={() => {
                            // TODO: Implement expo-image-picker here
                            Alert.alert(t('Opening Camera Roll...'));
                        }}
                    >
                        <Image
                            source={{ uri: 'https://avatar.iran.liara.run/public/44' }}
                            style={styles.avatar}
                        />
                        <View style={styles.editBadge}>
                            <Ionicons name="pencil" size={14} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <InputField
                        label={t('Full Name')}
                        icon="person"
                        value={name}
                        onChangeText={setName}
                    />

                    <InputField
                        label={t('Email Address')}
                        icon="mail"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    <InputField
                        label={t('Phone Number')}
                        icon="call"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {/* Province Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('Province')}</Text>
                        <TouchableOpacity
                            style={styles.inputWrapper}
                            onPress={() => setShowDropdown(!showDropdown)}
                            activeOpacity={0.8}
                        >
                            {/* No left icon for province in the design */}
                            <Text style={styles.inputText}>{province}</Text>
                            <Ionicons name="chevron-down" size={20} color={COLORS.navy} />
                        </TouchableOpacity>

                        {/* Inline Dropdown for Demo */}
                        {showDropdown && (
                            <View style={styles.dropdownContainer}>
                                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                    {WILAYAS.map((wilaya, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setProvince(wilaya);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>{wilaya}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom Button attached to safe area bottom */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>{t('Save Changes')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>


        </KeyboardAvoidingView>
    );
}

// Reusable Input Field Component
function InputField({ label, icon, value, onChangeText, keyboardType }: any) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.navy,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 30,
        paddingHorizontal: 30,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarWrapper: {
        position: 'relative',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#F3F4F6', // light border from design
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.navy,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 8,
        position: 'relative',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.navy,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.navy,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 54,
        backgroundColor: COLORS.white,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textDark,
        height: '100%',
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textDark,
    },
    dropdownContainer: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.navy,
        borderRadius: 12,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownText: {
        fontSize: 16,
        color: COLORS.textDark,
    },
    bottomContainer: {
        marginTop: 'auto',
        paddingTop: 10,
        backgroundColor: COLORS.white,
    },
    saveButton: {
        backgroundColor: COLORS.yellow,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
