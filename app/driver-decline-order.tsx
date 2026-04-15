import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';

const NAVY  = '#003366';
const YELLOW = '#FACC15';
const BG    = '#F5F7FA';
const WHITE = '#FFFFFF';
const GRAY  = '#6B7280';
const BORDER = '#E5E7EB';

// ─── Decline reasons matching the mockup ────────────────────────────────────
const REASONS = [
    {
        id: 'too_far',
        label: 'Too far',
        subtitle: 'Outside current service area',
        icon: 'location' as const,
    },
    {
        id: 'out_of_stock',
        label: 'Out of stock',
        subtitle: 'Inventory not available',
        icon: 'archive' as const,
    },
    {
        id: 'emergency',
        label: 'Emergency',
        subtitle: 'Personal emergency issue',
        icon: 'warning' as const,
    },
    {
        id: 'vehicle_issues',
        label: 'Vehicle issues',
        subtitle: 'Maintenance required immediately',
        icon: 'car-sport' as const,
    },
];

export default function DriverDeclineOrderScreen() {
    const router  = useRouter();
    const { t }   = useTranslation();
    const insets  = useSafeAreaInsets();
    const { cancelDriverOrder, userRole } = useAppStore();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [note, setNote] = useState('');

    const canConfirm = selectedId !== null;

    const handleGoHome = () => {
        if (userRole === 'DRIVER_TANKER') {
            router.replace('/(driver)/tanker-dashboard');
        } else if (userRole === 'DRIVER_BOTTLED') {
            router.replace('/(driver)/driver-home');
        } else {
            router.replace('/');
        }
    };

    const handleConfirm = () => {
        if (!canConfirm) return;
        const reasonLabel = REASONS.find(r => r.id === selectedId)?.label ?? selectedId!;
        const fullReason  = note.trim() ? `${reasonLabel}: ${note.trim()}` : reasonLabel;

        if (useAppStore.getState().activeDriverOrder) {
            // Case: driver cancels an already-accepted active order → save to trips log
            cancelDriverOrder(fullReason);
        }
        // Case: driver declines an incoming (not-yet-accepted) order → just go to dashboard
        handleGoHome();
    };

    const handleBack = () => {
        router.back(); // returns to driver-active-delivery
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" />

                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={22} color={NAVY} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('DECLINE REQUEST')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Title ── */}
                    <Text style={styles.title}>{t('Why are you declining this order?')}</Text>
                    <Text style={styles.subtitle}>{t('Select a reason to help us improve your service.')}</Text>

                    {/* ── Reason Cards ── */}
                    <View style={styles.reasonsList}>
                        {REASONS.map((reason) => {
                            const selected = selectedId === reason.id;
                            return (
                                <TouchableOpacity
                                    key={reason.id}
                                    style={[styles.reasonCard, selected && styles.reasonCardSelected]}
                                    onPress={() => setSelectedId(reason.id)}
                                    activeOpacity={0.8}
                                >
                                    {/* Icon box */}
                                    <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                                        <Ionicons name={reason.icon} size={22} color={NAVY} />
                                    </View>

                                    {/* Text */}
                                    <View style={styles.reasonText}>
                                        <Text style={styles.reasonLabel}>{t(reason.label)}</Text>
                                        <Text style={styles.reasonSubtitle}>{t(reason.subtitle)}</Text>
                                    </View>

                                    {/* Radio */}
                                    <View style={[styles.radio, selected && styles.radioSelected]}>
                                        {selected && <View style={styles.radioDot} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Additional Details ── */}
                    <Text style={styles.additionalLabel}>{t('ADDITIONAL DETAILS (OPTIONAL)')}</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder={t('Provide more context for our support team...')}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={note}
                        onChangeText={setNote}
                        textAlignVertical="top"
                    />

                    {/* ── Bottom Actions ── */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
                            onPress={handleConfirm}
                            activeOpacity={canConfirm ? 0.85 : 1}
                            disabled={!canConfirm}
                        >
                            <Text style={styles.confirmBtnText}>{t('CONFIRM DECLINE')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleBack} style={styles.backLinkBtn}>
                            <Text style={styles.backLinkText}>{t('Back to Order Details')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>


            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BG,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: WHITE,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    headerTitle: {
        fontSize: 14, fontWeight: '800', color: NAVY, letterSpacing: 1.2,
    },

    scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },

    // Title
    title: {
        fontSize: 28, fontWeight: '900', color: NAVY, lineHeight: 36, marginBottom: 8,
    },
    subtitle: { fontSize: 14, color: GRAY, marginBottom: 28 },

    // Reasons
    reasonsList: { gap: 12, marginBottom: 32 },
    reasonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: BORDER,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    reasonCardSelected: {
        borderColor: YELLOW,
        backgroundColor: '#FFFBEB',
    },
    iconBox: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    iconBoxSelected: { backgroundColor: '#FEF3C7' },
    reasonText: { flex: 1 },
    reasonLabel: { fontSize: 16, fontWeight: '700', color: NAVY, marginBottom: 2 },
    reasonSubtitle: { fontSize: 13, color: GRAY },
    radio: {
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2, borderColor: BORDER,
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 12,
    },
    radioSelected: { borderColor: NAVY },
    radioDot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: NAVY,
    },

    // Additional note
    additionalLabel: {
        fontSize: 11, fontWeight: '800', color: NAVY,
        letterSpacing: 1, marginBottom: 12,
    },
    noteInput: {
        backgroundColor: WHITE,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: BORDER,
        padding: 16,
        fontSize: 14,
        color: NAVY,
        minHeight: 110,
    },

    // Bottom bar
    bottomBar: {
        marginTop: 'auto',
        backgroundColor: BG,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
    },
    confirmBtn: {
        backgroundColor: NAVY,
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: NAVY, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
    },
    confirmBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
    confirmBtnText: { fontSize: 15, fontWeight: '900', color: WHITE, letterSpacing: 0.8 },
    backLinkBtn: { alignItems: 'center', paddingVertical: 14 },
    backLinkText: { fontSize: 14, fontWeight: '600', color: GRAY },
});
