import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const toggleLanguage = () => {
        i18n.changeLanguage(isAr ? 'en' : 'ar');
    };

    return (
        <button
            onClick={toggleLanguage}
            title={isAr ? 'Switch to English' : 'التبديل للعربية'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5"
            style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(223,186,107,0.25)',
                color: '#DFBA6B',
            }}
        >
            <span className="text-[11px] leading-none">{isAr ? 'EN' : 'ع'}</span>
            <span className="hidden sm:inline">{isAr ? 'English' : 'عربي'}</span>
        </button>
    );
};

export default LanguageSwitcher;
