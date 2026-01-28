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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-700 font-bold text-xs uppercase tracking-wider"
        >
            <Languages size={14} className="text-primary-600" />
            <span>{i18n.language === 'en' ? 'عربي' : 'English'}</span>
        </button>
    );
};

export default LanguageSwitcher;
