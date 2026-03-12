import AsyncStorage from '@react-native-async-storage/async-storage';

const APPOINTMENT_KEY = '@ammarli_appointment';

export const saveAppointment = async (appointmentStr: string) => {
    try {
        await AsyncStorage.setItem(APPOINTMENT_KEY, appointmentStr);
    } catch (e) {
        console.error('Error saving appointment', e);
    }
};

export const getAppointment = async (): Promise<string | null> => {
    try {
        const value = await AsyncStorage.getItem(APPOINTMENT_KEY);
        return value;
    } catch (e) {
        console.error('Error retrieving appointment', e);
        return null;
    }
};

export const clearAppointment = async () => {
    try {
        await AsyncStorage.removeItem(APPOINTMENT_KEY);
    } catch (e) {
        console.error('Error clearing appointment', e);
    }
};

const USER_SESSION_KEY = '@ammarli_user_session';

export const saveUserSession = async (uid: string) => {
    try {
        await AsyncStorage.setItem(USER_SESSION_KEY, uid);
    } catch (e) {
        console.error('Error saving user session', e);
    }
};

export const getUserSession = async (): Promise<string | null> => {
    try {
        const value = await AsyncStorage.getItem(USER_SESSION_KEY);
        return value;
    } catch (e) {
        console.error('Error retrieving user session', e);
        return null;
    }
};

export const clearUserSession = async () => {
    try {
        await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (e) {
        console.error('Error clearing user session', e);
    }
};
