/**
 * ScreenWrapper — Global Safe Area Wrapper
 *
 * Drop-in replacement for View/SafeAreaView that correctly applies
 * device-specific safe area insets on both iOS and Android using
 * react-native-safe-area-context (never the buggy react-native version).
 *
 * Usage:
 *   <ScreenWrapper>           — applies top + bottom insets
 *   <ScreenWrapper edges={['top']}>  — top only (e.g. map screens with custom bottom)
 *   <ScreenWrapper edges={['bottom']}>  — bottom only
 */

import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenWrapperProps {
    children: React.ReactNode;
    /** Which edges to apply inset padding to. Defaults to ['top', 'bottom']. */
    edges?: Edge[];
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
}

export default function ScreenWrapper({
    children,
    edges = ['top', 'bottom'],
    style,
    backgroundColor,
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    const paddingStyle: ViewStyle = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
    };

    return (
        <View
            style={[
                styles.container,
                backgroundColor ? { backgroundColor } : undefined,
                paddingStyle,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
