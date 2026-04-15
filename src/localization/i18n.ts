import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { changeLanguage as i18nChangeLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';

const LANGUAGE_KEY = 'AppLanguage';

// ── Default to Arabic ─────────────────────────────────────────────────────────
const DEFAULT_LANGUAGE = 'ar';

const languageDetector: any = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (savedLanguage) {
                return callback(savedLanguage);
            }
            // Default: Arabic
            callback(DEFAULT_LANGUAGE);
        } catch (error) {
            console.log('Error reading language', error);
            callback(DEFAULT_LANGUAGE);
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources: {
            en: { translation: en },
            ar: { translation: ar },
        },
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

/**
 * Apply RTL at startup based on stored language.
 * Call this as early as possible in _layout.tsx.
 */
export const applyStoredRTL = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        const lang = savedLanguage ?? DEFAULT_LANGUAGE;
        const isRTL = lang === 'ar';
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
    } catch (e) {
        // Default to RTL (Arabic)
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
    }
};

/**
 * Change language at runtime.
 * Returns true if RTL direction changed (requires app reload to fully apply).
 */
export const changeLanguage = async (language: string): Promise<boolean> => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18nChangeLanguage(language);

    const isRTL = language === 'ar';
    const needsRTLChange = I18nManager.isRTL !== isRTL;

    if (needsRTLChange) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        return true; // Caller must reload the app
    }
    return false;
};

export default i18n;
