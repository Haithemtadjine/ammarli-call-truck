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
    View 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const NAVY = '#003366';
const GRAY = '#64748B';
const BG = '#FFFFFF';
const INPUT_BG = '#F8FAFC'; // Very light grayish-blue
const VERIFIED_BG = '#F1F5F9';
const BORDER = '#E2E8F0';

export default function DriverPersonalInfoScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    
    // Get store data
    const driver = useAppStore(s => s.registeredDriver);
    const userRole = useAppStore(s => s.userRole);
    const updateProfile = useAppStore(s => s.updateDriverProfile);

    // Local state for edits
    const [name, setName] = useState(driver?.name || 'James Anderson');
    const [phone, setPhone] = useState(driver?.phone || '+1 (415) 555-0123');

    const handleGoBack = () => {
        if (userRole === 'DRIVER_TANKER') {
            router.replace('/(driver)/tanker-dashboard');
        } else if (userRole === 'DRIVER_BOTTLED') {
            router.replace('/(driver)/driver-home');
        } else {
            router.back();
        }
    };

    const handleSave = () => {
        if (!name.trim() || !phone.trim()) return;
        updateProfile(name, phone);
        handleGoBack();
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: BG }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Information</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                <Text style={styles.introText}>
                    Update your account details to keep your profile accurate.
                </Text>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                </View>

                {/* Phone Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+1 (000) 000-0000"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Verified Card */}
                <View style={styles.verifiedCard}>
                    <View style={styles.shieldBox}>
                        <Ionicons name="shield-checkmark" size={18} color={NAVY} />
                    </View>
                    <View style={styles.verifiedTextCol}>
                        <Text style={styles.verifiedTitle}>Account Verified</Text>
                        <Text style={styles.verifiedSubtitle}>Your identity was verified on May 2024</Text>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>



        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: BG,
    },
    backBtn: {
        width: 44, height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 40,
    },
    introText: {
        fontSize: 15,
        color: GRAY,
        lineHeight: 22,
        marginBottom: 35,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: INPUT_BG,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        height: '100%',
    },
    verifiedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: VERIFIED_BG,
        borderRadius: 12,
        padding: 18,
        marginTop: 10,
    },
    shieldBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    verifiedTextCol: {
        flex: 1,
    },
    verifiedTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 2,
    },
    verifiedSubtitle: {
        fontSize: 12,
        color: GRAY,
    },
    bottomContainer: {
        marginTop: 'auto',
        paddingTop: 20,
        backgroundColor: BG,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    saveBtn: {
        backgroundColor: NAVY,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
