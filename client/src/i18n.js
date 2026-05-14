import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationAR from './locales/ar/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ar: { translation: translationAR },
        },
        lng: 'ar',
        fallbackLng: 'ar',
        debug: false,
        interpolation: { escapeValue: false },
    });

// Always RTL Arabic
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';
document.body.dir = 'rtl';

export default i18n;
