import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure, updateConfigSuccess } from '../redux/config/configSlice';
import { HiCog, HiColorSwatch, HiPhone, HiOfficeBuilding, HiShare, HiPhotograph,
    HiTranslate, HiSave, HiCheckCircle, HiExclamationCircle, HiGlobe, HiCollection, HiChevronRight } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import HeroSettings from './HeroSettings';
import CTAManager from './CTAManager';
import MediaManager from './MediaManager';
import TranslationManager from './TranslationManager';

const navItems = [
    { key: 'general', label: 'هوية الموقع', icon: HiCog },
    { key: 'hero', label: 'قسم الرئيسية', icon: HiPhotograph },
    { key: 'colors', label: 'الألوان والتصميم', icon: HiColorSwatch },
    { key: 'cta', label: 'أزرار الدعوة للعمل', icon: HiGlobe },
    { key: 'contact', label: 'بيانات التواصل', icon: HiPhone },
    { key: 'branches', label: 'الفروع', icon: HiOfficeBuilding },
    { key: 'social', label: 'روابط التواصل الاجتماعي', icon: HiShare },
    { key: 'services', label: 'قسم الخدمات', icon: HiCollection },
    { key: 'media', label: 'مكتبة الوسائط', icon: HiPhotograph },
    { key: 'translations', label: 'الترجمات', icon: HiTranslate },
];

