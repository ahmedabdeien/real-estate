import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    ar: {
        translation: translationAR,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['queryString', 'cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
    });

// Handle RTL
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

// Initial check
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;
document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'; // Force body dir as well for some CSS frameworks

export default i18n;
