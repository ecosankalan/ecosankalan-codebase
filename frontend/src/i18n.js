import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ecosankalan_lang',
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

// Keep <html lang> in sync for a11y / SEO
i18n.on('languageChanged', (lng) => {
  try {
    document.documentElement.lang = lng === 'hi' ? 'hi' : 'en';
  } catch { /* noop */ }
});
try {
  document.documentElement.lang = (i18n.language || 'en').split('-')[0];
} catch { /* noop */ }

export default i18n;
