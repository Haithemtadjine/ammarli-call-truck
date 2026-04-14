import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Alert,
    Modal,
    ScrollView, 
    StyleSheet, 
    Switch, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { changeLanguage } from '../src/localization/i18n';
import { useAppStore } from '../src/store/useAppStore';

const NAVY = '#003366';
const GRAY = '#64748B';
const BG = '#F8FAFC'; // Very light gray background like mockup
const WHITE = '#FFFFFF';
const ICON_BG = '#E2E8F0'; // Light gray box for icons

export default function DriverSettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const settings = useAppStore(s => s.appSettings);
    const updateSetting = useAppStore(s => s.updateAppSetting);
    const logout = useAppStore(s => s.logout);

    const [langModalVisible, setLangModalVisible] = useState(false);

    const handleLogout = () => {
        logout();
        router.replace('/driver-login');
    };

    const handleLanguageSelect = async (code: string, label: string) => {
        setLangModalVisible(false);
        updateSetting('language', label);
        const requiresRestart = await changeLanguage(code);
        
        if (requiresRestart) {
            Alert.alert(
                'Layout Changed',
                'The app layout direction has changed. Please restart the app for it to take effect properly.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={NAVY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('App Settings')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* ── GENERAL SETTINGS ── */}
                <Text style={styles.sectionTitle}>{t('GENERAL SETTINGS')}</Text>
                <View style={styles.cardGroup}>
                    
                    {/* Push Notifications */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="notifications" size={18} color={NAVY} />
                            </View>
                            <Text style={styles.rowText}>{t('Push Notifications')}</Text>
                        </View>
                        <Switch
                            value={settings.pushNotifications}
                            onValueChange={(val) => updateSetting('pushNotifications', val)}
                            trackColor={{ false: '#CBD5E1', true: NAVY }}
                            thumbColor={WHITE}
                        />
                    </View>
                    <View style={styles.rowDivider} />

                    {/* Location Services */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="location" size={18} color={NAVY} />
                            </View>
                            <Text style={styles.rowText}>{t('Location Services')}</Text>
                        </View>
                        <Switch
                            value={settings.locationServices}
                            onValueChange={(val) => updateSetting('locationServices', val)}
                            trackColor={{ false: '#CBD5E1', true: NAVY }}
                            thumbColor={WHITE}
                        />
                    </View>
                    <View style={styles.rowDivider} />

                    {/* Sound & Vibration */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="volume-high" size={18} color={NAVY} />
                            </View>
                            <Text style={styles.rowText}>{t('Sound & Vibration')}</Text>
                        </View>
                        <Switch
                            value={settings.soundVibration}
                            onValueChange={(val) => updateSetting('soundVibration', val)}
                            trackColor={{ false: '#CBD5E1', true: NAVY }}
                            thumbColor={WHITE}
                        />
                    </View>

                </View>

                {/* ── PREFERENCES ── */}
                <Text style={styles.sectionTitle}>{t('PREFERENCES')}</Text>
                <View style={styles.cardGroup}>
                    
                    {/* Dark Mode */}
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="moon" size={18} color={NAVY} />
                            </View>
                            <Text style={styles.rowText}>{t('Dark Mode')}</Text>
                        </View>
                        <Switch
                            value={settings.darkMode}
                            onValueChange={(val) => updateSetting('darkMode', val)}
                            trackColor={{ false: '#CBD5E1', true: NAVY }}
                            thumbColor={WHITE}
                        />
                    </View>
                    <View style={styles.rowDivider} />

                    {/* App Language */}
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setLangModalVisible(true)}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="globe" size={18} color={NAVY} />
                            </View>
                            <View>
                                <Text style={styles.rowText}>{t('App Language')}</Text>
                                <Text style={styles.rowSubText}>{settings.language}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />    
                        </View>
                    </TouchableOpacity>

                </View>

                {/* ── ACCOUNT ── */}
                <Text style={styles.sectionTitle}>{t('ACCOUNT')}</Text>
                <View style={styles.cardGroup}>
                    
                    {/* Log Out */}
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleLogout}>
                        <View style={styles.rowLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="log-out-outline" size={18} color={NAVY} />
                            </View>
                            <Text style={styles.rowText}>{t('Log Out')}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

                {/* Footer Version Info */}
                <View style={styles.footerInfo}>
                    <Text style={styles.footerText}>{t('App Version')}</Text>
                    <Text style={styles.footerText}>© 2024 Premium App Design</Text>
                </View>

            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={langModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLangModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                                <Ionicons name="close" size={24} color={NAVY} />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.langOption} 
                            onPress={() => handleLanguageSelect('en', 'English (US)')}
                        >
                            <Text style={styles.langOptionText}>English 🇺🇸</Text>
                            {settings.language.includes('English') && <Ionicons name="checkmark" size={20} color={NAVY} />}
                        </TouchableOpacity>
                        
                        <View style={styles.rowDivider} />
                        
                        <TouchableOpacity 
                            style={styles.langOption} 
                            onPress={() => handleLanguageSelect('ar', 'العربية')}
                        >
                            <Text style={styles.langOptionText}>العربية 🇩🇿</Text>
                            {settings.language.includes('العربية') && <Ionicons name="checkmark" size={20} color={NAVY} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
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
        borderRadius: 22,
        backgroundColor: '#E2E8F0',
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
        backgroundColor: '#E2E8F0',
        width: '100%',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 1.2,
        marginBottom: 10,
        marginLeft: 4,
    },
    cardGroup: {
        backgroundColor: WHITE,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        // Slight shadow to match the floating look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        minHeight: 64, // Sufficient tap target height
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: ICON_BG,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    rowSubText: {
        fontSize: 12,
        color: GRAY,
        marginTop: 2,
    },
    rowDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 52, // Indents past the icon box
    },
    languageSelectText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    footerInfo: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: NAVY,
    },
    langOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    langOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
});
