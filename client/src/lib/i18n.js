import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationKZ from '../locales/kz/translation.json';
import translationRU from '../locales/ru/translation.json';
import translationEN from '../locales/en/translation.json';

const resources = {
  kz: {
    translation: translationKZ
  },
  ru: {
    translation: translationRU
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

