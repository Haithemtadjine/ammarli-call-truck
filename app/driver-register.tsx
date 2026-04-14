import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// ─── Constants ─────────────────────────────────────────────────────────────────
const NAVY = '#003366';
const YELLOW = '#F3CD0D';
const GRAY = '#F5F6FA';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const LABEL = '#6B7280';

const WATER_TYPES = ['Spring', 'Well', 'Construction'];
const BOTTLED_BRANDS = [
    'Ifri', 'Guedila', 'Saida', 'Lalla Khedidja',
    'Youkous', 'Hayat', 'Mansourah', 'Texanna',
    'Toudja', 'Messerghine',
];
const CAP_MIN = 500;
const CAP_MAX = 10000;
const CAP_STEP = 500;
const CAP_STEPS = (CAP_MAX - CAP_MIN) / CAP_STEP; // 19 steps

const BRAND_LOGOS: Record<string, any> = {
    'Ifri':           require('../assets/brands/ifri.png'),
    'Guedila':        require('../assets/brands/guedila.png'),
    'Saida':          require('../assets/brands/saida.png'),
    'Lalla Khedidja': require('../assets/brands/lalla-khedidja.png'),
    'Youkous':        require('../assets/brands/youkous.png'),
    'Hayat':          require('../assets/brands/hayat.jpg'),
    'Mansourah':      require('../assets/brands/mansourah.png'),
    'Texanna':        require('../assets/brands/texanna.png'),
    'Toudja':         require('../assets/brands/toudja.png'),
    'Messerghine':    require('../assets/brands/messerghine.png'),
};

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function DriverRegisterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const registerDriver = useAppStore((s) => s.registerDriver);

    // Core fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [plate, setPlate] = useState('');
    const [loading, setLoading] = useState(false);

    // Category
    const [category, setCategory] = useState<'Tanker' | 'Bottled' | null>(null);

    // Tanker sub-options
    const [waterType, setWaterType] = useState('Spring');
    const [capacity, setCapacity] = useState(5000);

    // Bottled brands
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const toggleBrand = (b: string) =>
        setSelectedBrands((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b]);

    // Submit
    const handleRegister = () => {
        if (!name.trim() || !phone.trim() || !password.trim() || !plate.trim()) {
            Alert.alert(t('Error'), t('Please fill all fields'));
            return;
        }
        if (!category) {
            Alert.alert(t('Error'), t('Please select your vehicle category'));
            return;
        }
        if (category === 'Bottled' && selectedBrands.length === 0) {
            Alert.alert(t('Error'), t('Please select at least one brand'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            registerDriver({
                name: name.trim(),
                phone: phone.trim(),
                password: password.trim(),
                truckPlate: plate.trim(),
                driverType: category,
                ...(category === 'Tanker'
                    ? { waterType, capacity }
                    : { brands: selectedBrands }),
            });
            setLoading(false);
            
            if (Platform.OS === 'android') {
                ToastAndroid.show(t('Account created successfully. Welcome!'), ToastAndroid.SHORT);
            } else {
                Alert.alert(t('Success'), t('Account created successfully. Welcome!'));
            }

            if (category === 'Tanker') {
                router.replace('/(driver)/tanker-dashboard');
            } else {
                router.replace('/(driver)/driver-home');
            }
        }, 1000);
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* ── Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={NAVY} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Create Driver Account')}</Text>
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── FULL NAME */}
                    <Text style={styles.fieldLabel}>FULL NAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={LABEL}
                        value={name}
                        onChangeText={setName}
                    />

                    {/* ── PHONE NUMBER */}
                    <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+213 (5XX) XXX-XXX"
                        placeholderTextColor={LABEL}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    {/* ── PASSWORD */}
                    <Text style={styles.fieldLabel}>PASSWORD</Text>
                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            placeholder="Create a password"
                            placeholderTextColor={LABEL}
                            secureTextEntry={!showPass}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowPass((v) => !v)}
                        >
                            <Ionicons
                                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={LABEL}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ── LICENSE PLATE */}
                    <Text style={styles.fieldLabel}>LICENSE PLATE</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ABC-1234"
                        placeholderTextColor={LABEL}
                        autoCapitalize="characters"
                        value={plate}
                        onChangeText={setPlate}
                    />

                    {/* ── VEHICLE CATEGORY */}
                    <Text style={styles.fieldLabel}>VEHICLE CATEGORY</Text>
                    <View style={styles.categoryRow}>
                        {/* Tanker Card */}
                        <TouchableOpacity
                            style={[
                                styles.categoryCard,
                                category === 'Tanker' && styles.categoryCardTanker,
                            ]}
                            onPress={() => setCategory('Tanker')}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="car"
                                size={36}
                                color={category === 'Tanker' ? NAVY : '#9CA3AF'}
                            />
                            <Text style={[
                                styles.categoryText,
                                category === 'Tanker' && styles.categoryTextTanker,
                            ]}>
                                Tanker Trucks
                            </Text>
                        </TouchableOpacity>

                        {/* Bottled Card */}
                        <TouchableOpacity
                            style={[
                                styles.categoryCard,
                                category === 'Bottled' && styles.categoryCardBottled,
                            ]}
                            onPress={() => setCategory('Bottled')}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="water"
                                size={36}
                                color={category === 'Bottled' ? NAVY : '#9CA3AF'}
                            />
                            <Text style={[
                                styles.categoryText,
                                category === 'Bottled' && styles.categoryTextBottled,
                            ]}>
                                Bottled Water
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ════ Tanker sub-section ════ */}
                    {category === 'Tanker' && (
                        <>
                            {/* WATER TYPE */}
                            <Text style={styles.fieldLabel}>WATER TYPE</Text>
                            <View style={styles.pillsRow}>
                                {WATER_TYPES.map((wt) => {
                                    const active = waterType === wt;
                                    return (
                                        <TouchableOpacity
                                            key={wt}
                                            style={[styles.pill, active && styles.pillActive]}
                                            onPress={() => setWaterType(wt)}
                                        >
                                            <Text style={[styles.pillText, active && styles.pillTextActive]}>
                                                {wt}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* TANK CAPACITY */}
                            <Text style={styles.fieldLabel}>TANK CAPACITY (Liters)</Text>
                            <View style={styles.capacityInputContainer}>
                                <TextInput
                                    style={styles.capacityInput}
                                    placeholder="Enter tank capacity"
                                    placeholderTextColor={LABEL}
                                    keyboardType="numeric"
                                    value={capacity === 0 ? '' : capacity.toString()}
                                    onChangeText={(text) => {
                                        const numericValue = text.replace(/[^0-9]/g, '');
                                        setCapacity(numericValue === '' ? 0 : parseInt(numericValue, 10));
                                    }}
                                />
                                <View style={styles.litersSuffix}>
                                    <Text style={styles.litersText}>L</Text>
                                </View>
                            </View>
                            <Text style={styles.capacityInfo}>
                                Recommended: {CAP_MIN.toLocaleString()}L - {CAP_MAX.toLocaleString()}L
                            </Text>
                        </>
                    )}

                    {/* ════ Bottled sub-section ════ */}
                    {category === 'Bottled' && (
                        <>
                            <Text style={styles.fieldLabel}>BRANDS YOU DELIVER</Text>
                            <Text style={styles.brandNote}>Select one or more brands</Text>
                            <View style={styles.brandGrid}>
                                {BOTTLED_BRANDS.map((b) => {
                                    const active = selectedBrands.includes(b);
                                    const logo = BRAND_LOGOS[b];
                                    return (
                                        <TouchableOpacity
                                            key={b}
                                            style={[styles.brandPill, active && styles.brandPillActive]}
                                            onPress={() => toggleBrand(b)}
                                        >
                                            {logo && <Image source={logo} style={styles.brandLogoSmall} />}
                                            <Text style={[styles.brandPillText, active && styles.brandPillTextActive]}>
                                                {b}
                                            </Text>
                                            {active && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={14}
                                                    color={NAVY}
                                                    style={{ marginLeft: 6 }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* ── REGISTER BUTTON */}
                    <TouchableOpacity
                        style={[styles.registerBtn, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.registerBtnText}>
                            {loading ? t('Registering...') : 'Register'}
                        </Text>
                        {!loading && (
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                        )}
                    </TouchableOpacity>

                    {/* ── Footer link */}
                    <View style={styles.footerCol}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Already have an account?  </Text>
                            <TouchableOpacity onPress={() => router.replace('/driver-login')}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.replace('/role-selection')}
                            style={styles.changeRoleBtn}
                        >
                            <Ionicons name="arrow-back-outline" size={14} color="#9CA3AF" />
                            <Text style={styles.changeRoleText}> Change Role</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#FFFFFF' },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: { marginRight: 14, padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: NAVY },

    // Scroll
    scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },

    // Labels above inputs
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: LABEL,
        marginBottom: 8,
        marginTop: 18,
    },

    // Inputs
    input: {
        backgroundColor: GRAY,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        color: TEXT,
        marginBottom: 2,
    },
    passwordWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GRAY,
        borderRadius: 14,
        paddingRight: 12,
        marginBottom: 2,
    },
    eyeBtn: { padding: 8 },

    // Category cards
    categoryRow: { flexDirection: 'row', gap: 14 },
    categoryCard: {
        flex: 1,
        backgroundColor: GRAY,
        borderRadius: 18,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 10,
    },
    categoryCardTanker: {
        backgroundColor: YELLOW,
        borderColor: YELLOW,
    },
    categoryCardBottled: {
        backgroundColor: '#FFFFFF',
        borderColor: NAVY,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
        color: LABEL,
        textAlign: 'center',
    },
    categoryTextTanker: { color: NAVY },
    categoryTextBottled: { color: NAVY },

    // Water type pills
    pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: '#FFFFFF',
    },
    pillActive: { backgroundColor: NAVY, borderColor: NAVY },
    pillText: { fontSize: 14, fontWeight: '600', color: TEXT },
    pillTextActive: { color: '#FFFFFF' },

    // Capacity Input
    capacityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GRAY,
        borderRadius: 14,
        height: 60,
        paddingHorizontal: 15,
        borderWidth: 1.5,
        borderColor: BORDER,
    },
    capacityInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: TEXT,
        textAlign: 'left',
        paddingVertical: 10,
    },
    litersSuffix: {
        backgroundColor: YELLOW,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 10,
    },
    litersText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
    },
    capacityInfo: {
        fontSize: 12,
        color: LABEL,
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Brand pills (Bottled)
    brandNote: { fontSize: 13, color: LABEL, marginBottom: 12 },
    brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    brandPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: '#FFFFFF',
    },
    brandPillActive: { borderColor: YELLOW, backgroundColor: '#FFFDE7' },
    brandPillText: { fontSize: 14, fontWeight: '600', color: LABEL },
    brandPillTextActive: { color: NAVY, fontWeight: 'bold' },
    brandLogoSmall: {
        width: 18,
        height: 18,
        marginRight: 8,
        resizeMode: 'contain',
    },

    // Register button
    registerBtn: {
        marginTop: 'auto',
        marginBottom: 10,
        backgroundColor: NAVY,
        borderRadius: 16,
        paddingVertical: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: NAVY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    registerBtnText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },

    // Footer
    footerCol: { alignItems: 'center', marginTop: 20, gap: 10 },
    footerRow: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 14, color: LABEL },
    footerLink: { fontSize: 14, fontWeight: 'bold', color: NAVY },
    changeRoleBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    changeRoleText: { fontSize: 13, color: '#9CA3AF' },
});
