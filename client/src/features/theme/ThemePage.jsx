import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { themeAPI } from '../../api/services';
import { setTheme } from '../../store/themeSlice';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FaPalette, FaFloppyDisk, FaFont, FaLayerGroup, FaBullhorn,
  FaRotateLeft, FaCheck, FaArrowUpRightFromSquare, FaTableCellsLarge, FaBars,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const COLOR_PRESETS = [
  { label: 'EgyEstate',  primaryColor: '#da1f27', primaryDark: '#a01820', primaryLight: '#f04048', accentColor: '#fbb140' },
  { label: 'أزرق ملكي', primaryColor: '#1e40af', primaryDark: '#1e3a8a', primaryLight: '#3b82f6', accentColor: '#f59e0b' },
  { label: 'أخضر طبيعي',primaryColor: '#059669', primaryDark: '#047857', primaryLight: '#10b981', accentColor: '#f97316' },
  { label: 'بنفسجي',    primaryColor: '#7c3aed', primaryDark: '#6d28d9', primaryLight: '#8b5cf6', accentColor: '#ec4899' },
  { label: 'رمادي أنيق',primaryColor: '#374151', primaryDark: '#1f2937', primaryLight: '#6b7280', accentColor: '#f59e0b' },
  { label: 'ذهبي فاخر',  primaryColor: '#b45309', primaryDark: '#92400e', primaryLight: '#d97706', accentColor: '#231f20' },
  { label: 'تركواز',     primaryColor: '#0d9488', primaryDark: '#0f766e', primaryLight: '#14b8a6', accentColor: '#f59e0b' },
  { label: 'وردي عصري',  primaryColor: '#db2777', primaryDark: '#be185d', primaryLight: '#ec4899', accentColor: '#8b5cf6' },
];

const TABS = [
  { id: 'colors',       label: 'الألوان',          icon: FaPalette },
  { id: 'sidebar',      label: 'الشريط الجانبي',   icon: FaBars },
  { id: 'typography',   label: 'التصميم',           icon: FaTableCellsLarge },
  { id: 'fonts',        label: 'الخط',              icon: FaFont },
  { id: 'announcement', label: 'الشريط الإعلاني',   icon: FaBullhorn },
];

const ColorRow = ({ label, field, form, onChange }) => (
  <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <div className="flex-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-50 font-mono">{form[field] || '#000000'}</p>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={form[field] || ''}
        onChange={e => onChange(field, e.target.value)}
        className="w-28 text-xs font-mono px-2 py-1.5 rounded-lg border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-dark)' }}
      />
      <div className="relative">
        <input
          type="color"
          value={form[field] || '#000000'}
          onChange={e => onChange(field, e.target.value)}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />
        <div className="w-9 h-9 rounded-xl border-2 cursor-pointer shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: form[field] || '#000000', borderColor: 'var(--color-border)' }} />
      </div>
    </div>
  </div>
);

