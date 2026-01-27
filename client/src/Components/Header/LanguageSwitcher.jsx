import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white font-medium text-sm backdrop-blur-md border border-white/20"
        >
            <Languages size={16} />
            <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
};

export default LanguageSwitcher;
