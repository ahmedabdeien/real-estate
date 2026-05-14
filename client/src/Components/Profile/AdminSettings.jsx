import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure, updateConfigSuccess } from '../redux/config/configSlice';
import {
    HiCog, HiColorSwatch, HiPhone, HiOfficeBuilding, HiShare, HiPhotograph,
    HiTranslate, HiSave, HiCheckCircle, HiExclamationCircle, HiGlobe,
    HiCollection, HiChevronLeft, HiStar, HiInformationCircle, HiCode,
} from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import { BsFacebook, BsInstagram, BsWhatsapp, BsYoutube, BsTiktok, BsLinkedin, BsTwitterX } from 'react-icons/bs';
import HeroSettings from './HeroSettings';
import MediaManager from './MediaManager';
import TranslationManager from './TranslationManager';

// ─── Sidebar sections ───────────────────────────────────────────────────────
const SECTIONS = [
    { key: 'general',      label: 'هوية الموقع',           icon: HiCog },
    { key: 'seo',          label: 'تحسين محركات البحث',    icon: HiGlobe },
    { key: 'hero',         label: 'قسم الرئيسية (Hero)',   icon: HiPhotograph },
    { key: 'colors',       label: 'الألوان والتصميم',       icon: HiColorSwatch },
    { key: 'stats',        label: 'إحصائيات الشركة',        icon: HiStar },
    { key: 'about',        label: 'قسم "من نحن"',           icon: HiInformationCircle },
    { key: 'services',     label: 'قسم الخدمات',            icon: HiCollection },
    { key: 'footer',       label: 'الفوتر',                 icon: HiCode },
    { key: 'contact',      label: 'بيانات التواصل',         icon: HiPhone },
    { key: 'branches',     label: 'الفروع',                 icon: HiOfficeBuilding },
    { key: 'social',       label: 'وسائل التواصل الاجتماعي', icon: HiShare },
    { key: 'media',        label: 'مكتبة الوسائط',          icon: HiPhotograph },
    { key: 'translations', label: 'الترجمات',               icon: HiTranslate },
];

// ─── Mini components ────────────────────────────────────────────────────────
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

const IS = { border: '1.5px solid #e2e8f0', background: 'white', borderRadius: 0 };
const fcs = e => e.target.style.borderColor = '#8A6924';
const blr = e => e.target.style.borderColor = '#e2e8f0';

const Inp = ({ value, onChange, placeholder, type = 'text', rows }) =>
    rows ? (
        <textarea value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows}
            className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
            style={IS} onFocus={fcs} onBlur={blr} />
    ) : (
        <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={IS} onFocus={fcs} onBlur={blr} />
    );

const ColorPair = ({ value, onChange, placeholder }) => (
    <div className="flex items-center gap-3">
        <input type="color" value={value || '#8A6924'} onChange={onChange}
            className="w-12 h-11 cursor-pointer" style={{ border: '1.5px solid #e2e8f0', padding: 2 }} />
        <input type="text" value={value || ''} onChange={onChange} placeholder={placeholder}
            className="flex-1 px-4 py-3 text-sm focus:outline-none"
            style={IS} onFocus={fcs} onBlur={blr} />
    </div>
);

// ─── deep clone helper ──────────────────────────────────────────────────────
const clone = o => JSON.parse(JSON.stringify(o || {}));

