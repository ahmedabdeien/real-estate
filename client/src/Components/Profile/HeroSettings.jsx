import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure } from '../redux/config/configSlice';

// Reuse the same design tokens from AdminSettings
const IS = { border: '1.5px solid #e2e8f0', background: 'white', borderRadius: 0 };
const fcs = e => e.target.style.borderColor = '#8A6924';
const blr = e => e.target.style.borderColor = '#e2e8f0';

const Card = ({ title, children }) => (
    <div className="bg-white mb-5 overflow-hidden" style={{ border: '1px solid rgba(138,105,36,0.1)', boxShadow: '0 2px 12px rgba(18,40,60,0.04)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(18,40,60,0.02)', borderBottom: '1px solid rgba(138,105,36,0.08)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#12283C' }}>{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const F = ({ label, hint, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>{label}</label>
        {children}
        {hint && <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{hint}</p>}
    </div>
);

/**
 * HeroSettings — rendered inside AdminSettings when active === 'hero'.
 * Reads/writes directly through the parent's `form` state via props.
 * Props: get(path), set(path, value)
 */
export default function HeroSettings({ get, set }) {
    if (!get || !set) return (
        <div className="p-10 text-center text-sm" style={{ color: '#94a3b8' }}>
            جارٍ تحميل الإعدادات...
        </div>
    );

    const inp = (path, ph) => (
        <input type="text" value={get(path)} onChange={e => set(path, e.target.value)} placeholder={ph}
            className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fcs} onBlur={blr} />
    );

    const ta = (path, ph, rows = 3) => (
        <textarea value={get(path)} onChange={e => set(path, e.target.value)} placeholder={ph} rows={rows}
            className="w-full px-4 py-3 text-sm focus:outline-none resize-none" style={IS} onFocus={fcs} onBlur={blr} />
    );

    return (
        <>
        <Card title="عنوان القسم الرئيسي (Hero Title)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="العنوان بالعربية">
                    {inp('hero.title.ar', 'نصنع مستقبلاً يليق بطموحاتك')}
                </F>
                <F label="العنوان بالإنجليزية">
                    {inp('hero.title.en', 'We Build a Future Worth Your Ambitions')}
                </F>
            </div>
        </Card>

        <Card title="العنوان الفرعي (Subtitle)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <F label="العنوان الفرعي بالعربية">
                    {ta('hero.subtitle.ar', 'شركة الصرح للاستثمار العقاري...')}
                </F>
                <F label="العنوان الفرعي بالإنجليزية">
                    {ta('hero.subtitle.en', 'Al-Sarh Real Estate Investment...')}
                </F>
            </div>
        </Card>

        <Card title="نصوص الأزرار والشارة">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <F label="الشارة (Badge)" hint="تظهر فوق العنوان">
                    {inp('hero.badge', 'ابتكار معماري')}
                </F>
                <F label="نص الزر الأول (CTA Primary)">
                    {inp('hero.ctaPrimary', 'استكشف مشاريعنا')}
                </F>
                <F label="نص الزر الثاني (CTA Secondary)">
                    {inp('hero.ctaSecondary', 'استشارة مجانية')}
                </F>
            </div>
        </Card>

        <Card title="صور الهيرو (Hero Images)" >
            <p className="text-xs mb-3" style={{ color: '#6b5e3e' }}>
                أضف روابط صور الخلفية المتحركة في قسم الهيرو (واحدة في كل سطر).
            </p>
            <textarea
                value={(get('hero.images') || []).join('\n')}
                onChange={e => set('hero.images', e.target.value.split('\n').filter(Boolean))}
                rows={5}
                placeholder={"https://images.unsplash.com/...\nhttps://..."}
                className="w-full px-4 py-3 text-sm focus:outline-none resize-none font-mono"
                style={IS} onFocus={fcs} onBlur={blr}
            />
            <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>
                روابط Firebase Storage أو Cloudinary — رابط لكل سطر
            </p>
        </Card>

        {/* معاينة */}
        <Card title="معاينة نص الهيرو">
            <div className="p-8 relative overflow-hidden" style={{ background: '#12283C', minHeight: 160 }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                <div className="relative z-10">
                    {get('hero.badge') && (
                        <span className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-3"
                            style={{ border: '1px solid rgba(223,186,107,0.4)', color: '#DFBA6B' }}>
                            {get('hero.badge')}
                        </span>
                    )}
                    <h2 className="text-xl font-black text-white mb-2 leading-snug">
                        {get('hero.title.ar') || 'عنوان القسم الرئيسي'}
                    </h2>
                    <p className="text-xs" style={{ color: 'rgba(223,186,107,0.7)' }}>
                        {get('hero.subtitle.ar') || 'العنوان الفرعي يظهر هنا'}
                    </p>
                    <div className="flex gap-3 mt-4">
                        <span className="px-4 py-2 text-xs font-black" style={{ background: 'linear-gradient(135deg,#8A6924,#c4983a)', color: 'white' }}>
                            {get('hero.ctaPrimary') || 'الزر الأول'}
                        </span>
                        <span className="px-4 py-2 text-xs font-black" style={{ border: '1px solid rgba(223,186,107,0.4)', color: '#DFBA6B' }}>
                            {get('hero.ctaSecondary') || 'الزر الثاني'}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
        </>
    );
}
