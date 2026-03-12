import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
};

export default function PrivacyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.yellow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Privacy Policy')}</Text>
                    <View style={{ width: 40 }} /> {/* Spacer */}
                </View>
            </View>

            {/* Main Body */}
            <ScrollView
                style={styles.mainBody}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.contentTitle}>{t('Privacy Policy')}</Text>
                <Text style={styles.paragraph}>
                    {/* Placeholder text, normally would be loaded from localization or backend */}
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    {'\n\n'}
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    {'\n\n'}
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingBottom: 25,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.yellow,
        textAlign: 'center',
    },
    mainBody: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    contentTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.navy,
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.textSecondary,
    }
});
