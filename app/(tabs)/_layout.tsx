import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTablet, MAX_CONTENT_WIDTH } from '../../src/utils/responsive';
import { useTheme } from '../../src/theme/ThemeContext';

export default function TabLayout() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // Compute safe tab bar sizing.
    // - TAB_CONTENT_HEIGHT: visible icon + label area
    // - bottomInset: gesture nav bar or home indicator
    const TAB_CONTENT_HEIGHT = 56;
    const bottomInset = insets.bottom;
    const tabBarHeight = TAB_CONTENT_HEIGHT + bottomInset;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: tabBarHeight,
                    paddingBottom: bottomInset + 4,
                    paddingTop: 8,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    // Tablet: constrain width so icons don't drift to screen edges
                    ...(isTablet && {
                        maxWidth: MAX_CONTENT_WIDTH,
                        alignSelf: 'center' as const,
                        width: '100%',
                        borderRadius: 0,
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 1,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: t('Home'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="promos"
                options={{
                    title: t('Promos'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="pricetag" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="activities"
                options={{
                    title: t('Activities'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('Profile'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
