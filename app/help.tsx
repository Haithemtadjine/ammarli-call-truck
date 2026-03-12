import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
};

export default function HelpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const faqs = [
        { question: t('How to track my order?'), id: 1 },
        { question: t('Change delivery address'), id: 2 },
        { question: t('Report a missing item'), id: 3 },
    ];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header Section */}
            <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.yellow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Help & Support')}</Text>
                    <View style={{ width: 40 }} /> {/* Spacer */}
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.navy} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('Search for help')}
                        placeholderTextColor={COLORS.navy}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Main Body */}
            <ScrollView
                style={styles.mainBody}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Categories Section */}
                <Text style={styles.sectionTitle}>{t('Categories')}</Text>

                <CategoryCard icon="card" title={t('Account & Payment')} />
                <CategoryCard icon="cube" title={t('Orders & Delivery')} />
                <CategoryCard icon="shield-checkmark" title={t('Safety')} />

                {/* FAQ Section */}
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>{t('Frequently Asked Questions')}</Text>

                <View style={styles.faqListContainer}>
                    {faqs.map((faq, index) => (
                        <TouchableOpacity key={faq.id} style={[styles.faqRow, index === faqs.length - 1 && styles.faqRowLast]}>
                            <Text style={styles.faqText}>{faq.question}</Text>
                            <Ionicons name="chevron-down" size={20} color={COLORS.yellow} />
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Reusable Category Card component
function CategoryCard({ icon, title }: any) {
    return (
        <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
            <View style={styles.categoryIconContainer}>
                <Ionicons name={icon} size={24} color={COLORS.yellow} />
            </View>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.yellow} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.yellow, // Main body background is yellow per requirements
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
        marginBottom: 20,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.yellow,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.navy,
    },
    mainBody: {
        flex: 1,
        backgroundColor: COLORS.yellow,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 15,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.navy,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(243, 205, 13, 0.15)', // light yellow tint for icon background to sit on the navy card
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    categoryTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.yellow,
    },
    faqListContainer: {
        backgroundColor: COLORS.navy,
        borderRadius: 12,
        overflow: 'hidden',
    },
    faqRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(243, 205, 13, 0.2)', // faint yellow line separator
    },
    faqRowLast: {
        borderBottomWidth: 0,
    },
    faqText: {
        fontSize: 15,
        color: COLORS.yellow,
        flex: 1,
        marginRight: 15,
    }
});
