import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export type ThemeColors = {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    iconContainer: string;
    border: string;
};

const lightColors: ThemeColors = {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#003366',
    textSecondary: '#9CA3AF',
    accent: '#F3CD0D',
    iconContainer: '#F5F7FA',
    border: '#E5E7EB',
};

const darkColors: ThemeColors = {
    background: '#0A1325',
    surface: '#003366',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    accent: '#F3CD0D',
    iconContainer: '#1A2F4C',
    border: '#1E3A5F',
};

type ThemeContextType = {
    isDarkMode: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Read the dark mode preference from the global Zustard store directly
    const isDarkMode = useAppStore((state: any) => state.appSettings.darkMode);
    const updateAppSetting = useAppStore((state: any) => state.updateAppSetting);

    // Provide a toggle function to easily flip it
    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            updateAppSetting('darkMode', newTheme);
            await AsyncStorage.setItem('app_theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const colors = isDarkMode ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
