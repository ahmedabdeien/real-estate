import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import {
  FaRocket, FaWrench, FaBug, FaShield, FaStar,
  FaArrowTrendUp, FaBell, FaCode, FaCircleCheck,
  FaTag,
} from 'react-icons/fa6';

/* ─── Data ─────────────────────────────── */
const CHANGELOG = [
  {
    version: '4.0.0',
    date: '2026-06-12',
    label: 'major',
    title: 'عزل متعدد الشركاء كامل + أدوار المنصة + ثيم 2.0',
    summary: 'فصل كامل بين الشركات والسوبر أدمن، نظام أدوار منصة منفصل، تطوير شامل لقسم الثيم، و6 بلوكات جديدة لمنشئ الصفحات.',
    entries: [
      { type: 'feature', text: 'أدوار المنصة — نظام أدوار منفصل تماماً للسوبر أدمن (مالك المشروع) بصلاحيات خاصة بالمنصة' },
      { type: 'feature', text: 'عزل صارم للأدوار — كل شركة تدير أدوارها فقط، ولا يمكن تعديل أدوار شركة أخرى' },
      { type: 'feature', text: 'لوحة سوبر أدمن منفصلة — إحصاءات المنصة بالكامل بدون خلط مع بيانات الشركات' },
      { type: 'feature', text: 'نظام انتحال الهوية — السوبر أدمن يدخل كمدير أي شركة ويعود لحسابه بضغطة زر' },
      { type: 'feature', text: 'ثيم 2.0 — تبويبات جديدة: الشريط العلوي، صفحة الدخول، إعدادات متقدمة' },
      { type: 'feature', text: 'الثيم: كثافة العرض، جداول مخططة، تقليل الحركة، تخصيص شريط التمرير، ألوان الحالات' },
      { type: 'feature', text: '4 خطوط عربية جديدة — IBM Plex Sans Arabic, Rubik, Changa, El Messiri' },
      { type: 'feature', text: 'بلوك فريق العمل — أعضاء بصور ومناصب قابلة للتعديل' },
      { type: 'feature', text: 'بلوك شعارات العملاء — مع خيار التدرج الرمادي' },
      { type: 'feature', text: 'بلوك خطوات العمل — أرقام دائرية بعنوان ووصف لكل خطوة' },
      { type: 'feature', text: 'بلوك خريطة جوجل — تضمين مباشر برابط الخريطة' },
      { type: 'feature', text: 'بلوك روابط التواصل — 8 منصات بألوانها الأصلية' },
      { type: 'feature', text: 'بلوك عداد تنازلي — مباشر بالثواني لعروضك ومناسباتك' },
      { type: 'feature', text: 'نسخ الأدوار بضغطة واحدة + عداد المستخدمين المرتبطين بكل دور + ألوان مخصصة للأدوار' },
      { type: 'improvement', text: 'عزل المستخدمين — السوبر أدمن يرى فريق المنصة فقط افتراضياً' },
      { type: 'improvement', text: 'صفحات 404 وغير مصرح جديدة بألوان العلامة التجارية' },
      { type: 'improvement', text: 'فوتر جديد بألوان اللوجو الأربعة مع أشرطة علوية وسفلية' },
      { type: 'fix', text: 'إصلاح نهائي لخطأ Invariant failed عند إنشاء صفحة جديدة في منشئ الصفحات' },
      { type: 'fix', text: 'منع حذف دور مرتبط بمستخدمين نشطين' },
    ],
  },
  {
    version: '3.1.0',
    date: '2026-06-11',
    label: 'major',
    title: 'UI Components System + TanStack Query v5 Full Migration',
    summary: 'مكتبة مكونات UI احترافية جديدة، إعادة بناء 4 صفحات رئيسية، CASL للصلاحيات، وحدة المستندات، وجدولة تلقائية للأقساط المتأخرة.',
    entries: [
      { type: 'feature', text: 'KpiCard — بطاقات KPI احترافية مع trend indicator وprogress bar وcallback' },
      { type: 'feature', text: 'Skeleton / SkeletonCard / SkeletonTable — loading states جاهزة' },
      { type: 'feature', text: 'Avatar / AvatarGroup — صور مستخدمين مع ألوان تلقائية من الاسم' },
      { type: 'feature', text: 'ProgressBar / MultiProgress — شريط تقدم مع دعم متعدد الألوان' },
      { type: 'feature', text: 'Tooltip — تلميحات سياقية مع 4 اتجاهات وdelay قابل للضبط' },
      { type: 'feature', text: 'StatusBadge — بادجات حالة موحدة لجميع الكيانات (وحدات، عقود، فواتير)' },
      { type: 'feature', text: 'FilterBar / SearchInput / FilterSelect / ViewToggle — نظام فلترة موحد' },
      { type: 'feature', text: 'UnitsPage — إعادة بناء كاملة مع Grid/Table view toggle محفوظ في Redux' },
      { type: 'feature', text: 'PaymentsPage — إعادة بناء مع MultiProgress لتوزيع طرق الدفع' },
      { type: 'feature', text: 'ExpensesPage — إعادة بناء مع breakdown chart للتصنيفات' },
      { type: 'feature', text: 'InstallmentsPage — إعادة بناء مع card timeline ودعم ProgressBar لكل قسط' },
      { type: 'feature', text: 'CASL Integration — @casl/ability + @casl/react، AbilityProvider، Can component' },
      { type: 'feature', text: 'وحدة المستندات — رفع وتصنيف وربط المستندات بالعملاء والوحدات والعقود' },
      { type: 'feature', text: 'AuditPage — timeline احترافي مع diff viewer وإحصاءات by module/action' },
      { type: 'feature', text: 'viewSlice — Redux slice لحفظ تفضيلات العرض (grid/table) محلياً' },
      { type: 'feature', text: 'Cron Job — تحديث تلقائي للأقساط والفواتير المتأخرة يومياً مع إشعارات' },
      { type: 'improvement', text: 'TanStack Query v5 placeholderData في جميع الصفحات لتجربة أسرع' },
      { type: 'improvement', text: 'ProtectedRoute يستخدم CASL بدلاً من manual permission check' },
      { type: 'improvement', text: 'CustomerDetailPage — قسم مستندات العميل المرتبطة تلقائياً' },
      { type: 'improvement', text: 'Notification model — دعم isSystem وbody وlink + indexes' },
      { type: 'fix', text: 'إصلاح double navbar في CmsPage عبر إزالة PublicLayout wrapper' },
      { type: 'fix', text: 'إصلاح 401 redirect loop في الصفحات العامة عبر publicApi منفصل' },
    ],
  },
  {
    version: '3.0.0',
    date: '2026-06-10',
    label: 'major',
    title: 'إعادة تصميم شاملة — Design System v3',
    summary: 'إعادة بناء كاملة لنظام الألوان والمكونات مستوحاة من أفضل أنظمة CRM العالمية.',
    entries: [
      { type: 'feature', text: 'نظام تصميم جديد كلياً — ألوان أكثر احترافية وتناسقاً' },
      { type: 'feature', text: 'ترقية DataTable إلى TanStack React Table v8 مع إخفاء الأعمدة وترتيب متعدد' },
      { type: 'feature', text: 'صفحة سجل التحديثات (هذه الصفحة) مع timeline تفاعلي' },
      { type: 'feature', text: 'Badge جديد بتصميم مستطيلي محترف بدلاً من الـ pill المفرط التدوير' },
      { type: 'feature', text: 'StatCard جديد بـ border indicator جانبي بدلاً من gradient bar' },
      { type: 'feature', text: 'PageHeader محسّن مع breadcrumb وإحصاءات سريعة compact' },
      { type: 'improvement', text: 'تحسين أداء الجداول بشكل ملحوظ عبر مكتبة TanStack' },
      { type: 'improvement', text: 'تقليل الـ animations الزائدة لتجربة أسرع وأكثر احترافية' },
      { type: 'improvement', text: 'تحسين CSS Variables للدعم الكامل لـ theming' },
      { type: 'fix', text: 'إصلاح Pagination مع ellipsis عند وجود صفحات كثيرة' },
    ],
  },
  {
    version: '2.8.0',
    date: '2026-05-28',
    label: 'minor',
    title: 'PDF Branding + Company Logo',
    summary: 'دعم شعار الشركة في ملفات PDF المُصدَّرة.',
    entries: [
      { type: 'feature', text: 'رفع شعار الشركة من إعدادات الحساب' },
      { type: 'feature', text: 'header وfooter مخصص في PDF العقود والفواتير والتقارير' },
      { type: 'feature', text: 'حفظ بيانات الشركة في Redux وLocalStorage تلقائياً' },
      { type: 'improvement', text: 'تحسين تنسيق PDF للطباعة على A4 عربي' },
    ],
  },
  {
    version: '2.7.0',
    date: '2026-05-15',
    label: 'minor',
    title: 'Dashboard إحصائي متقدم',
    summary: 'لوحة تحكم جديدة مع مكونات تفاعلية وإحصاءات حية.',
    entries: [
      { type: 'feature', text: 'ساعة حية LiveClock تتحدث كل ثانية' },
      { type: 'feature', text: 'AnimNum لعرض الأرقام الإحصائية بتأثير count-up' },
      { type: 'feature', text: 'KPI cards مع ألوان دلالية وتدرجات' },
      { type: 'feature', text: 'تحذير الأقساط المتأخرة داخل banner الترحيب' },
      { type: 'improvement', text: 'تحسين سرعة تحميل البيانات بـ TanStack Query v5' },
    ],
  },
  {
    version: '2.6.0',
    date: '2026-05-01',
    label: 'minor',
    title: 'CommandPalette + Quick Actions',
    summary: 'إضافة لوحة البحث السريع بضغط Ctrl+K.',
    entries: [
      { type: 'feature', text: 'CommandPalette مع بحث سريع في جميع الصفحات' },
      { type: 'feature', text: 'استخدام createPortal لحل مشكلة z-index' },
      { type: 'feature', text: 'Quick Actions من لوحة التحكم' },
    ],
  },
  {
    version: '2.5.0',
    date: '2026-04-18',
    label: 'minor',
    title: 'TanStack Query Migration',
    summary: 'ترقية كاملة من SWR إلى TanStack Query v5.',
    entries: [
      { type: 'improvement', text: 'ترقية جميع الصفحات إلى TanStack Query v5' },
      { type: 'fix', text: 'إصلاح onSuccess في useQuery (لا يدعمه v5) باستخدام useEffect' },
      { type: 'improvement', text: 'تحسين cache invalidation بعد mutations' },
      { type: 'improvement', text: 'Loading states أفضل وأسرع' },
    ],
  },
  {
    version: '2.4.0',
    date: '2026-04-05',
    label: 'minor',
    title: 'Activity Log + Audit Trail',
    summary: 'سجل كامل لجميع العمليات داخل النظام.',
    entries: [
      { type: 'feature', text: 'سجل عمليات مفصّل لكل إجراء (إنشاء، تعديل، حذف)' },
      { type: 'feature', text: 'فلترة السجل بالمستخدم والتاريخ ونوع العملية' },
      { type: 'security', text: 'تسجيل محاولات تسجيل الدخول الفاشلة' },
    ],
  },
  {
    version: '2.3.0',
    date: '2026-03-22',
    label: 'minor',
    title: 'نظام الإشعارات الفوري',
    summary: 'إشعارات real-time عبر Socket.IO.',
    entries: [
      { type: 'feature', text: 'إشعارات فورية عند إنشاء عقد أو دفعة جديدة' },
      { type: 'feature', text: 'NotificationsDropdown في الـ Navbar' },
      { type: 'feature', text: 'إشعار تلقائي عند اقتراب موعد قسط' },
      { type: 'improvement', text: 'تحسين اتصال Socket.IO للحفاظ على الاتصال' },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-03-01',
    label: 'major',
    title: 'Multi-Tenant Architecture',
    summary: 'إعادة هيكلة كاملة للنظام دعماً لتعدد المستأجرين.',
    entries: [
      { type: 'feature', text: 'كل شركة بيانات معزولة تماماً عبر tenantScope middleware' },
      { type: 'feature', text: 'RBAC ديناميكي — صلاحيات مخصصة لكل دور' },
      { type: 'feature', text: 'Theme builder لكل شركة' },
      { type: 'feature', text: 'لوحة المشرف العام لإدارة الشركات والخطط' },
      { type: 'security', text: 'JWT tokens مع tenantId embedded' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-15',
    label: 'major',
    title: 'الإطلاق الأول',
    summary: 'الإصدار الأول من EgyEstate SaaS.',
    entries: [
      { type: 'feature', text: 'إدارة المشاريع والوحدات العقارية' },
      { type: 'feature', text: 'إدارة العملاء والعقود' },
      { type: 'feature', text: 'جدول الأقساط التلقائي' },
      { type: 'feature', text: 'الفواتير والمدفوعات والمصروفات' },
      { type: 'feature', text: 'تقارير مالية مع ApexCharts' },
      { type: 'feature', text: 'تصدير PDF وExcel' },
    ],
  },
];

/* ─── Helpers ─────────────────────────── */
const ENTRY_ICONS = {
  feature:     { icon: FaStar,      color: '#2563EB', bg: '#EFF6FF', label: 'ميزة جديدة' },
  improvement: { icon: FaArrowTrendUp, color: '#059669', bg: '#F0FDF4', label: 'تحسين' },
  fix:         { icon: FaBug,       color: '#D97706', bg: '#FFFBEB', label: 'إصلاح' },
  security:    { icon: FaShield,    color: '#7C3AED', bg: '#F5F3FF', label: 'أمان' },
};

const LABEL_MAP = {
  major: { text: 'إصدار رئيسي', bg: '#FEE2E2', color: '#C8161D' },
  minor: { text: 'ميزات جديدة', bg: '#EFF6FF', color: '#1D4ED8' },
  patch: { text: 'إصلاحات',     bg: '#F0FDF4', color: '#059669' },
};

const EntryRow = ({ entry }) => {
  const cfg = ENTRY_ICONS[entry.type] || ENTRY_ICONS.feature;
  const Icon = cfg.icon;
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center"
        style={{ background: cfg.bg }}>
        <Icon style={{ color: cfg.color, fontSize: 9 }} />
      </span>
      <span style={{ color: 'var(--color-text-medium)' }}>{entry.text}</span>
    </li>
  );
};

const VersionCard = ({ release, isLatest, idx }) => {
  const [expanded, setExpanded] = useState(idx < 2);
  const lbl = LABEL_MAP[release.label] || LABEL_MAP.minor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: idx * 0.05 }}
      className="relative flex gap-5"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0 z-10"
          style={{
            borderColor: isLatest ? 'var(--color-primary)' : 'var(--color-border-strong)',
            background:  isLatest ? 'var(--color-primary)' : 'var(--color-surface)',
          }} />
        <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-border)', minHeight: 32 }} />
      </div>

      {/* Card */}
      <div className="flex-1 mb-6">
        <div className="card overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-5 py-4 text-right transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>
                  v{release.version}
                </span>
                {isLatest && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    الأحدث
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: lbl.bg, color: lbl.color }}>
                  {lbl.text}
                </span>
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>
                {release.title}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                {new Date(release.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <FaChevron expanded={expanded} />
            </div>
          </button>

          {/* Body */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.18 }}
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <div className="px-5 py-4">
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {release.summary}
                </p>
                <ul className="space-y-2.5">
                  {release.entries.map((e, i) => <EntryRow key={i} entry={e} />)}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FaChevron = ({ expanded }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
    style={{ transition: 'transform 0.18s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--color-text-faint)' }}>
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Legend ─── */
const Legend = () => (
  <div className="card p-4 mb-6">
    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>دليل الرموز</p>
    <div className="flex flex-wrap gap-3">
      {Object.entries(ENTRY_ICONS).map(([key, cfg]) => {
        const Icon = cfg.icon;
        return (
          <div key={key} className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--color-text-medium)' }}>
            <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.bg }}>
              <Icon style={{ color: cfg.color, fontSize: 9 }} />
            </span>
            {cfg.label}
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Stats Bar ─── */
const StatsBar = () => {
  const totalFeatures = CHANGELOG.flatMap(r => r.entries).filter(e => e.type === 'feature').length;
  const totalFixes    = CHANGELOG.flatMap(r => r.entries).filter(e => e.type === 'fix').length;
  const majors        = CHANGELOG.filter(r => r.label === 'major').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'إصدارات', value: CHANGELOG.length, icon: FaTag, color: '#C8161D' },
        { label: 'ميزات جديدة', value: totalFeatures, icon: FaStar, color: '#2563EB' },
        { label: 'إصلاحات', value: totalFixes, icon: FaBug, color: '#D97706' },
        { label: 'إصدارات رئيسية', value: majors, icon: FaRocket, color: '#7C3AED' },
      ].map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="card p-3.5 flex items-center gap-3"
          style={{ borderRight: `3px solid ${s.color}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${s.color}12` }}>
            <s.icon style={{ color: s.color, fontSize: 13 }} />
          </div>
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: 'var(--color-text-dark)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Page ─────────────────────────────── */
const ChangelogPage = () => {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? CHANGELOG
    : CHANGELOG.filter(r => r.label === filter);

  return (
    <div>
      <PageHeader
        title="سجل التحديثات"
        subtitle="تاريخ كامل لجميع الإصدارات والتحسينات"
        actions={
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            <FaCode style={{ fontSize: 10 }} />
            الإصدار الحالي: <span style={{ color: 'var(--color-primary)' }}>v3.0.0</span>
          </div>
        }
      />

      <StatsBar />

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {[
          { key: 'all',   label: 'الكل' },
          { key: 'major', label: 'رئيسية' },
          { key: 'minor', label: 'ميزات' },
          { key: 'patch', label: 'إصلاحات' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={filter === tab.key
              ? { background: 'var(--color-primary)', color: '#fff' }
              : { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <Legend />

      {/* Timeline */}
      <div>
        {filtered.map((release, i) => (
          <VersionCard
            key={release.version}
            release={release}
            isLatest={i === 0 && filter === 'all'}
            idx={i}
          />
        ))}
      </div>

      {/* Bottom note */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-faint)' }}>
          <FaCircleCheck style={{ fontSize: 10, color: 'var(--color-success)' }} />
          نظام EgyEstate — يتطور باستمرار
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;
