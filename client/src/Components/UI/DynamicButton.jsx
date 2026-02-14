import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function DynamicButton({ type = 'primary', className = '', ...props }) {
    const { ctas } = useSelector((state) => state.cta);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // Find the active CTA for the requested type
    const cta = ctas.find(c => c.type === type && c.active);

    if (!cta) return null;

    const label = cta.label[currentLang] || cta.label.en;

    // Determine styles based on type or custom color
    let style = {};
    if (cta.color) {
        style = { backgroundColor: cta.color, borderColor: cta.color };
    }

    // Determine if internal or external link
    const isExternal = cta.link.startsWith('http');

    const commonClasses = `inline-block px-6 py-3 text-white font-bold rounded-none shadow-md hover:shadow-lg transition-all ${className}`;

    if (isExternal) {
        return (
            <a href={cta.link} target="_blank" rel="noopener noreferrer" className={commonClasses} style={style} {...props}>
                {label}
            </a>
        );
    }

    return (
        <Link to={cta.link} className={commonClasses} style={style} {...props}>
            {label}
        </Link>
    );
}
