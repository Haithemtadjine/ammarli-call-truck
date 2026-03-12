import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('Notifications')}</Text>
            <Text>{t('No new notifications at this time.')}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#003366',
    },
});
