import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    lightGray: '#F9FAFB',
    borderGray: '#E5E7EB',
    starEmpty: '#E5E7EB',
};

export default function RatingModal() {
    const { t } = useTranslation();
    const { driver, pendingRating, setPendingRating } = useAppStore();
    const [driverRating, setDriverRating] = useState(0);
    const [appRating, setAppRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!pendingRating) return null;

    const driverName = driver?.name || 'Ahmed Abdullah';

    const handleSubmit = () => {
        if (driverRating === 0 || appRating === 0) {
            Alert.alert(t('Error'), t('Please provide both ratings before submitting.'));
            return;
        }
        Alert.alert(t('Success'), t('Thank you for your feedback!'));
        setPendingRating(false);
        setDriverRating(0);
        setAppRating(0);
        setComment('');
    };

    const handleClose = () => {
        // According to flow, users should ideally submit the review.
        // But if they force close the modal:
        setPendingRating(false);
        setDriverRating(0);
        setAppRating(0);
        setComment('');
    };

    return (
        <Modal transparent visible={pendingRating} animationType="slide" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContent}>
                        {/* Title */}
                        <Text style={styles.modalTitle}>{t('Rate Your Experience')}</Text>

                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Driver Profile */}
                            <View style={styles.driverProfileContainer}>
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>{driverName.charAt(0)}</Text>
                                </View>
                                <Text style={styles.driverName}>{driverName}</Text>
                            </View>

                            {/* Driver 5-Star Rating */}
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={`driver-${star}`}
                                        onPress={() => setDriverRating(star)}
                                        activeOpacity={0.7}
                                        style={styles.starButton}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={36}
                                            color={star <= driverRating ? COLORS.yellow : COLORS.starEmpty}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* App Rating Prompt */}
                            <Text style={styles.appRatingPrompt}>{t('How do you like the Ammerli app?')}</Text>

                            {/* App 5-Star Rating */}
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={`app-${star}`}
                                        onPress={() => setAppRating(star)}
                                        activeOpacity={0.7}
                                        style={styles.starButton}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={36}
                                            color={star <= appRating ? COLORS.yellow : COLORS.starEmpty}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Comment Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('Additional comments (optional)')}
                                    placeholderTextColor={COLORS.textGray}
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>{t('Submit Review')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 34, 68, 0.95)', // Dark navy semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        paddingTop: 30,
        paddingBottom: 24,
        paddingHorizontal: 20,
        alignItems: 'stretch',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 25,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    driverProfileContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#39827B', // Teal color like in the design snapshot
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.yellow,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    starButton: {
        paddingHorizontal: 5,
    },
    appRatingPrompt: {
        fontSize: 16,
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 15,
    },
    inputContainer: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderGray,
        marginBottom: 20,
    },
    textInput: {
        width: '100%',
        minHeight: 120, // Make it tall enough for multiline
        padding: 16,
        fontSize: 15,
        color: COLORS.navy,
    },
    submitButton: {
        width: '100%',
        backgroundColor: COLORS.yellow,
        borderRadius: 12,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