const Section = ({ title, children }) => (
    <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Field = ({ label, children, hint }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

const Input = ({ value, onChange, type = 'text', placeholder, prefix }) => (
    <div className="relative">
        {prefix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 select-none">{prefix}</span>}
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full ${prefix ? 'pr-16' : 'pr-3'} pl-3 py-2.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all`}
        />
    </div>
);

export default function AdminSettings() {
    const { config, loading } = useSelector((state) => state.config);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [activeKey, setActiveKey] = useState('general');
    const [formData, setFormData] = useState({});
    const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'success' | 'error'

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                dispatch(fetchConfigStart());
                const res = await fetch('/api/config');
                const data = await res.json();
                if (!data.success === false) {
                    dispatch(fetchConfigSuccess(data));
                    setFormData(deepClone(data));
                } else {
                    dispatch(fetchConfigFailure(data.message));
                }
            } catch (err) {
                dispatch(fetchConfigFailure(err.message));
            }
        };
        fetchConfig();
    }, [dispatch]);

    const deepClone = (obj) => JSON.parse(JSON.stringify(obj || {}));

    const update = (path, value) => {
        setFormData(prev => {
            const next = deepClone(prev);
            const keys = path.split('.');
            let ref = next;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!ref[keys[i]]) ref[keys[i]] = {};
                ref = ref[keys[i]];
            }
            ref[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                setSaveStatus('error');
                return;
            }
            dispatch(updateConfigSuccess(data));
            setSaveStatus('success');
            if (data.primaryColor) document.documentElement.style.setProperty('--primary', data.primaryColor);
            if (data.accentColor) document.documentElement.style.setProperty('--accent', data.accentColor);
            setTimeout(() => setSaveStatus(null), 3000);
        } catch {
            setSaveStatus('error');
        }
    };

    if (currentUser?.role !== 'Admin') {
        return <div className="p-20 text-center text-slate-500 font-bold">غير مصرح بالوصول</div>;
    }

    const val = (path) => {
        const keys = path.split('.');
        let ref = formData;
        for (const k of keys) { if (ref == null) return ''; ref = ref[k]; }
        return ref ?? '';
    };

    const inp = (path, placeholder) => (
        <Input value={val(path)} onChange={e => update(path, e.target.value)} placeholder={placeholder} />
    );

    return (
        <div className="flex min-h-full" dir="rtl">
            {/* Inner Sidebar */}
            <div className="w-56 flex-shrink-0 bg-white border-l border-slate-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="p-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إعدادات الموقع</p>
                </div>
                <nav className="p-2 space-y-0.5">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveKey(item.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all text-right ${activeKey === item.key
                                ? 'bg-primary text-white'
                                : 'text-slate-600 hover:bg-primary-50 hover:text-primary'
                            }`}
                        >
                            <item.icon size={14} />
                            <span className="flex-1">{item.label}</span>
                            {activeKey !== item.key && <HiChevronRight size={11} className="text-slate-300" />}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-50 overflow-y-auto">
                {/* Top Bar */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10">
                    <div>
                        <h2 className="font-black text-slate-800">
                            {navItems.find(i => i.key === activeKey)?.label}
                        </h2>
                        <p className="text-[10px] text-slate-400">تغييراتك ستظهر فوراً على الموقع بعد الحفظ</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-bold transition-all ${saveStatus === 'saving'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : saveStatus === 'success'
                                ? 'bg-green-500 text-white'
                                : saveStatus === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-primary text-white hover:bg-primary-700'
                        }`}
                    >
                        {saveStatus === 'saving' ? (
                            <><TbLoaderQuarter className="animate-spin" size={16} /> جارٍ الحفظ...</>
                        ) : saveStatus === 'success' ? (
                            <><HiCheckCircle size={16} /> تم الحفظ</>
                        ) : saveStatus === 'error' ? (
                            <><HiExclamationCircle size={16} /> فشل الحفظ</>
                        ) : (
                            <><HiSave size={16} /> حفظ التغييرات</>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-16">
                            <TbLoaderQuarter className="animate-spin text-3xl text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* General */}
                            {activeKey === 'general' && (
                                <Section title="هوية الموقع والعلامة التجارية">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="اسم الموقع">
                                            {inp('siteName', 'مثال: الصرح للعقارات')}
                                        </Field>
                                        <Field label="رابط الشعار (Logo URL)" hint="أدخل رابط صورة الشعار من Cloudinary أو أي مستضيف">
                                            {inp('logo', 'https://...')}
                                        </Field>
                                        <Field label="مفتاح Google Maps API" hint="مطلوب لعرض الخرائط">
                                            <input
                                                type="password"
                                                value={val('mapsApiKey')}
                                                onChange={e => update('mapsApiKey', e.target.value)}
                                                placeholder="AIzaSy..."
                                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary"
                                            />
                                        </Field>
                                    </div>
                                </Section>
                            )}

                            {/* Hero */}
                            {activeKey === 'hero' && (
                                <HeroSettings parentForm={{ setFieldsValue: () => {}, getFieldValue: (k) => val(k) }} />
                            )}

                            {/* Colors */}
                            {activeKey === 'colors' && (
                                <Section title="ألوان الهوية البصرية للشركة">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="اللون الأساسي (Primary Color)" hint="اللون الذهبي للشركة">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={val('primaryColor') || '#8A6924'}
                                                    onChange={e => update('primaryColor', e.target.value)}
                                                    className="w-12 h-10 rounded-sm border border-slate-200 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={val('primaryColor') || '#8A6924'}
                                                    onChange={e => update('primaryColor', e.target.value)}
                                                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary"
                                                    placeholder="#8A6924"
                                                />
                                            </div>
                                        </Field>
                                        <Field label="اللون المميز (Accent Color)" hint="اللون الذهبي الفاتح">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={val('accentColor') || '#DFBA6B'}
                                                    onChange={e => update('accentColor', e.target.value)}
                                                    className="w-12 h-10 rounded-sm border border-slate-200 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={val('accentColor') || '#DFBA6B'}
                                                    onChange={e => update('accentColor', e.target.value)}
                                                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-primary"
                                                    placeholder="#DFBA6B"
                                                />
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="mt-4 p-4 bg-slate-50 rounded-sm border border-slate-200">
                                        <p className="text-xs text-slate-500 font-bold mb-3">معاينة الألوان</p>
                                        <div className="flex gap-3">
                                            <div className="w-16 h-10 rounded-sm border" style={{ backgroundColor: val('primaryColor') || '#8A6924' }} />
                                            <div className="w-16 h-10 rounded-sm border" style={{ backgroundColor: val('accentColor') || '#DFBA6B' }} />
                                            <div className="w-16 h-10 rounded-sm border bg-secondary" />
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* CTA */}
                            {activeKey === 'cta' && <CTAManager />}

                            {/* Contact */}
                            {activeKey === 'contact' && (
                                <Section title="بيانات التواصل مع الشركة">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="الخط الساخن (Hotline)">
                                            {inp('contact.hotline', '19000')}
                                        </Field>
                                        <Field label="رقم الهاتف">
                                            {inp('contact.phone', '+20 1xx xxx xxxx')}
                                        </Field>
                                        <Field label="البريد الإلكتروني">
                                            {inp('contact.email', 'example@domain.com')}
                                        </Field>
                                    </div>
                                </Section>
                            )}

                            {/* Branches */}
                            {activeKey === 'branches' && (
                                <>
                                    <Section title="فرع المعادي">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field label="العنوان">
                                                {inp('contact.maadiBranchAddress', 'العنوان الكامل للفرع')}
                                            </Field>
                                            <Field label="رابط خرائط جوجل">
                                                {inp('contact.maadiBranchLink', 'https://maps.app.goo.gl/...')}
                                            </Field>
                                        </div>
                                    </Section>
                                    <Section title="فرع بني سويف">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field label="العنوان">
                                                {inp('contact.beniSuefBranchAddress', 'العنوان الكامل للفرع')}
                                            </Field>
                                            <Field label="رابط خرائط جوجل">
                                                {inp('contact.beniSuefBranchLink', 'https://maps.app.goo.gl/...')}
                                            </Field>
                                        </div>
                                    </Section>
                                </>
                            )}

                            {/* Social Media */}
                            {activeKey === 'social' && (
                                <Section title="روابط حسابات التواصل الاجتماعي">
                                    <div className="space-y-4">
                                        <Field label="فيسبوك">
                                            <Input
                                                value={val('socialLinks.facebook')}
                                                onChange={e => update('socialLinks.facebook', e.target.value)}
                                                placeholder="https://facebook.com/yourpage"
                                            />
                                        </Field>
                                        <Field label="إنستغرام">
                                            <Input
                                                value={val('socialLinks.instagram')}
                                                onChange={e => update('socialLinks.instagram', e.target.value)}
                                                placeholder="https://instagram.com/yourpage"
                                            />
                                        </Field>
                                        <Field label="واتساب (رابط مباشر)">
                                            <Input
                                                value={val('socialLinks.whatsapp')}
                                                onChange={e => update('socialLinks.whatsapp', e.target.value)}
                                                placeholder="https://wa.me/201xxxxxxxxx"
                                            />
                                        </Field>
                                        <Field label="يوتيوب">
                                            <Input
                                                value={val('socialLinks.youtube')}
                                                onChange={e => update('socialLinks.youtube', e.target.value)}
                                                placeholder="https://youtube.com/@yourchannel"
                                            />
                                        </Field>
                                        <Field label="تيك توك">
                                            <Input
                                                value={val('socialLinks.tiktok')}
                                                onChange={e => update('socialLinks.tiktok', e.target.value)}
                                                placeholder="https://tiktok.com/@yourprofile"
                                            />
                                        </Field>
                                        <Field label="لينكدإن">
                                            <Input
                                                value={val('socialLinks.linkedin')}
                                                onChange={e => update('socialLinks.linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/company/yourcompany"
                                            />
                                        </Field>
                                    </div>
                                </Section>
                            )}

                            {/* Services Section */}
                            {activeKey === 'services' && (
                                <Section title="خدمات الشركة (تظهر في الصفحة الرئيسية)">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                                            <p className="text-xs font-black text-primary mb-3">الخدمة {i}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Field label="عنوان الخدمة">
                                                    {inp(`services.s${i}.title`, `عنوان الخدمة ${i}`)}
                                                </Field>
                                                <Field label="وصف الخدمة">
                                                    {inp(`services.s${i}.desc`, 'وصف مختصر للخدمة...')}
                                                </Field>
                                            </div>
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* Media */}
                            {activeKey === 'media' && <MediaManager />}

                            {/* Translations */}
                            {activeKey === 'translations' && <TranslationManager />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
