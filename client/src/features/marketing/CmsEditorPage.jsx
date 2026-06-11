import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FaRocket, FaChartBar, FaStar, FaTag, FaQuestion, FaBullhorn, FaComments, FaPen,
  FaChevronUp, FaChevronDown, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash,
  FaPlus, FaTrash, FaFloppyDisk, FaGear, FaLayerGroup, FaSpinner,
  FaHouse, FaBuilding, FaUsers, FaHandshake, FaListOl, FaImages, FaEnvelope,
  FaClock, FaVideo, FaMapLocationDot, FaPhone, FaBriefcase, FaBook,
  FaFileLines, FaShield, FaCode, FaRoad, FaGlobe, FaBars, FaArrowsLeftRight,
  FaCircle, FaCheck, FaLink, FaImage,
} from 'react-icons/fa6';
import { cmsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import IconPicker, { resolveIcon } from '../../components/ui/IconPicker';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const P = 'var(--color-primary, #c8161d)';
const A = '#fbb140';

/* ── Section type definitions ─────────────────────────────── */
const SECTION_TYPE_META = {
  hero:         { icon: FaRocket,          label: 'الهيرو / Banner',       color: '#c8161d' },
  stats:        { icon: FaChartBar,        label: 'الإحصائيات',            color: '#1d4ed8' },
  features:     { icon: FaStar,            label: 'المميزات',              color: '#7c3aed' },
  pricing:      { icon: FaTag,             label: 'الباقات والأسعار',      color: '#15803d' },
  faq:          { icon: FaQuestion,        label: 'الأسئلة الشائعة',       color: '#0891b2' },
  cta:          { icon: FaBullhorn,        label: 'دعوة للتسجيل',          color: '#d97706' },
  testimonials: { icon: FaComments,        label: 'آراء العملاء',          color: '#be185d' },
  team:         { icon: FaUsers,           label: 'فريق العمل',            color: '#0d9488' },
  partners:     { icon: FaHandshake,       label: 'شركاء النجاح',          color: '#6366f1' },
  process:      { icon: FaListOl,          label: 'كيف يعمل',             color: '#ea580c' },
  gallery:      { icon: FaImages,          label: 'معرض الصور',            color: '#db2777' },
  newsletter:   { icon: FaEnvelope,        label: 'النشرة البريدية',        color: '#0891b2' },
  timeline:     { icon: FaClock,           label: 'التاريخ والمسيرة',       color: '#7c3aed' },
  video:        { icon: FaVideo,           label: 'فيديو تعريفي',          color: '#dc2626' },
  map:          { icon: FaMapLocationDot,  label: 'الموقع على الخريطة',    color: '#059669' },
  comparison:   { icon: FaArrowsLeftRight, label: 'مقارنة الخطط',          color: '#b45309' },
  custom:       { icon: FaPen,             label: 'قسم مخصص',             color: '#6b7280' },
};

/* ── Pages list ───────────────────────────────────────────── */
const PAGES = [
  { key: 'landing',  label: 'الرئيسية',     icon: FaHouse,       color: '#c8161d' },
  { key: 'features', label: 'المميزات',     icon: FaStar,        color: '#7c3aed' },
  { key: 'pricing',  label: 'الأسعار',      icon: FaTag,         color: '#15803d' },
  { key: 'about',    label: 'من نحن',       icon: FaBuilding,    color: '#1d4ed8' },
  { key: 'contact',      label: 'تواصل معنا',   icon: FaPhone,       color: '#0891b2' },
  { key: 'careers',      label: 'الوظائف',      icon: FaBriefcase,   color: '#d97706' },
  { key: 'blog',         label: 'المقالات',     icon: FaBook,        color: '#be185d' },
  { key: 'partners',     label: 'الشركاء',      icon: FaHandshake,   color: '#6366f1' },
  { key: 'integrations', label: 'التكاملات',    icon: FaGlobe,       color: '#0891b2' },
  { key: 'roadmap',      label: 'خارطة الطريق', icon: FaRoad,        color: '#ea580c' },
  { key: 'help',         label: 'المساعدة',     icon: FaQuestion,    color: '#0d9488' },
  { key: 'terms',        label: 'الشروط',       icon: FaFileLines,   color: '#6366f1' },
  { key: 'privacy',      label: 'الخصوصية',     icon: FaShield,      color: '#059669' },
  { key: 'api-docs',     label: 'API Docs',     icon: FaCode,        color: '#6b7280' },
];

/* ── Section Card ─────────────────────────────────────────── */
function SectionCard({ section, onEdit, onToggle, onMoveUp, onMoveDown, onDelete, isFirst, isLast }) {
  const meta = SECTION_TYPE_META[section.type] || SECTION_TYPE_META.custom;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group flex items-center gap-3 p-3.5 card transition-all"
      style={{ opacity: section.visible ? 1 : 0.55 }}
    >
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button onClick={onMoveUp} disabled={isFirst}
          className="p-1 rounded transition-colors text-gray-300 hover:text-gray-600 disabled:opacity-20">
          <FaChevronUp className="text-[10px]" />
        </button>
        <button onClick={onMoveDown} disabled={isLast}
          className="p-1 rounded transition-colors text-gray-300 hover:text-gray-600 disabled:opacity-20">
          <FaChevronDown className="text-[10px]" />
        </button>
      </div>

      {/* Icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${meta.color}15`, color: meta.color }}>
        <Icon className="text-sm" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>{meta.label}</p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-faint)' }}>
          {section.title || section.subtitle || '—'}
        </p>
      </div>

      {/* Items count */}
      {section.items?.length > 0 && (
        <span className="text-xs px-2 py-0.5 rounded font-medium"
          style={{ background: `${meta.color}12`, color: meta.color }}>
          {section.items.length} عنصر
        </span>
      )}

      {/* Visibility badge */}
      <span className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
        style={{
          background: section.visible ? '#dcfce7' : '#f3f4f6',
          color: section.visible ? '#15803d' : '#9ca3af',
        }}>
        {section.visible ? 'ظاهر' : 'مخفي'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onToggle(section.key)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          {section.visible
            ? <FaToggleOn className="text-green-600 text-lg" />
            : <FaToggleOff className="text-gray-400 text-lg" />}
        </button>
        <button onClick={() => onEdit(section)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
          <FaPen className="text-xs" />
        </button>
        {section.type === 'custom' && (
          <button onClick={() => onDelete(section.key)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <FaTrash className="text-xs" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Generic items editor ─────────────────────────────────── */
function ItemsEditor({ items = [], onChange, type }) {
  const TEMPLATES = {
    features:     { icon: 'FaBuilding', title: '', desc: '' },
    stats:        { value: '', label: '' },
    faq:          { q: '', a: '' },
    testimonials: { name: '', role: '', text: '', rating: 5 },
    team:         { name: '', role: '', bio: '', photo: '', linkedin: '' },
    partners:     { name: '', logo: '', link: '' },
    process:      { icon: 'FaCircle', title: '', desc: '' },
    gallery:      { url: '', caption: '' },
    timeline:     { year: '', title: '', desc: '' },
    comparison:   { feature: '', basic: false, pro: false, enterprise: false },
  };

  const add = () => onChange([...items, TEMPLATES[type] || { text: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg p-4 relative border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => remove(i)}
            className="absolute top-3 left-3 w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
            <FaTrash className="text-xs" />
          </button>

          {type === 'features' && (
            <div className="space-y-3">
              <IconPicker label="الأيقونة" value={item.icon} onChange={v => update(i, 'icon', v)} />
              <Input label="العنوان" value={item.title || ''} onChange={e => update(i, 'title', e.target.value)} />
              <div><label className="label">الوصف</label>
                <textarea className="input h-16 resize-none text-sm" value={item.desc || ''} onChange={e => update(i, 'desc', e.target.value)} /></div>
            </div>
          )}

          {type === 'stats' && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="القيمة" value={item.value || ''} onChange={e => update(i, 'value', e.target.value)} placeholder="١٥٠+" />
              <Input label="التسمية" value={item.label || ''} onChange={e => update(i, 'label', e.target.value)} placeholder="شركة عقارية" />
            </div>
          )}

          {type === 'faq' && (
            <div className="space-y-3">
              <Input label="السؤال" value={item.q || ''} onChange={e => update(i, 'q', e.target.value)} />
              <div><label className="label">الإجابة</label>
                <textarea className="input h-20 resize-none text-sm" value={item.a || ''} onChange={e => update(i, 'a', e.target.value)} /></div>
            </div>
          )}

          {type === 'testimonials' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="الاسم" value={item.name || ''} onChange={e => update(i, 'name', e.target.value)} />
                <Input label="المسمى / الشركة" value={item.role || ''} onChange={e => update(i, 'role', e.target.value)} />
              </div>
              <div><label className="label">التعليق</label>
                <textarea className="input h-20 resize-none text-sm" value={item.text || ''} onChange={e => update(i, 'text', e.target.value)} /></div>
              <div className="flex items-center gap-2">
                <label className="label mb-0">التقييم:</label>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => update(i, 'rating', n)}>
                    <FaStar className="text-lg" style={{ color: n <= (item.rating || 5) ? A : '#d1d5db' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'team' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="الاسم" value={item.name || ''} onChange={e => update(i, 'name', e.target.value)} />
                <Input label="المنصب" value={item.role || ''} onChange={e => update(i, 'role', e.target.value)} />
              </div>
              <Input label="رابط الصورة" value={item.photo || ''} onChange={e => update(i, 'photo', e.target.value)} placeholder="https://..." />
              <Input label="رابط LinkedIn" value={item.linkedin || ''} onChange={e => update(i, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
              <div><label className="label">نبذة قصيرة</label>
                <textarea className="input h-16 resize-none text-sm" value={item.bio || ''} onChange={e => update(i, 'bio', e.target.value)} /></div>
            </div>
          )}

          {type === 'partners' && (
            <div className="space-y-3">
              <Input label="اسم الشريك" value={item.name || ''} onChange={e => update(i, 'name', e.target.value)} />
              <Input label="رابط الشعار (Logo)" value={item.logo || ''} onChange={e => update(i, 'logo', e.target.value)} placeholder="https://..." />
              <Input label="رابط الموقع (اختياري)" value={item.link || ''} onChange={e => update(i, 'link', e.target.value)} placeholder="https://..." />
            </div>
          )}

          {type === 'process' && (
            <div className="space-y-3">
              <IconPicker label="الأيقونة" value={item.icon} onChange={v => update(i, 'icon', v)} />
              <Input label="العنوان" value={item.title || ''} onChange={e => update(i, 'title', e.target.value)} placeholder={`الخطوة ${i + 1}`} />
              <div><label className="label">الوصف</label>
                <textarea className="input h-16 resize-none text-sm" value={item.desc || ''} onChange={e => update(i, 'desc', e.target.value)} /></div>
            </div>
          )}

          {type === 'gallery' && (
            <div className="space-y-3">
              <Input label="رابط الصورة" value={item.url || ''} onChange={e => update(i, 'url', e.target.value)} placeholder="https://images.unsplash.com/..." />
              <Input label="التعليق (اختياري)" value={item.caption || ''} onChange={e => update(i, 'caption', e.target.value)} />
              {item.url && (
                <img src={item.url} alt="" className="w-full h-28 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
              )}
            </div>
          )}

          {type === 'timeline' && (
            <div className="space-y-3">
              <Input label="السنة / التاريخ" value={item.year || ''} onChange={e => update(i, 'year', e.target.value)} placeholder="٢٠٢٤" />
              <Input label="العنوان" value={item.title || ''} onChange={e => update(i, 'title', e.target.value)} />
              <div><label className="label">التفاصيل</label>
                <textarea className="input h-16 resize-none text-sm" value={item.desc || ''} onChange={e => update(i, 'desc', e.target.value)} /></div>
            </div>
          )}

          {type === 'comparison' && (
            <div className="space-y-3">
              <Input label="الميزة" value={item.feature || ''} onChange={e => update(i, 'feature', e.target.value)} placeholder="مثال: إدارة المشاريع" />
              <div className="grid grid-cols-3 gap-3">
                {['basic', 'pro', 'enterprise'].map(plan => (
                  <label key={plan} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!item[plan]} onChange={e => update(i, plan, e.target.checked)} className="rounded" />
                    <span style={{ color: 'var(--color-text-medium)' }}>
                      {plan === 'basic' ? 'أساسي' : plan === 'pro' ? 'احترافي' : 'مؤسسي'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={add}
        className="w-full py-3 rounded-lg text-sm font-medium border-2 border-dashed transition-colors flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8161d50'; e.currentTarget.style.color = '#c8161d'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
        <FaPlus className="text-xs" /> إضافة عنصر
      </button>
    </div>
  );
}

/* ── CTA Buttons editor ───────────────────────────────────── */
function CtaButtonsEditor({ buttons = [], onChange }) {
  const add = () => onChange([...buttons, { label: '', link: '/login', variant: 'primary' }]);
  const remove = (i) => onChange(buttons.filter((_, idx) => idx !== i));
  const update = (i, k, v) => { const next = [...buttons]; next[i] = { ...next[i], [k]: v }; onChange(next); };

  return (
    <div className="space-y-3">
      {buttons.map((btn, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 items-end p-3 rounded-lg border relative"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => remove(i)} className="absolute top-2 left-2 text-red-400 hover:text-red-600">
            <FaTrash className="text-xs" />
          </button>
          <Input label="نص الزر" value={btn.label} onChange={e => update(i, 'label', e.target.value)} />
          <Input label="الرابط" value={btn.link} onChange={e => update(i, 'link', e.target.value)} />
          <div>
            <label className="label">النوع</label>
            <select className="input text-sm" value={btn.variant} onChange={e => update(i, 'variant', e.target.value)}>
              <option value="primary">رئيسي (أحمر)</option>
              <option value="secondary">ثانوي (شفاف)</option>
              <option value="accent">ذهبي</option>
            </select>
          </div>
        </div>
      ))}
      <button onClick={add}
        className="w-full py-2.5 rounded-lg text-sm font-medium border-2 border-dashed flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text-muted)' }}>
        <FaPlus className="text-xs" /> إضافة زر
      </button>
    </div>
  );
}

/* ── Section Edit Form ────────────────────────────────────── */
function SectionEditForm({ section, form, setF }) {
  const needsItems = ['features', 'stats', 'faq', 'testimonials', 'team', 'partners', 'process', 'gallery', 'timeline', 'comparison'];
  const needsBody  = ['hero', 'cta', 'custom', 'newsletter', 'video', 'map'];
  const needsBtns  = ['hero', 'cta'];
  const needsBg    = ['hero'];

  return (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pl-1">
      {/* Visibility */}
      <div className="flex items-center justify-between p-3 rounded-lg border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-dark)' }}>إظهار هذا القسم</span>
        <button onClick={() => setF('visible', !form.visible)}>
          {form.visible
            ? <FaToggleOn className="text-green-600 text-2xl" />
            : <FaToggleOff className="text-gray-400 text-2xl" />}
        </button>
      </div>

      <Input label="العنوان الرئيسي" value={form.title || ''} onChange={e => setF('title', e.target.value)} />

      {section.type !== 'partners' && (
        <div><label className="label">العنوان الفرعي</label>
          <textarea className="input h-16 resize-none text-sm" value={form.subtitle || ''}
            onChange={e => setF('subtitle', e.target.value)} /></div>
      )}

      {needsBody.includes(section.type) && (
        <div>
          <label className="label">
            {section.type === 'video'      ? 'رابط الفيديو (YouTube embed URL)' :
             section.type === 'map'        ? 'رابط خريطة Google Maps (embed)' :
             section.type === 'newsletter' ? 'النص التوضيحي' :
             section.type === 'custom'     ? 'المحتوى (HTML مدعوم)' : 'النص التفصيلي'}
          </label>
          <textarea className="input resize-y text-sm" rows={section.type === 'custom' ? 8 : 3}
            value={form.body || ''} onChange={e => setF('body', e.target.value)}
            placeholder={
              section.type === 'video' ? 'https://www.youtube.com/embed/...' :
              section.type === 'map'   ? 'https://www.google.com/maps/embed?...' : ''
            } />
        </div>
      )}

      {needsBg.includes(section.type) && (
        <div className="space-y-3">
          <Input label="صورة الخلفية (URL)" value={form.bgImage || ''}
            onChange={e => setF('bgImage', e.target.value)} placeholder="https://images.unsplash.com/..." />
          {form.bgImage && (
            <img src={form.bgImage} alt="" className="w-full h-28 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      )}

      {/* Newsletter specific */}
      {section.type === 'newsletter' && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="نص placeholder للإدخال" value={form.placeholder || ''} onChange={e => setF('placeholder', e.target.value)} placeholder="أدخل بريدك الإلكتروني..." />
          <Input label="نص زر الاشتراك" value={form.btnLabel || ''} onChange={e => setF('btnLabel', e.target.value)} placeholder="اشترك الآن" />
        </div>
      )}

      {/* Comparison: plan names */}
      {section.type === 'comparison' && (
        <div className="grid grid-cols-3 gap-3">
          <Input label="اسم الباقة الأساسية" value={form.planBasic || 'أساسي'} onChange={e => setF('planBasic', e.target.value)} />
          <Input label="اسم الباقة الاحترافية" value={form.planPro || 'احترافي'} onChange={e => setF('planPro', e.target.value)} />
          <Input label="اسم الباقة المؤسسية" value={form.planEnterprise || 'مؤسسي'} onChange={e => setF('planEnterprise', e.target.value)} />
        </div>
      )}

      {needsBtns.includes(section.type) && (
        <div>
          <label className="label mb-3">أزرار الدعوة للتسجيل</label>
          <CtaButtonsEditor buttons={form.buttons || []} onChange={v => setF('buttons', v)} />
        </div>
      )}

      {needsItems.includes(section.type) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">العناصر ({(form.items || []).length})</label>
          </div>
          <ItemsEditor items={form.items || []} onChange={v => setF('items', v)} type={section.type} />
        </div>
      )}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────── */
const CmsEditorPage = () => {
  const qc = useQueryClient();
  const [pageKey, setPageKey]         = useState('landing');
  const [editSection, setEditSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({});
  const [addOpen, setAddOpen]         = useState(false);
  const [newType, setNewType]         = useState('custom');
  const [seoOpen, setSeoOpen]         = useState(false);
  const [pageSearch, setPageSearch]   = useState('');

  const queryKey = ['cms', pageKey];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => cmsAPI.getPage(pageKey).then(r => r.data.data),
  });

  const updatePage = useMutation({
    mutationFn: (d) => cmsAPI.updatePage(pageKey, d),
    onSuccess: () => { qc.invalidateQueries(queryKey); toast.success('تم الحفظ'); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const updateSection = useMutation({
    mutationFn: ({ key, d }) => cmsAPI.updateSection(pageKey, key, d),
    onSuccess: () => { qc.invalidateQueries(queryKey); toast.success('تم حفظ القسم'); setEditSection(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const sections = data?.sections
    ? [...data.sections].sort((a, b) => a.order - b.order)
    : [];

  const toggleSection = useCallback((key) => {
    const updated = sections.map(s => s.key === key ? { ...s, visible: !s.visible } : s);
    updatePage.mutate({ ...data, sections: updated });
  }, [sections, data]);

  const moveSection = useCallback((idx, dir) => {
    const arr = [...sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    updatePage.mutate({ ...data, sections: arr.map((s, i) => ({ ...s, order: i })) });
  }, [sections, data]);

  const deleteSection = (key) => {
    if (!window.confirm('حذف هذا القسم نهائياً؟')) return;
    updatePage.mutate({ ...data, sections: sections.filter(s => s.key !== key) });
  };

  const openEdit = (section) => {
    setEditSection(section);
    setSectionForm(JSON.parse(JSON.stringify(section)));
  };

  const saveSection = () => updateSection.mutate({ key: editSection.key, d: sectionForm });

  const addSection = () => {
    const key = `custom_${Date.now()}`;
    const meta = SECTION_TYPE_META[newType] || SECTION_TYPE_META.custom;
    updatePage.mutate({ ...data, sections: [...sections, {
      key, type: newType, order: sections.length, visible: true,
      title: meta.label, subtitle: '', items: [], buttons: [],
    }]});
    setAddOpen(false);
  };

  const setF = (k, v) => setSectionForm(f => ({ ...f, [k]: v }));

  const currentPage = PAGES.find(p => p.key === pageKey);
  const filteredSectionTypes = Object.entries(SECTION_TYPE_META).filter(([, m]) =>
    pageSearch === '' || m.label.includes(pageSearch)
  );

  return (
    <div>
      <PageHeader
        title="محرر الموقع"
        subtitle="تحكم كامل في محتوى كل صفحة بدون كود"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSeoOpen(true)}>
              <FaGear /> SEO
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
              <FaEye /> معاينة
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <FaPlus /> قسم جديد
            </Button>
          </div>
        }
      />

      {/* ── Page Tabs ── */}
      <div className="card p-1.5 mb-5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {PAGES.map(p => {
            const Icon = p.icon;
            const active = pageKey === p.key;
            return (
              <button key={p.key} onClick={() => setPageKey(p.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: active ? p.color : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                }}>
                <Icon className="text-[11px]" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats bar ── */}
      {data && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'إجمالي الأقسام', value: sections.length, color: currentPage?.color || '#c8161d', Icon: FaLayerGroup },
            { label: 'أقسام ظاهرة',   value: sections.filter(s => s.visible).length, color: '#15803d', Icon: FaEye },
            { label: 'أقسام مخفية',   value: sections.filter(s => !s.visible).length, color: '#9ca3af', Icon: FaEyeSlash },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.Icon className="text-sm" />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sections List ── */}
      {isLoading ? (
        <div className="card p-12 text-center" style={{ color: 'var(--color-text-faint)' }}>
          <FaSpinner className="text-3xl animate-spin mx-auto mb-3 opacity-30" />
          جاري التحميل...
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sections.map((section, idx) => (
              <SectionCard
                key={section.key}
                section={section}
                onEdit={openEdit}
                onToggle={toggleSection}
                onMoveUp={() => moveSection(idx, -1)}
                onMoveDown={() => moveSection(idx, 1)}
                onDelete={deleteSection}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
              />
            ))}
          </AnimatePresence>

          {sections.length === 0 && (
            <div className="card border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <FaLayerGroup className="text-3xl mx-auto mb-3" style={{ color: 'var(--color-border-strong)' }} />
              <p style={{ color: 'var(--color-text-faint)' }}>لا توجد أقسام — أضف قسماً جديداً</p>
            </div>
          )}
        </div>
      )}

      {/* ── Section Edit Modal ── */}
      <Modal
        open={!!editSection}
        onClose={() => setEditSection(null)}
        title={`تعديل: ${SECTION_TYPE_META[editSection?.type]?.label || editSection?.type}`}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditSection(null)}>إلغاء</Button>
            <Button onClick={saveSection} loading={updateSection.isPending}>
              <FaFloppyDisk /> حفظ القسم
            </Button>
          </>
        }
      >
        {editSection && (
          <SectionEditForm section={editSection} form={sectionForm} setF={setF} />
        )}
      </Modal>

      {/* ── Add Section Modal ── */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة قسم جديد"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={addSection}><FaPlus /> إضافة القسم</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>اختر نوع القسم الذي تريد إضافته:</p>
          <div className="relative">
            <input
              className="input pr-9 text-sm"
              placeholder="بحث عن نوع قسم..."
              value={pageSearch}
              onChange={e => setPageSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {filteredSectionTypes.map(([type, meta]) => {
              const Icon = meta.icon;
              const active = newType === type;
              return (
                <button key={type} onClick={() => setNewType(type)}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 text-right transition-all"
                  style={{
                    borderColor: active ? meta.color : 'var(--color-border)',
                    background: active ? `${meta.color}08` : 'transparent',
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15`, color: meta.color }}>
                    <Icon className="text-sm" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* ── SEO Modal ── */}
      <Modal
        open={seoOpen}
        onClose={() => setSeoOpen(false)}
        title={`إعدادات SEO — ${currentPage?.label}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSeoOpen(false)}>إغلاق</Button>
            <Button onClick={() => { updatePage.mutate(data); setSeoOpen(false); }}>
              <FaFloppyDisk /> حفظ
            </Button>
          </>
        }
      >
        {data && (
          <div className="space-y-4">
            <Input label="عنوان الصفحة (Title Tag)"
              value={data.metaTitle || ''}
              onChange={e => updatePage.mutate({ ...data, metaTitle: e.target.value })} />
            <div>
              <label className="label">وصف الصفحة (Meta Description)</label>
              <textarea className="input h-24 resize-none text-sm"
                value={data.metaDesc || ''}
                placeholder="وصف موجز (150-160 حرف)..."
                onChange={e => updatePage.mutate({ ...data, metaDesc: e.target.value })} />
            </div>
            <Input label="كلمات مفتاحية"
              value={data.metaKeywords || ''}
              placeholder="عقارات، إدارة عقارات..."
              onChange={e => updatePage.mutate({ ...data, metaKeywords: e.target.value })} />
            <Input label="صورة المشاركة (OG Image URL)"
              value={data.ogImage || ''}
              placeholder="https://..."
              onChange={e => updatePage.mutate({ ...data, ogImage: e.target.value })} />
            <div className="p-4 rounded-lg border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>معاينة نتيجة البحث:</p>
              <p className="text-blue-700 text-sm font-bold">{data.metaTitle || data.title || 'EgyEstate'}</p>
              <p className="text-xs text-green-700">egyestate-app.vercel.app</p>
              <p className="text-xs text-gray-600 mt-1">{data.metaDesc || 'لا يوجد وصف...'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CmsEditorPage;
