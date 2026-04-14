/**
 * ResponsiveContainer
 * Drop-in wrapper that constrains content to MAX_CONTENT_WIDTH on tablets
 * and remains full-width on phones.
 *
 * Usage:
 *   <ResponsiveContainer style={styles.myContainer}>
 *     ...
 *   </ResponsiveContainer>
 */
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { centredContainer } from '../utils/responsive';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /** If true, fills remaining vertical space (flex:1). Default: true */
    flex?: boolean;
}

export default function ResponsiveContainer({ children, style, flex = true }: Props) {
    return (
        <View style={[flex && styles.flexFill, styles.outer]}>
            <View style={[styles.inner, style]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flexFill: {
        flex: 1,
    },
    outer: {
        width: '100%',
        alignItems: 'center',
    },
    inner: {
        ...centredContainer,
        flex: 1,
    },
});
