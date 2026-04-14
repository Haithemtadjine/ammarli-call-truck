import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';

export default function PromosScreen() {
    const { colors } = useTheme();
    const COLORS = {
        ...colors,
        navy: colors.textPrimary,
        yellow: colors.accent,
        white: colors.surface,
        paleYellow: colors.iconContainer,
        grayText: colors.textSecondary,
        grayHint: colors.textSecondary,
        grayBorder: colors.border,
        background: colors.background,
    };
    const styles = getStyles(COLORS);
    const { t } = useTranslation();

    const [promoCode, setPromoCode] = useState('');

    const offers = [
        {
            id: '1',
            icon: 'gift-outline',
            title: t('20% OFF your next Spring Water order'),
            subtitle: t('Valid until end of month'),
        },
        {
            id: '2',
            icon: 'tag-outline',
            title: t('Get AED 20 back on orders over AED 100'),
            subtitle: t('Cashback applied to wallet'),
        },
        {
            id: '3',
            icon: 'gift-outline',
            title: t('Free Delivery on 5 Gal Bottles'),
            subtitle: t('Applies automatically at checkout'),
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.contentContainer, { paddingTop: 20 }]}
            >
            {/* Header */}
            <Text style={styles.screenTitle}>{t('Promotions')}</Text>

            {/* Add Promo Code Section */}
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>{t('Add Promo Code')}</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder={t('Enter code')}
                    placeholderTextColor={COLORS.grayHint}
                    value={promoCode}
                    onChangeText={setPromoCode}
                />
                <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
                    <Text style={styles.applyButtonText}>{t('APPLY')}</Text>
                </TouchableOpacity>
            </View>

            {/* Available Offers Section */}
            <View style={[styles.sectionHeaderContainer, { marginTop: 30 }]}>
                <Text style={styles.sectionTitle}>{t('Available Offers')}</Text>
            </View>

            <View style={styles.offersContainer}>
                {offers.map((offer) => (
                    <View key={offer.id} style={styles.offerCard}>
                        {/* Left: Icon */}
                        <View style={styles.cardLeft}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name={offer.icon as any} size={28} color={COLORS.yellow} />
                            </View>
                        </View>

                        {/* Middle: Text Stack */}
                        <View style={styles.cardMiddle}>
                            <Text style={styles.offerTitle}>{offer.title}</Text>
                            <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                        </View>

                        {/* Right: Button */}
                        <View style={styles.cardRight}>
                            <TouchableOpacity style={styles.useButton} activeOpacity={0.8}>
                                <Text style={styles.useButtonText}>{t('USE')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.navy,
        marginBottom: 30, // Spacing below total header
    },
    sectionHeaderContainer: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayBorder,
        padding: 5, // padding inside to space out input and internal button
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        height: 48,
        paddingHorizontal: 15,
        fontSize: 16,
        color: COLORS.navy,
    },
    applyButton: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8, // inner radius
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: COLORS.background, // contrasting button background text
        fontWeight: 'bold',
        fontSize: 14,
    },
    offersContainer: {
        gap: 15,
    },
    offerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.grayBorder,
        padding: 20,
        // Optional subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardLeft: {
        marginRight: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16, // rounded square
        backgroundColor: COLORS.paleYellow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardMiddle: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 10,
    },
    offerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 6,
        lineHeight: 20,
    },
    offerSubtitle: {
        fontSize: 13,
        color: COLORS.grayText,
    },
    cardRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    useButton: {
        backgroundColor: COLORS.navy,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20, // pill shaped
    },
    useButtonText: {
        color: COLORS.background, // Contrasting text color
        fontSize: 13,
        fontWeight: 'bold',
    }
});