const ThemePage = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const [tab, setTab] = useState('colors');
  const [form, setForm] = useState({});
  const currentTheme = useSelector(s => s.theme);

  const { data, isLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: () => themeAPI.get().then(r => r.data.data),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (data) {
      setForm(data);
      dispatch(setTheme(data));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: themeAPI.update,
    onSuccess: (res) => {
      qc.invalidateQueries(['theme']);
      dispatch(setTheme(res.data.data));
      toast.success('تم حفظ الثيم بنجاح');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    dispatch(setTheme({ [k]: v }));
  };

  const setNested = (parent, k, v) => {
    setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }));
    dispatch(setTheme({ [parent]: { ...form[parent], [k]: v } }));
  };

  const applyPreset = (preset) => {
    const next = { ...form, ...preset };
    setForm(next);
    dispatch(setTheme(preset));
    toast.success(`تم تطبيق ثيم "${preset.label}"`);
  };

  const resetDefaults = () => {
    const defaults = {
      primaryColor: '#da1f27', primaryDark: '#a01820', primaryLight: '#f04048',
      accentColor: '#fbb140', backgroundColor: '#fcfcfc', surfaceColor: '#FFFFFF',
      textDark: '#1F1F1F', textMuted: '#6B7280', borderColor: '#E5E0DC',
    };
    const next = { ...form, ...defaults };
    setForm(next);
    dispatch(setTheme(defaults));
    toast('تم استعادة الألوان الافتراضية');
  };

  if (isLoading) return <LoadingSpinner />;

  const ann = form.announcementBar || {};

  return (
    <div>
      <PageHeader
        title="الثيم والمظهر"
        subtitle="تخصيص كامل لمظهر النظام — التغييرات تُطبق فوراً على جميع الصفحات"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDefaults}><FaRotateLeft /> استعادة</Button>
            <Button onClick={() => save.mutate(form)} loading={save.isPending}><FaFloppyDisk /> حفظ التغييرات</Button>
          </div>
        }
      />

      {/* Live preview bar */}
      <div className="card p-4 mb-6 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold opacity-70">معاينة مباشرة:</span>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--btn-radius)' }}>
            زر أساسي
          </div>
          <div className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--btn-radius)', color: 'var(--color-text-dark)' }}>
            زر ثانوي
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
            تمييز
          </div>
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <div className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
        </div>
        <div className="mr-auto text-xs opacity-40">التغييرات مباشرة — اضغط حفظ لتطبيقها على جميع المستخدمين</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: tab === t.id ? 'var(--color-surface)' : 'transparent',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              <Icon className="text-xs" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Colors ── */}
      {tab === 'colors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Presets */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4">ثيمات جاهزة</h3>
              <div className="flex gap-3 flex-wrap">
                {COLOR_PRESETS.map(preset => (
                  <button key={preset.label} onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:shadow-md"
                    style={{ borderColor: preset.primaryColor, color: preset.primaryColor }}>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                    </div>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand colors */}
            <div className="card p-5">
              <h3 className="font-semibold mb-1">ألوان العلامة التجارية</h3>
              <p className="text-xs opacity-50 mb-4">هذه الألوان تُطبق على الأزرار والروابط والعناصر التفاعلية</p>
              {[
                ['primaryColor', 'اللون الأساسي'],
                ['primaryDark', 'اللون الداكن'],
                ['primaryLight', 'اللون الفاتح'],
                ['accentColor', 'لون التمييز'],
              ].map(([k, l]) => <ColorRow key={k} label={l} field={k} form={form} onChange={set} />)}
            </div>

            {/* UI colors */}
            <div className="card p-5">
              <h3 className="font-semibold mb-1">ألوان الواجهة</h3>
              <p className="text-xs opacity-50 mb-4">خلفيات البطاقات والنصوص والحدود</p>
              {[
                ['backgroundColor', 'لون الخلفية العامة'],
                ['surfaceColor', 'لون السطح (البطاقات)'],
                ['textDark', 'لون النص الرئيسي'],
                ['textMuted', 'لون النص الثانوي'],
                ['borderColor', 'لون الحدود'],
              ].map(([k, l]) => <ColorRow key={k} label={l} field={k} form={form} onChange={set} />)}
            </div>
          </div>

          {/* Sidebar preview */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-3 text-sm">معاينة بطاقة</h3>
              <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--card-radius)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <FaPalette className="text-white text-xs" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>عنوان البطاقة</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>وصف ثانوي</p>
                  </div>
                </div>
                <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>محتوى البطاقة — نص عادي يظهر هنا</p>
                <div className="flex gap-2">
                  <div className="flex-1 py-1.5 rounded-lg text-center text-xs text-white font-medium"
                    style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--btn-radius)' }}>
                    تأكيد
                  </div>
                  <div className="flex-1 py-1.5 rounded-lg text-center text-xs border font-medium"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dark)', borderRadius: 'var(--btn-radius)' }}>
                    إلغاء
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-5 text-sm space-y-2 opacity-70">
              <p className="font-semibold">ملاحظات</p>
              <p>التغييرات تُطبق فوراً على الصفحة الحالية.</p>
              <p>اضغط حفظ ليراها جميع المستخدمين في الشركة.</p>
              <p>كل شركة لها إعداداتها المستقلة تماماً.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      {tab === 'sidebar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Presets */}
            <div className="card p-5">
              <h3 className="font-semibold mb-4">قوالب جاهزة للشريط الجانبي</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'داكن (افتراضي)', sidebarBg: '#0F0E0E', sidebarActiveBg: 'rgba(218,31,39,0.35)', sidebarActiveColor: '#ff7b82', sidebarTextColor: 'rgba(255,255,255,0.68)', sidebarGroupColor: 'rgba(255,255,255,0.28)' },
                  { label: 'أسود عصري',      sidebarBg: '#111827', sidebarActiveBg: 'rgba(99,102,241,0.3)', sidebarActiveColor: '#a5b4fc', sidebarTextColor: 'rgba(255,255,255,0.65)', sidebarGroupColor: 'rgba(255,255,255,0.25)' },
                  { label: 'أحمر EgyEstate', sidebarBg: '#1a0607', sidebarActiveBg: 'rgba(218,31,39,0.45)', sidebarActiveColor: '#fca5a5', sidebarTextColor: 'rgba(255,255,255,0.75)', sidebarGroupColor: 'rgba(255,150,150,0.35)' },
                  { label: 'فاتح نظيف',      sidebarBg: '#ffffff', sidebarActiveBg: 'rgba(218,31,39,0.08)', sidebarActiveColor: '#da1f27', sidebarTextColor: '#374151', sidebarGroupColor: '#9ca3af' },
                  { label: 'رمادي أنيق',     sidebarBg: '#1f2937', sidebarActiveBg: 'rgba(251,177,64,0.2)', sidebarActiveColor: '#fbbf24', sidebarTextColor: 'rgba(255,255,255,0.7)', sidebarGroupColor: 'rgba(255,255,255,0.3)' },
                  { label: 'أزرق احترافي',   sidebarBg: '#1e3a5f', sidebarActiveBg: 'rgba(59,130,246,0.3)', sidebarActiveColor: '#93c5fd', sidebarTextColor: 'rgba(255,255,255,0.72)', sidebarGroupColor: 'rgba(147,197,253,0.35)' },
                ].map(preset => {
                  const { label, ...colors } = preset;
                  return (
                    <button key={label} onClick={() => { Object.entries(colors).forEach(([k,v]) => set(k,v)); toast.success(`قالب "${label}"`); }}
                      className="flex items-center gap-3 p-3 rounded-xl border text-sm font-medium text-right transition-all hover:shadow-md"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                      <div className="w-8 h-12 rounded-lg flex-shrink-0 flex flex-col gap-1 p-1.5"
                        style={{ backgroundColor: colors.sidebarBg }}>
                        <div className="h-1.5 rounded-full w-full opacity-40" style={{ backgroundColor: colors.sidebarTextColor }} />
                        <div className="h-1.5 rounded-full w-4/5 opacity-40" style={{ backgroundColor: colors.sidebarTextColor }} />
                        <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: colors.sidebarActiveBg }} />
                        <div className="h-1.5 rounded-full w-3/4 opacity-30" style={{ backgroundColor: colors.sidebarTextColor }} />
                      </div>
                      <span style={{ color: 'var(--color-text-dark)' }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual colors */}
            <div className="card p-5">
              <h3 className="font-semibold mb-1">ألوان مخصصة</h3>
              <p className="text-xs opacity-50 mb-4">تخصيص يدوي لكل عنصر في الشريط الجانبي</p>
              {[
                ['sidebarBg',          'خلفية الشريط الجانبي'],
                ['sidebarActiveBg',    'خلفية العنصر النشط'],
                ['sidebarActiveColor', 'نص العنصر النشط'],
                ['sidebarTextColor',   'نص العناصر العادية'],
                ['sidebarGroupColor',  'نص عناوين المجموعات'],
              ].map(([k, l]) => <ColorRow key={k} label={l} field={k} form={form} onChange={set} />)}
            </div>
          </div>

          {/* Live preview */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-sm">معاينة الشريط الجانبي</h3>
            <div className="rounded-xl overflow-hidden border w-52 mx-auto" style={{ borderColor: 'var(--color-border)' }}>
              <div className="p-3" style={{ backgroundColor: form.sidebarBg || '#0F0E0E' }}>
                <div className="h-6 mb-4 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                {[
                  { label: 'لوحة التحكم', active: true },
                  { label: 'المشاريع', active: false },
                  { label: 'العملاء', active: false },
                ].map(item => (
                  <div key={item.label}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1 text-xs"
                    style={{
                      backgroundColor: item.active ? form.sidebarActiveBg || 'rgba(218,31,39,0.35)' : 'transparent',
                      color: item.active ? form.sidebarActiveColor || '#ff7b82' : form.sidebarTextColor || 'rgba(255,255,255,0.68)',
                    }}>
                    <div className="w-3 h-3 rounded-sm opacity-70" style={{ backgroundColor: 'currentColor' }} />
                    {item.label}
                  </div>
                ))}
                <div className="text-[9px] px-2 mt-3 mb-1" style={{ color: form.sidebarGroupColor || 'rgba(255,255,255,0.28)' }}>
                  المالية
                </div>
                {['العقود', 'الفواتير'].map(l => (
                  <div key={l} className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1 text-xs"
                    style={{ color: form.sidebarTextColor || 'rgba(255,255,255,0.68)' }}>
                    <div className="w-3 h-3 rounded-sm opacity-50" style={{ backgroundColor: 'currentColor' }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs opacity-40 text-center mt-3">معاينة حية — تتغير مع كل تعديل</p>
          </div>
        </div>
      )}

      {/* ── Typography / Layout ── */}
      {tab === 'typography' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-6">
            <h3 className="font-semibold">شكل الأزرار والبطاقات</h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="label mb-0">نصف قطر الأزرار</label>
                <span className="text-sm font-mono opacity-60">{form.buttonRadius || '0.5rem'}</span>
              </div>
              <input type="range" min="0" max="2" step="0.125"
                value={parseFloat(form.buttonRadius) || 0.5}
                onChange={e => set('buttonRadius', `${e.target.value}rem`)}
                className="w-full accent-primary" style={{ accentColor: 'var(--color-primary)' }} />
              <div className="flex justify-between text-xs opacity-40 mt-1">
                <span>مربع</span><span>مستدير</span>
              </div>
              <div className="mt-3 flex gap-3">
                {['0rem', '0.375rem', '0.75rem', '9999px'].map(r => (
                  <button key={r} onClick={() => set('buttonRadius', r)}
                    className="px-3 py-1 border text-xs font-medium transition-all"
                    style={{
                      borderRadius: r, borderColor: 'var(--color-border)',
                      backgroundColor: form.buttonRadius === r ? 'var(--color-primary)' : 'transparent',
                      color: form.buttonRadius === r ? '#fff' : 'var(--color-text-dark)',
                    }}>
                    {r === '0rem' ? 'مربع' : r === '9999px' ? 'بيضاوي' : r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="label mb-0">نصف قطر البطاقات</label>
                <span className="text-sm font-mono opacity-60">{form.cardRadius || '0.75rem'}</span>
              </div>
              <input type="range" min="0" max="2" step="0.125"
                value={parseFloat(form.cardRadius) || 0.75}
                onChange={e => set('cardRadius', `${e.target.value}rem`)}
                className="w-full" style={{ accentColor: 'var(--color-primary)' }} />
            </div>

            <div>
              <label className="label">حجم الخط العام</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { value: '93.75%', label: 'صغير' },
                  { value: '100%',   label: 'عادي' },
                  { value: '106.25%', label: 'كبير' },
                ].map(o => (
                  <button key={o.value} onClick={() => set('fontScale', o.value)}
                    className="py-2.5 rounded-xl border text-sm font-semibold transition-all"
                    style={{
                      borderColor: (form.fontScale || '100%') === o.value ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: (form.fontScale || '100%') === o.value ? 'var(--color-primary)' : 'transparent',
                      color: (form.fontScale || '100%') === o.value ? '#fff' : 'var(--color-text-dark)',
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">ظلال البطاقات</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { value: 'none',   label: 'بدون',  shadow: 'none' },
                  { value: 'soft',   label: 'خفيف',  shadow: '0 1px 3px rgba(0,0,0,0.06)' },
                  { value: 'medium', label: 'متوسط', shadow: '0 4px 14px rgba(0,0,0,0.10)' },
                ].map(o => (
                  <button key={o.value} onClick={() => set('cardShadow', o.value)}
                    className="py-3 rounded-xl border text-sm font-semibold transition-all bg-white"
                    style={{
                      borderColor: (form.cardShadow || 'soft') === o.value ? 'var(--color-primary)' : 'var(--color-border)',
                      color: (form.cardShadow || 'soft') === o.value ? 'var(--color-primary)' : 'var(--color-text-dark)',
                      boxShadow: o.shadow,
                    }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">نمط الشريط الجانبي</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { value: 'dark', label: 'داكن', bg: '#0F0E0E' },
                  { value: 'light', label: 'فاتح', bg: '#f8f9fa' },
                  { value: 'colored', label: 'ملون', bg: 'var(--color-primary)' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => set('sidebarStyle', opt.value)}
                    className="relative p-3 rounded-xl border-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: form.sidebarStyle === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                    }}>
                    <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: opt.bg }} />
                    {opt.label}
                    {form.sidebarStyle === opt.value && (
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary)' }}>
                        <FaCheck className="text-white text-[8px]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">تخطيط لوحة التحكم</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'default', label: 'افتراضي' },
                { value: 'compact', label: 'مضغوط' },
                { value: 'wide', label: 'عريض' },
              ].map(opt => (
                <button key={opt.value} onClick={() => set('dashboardLayout', opt.value)}
                  className="relative p-3 rounded-xl border-2 text-xs font-medium transition-all"
                  style={{
                    borderColor: form.dashboardLayout === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                  }}>
                  <div className="h-12 rounded-lg mb-2 flex gap-1 p-1.5" style={{ backgroundColor: 'var(--color-background)' }}>
                    {opt.value === 'default' && <>
                      <div className="w-1/3 rounded" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.5 }} />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                        <div className="h-2 rounded w-2/3" style={{ backgroundColor: 'var(--color-border)' }} />
                      </div>
                    </>}
                    {opt.value === 'compact' && <>
                      <div className="w-1/4 rounded" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.5 }} />
                      <div className="flex-1 grid grid-cols-2 gap-1">
                        {[1,2,3,4].map(i => <div key={i} className="rounded" style={{ backgroundColor: 'var(--color-border)' }} />)}
                      </div>
                    </>}
                    {opt.value === 'wide' && (
                      <div className="flex-1 space-y-1">
                        <div className="h-3 rounded" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.4 }} />
                        <div className="h-2 rounded" style={{ backgroundColor: 'var(--color-border)' }} />
                      </div>
                    )}
                  </div>
                  {opt.label}
                  {form.dashboardLayout === opt.value && (
                    <div className="absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary)' }}>
                      <FaCheck className="text-white text-[8px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="label">CSS مخصص (متقدم)</label>
              <textarea
                className="input font-mono text-xs leading-relaxed"
                rows={6}
                placeholder="/* أضف CSS مخصص هنا */&#10;.card { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }"
                value={form.customCss || ''}
                onChange={e => set('customCss', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Fonts ── */}
      {tab === 'fonts' && (
        <div className="card p-6 max-w-xl">
          <h3 className="font-semibold mb-4">الخط</h3>
          <div className="space-y-3">
            {[
              { value: 'Tajawal', sample: 'نظام إدارة العقارات — Tajawal' },
              { value: 'Cairo', sample: 'نظام إدارة العقارات — Cairo' },
              { value: 'Almarai', sample: 'نظام إدارة العقارات — Almarai' },
              { value: 'Noto Sans Arabic', sample: 'نظام إدارة العقارات — Noto' },
            ].map(f => (
              <button key={f.value} onClick={() => set('fontFamily', f.value)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 text-right transition-all"
                style={{
                  borderColor: form.fontFamily === f.value ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: form.fontFamily === f.value ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)' : 'transparent',
                  fontFamily: f.value,
                }}>
                <div>
                  <p className="font-semibold text-base">{f.value}</p>
                  <p className="text-sm opacity-60 mt-0.5">{f.sample}</p>
                </div>
                {form.fontFamily === f.value && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    <FaCheck className="text-white text-xs" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Announcement Bar ── */}
      {tab === 'announcement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">الشريط الإعلاني</h3>
                <p className="text-xs opacity-50 mt-0.5">شريط في أعلى الصفحات لعرض الإعلانات والتنبيهات</p>
              </div>
              <button
                onClick={() => setNested('announcementBar', 'enabled', !ann.enabled)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ backgroundColor: ann.enabled ? 'var(--color-primary)' : 'var(--color-border)' }}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${ann.enabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            <div className={ann.enabled ? '' : 'opacity-40 pointer-events-none'}>
              <div>
                <label className="label">نص الشريط</label>
                <input className="input" placeholder="أهلاً بكم في النظام! تواصل معنا للمساعدة."
                  value={ann.text || ''} onChange={e => setNested('announcementBar', 'text', e.target.value)} />
              </div>

              <div className="mt-4">
                <label className="label">رابط (اختياري)</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="https://example.com"
                    value={ann.link || ''} onChange={e => setNested('announcementBar', 'link', e.target.value)} />
                  {ann.link && (
                    <a href={ann.link} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-3 text-sm rounded-lg border"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
                      <FaArrowUpRightFromSquare className="text-xs" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label">لون الخلفية</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={ann.bgColor || '#da1f27'}
                      onChange={e => setNested('announcementBar', 'bgColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--color-border)' }} />
                    <input className="input flex-1 font-mono text-sm" value={ann.bgColor || '#da1f27'}
                      onChange={e => setNested('announcementBar', 'bgColor', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">لون النص</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={ann.textColor || '#ffffff'}
                      onChange={e => setNested('announcementBar', 'textColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--color-border)' }} />
                    <input className="input flex-1 font-mono text-sm" value={ann.textColor || '#ffffff'}
                      onChange={e => setNested('announcementBar', 'textColor', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input type="checkbox" id="dismissible" checked={ann.dismissible ?? true}
                  onChange={e => setNested('announcementBar', 'dismissible', e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-primary)' }} />
                <label htmlFor="dismissible" className="text-sm cursor-pointer">
                  السماح للمستخدمين بإغلاق الشريط
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold mb-4 text-sm">معاينة</h3>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                {ann.enabled && ann.text ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium relative"
                    style={{ backgroundColor: ann.bgColor || '#da1f27', color: ann.textColor || '#ffffff' }}>
                    <span>{ann.text}</span>
                    {ann.dismissible && (
                      <span className="absolute left-3 opacity-60 text-xs">✕</span>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs opacity-40">الشريط معطل أو النص فارغ</div>
                )}
                <div className="p-4 text-xs opacity-50 text-center" style={{ backgroundColor: 'var(--color-background)' }}>
                  محتوى الصفحة هنا
                </div>
              </div>
            </div>

            <div className="card p-5 text-sm space-y-2 opacity-70">
              <p className="font-semibold">استخدامات مقترحة</p>
              <p>• إعلانات الصيانة أو التحديثات</p>
              <p>• تنبيهات انتهاء الاشتراك</p>
              <p>• رسائل ترحيب بالمستخدمين الجدد</p>
              <p>• روابط لوثائق أو صفحات مهمة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePage;
