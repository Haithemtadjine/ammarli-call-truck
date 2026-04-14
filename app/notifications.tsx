import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#002952',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    bgLight: '#FBFBFB',
    borderGray: '#F1F5F9',
    green: '#10B981',
    blue: '#3B82F6',
    orange: '#F59E0B',
    red: '#EF4444',
};

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { notifications, markAllNotificationsAsRead } = useAppStore();

    const getIconConfig = (type: string) => {
        switch (type) {
            case 'order':
                return { name: 'file-document-outline', color: COLORS.green, bg: '#ECFDF5', family: 'MaterialCommunityIcons' };
            case 'schedule':
                return { name: 'time-outline', color: COLORS.blue, bg: '#EFF6FF', family: 'Ionicons' };
            case 'promo':
                return { name: 'star-outline', color: COLORS.orange, bg: '#FFFBEB', family: 'Ionicons' };
            case 'driver':
                return { name: 'car-outline', color: COLORS.yellow, bg: '#FEFCE8', family: 'Ionicons' };
            default:
                return { name: 'notifications-outline', color: COLORS.navy, bg: '#F1F5F9', family: 'Ionicons' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Notifications')}</Text>
                <TouchableOpacity onPress={markAllNotificationsAsRead}>
                    <Text style={styles.markReadText}>{t('Mark all as read')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length > 0 ? (
                    notifications.map((item) => {
                        const icon = getIconConfig(item.type);
                        const IconComp: any = icon.family === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

                        return (
                            <View key={item.id} style={styles.notiCard}>
                                <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                                    <IconComp name={icon.name} size={24} color={icon.color} />
                                </View>
                                <View style={styles.notiBody}>
                                    <View style={styles.notiTopRow}>
                                        <Text style={[styles.notiTitle, !item.isRead && styles.unreadTitle]}>
                                            {item.title}
                                        </Text>
                                        {!item.isRead && <View style={styles.unreadDot} />}
                                    </View>
                                    <Text style={styles.notiDesc}>{item.description}</Text>
                                    <Text style={styles.notiTime}>{item.time}</Text>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.borderGray} />
                        <Text style={styles.emptyText}>{t('No notifications yet')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderGray,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
    },
    markReadText: {
        fontSize: 12,
        color: COLORS.blue,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    notiCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    notiBody: {
        flex: 1,
    },
    notiTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notiTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.navy,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.navy,
    },
    notiDesc: {
        fontSize: 13,
        color: COLORS.textGray,
        lineHeight: 18,
        marginBottom: 8,
    },
    notiTime: {
        fontSize: 11,
        color: '#94A3B8',
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textGray,
    },
});