export default function AdminSettings() {
    const { config, loading } = useSelector(s => s.config);
    const { currentUser }     = useSelector(s => s.user);
    const dispatch = useDispatch();

    const [active, setActive]     = useState('general');
    const [form,   setForm]       = useState({});
    const [status, setStatus]     = useState(null); // saving | success | error

    // ── fetch config ──────────────────────────────────────
    useEffect(() => {
        dispatch(fetchConfigStart());
        fetch('/api/config')
            .then(r => r.json())
            .then(d => { dispatch(fetchConfigSuccess(d)); setForm(clone(d)); })
            .catch(e => dispatch(fetchConfigFailure(e.message)));
    }, [dispatch]);

    // ── deep set helper ───────────────────────────────────
    const set = (path, value) => setForm(prev => {
        const next = clone(prev);
        const keys = path.split('.');
        let ref = next;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!ref[keys[i]]) ref[keys[i]] = {};
            ref = ref[keys[i]];
        }
        ref[keys[keys.length - 1]] = value;
        return next;
    });

    const get = path => {
        const keys = path.split('.');
        let ref = form;
        for (const k of keys) { if (ref == null) return ''; ref = ref[k]; }
        return ref ?? '';
    };

    // ── save ──────────────────────────────────────────────
    const save = async () => {
        setStatus('saving');
        try {
            const res = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setStatus('error'); return; }
            dispatch(updateConfigSuccess(data));
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch { setStatus('error'); }
    };

    if (!currentUser?.isAdmin) return (
        <div className="p-20 text-center text-sm font-bold" style={{ color: '#6b5e3e' }}>
            غير مصرح بالوصول إلى هذه الصفحة
        </div>
    );

    const inp = (path, ph) => <Inp value={get(path)} onChange={e => set(path, e.target.value)} placeholder={ph} />;
    const ta  = (path, ph, rows = 3) => <Inp value={get(path)} onChange={e => set(path, e.target.value)} placeholder={ph} rows={rows} />;
    const clr = (path, ph) => <ColorPair value={get(path)} onChange={e => set(path, e.target.value)} placeholder={ph} />;

    return (
        <div className="flex h-full" dir="rtl">

            {/* ══════ Sidebar ══════════════════════════════════ */}
            <aside className="w-60 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
                style={{ background: '#12283C', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[10px] font-black tracking-[0.35em] uppercase" style={{ color: '#DFBA6B' }}>
                        إعدادات الموقع
                    </p>
                </div>
                <nav className="p-3 space-y-0.5">
                    {SECTIONS.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActive(key)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-right transition-all"
                            style={active === key
                                ? { background: 'rgba(138,105,36,0.25)', color: '#DFBA6B', borderRight: '3px solid #8A6924' }
                                : { color: 'rgba(255,255,255,0.55)', borderRight: '3px solid transparent' }
                            }>
                            <Icon size={14} />
                            <span className="flex-1">{label}</span>
                            {active !== key && <HiChevronLeft size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ══════ Content ══════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto" style={{ background: '#faf8f4' }}>
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white"
                    style={{ borderBottom: '1px solid rgba(138,105,36,0.1)', boxShadow: '0 2px 12px rgba(18,40,60,0.04)' }}>
                    <div>
                        <h2 className="font-black text-sm" style={{ color: '#12283C' }}>
                            {SECTIONS.find(s => s.key === active)?.label}
                        </h2>
                        <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                            تغييراتك تظهر على الموقع فور الحفظ
                        </p>
                    </div>
                    <button onClick={save} disabled={status === 'saving'}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white transition-all disabled:opacity-60"
                        style={{
                            background: status === 'success' ? '#16a34a' : status === 'error' ? '#dc2626' : 'linear-gradient(135deg,#8A6924,#c4983a)',
                            boxShadow: '0 4px 16px rgba(138,105,36,0.3)',
                        }}>
                        {status === 'saving' ? <><TbLoaderQuarter className="animate-spin" size={15} /> جارٍ الحفظ...</>
                            : status === 'success' ? <><HiCheckCircle size={15} /> تم الحفظ</>
                            : status === 'error' ? <><HiExclamationCircle size={15} /> فشل الحفظ</>
                            : <><HiSave size={15} /> حفظ التغييرات</>}
                    </button>
                </div>

                <div className="p-6">
                    {loading && <div className="flex justify-center py-20"><TbLoaderQuarter className="animate-spin text-3xl" style={{ color: '#8A6924' }} /></div>}

                    {!loading && (
                        <>
                        {/* ─── هوية الموقع ─────────────────────────────── */}
                        {active === 'general' && (
                            <>
                            <Card title="اسم الموقع والشعار">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <F label="اسم الموقع">{inp('siteName', 'الصرح للتطوير العقاري')}</F>
                                    <F label="رابط الشعار (Logo URL)" hint="رابط صورة من Firebase أو Cloudinary">
                                        {inp('logo', 'https://...')}
                                    </F>
                                    <F label="رابط الـ Favicon" hint="أيقونة المتصفح (16×16 أو 32×32)">
                                        {inp('favicon', 'https://...')}
                                    </F>
                                    <F label="مفتاح Google Maps" hint="AIzaSy...">
                                        <input type="password" value={get('mapsApiKey')} onChange={e => set('mapsApiKey', e.target.value)}
                                            placeholder="AIzaSy..." className="w-full px-4 py-3 text-sm focus:outline-none"
                                            style={IS} onFocus={fcs} onBlur={blr} />
                                    </F>
                                </div>
                            </Card>
                            <Card title="معاينة الهوية">
                                <div className="flex items-center gap-4">
                                    {get('logo') && <img src={get('logo')} className="h-12 w-auto" alt="logo" />}
                                    <div>
                                        <p className="font-black text-base" style={{ color: '#12283C' }}>{get('siteName') || 'الصرح للتطوير العقاري'}</p>
                                        <p className="text-xs" style={{ color: '#8A6924' }}>للاستثمار العقاري</p>
                                    </div>
                                </div>
                            </Card>
                            </>
                        )}

                        {/* ─── SEO ──────────────────────────────────────── */}
                        {active === 'seo' && (
                            <Card title="إعدادات تحسين محركات البحث (SEO)">
                                <div className="space-y-4">
                                    <F label="عنوان الصفحة الرئيسية (Title Tag)" hint="يظهر في نتائج البحث - الحد الأمثل 60 حرف">
                                        {inp('seo.title', 'الصرح للاستثمار العقاري')}
                                    </F>
                                    <F label="وصف الموقع (Meta Description)" hint="الحد الأمثل 155 حرف">
                                        {ta('seo.description', 'أكثر من 20 عاماً من الخبرة...', 3)}
                                    </F>
                                    <F label="الكلمات المفتاحية (Keywords)" hint="مفصولة بفاصلة">
                                        {inp('seo.keywords', 'عقارات, استثمار, مصر')}
                                    </F>
                                </div>
                            </Card>
                        )}

                        {/* ─── Hero ────────────────────────────────────── */}
                        {active === 'hero' && <HeroSettings get={get} set={set} />}

                        {/* ─── Colors ──────────────────────────────────── */}
                        {active === 'colors' && (
                            <>
                            <Card title="ألوان الهوية البصرية">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <F label="اللون الأساسي (Primary)" hint="اللون الذهبي">
                                        {clr('primaryColor', '#8A6924')}
                                    </F>
                                    <F label="اللون المميز (Accent)" hint="الذهبي الفاتح">
                                        {clr('accentColor', '#DFBA6B')}
                                    </F>
                                    <F label="اللون الثانوي (Secondary)" hint="اللون الأزرق الداكن">
                                        {clr('secondaryColor', '#12283C')}
                                    </F>
                                </div>
                            </Card>
                            <Card title="معاينة الألوان">
                                <div className="flex gap-4 items-end">
                                    {[['primaryColor','اللون الأساسي'],['accentColor','اللون المميز'],['secondaryColor','الثانوي']].map(([k,l]) => (
                                        <div key={k} className="text-center">
                                            <div className="w-20 h-12 mb-2" style={{ background: get(k), border: '1px solid #e2e8f0' }} />
                                            <p className="text-[10px] font-bold" style={{ color: '#6b5e3e' }}>{l}</p>
                                            <p className="text-[10px]" style={{ color: '#94a3b8' }}>{get(k)}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            </>
                        )}

                        {/* ─── Stats ───────────────────────────────────── */}
                        {active === 'stats' && (
                            <Card title="إحصائيات الشركة (تظهر في صفحات متعددة)">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <F label="إجمالي المشاريع">{inp('stats.projects', '150+')}</F>
                                    <F label="سنوات الخبرة">{inp('stats.experience', '20+')}</F>
                                    <F label="عدد العملاء">{inp('stats.clients', '50K+')}</F>
                                    <F label="الوحدات السكنية">{inp('stats.units', '500+')}</F>
                                </div>
                                <div className="mt-4 p-4 flex gap-8 justify-center" style={{ background: '#12283C', border: '1px solid rgba(223,186,107,0.15)' }}>
                                    {[['stats.projects','مشروع'],['stats.experience','عاماً'],['stats.clients','عميل'],['stats.units','وحدة']].map(([k,l]) => (
                                        <div key={k} className="text-center">
                                            <p className="text-xl font-black" style={{ color: '#DFBA6B' }}>{get(k)}</p>
                                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* ─── About ───────────────────────────────────── */}
                        {active === 'about' && (
                            <>
                            <Card title="قسم من نحن — النص والصورة">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <F label="شارة النص الصغير">{inp('about.badge', 'إرث يمتد منذ 2004')}</F>
                                    <F label="نص زر الـ CTA">{inp('about.ctaText', 'اكتشف قصتنا')}</F>
                                    <F label="عنوان القسم (بالعربية)">{inp('about.title.ar', 'رؤية عقارية تتجاوز الحدود')}</F>
                                    <F label="عنوان القسم (بالإنجليزية)">{inp('about.title.en', 'A Real Estate Vision Beyond Limits')}</F>
                                    <F label="وصف (بالعربية)">{ta('about.description.ar', 'منذ انطلاقتنا...', 3)}</F>
                                    <F label="وصف (بالإنجليزية)">{ta('about.description.en', 'Since 2004...', 3)}</F>
                                    <F label="رابط صورة القسم" hint="صورة تظهر في قسم من نحن بالرئيسية">
                                        {inp('about.image', 'https://...')}
                                    </F>
                                    <div className="grid grid-cols-2 gap-4">
                                        <F label="تسمية السنوات">{inp('about.yearsLabel', 'عاماً من الخبرة')}</F>
                                        <F label="تسمية المشاريع">{inp('about.projectsLabel', 'مشروع منجز')}</F>
                                    </div>
                                </div>
                            </Card>
                            </>
                        )}

                        {/* ─── Services ────────────────────────────────── */}
                        {active === 'services' && (
                            <Card title="خدمات الشركة (4 خدمات تظهر بالرئيسية)">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="mb-6 pb-6 last:mb-0 last:pb-0" style={{ borderBottom: i < 4 ? '1px solid rgba(138,105,36,0.1)' : 'none' }}>
                                        <p className="text-xs font-black mb-3 tracking-widest uppercase" style={{ color: '#8A6924' }}>
                                            الخدمة {i}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <F label="عنوان الخدمة">
                                                {inp(`services.s${i}.title`, `عنوان الخدمة ${i}`)}
                                            </F>
                                            <F label="وصف الخدمة">
                                                {inp(`services.s${i}.desc`, 'وصف مختصر...')}
                                            </F>
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        )}

                        {/* ─── Footer ──────────────────────────────────── */}
                        {active === 'footer' && (
                            <Card title="إعدادات الفوتر">
                                <div className="space-y-4">
                                    <F label="نص التعريف بالشركة (يظهر في الفوتر)">
                                        {ta('footer.about', 'منذ عام 2004 ونحن نعيد تعريف...', 3)}
                                    </F>
                                    <F label="نص حقوق الملكية">{inp('footer.copyright', 'جميع الحقوق محفوظة')}</F>
                                    <F label="ساعات العمل">{inp('footer.workingHours', 'السبت - الخميس: 10:00 - 17:00')}</F>
                                </div>
                            </Card>
                        )}

                        {/* ─── Contact ─────────────────────────────────── */}
                        {active === 'contact' && (
                            <Card title="بيانات التواصل مع الشركة">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <F label="رقم الهاتف">{inp('contact.phone', '+20 1xx xxx xxxx')}</F>
                                    <F label="الخط الساخن (Hotline)">{inp('contact.hotline', '19000')}</F>
                                    <F label="البريد الإلكتروني">{inp('contact.email', 'example@domain.com')}</F>
                                </div>
                            </Card>
                        )}

                        {/* ─── Branches ────────────────────────────────── */}
                        {active === 'branches' && (
                            <>
                            {[
                                { key: 'maadi',   label: 'فرع المعادي' },
                                { key: 'beniSuef', label: 'فرع بني سويف' },
                            ].map(({ key, label }) => (
                                <Card key={key} title={label}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <F label="العنوان الكامل">
                                            {inp(`contact.${key}BranchAddress`, 'العنوان...')}
                                        </F>
                                        <F label="رابط خرائط جوجل" hint="maps.app.goo.gl/...">
                                            {inp(`contact.${key}BranchLink`, 'https://maps.app.goo.gl/...')}
                                        </F>
                                    </div>
                                </Card>
                            ))}
                            </>
                        )}

                        {/* ─── Social ──────────────────────────────────── */}
                        {active === 'social' && (
                            <Card title="روابط حسابات التواصل الاجتماعي">
                                <div className="space-y-3">
                                    {[
                                        { key: 'socialLinks.facebook',  label: 'فيسبوك',   icon: BsFacebook,   ph: 'https://facebook.com/...' },
                                        { key: 'socialLinks.instagram', label: 'إنستغرام', icon: BsInstagram,  ph: 'https://instagram.com/...' },
                                        { key: 'socialLinks.whatsapp',  label: 'واتساب',   icon: BsWhatsapp,   ph: 'https://wa.me/201...' },
                                        { key: 'socialLinks.youtube',   label: 'يوتيوب',   icon: BsYoutube,    ph: 'https://youtube.com/@...' },
                                        { key: 'socialLinks.tiktok',    label: 'تيك توك',  icon: BsTiktok,     ph: 'https://tiktok.com/@...' },
                                        { key: 'socialLinks.linkedin',  label: 'لينكدإن',  icon: BsLinkedin,   ph: 'https://linkedin.com/company/...' },
                                        { key: 'socialLinks.x',         label: 'X (تويتر)', icon: BsTwitterX,  ph: 'https://x.com/...' },
                                    ].map(({ key, label, icon: Icon, ph }) => (
                                        <F key={key} label={label}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-11 flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(18,40,60,0.06)', border: '1.5px solid #e2e8f0' }}>
                                                    <Icon size={16} style={{ color: '#12283C' }} />
                                                </div>
                                                <div className="flex-1"><Inp value={get(key)} onChange={e => set(key, e.target.value)} placeholder={ph} /></div>
                                            </div>
                                        </F>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* ─── Media ───────────────────────────────────── */}
                        {active === 'media' && <MediaManager />}

                        {/* ─── Translations ────────────────────────────── */}
                        {active === 'translations' && <TranslationManager get={get} set={set} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
