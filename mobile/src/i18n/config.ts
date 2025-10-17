import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation resources
import en from './locales/en.json';
import tr from './locales/tr.json';

const LANGUAGE_KEY = '@app_language';

// Get saved language from AsyncStorage
const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Error getting stored language:', error);
    return null;
  }
};

// Save language to AsyncStorage
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      debug: __DEV__,

      interpolation: {
        escapeValue: false,
      },

      react: {
        useSuspense: false,
      },
    });
};

initI18n();

export default i18n;
