import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    bgGray: '#F5F5F5',
    inputBg: '#F3F4F6',
    textGray: '#9CA3AF',
    textDark: '#1F2937',
    cloudGray: '#E5E7EB',
};

type Message = {
    id: string;
    text: string;
    sender: 'driver' | 'user';
    timestamp: string;
    isTypingIndicator?: boolean;
};

export default function ChatDriverScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { driver } = useAppStore();

    const INITIAL_MESSAGES: Message[] = [
        {
            id: '1',
            text: t("I'm arriving at your location"),
            sender: 'driver',
            timestamp: '10:42 AM',
        },
        {
            id: '2',
            text: t("Great, I'll open the main gate for you."),
            sender: 'user',
            timestamp: '10:43 AM',
        },
        {
            id: '3',
            text: t("Perfect, pulling in now!"),
            sender: 'driver',
            timestamp: '10:44 AM',
        },
    ];

    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        let timeout: any;
        if (messages.length > 0) {
            timeout = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [messages]);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        };
    }, []);

    const handleCallDriver = () => {
        Linking.openURL('tel:+1234567890');
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputText('');

        // Simulate typing indicator
        const typingMsgId = 'typing-' + Date.now();
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: typingMsgId, text: '', sender: 'driver', timestamp: '', isTypingIndicator: true }
            ]);

            // Simulate driver reply after 2 seconds
            typingTimerRef.current = setTimeout(() => {
                setMessages((prev) => {
                    const filtered = prev.filter(m => m.id !== typingMsgId);
                    return [
                        ...filtered,
                        {
                            id: Date.now().toString(),
                            text: t("Okay, I see you!"),
                            sender: 'driver',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ];
                });
            }, 2000);

        }, 500);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';

        if (item.isTypingIndicator) {
            return (
                <View style={[styles.messageRow, styles.messageRowDriver]}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.chatAvatar}
                    />
                    <View style={styles.typingBubble}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowDriver]}>
                {!isUser && (
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.chatAvatar}
                    />
                )}

                <View style={{ maxWidth: '80%' }}>
                    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleDriver]}>
                        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextDriver]}>
                            {item.text}
                        </Text>
                    </View>
                    <View style={[styles.timeContainer, isUser ? styles.timeContainerRight : styles.timeContainerLeft]}>
                        <Text style={styles.timeText}>{item.timestamp}</Text>
                        {isUser && <Ionicons name="checkmark-done" size={14} color={COLORS.navy} style={{ marginLeft: 4 }} />}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.headerAvatar}
                    />
                    <View>
                        <Text style={styles.headerName}>{driver?.name || 'Driver'}</Text>
                        <Text style={styles.headerStatus}>{t('Online')}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={handleCallDriver} style={styles.callButton}>
                    <Ionicons name="call" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Chat Body */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatListContent}
                ListHeaderComponent={() => (
                    <View style={styles.dateHeaderBadge}>
                        <Text style={styles.dateHeaderText}>{t('Today, 10:42 AM')}</Text>
                    </View>
                )}
            />

            {/* Input Area */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.inputPill}>
                    <TouchableOpacity style={styles.cameraIcon}>
                        <Ionicons name="camera" size={24} color={COLORS.textGray} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.textInput}
                        placeholder={t('Type a message...')}
                        placeholderTextColor={COLORS.textGray}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={16} color={COLORS.navy} style={styles.sendIcon} />
                    </TouchableOpacity>
                </View>

                {/* Visual Home Indicator Pill Line for exact UI replication */}
                {Platform.OS === 'ios' && <View style={styles.homeIndicator} />}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgGray,
    },
    header: {
        backgroundColor: COLORS.navy,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerStatus: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatListContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    dateHeaderBadge: {
        alignSelf: 'center',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 20,
    },
    dateHeaderText: {
        fontSize: 12,
        color: COLORS.textGray,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    messageRowDriver: {
        justifyContent: 'flex-start',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    chatAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    bubbleDriver: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4, // creates the tail effect
    },
    bubbleUser: {
        backgroundColor: COLORS.navy,
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 22,
    },
    bubbleTextDriver: {
        color: COLORS.textDark,
    },
    bubbleTextUser: {
        color: COLORS.white,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    timeContainerLeft: {
        justifyContent: 'flex-start',
    },
    timeContainerRight: {
        justifyContent: 'flex-end',
    },
    timeText: {
        fontSize: 11,
        color: COLORS.textGray,
    },
    typingBubble: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 2,
    },
    inputContainer: {
        backgroundColor: COLORS.white,
        paddingTop: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    inputPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    cameraIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
        maxHeight: 100,
        paddingVertical: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.yellow,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    sendIcon: {
        marginLeft: 4, // Visual balance for paper airplane
    },
    homeIndicator: {
        width: 130,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center',
        marginTop: 20,
    }
});

