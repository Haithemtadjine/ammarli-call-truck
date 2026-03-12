import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { changeLanguage } from '../src/localization/i18n';
import { useTheme } from '../src/theme/ThemeContext';

export default function SettingsScreen() {
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const COLORS = colors;
    const styles = getStyles(COLORS);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const paddingTopWithSafeArea = Math.max(insets.top + 20, 40);
    const { t, i18n } = useTranslation();

    const [isLangModalVisible, setLangModalVisible] = useState(false);
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLanguageSelect = async (lang: string) => {
        setLangModalVisible(false);
        const needsReload = await changeLanguage(lang);
        if (needsReload) {
            alert('Language changed. Please restart the app to apply layout direction changes completely.');
        }
    };

    const SettingsRow = ({ iconName, title, rightText, isDestructive, hasChevron = true, onPress, componentRight }: any) => {
        const titleColor = isDestructive ? '#E63946' : COLORS.textPrimary;
        const iconColor = isDestructive ? '#E63946' : COLORS.textPrimary;

        return (
            <TouchableOpacity
                style={styles.rowContainer}
                activeOpacity={0.7}
                onPress={onPress}
                disabled={!onPress && !hasChevron && !componentRight}
            >
                <View style={styles.rowLeft}>
                    <Ionicons name={iconName} size={22} color={iconColor} style={styles.rowIcon} />
                    <Text style={[styles.rowTitle, { color: titleColor }]}>{title}</Text>
                </View>

                <View style={styles.rowRight}>
                    {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                    {componentRight && componentRight}
                    {hasChevron && !componentRight && (
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} style={styles.chevron} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: paddingTopWithSafeArea }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Settings')}</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Section 1: APP PREFERENCES */}
                <Text style={styles.sectionTitle}>{t('APP PREFERENCES')}</Text>
                <View style={styles.card}>
                    <SettingsRow
                        iconName="globe-outline"
                        title={t('Language')}
                        rightText={i18n.language === 'ar' ? t('Arabic') : t('English')}
                        onPress={() => setLangModalVisible(true)}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        iconName="moon-outline"
                        title={t('Dark Mode')}
                        hasChevron={false}
                        componentRight={
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: COLORS.textSecondary, true: COLORS.textPrimary }}
                                thumbColor={isDarkMode ? COLORS.accent : COLORS.surface}
                                ios_backgroundColor={COLORS.textSecondary}
                                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            />
                        }
                    />
                </View>

                {/* Section 2: ACCOUNT */}
                <Text style={styles.sectionTitle}>{t('ACCOUNT')}</Text>
                <View style={styles.card}>
                    <SettingsRow
                        iconName="person-outline"
                        title={t('Edit Profile')}
                        onPress={() => router.push('/edit-profile')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        iconName="lock-closed-outline"
                        title={t('Change Password')}
                        onPress={() => setPasswordModalVisible(true)}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        iconName="trash-outline"
                        title={t('Delete Account')}
                        isDestructive
                        hasChevron={false}
                        onPress={() => {
                            Alert.alert(
                                t('Delete Account'),
                                t('Are you sure? This cannot be undone.'),
                                [
                                    { text: t('Cancel'), style: 'cancel' },
                                    { text: t('Delete'), style: 'destructive', onPress: () => { /* Handle delete logic later */ } }
                                ]
                            );
                        }}
                    />
                </View>

                {/* Section 3: ABOUT */}
                <Text style={styles.sectionTitle}>{t('ABOUT')}</Text>
                <View style={styles.card}>
                    <SettingsRow
                        iconName="help-circle-outline"
                        title={t('Help Center')}
                        onPress={() => router.push('/help')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        iconName="document-text-outline"
                        title={t('Privacy Policy')}
                        onPress={() => router.push('/privacy')}
                    />
                </View>

                {/* Footer */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        Alert.alert(
                            t('Logout Confirmation'),
                            t('Are you sure you want to sign out of your account?'),
                            [
                                { text: t('Cancel'), style: 'cancel' },
                                {
                                    text: t('Yes'),
                                    style: 'destructive',
                                    onPress: () => {
                                        // TODO: Implement actual AsyncStorage clearing
                                        router.replace('/login');
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.logoutText}>{t('Log Out')}</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>{t('App Version')}</Text>

            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isLangModalVisible}
                onRequestClose={() => setLangModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('Select Language')}</Text>

                        <TouchableOpacity
                            style={styles.langOption}
                            onPress={() => handleLanguageSelect('en')}
                        >
                            <Text style={[
                                styles.langOptionText,
                                i18n.language === 'en' && styles.langOptionSelectedText
                            ]}>English</Text>
                            {i18n.language === 'en' && <Ionicons name="checkmark" size={24} color={COLORS.textPrimary} />}
                        </TouchableOpacity>

                        <View style={styles.modalDivider} />

                        <TouchableOpacity
                            style={styles.langOption}
                            onPress={() => handleLanguageSelect('ar')}
                        >
                            <Text style={[
                                styles.langOptionText,
                                i18n.language === 'ar' && styles.langOptionSelectedText
                            ]}>العربية</Text>
                            {i18n.language === 'ar' && <Ionicons name="checkmark" size={24} color={COLORS.textPrimary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setLangModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isPasswordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{t('Change Password')}</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder={t('Current Password')}
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('New Password')}
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <TouchableOpacity
                            style={styles.saveModalButton}
                            onPress={() => {
                                setPasswordModalVisible(false);
                                setCurrentPassword('');
                                setNewPassword('');
                            }}
                        >
                            <Text style={styles.saveModalButtonText}>{t('Save')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => {
                                setPasswordModalVisible(false);
                                setCurrentPassword('');
                                setNewPassword('');
                            }}
                        >
                            <Text style={styles.modalCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.navy,
    },
    backButtonPlaceholder: {
        width: 44, // Matches backButton hit area approximately to keep title centered
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginTop: 24,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        marginRight: 16,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginRight: 8,
    },
    chevron: {
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 54, // Align with text start
        marginRight: 16,
    },
    logoutButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 30, // Pill shape
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 16,
    },
    logoutText: {
        color: '#003366', // Keep this text explicit or map to something else, since accent is yellow
        fontSize: 16,
        fontWeight: '700',
    },
    versionText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    langOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    langOptionText: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    langOptionSelectedText: {
        fontWeight: '700',
    },
    modalDivider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    modalCancelButton: {
        marginTop: 24,
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 16,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.background,
    },
    saveModalButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveModalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#003366',
    },
});
