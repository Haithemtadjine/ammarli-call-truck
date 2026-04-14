import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/theme/ThemeContext';
import { clearUserSession } from '../../src/utils/storage';
import { changeLanguage } from '../../src/localization/i18n';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { colors } = useTheme();
    const COLORS = colors;
    const styles = getStyles(COLORS);

    const router = useRouter();
    const { t } = useTranslation();

    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

    const logout = useAppStore(s => s.logout);
    const language = useAppStore(s => s.language);
    const setLanguage = useAppStore(s => s.setLanguage);

    const handleLanguageSelect = async (lang: 'en' | 'ar') => {
        setLanguageModalVisible(false);
        if (lang === language) return;

        setLanguage(lang);
        const needsReload = await changeLanguage(lang);

        if (needsReload) {
            Alert.alert(
                t('Settings'),
                t('App layout needs to be refreshed to fully apply the Arabic shift. The app will now reload.'),
                [
                    { 
                        text: t('OK'), 
                        onPress: () => {
                            if (__DEV__ && NativeModules.DevSettings) {
                                NativeModules.DevSettings.reload();
                            }
                        } 
                    }
                ]
            );
        }
    };

    const handleSignOut = async () => {
        setLogoutModalVisible(false);
        // Navigate FIRST before wiping state — prevents null reads during transition
        router.replace('/login');
        await clearUserSession();
        logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: 20 },
                ]}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.userName}>{useAppStore((state) => state.userProfile?.name || 'Guest')}</Text>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>{useAppStore((state) => state.user?.rating ?? 4.8)} </Text>
                        <Ionicons name="star" size={14} color="#000" />
                        </View>
                    </View>
                    <View style={styles.avatarContainer}>
                        {/* Placeholder Avatar */}
                        <Image
                            source={{ uri: 'https://avatar.iran.liara.run/public/45' }}
                            style={styles.avatar}
                        />
                    </View>
                </View>

                {/* Quick Action Cards */}
                <View style={styles.quickActionsContainer}>
                    <QuickActionCard
                        iconFamily="Ionicons"
                        iconName="settings-sharp"
                        title={t('Settings')}
                        onPress={() => router.push('/settings')}
                    />
                    <QuickActionCard iconFamily="Ionicons" iconName="wallet" title={t('Wallet')} />
                    <QuickActionCard
                        iconFamily="Ionicons"
                        iconName="help-circle"
                        title={t('Help')}
                        onPress={() => router.push('/help')}
                    />
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        iconFamily="MaterialCommunityIcons"
                        iconName="account-edit"
                        title={t('Edit Profile')}
                        onPress={() => {
                            router.push('/edit-profile');
                        }}
                    />
                    <MenuItem
                        iconFamily="Ionicons"
                        iconName="card"
                        title={t('Payment Methods')}
                    />
                    <MenuItem
                        iconFamily="Ionicons"
                        iconName="language"
                        title={t('Language')}
                        onPress={() => setLanguageModalVisible(true)}
                    />
                    <MenuItem
                        iconFamily="Ionicons"
                        iconName="shield-checkmark"
                        title={t('Safety')}
                    />
                    <MenuItem
                        iconFamily="Ionicons"
                        iconName="lock-closed"
                        title={t('Privacy')}
                    />

                    <View style={styles.spacer} />

                    <MenuItem
                        iconFamily="Ionicons"
                        iconName="log-out-outline"
                        title={t('Logout')}
                        isLogout
                        onPress={() => setLogoutModalVisible(true)}
                    />
                </View>
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isLogoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Modal Icon */}
                        <Ionicons
                            name="log-out-outline"
                            size={40}
                            color={COLORS.textPrimary}
                            style={styles.modalIcon}
                        />

                        {/* Title and Subtitle */}
                        <Text style={styles.modalTitle}>{t('Sign Out?')}</Text>
                        <Text style={styles.modalSubtitle}>
                            {t('Are you sure you want to sign out of your account?')}
                        </Text>

                        {/* Buttons */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignOut}>
                            <Text style={styles.primaryButtonText}>{t('Sign Out')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setLogoutModalVisible(false)}>
                            <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Language Selection Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isLanguageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { padding: 20 }]}>
                        <Text style={[styles.modalTitle, { fontSize: 20, marginBottom: 20 }]}>{t('Select Language')}</Text>
                        
                        <TouchableOpacity style={styles.langOption} onPress={() => handleLanguageSelect('en')}>
                            <Text style={styles.langText}>English</Text>
                            {language === 'en' && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.langOption} onPress={() => handleLanguageSelect('ar')}>
                            <Text style={styles.langText}>العربية</Text>
                            {language === 'ar' && <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.secondaryButton, { marginTop: 15 }]} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function QuickActionCard({ iconFamily, iconName, title, onPress }: any) {
    const { colors } = useTheme();
    const COLORS = colors;
    const styles = getStyles(COLORS);

    const IconComponent: any = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    return (
        <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7} onPress={onPress}>
            <IconComponent name={iconName} size={32} color={COLORS.textPrimary} style={styles.quickActionIcon} />
            <Text style={styles.quickActionText}>{title}</Text>
        </TouchableOpacity>
    );
}

function MenuItem({ iconFamily, iconName, title, isLogout, onPress }: any) {
    const { colors } = useTheme();
    const COLORS = colors;
    const styles = getStyles(COLORS);

    const IconComponent: any = iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    const color = isLogout ? '#EF4444' : COLORS.textPrimary;
    return (
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <IconComponent name={iconName} size={24} color={color} style={styles.menuIcon} />
                <Text style={[styles.menuText, { color }]}>{title}</Text>
            </View>
            {!isLogout && (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            )}
        </TouchableOpacity>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 28,
        paddingBottom: 40,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    headerLeft: {
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    userName: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.textPrimary,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20, // pill shape
    },
    ratingText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: COLORS.iconContainer, // placeholder background
        borderWidth: 3,
        borderColor: COLORS.surface, // In the design the avatar sits plainly or has a soft edge, let's keep it clean
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    quickActionCard: {
        backgroundColor: COLORS.surface,
        width: (width - 56 - 24) / 3, // container width minus padding, minus gap, divide by 3
        aspectRatio: 1, // keeping it perfectly square
        borderRadius: 24, // quite curved exactly as in design
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 4,
        borderBottomColor: COLORS.accent,
        // subtle soft shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },
    quickActionIcon: {
        marginBottom: 12,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    menuContainer: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 20,
        width: 28, // fix width so text aligns perfectly vertically if there are any tiny icon diffs
        textAlign: 'center',
    },
    menuText: {
        fontSize: 18,
        fontWeight: '700',
    },
    spacer: {
        height: 20,
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalIcon: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: COLORS.accent,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: '#003366', // yellow button -> navy text always
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    langOption: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border || '#f0f0f0',
    },
    langText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    }
});
