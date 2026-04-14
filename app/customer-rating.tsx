import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// ─── Theme ──────────────────────────────────────────────────────────────────
const NAVY   = '#002952';
const YELLOW = '#F3CD0D';
const WHITE  = '#FFFFFF';
const GRAY   = '#6B7280';
const LIGHT  = '#F5F7FA';
const BORDER = '#E5E7EB';
const GREEN  = '#10B981';

// ─── Quick-tag chips per star range ─────────────────────────────────────────
const TAGS_BY_RATING: Record<number, string[]> = {
    1: ['Very Late', 'Inappropriate Behavior', 'Order Issue', 'Did Not Arrive'],
    2: ['Somewhat Late', 'Poor Communication', 'Missing Items'],
    3: ['Acceptable', 'Slightly Late', 'Could Improve'],
    4: ['Fast', 'Friendly', 'Organized'],
    5: ['Excellent!', 'Very Fast', 'Very Friendly', 'Recommended', 'Best Driver'],
};

// ─── Star labels ─────────────────────────────────────────────────────────────
const STAR_LABELS = ['', 'Bad', 'Acceptable', 'Good', 'Excellent', 'Awesome!'];

export default function CustomerRatingScreen() {
    const router   = useRouter();
    const insets   = useSafeAreaInsets();
    const { t } = useTranslation();
    const { activeOrder, completeOrder } = useAppStore();

    const driverName = (activeOrder as any)?.driver?.name || t('Driver');

    // ─── Rating state ─────────────────────────────────────────────────────
    const [rating,       setRating]   = useState(0);
    const [hoveredStar,  setHovered]  = useState(0);
    const [selectedTags, setTags]     = useState<string[]>([]);
    const [comment,      setComment]  = useState('');
    const [submitted,    setSubmitted] = useState(false);

    // ─── Star animation scales ────────────────────────────────────────────
    const starScales = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;
    const successScale = useRef(new Animated.Value(0)).current;

    const animateStar = (index: number) => {
        Animated.sequence([
            Animated.timing(starScales[index], {
                toValue: 1.4,
                duration: 120,
                easing: Easing.out(Easing.back(2)),
                useNativeDriver: true,
            }),
            Animated.timing(starScales[index], {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleStarPress = (star: number) => {
        setRating(star);
        setTags([]);   // reset chips when rating changes
        animateStar(star - 1);
    };

    const toggleTag = (tag: string) => {
        setTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = () => {
        // Animate success badge
        Animated.spring(successScale, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
        }).start();
        setSubmitted(true);

        // After brief celebration, complete order and go home
        setTimeout(() => {
            completeOrder();
            router.replace('/(tabs)');
        }, 2200);
    };

    const handleSkip = () => {
        completeOrder();
        router.replace('/(tabs)');
    };

    const displayStar = hoveredStar || rating;   // what star is "active" visually

    // ─── Submitted state ──────────────────────────────────────────────────
    if (submitted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
                    <Ionicons name="checkmark" size={52} color={NAVY} />
                </Animated.View>
                <Text style={styles.successTitle}>{t('Thank you for your rating!')}</Text>
                <Text style={styles.successSub}>{t('Your feedback helps us improve our service')}</Text>
            </View>
        );
    }

    // ─── Rating screen ────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header card ── */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={34} color={NAVY} />
                    </View>
                    <Text style={styles.driverName}>{driverName}</Text>
                    <Text style={styles.headerSub}>{t('How was your experience with the driver?')}</Text>
                </View>

                {/* ── 5 Stars ── */}
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(star => {
                        const filled = star <= displayStar;
                        return (
                            <Animated.View
                                key={star}
                                style={{ transform: [{ scale: starScales[star - 1] }] }}
                            >
                                <TouchableOpacity
                                    onPress={() => handleStarPress(star)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                >
                                    <Ionicons
                                        name={filled ? 'star' : 'star-outline'}
                                        size={52}
                                        color={filled ? YELLOW : BORDER}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Star label */}
                {rating > 0 && (
                    <Text style={styles.starLabel}>{t(STAR_LABELS[rating])}</Text>
                )}

                {/* ── Quick tags (appear after rating) ── */}
                {rating > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagsTitle}>{t('Select all that apply')}</Text>
                        <View style={styles.tagsWrap}>
                            {TAGS_BY_RATING[rating].map(tag => {
                                const active = selectedTags.includes(tag);
                                return (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => toggleTag(tag)}
                                        activeOpacity={0.8}
                                        style={[styles.chip, active && styles.chipActive]}
                                    >
                                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                            {t(tag)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* ── Optional comment ── */}
                {rating > 0 && (
                    <View style={styles.commentSection}>
                        <Text style={styles.commentLabel}>{t('Additional Comment (Optional)')}</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder={t('Write your comment here...')}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                            textAlign="left"
                        />
                    </View>
                )}

                {/* ── Spacer for bottom buttons ── */}
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {rating > 0 ? (
                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmit}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="checkmark-circle" size={20} color={NAVY} style={{ marginRight: 8 }} />
                        <Text style={styles.submitBtnText}>{t('Submit Rating')}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.submitBtnDisabled}
                        disabled
                    >
                        <Text style={styles.submitBtnDisabledText}>{t('Select stars first')}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                    <Text style={styles.skipText}>{t('Skip')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT,
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 24,
        alignItems: 'center',
    },

    // ── Header ──────────────────────────────────────────────────────────────
    headerCard: {
        width: '100%',
        backgroundColor: WHITE,
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 28,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: YELLOW,
    },
    driverName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 6,
    },
    headerSub: {
        fontSize: 14,
        color: GRAY,
        textAlign: 'center',
    },

    // ── Stars ────────────────────────────────────────────────────────────────
    starsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    starLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: NAVY,
        marginBottom: 24,
        letterSpacing: 0.5,
    },

    // ── Chips ────────────────────────────────────────────────────────────────
    tagsSection: {
        width: '100%',
        marginBottom: 20,
    },
    tagsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: GRAY,
        marginBottom: 12,
        textAlign: 'right',
    },
    tagsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-end',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: WHITE,
    },
    chipActive: {
        borderColor: NAVY,
        backgroundColor: NAVY,
    },
    chipText: {
        fontSize: 13,
        color: GRAY,
        fontWeight: '500',
    },
    chipTextActive: {
        color: YELLOW,
        fontWeight: '700',
    },

    // ── Comment ──────────────────────────────────────────────────────────────
    commentSection: {
        width: '100%',
        marginBottom: 8,
    },
    commentLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: GRAY,
        marginBottom: 10,
        textAlign: 'right',
    },
    commentInput: {
        backgroundColor: WHITE,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: BORDER,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        fontSize: 14,
        color: NAVY,
        minHeight: 90,
        textAlign: 'right',
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: `${LIGHT}EE`,
        gap: 10,
    },
    submitBtn: {
        backgroundColor: YELLOW,
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    submitBtnText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: NAVY,
    },
    submitBtnDisabled: {
        backgroundColor: BORDER,
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
    },
    submitBtnDisabledText: {
        fontSize: 16,
        color: GRAY,
        fontWeight: '600',
    },
    skipBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 14,
        color: GRAY,
        fontWeight: '500',
    },

    // ── Success ───────────────────────────────────────────────────────────────
    successCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: YELLOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: NAVY,
        marginBottom: 10,
    },
    successSub: {
        fontSize: 15,
        color: GRAY,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
