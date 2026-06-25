import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FaFacebook, FaPlus, FaPen, FaTrash, FaEye, FaPause, FaPlay,
  FaChartLine, FaMoneyBillWave, FaUsers, FaMousePointer,
  FaMagnifyingGlass, FaCircleCheck, FaCircleXmark, FaClock,
  FaBullhorn, FaImage, FaVideo, FaCaretUp, FaCaretDown,
} from 'react-icons/fa6';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { KpiCard } from '../../components/ui/KpiCard';
import { FilterBar, SearchInput, FilterSelect } from '../../components/ui/FilterBar';
import DataTable from '../../components/ui/DataTable';
import toast from 'react-hot-toast';

// ── constants ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { label: 'نشط',     color: '#059669', bg: '#d1fae5' },
  paused:   { label: 'موقوف',   color: '#d97706', bg: '#fef3c7' },
  draft:    { label: 'مسودة',   color: '#6b7280', bg: '#f3f4f6' },
  ended:    { label: 'منتهي',   color: '#dc2626', bg: '#fee2e2' },
  rejected: { label: 'مرفوض',  color: '#9333ea', bg: '#f3e8ff' },
};

const OBJECTIVE_OPTIONS = [
  { value: 'awareness',    label: 'زيادة الوعي' },
  { value: 'traffic',      label: 'زيارات الموقع' },
  { value: 'leads',        label: 'جمع العملاء المحتملين' },
  { value: 'conversions',  label: 'التحويلات' },
  { value: 'messages',     label: 'الرسائل' },
  { value: 'reach',        label: 'الوصول' },
];

const FORMAT_OPTIONS = [
  { value: 'image',    label: 'صورة', icon: FaImage },
  { value: 'video',    label: 'فيديو', icon: FaVideo },
  { value: 'carousel', label: 'كاروسيل', icon: FaBullhorn },
];

const EMPTY_FORM = {
  name: '', objective: 'leads', budget: '', budgetType: 'daily',
  startDate: '', endDate: '', targetAudience: '', format: 'image',
  headline: '', description: '', callToAction: 'تواصل معنا', status: 'draft',
  notes: '',
};

function fmt(n) {
  return (n || 0).toLocaleString('en-US');
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function MetricDelta({ value, suffix = '%' }) {
  const pos = value >= 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold"
      style={{ color: pos ? '#059669' : '#dc2626' }}>
      {pos ? <FaCaretUp /> : <FaCaretDown />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

// ── mock data helper (until real API exists) ───────────────────────────────
const MOCK_ADS = [
  { _id: '1', name: 'حملة شقق النيل', objective: 'leads', status: 'active',   budget: 5000, budgetType: 'monthly', spent: 2340, impressions: 124000, clicks: 3200, leads: 87, ctr: 2.58, cpl: 26.9, format: 'image',    startDate: '2025-06-01', endDate: '2025-06-30' },
  { _id: '2', name: 'إعلان فيلات الساحل', objective: 'awareness', status: 'active', budget: 8000, budgetType: 'monthly', spent: 5100, impressions: 310000, clicks: 4800, leads: 62, ctr: 1.55, cpl: 82.3, format: 'video', startDate: '2025-05-15', endDate: '2025-06-30' },
  { _id: '3', name: 'مكاتب تجارية', objective: 'traffic', status: 'paused',  budget: 3000, budgetType: 'monthly', spent: 1200, impressions: 58000,  clicks: 980,  leads: 24, ctr: 1.69, cpl: 50.0, format: 'carousel', startDate: '2025-06-10', endDate: '2025-07-10' },
  { _id: '4', name: 'شقق للإيجار', objective: 'messages', status: 'draft',   budget: 2500, budgetType: 'daily',   spent: 0,    impressions: 0,       clicks: 0,    leads: 0,  ctr: 0,    cpl: 0,    format: 'image',    startDate: '2025-07-01', endDate: '2025-07-31' },
  { _id: '5', name: 'أراضي للبيع', objective: 'leads',    status: 'ended',   budget: 4000, budgetType: 'monthly', spent: 4000, impressions: 95000,  clicks: 2100, leads: 110, ctr: 2.21, cpl: 36.4, format: 'image',   startDate: '2025-04-01', endDate: '2025-04-30' },
];

// ── main component ─────────────────────────────────────────────────────────
export default function FacebookAdsPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [objectiveFilter, setObj]   = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [detailAd, setDetailAd]     = useState(null);
  const [delId, setDelId]           = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  // Using mock data for now — replace with real API calls when backend is ready
  const ads = MOCK_ADS.filter(a => {
    if (search && !a.name.includes(search)) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (objectiveFilter && a.objective !== objectiveFilter) return false;
    return true;
  });

  const kpis = {
    total:       MOCK_ADS.length,
    active:      MOCK_ADS.filter(a => a.status === 'active').length,
    totalSpent:  MOCK_ADS.reduce((s, a) => s + a.spent, 0),
    totalLeads:  MOCK_ADS.reduce((s, a) => s + a.leads, 0),
    totalImpr:   MOCK_ADS.reduce((s, a) => s + a.impressions, 0),
    avgCtr:      (MOCK_ADS.reduce((s, a) => s + a.ctr, 0) / MOCK_ADS.length).toFixed(2),
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit   = ad => { setEditing(ad); setForm({ ...EMPTY_FORM, ...ad }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('اسم الحملة مطلوب'); return; }
    if (!form.budget)      { toast.error('الميزانية مطلوبة'); return; }
    toast.success(editing ? 'تم تحديث الحملة' : 'تم إنشاء الحملة');
    closeModal();
  };

  const handleDelete = () => {
    toast.success('تم حذف الحملة');
    setDelId(null);
  };

  const handleToggle = (ad) => {
    const next = ad.status === 'active' ? 'paused' : 'active';
    toast.success(next === 'active' ? 'تم تفعيل الحملة' : 'تم إيقاف الحملة');
  };

  // ── table columns ──────────────────────────────────────────────────────
  const columns = [
    {
      header: 'الحملة',
      render: (r) => (
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-dark)' }}>{r.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {OBJECTIVE_OPTIONS.find(o => o.value === r.objective)?.label}
          </p>
        </div>
      ),
    },
    {
      header: 'الحالة',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'الميزانية',
      hidden: 'sm',
      render: (r) => (
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>
            {fmt(r.budget)} ج.م
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {r.budgetType === 'daily' ? 'يومي' : 'شهري'}
          </p>
        </div>
      ),
    },
    {
      header: 'المصروف',
      hidden: 'sm',
      render: (r) => (
        <div>
          <p className="font-bold text-sm" style={{ color: '#dc2626' }}>{fmt(r.spent)} ج.م</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {r.budget ? Math.round((r.spent / r.budget) * 100) : 0}%
          </p>
        </div>
      ),
    },
    {
      header: 'المشاهدات',
      hidden: 'md',
      render: (r) => (
        <span className="font-medium text-sm">{fmt(r.impressions)}</span>
      ),
    },
    {
      header: 'النقرات / CTR',
      hidden: 'md',
      render: (r) => (
        <div>
          <p className="font-medium text-sm">{fmt(r.clicks)}</p>
          <p className="text-xs font-bold" style={{ color: r.ctr >= 2 ? '#059669' : 'var(--color-text-muted)' }}>
            {r.ctr}%
          </p>
        </div>
      ),
    },
    {
      header: 'العملاء / CPL',
      render: (r) => (
        <div>
          <p className="font-bold text-sm" style={{ color: '#2563eb' }}>{r.leads}</p>
          {r.cpl > 0 && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {r.cpl} ج.م/عميل
            </p>
          )}
        </div>
      ),
    },
    {
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="التفاصيل" onClick={() => setDetailAd(r)}>
            <FaEye style={{ color: '#2563eb' }} />
          </Button>
          <Button variant="ghost" size="icon" title={r.status === 'active' ? 'إيقاف' : 'تفعيل'}
            onClick={() => handleToggle(r)}>
            {r.status === 'active'
              ? <FaPause style={{ color: '#d97706' }} />
              : <FaPlay style={{ color: '#059669' }} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDelId(r._id)}>
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="إعلانات فيسبوك"
        subtitle={`${MOCK_ADS.length} حملة`}
        icon={FaFacebook}
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'التسويق' },
          { label: 'إعلانات فيسبوك' },
        ]}
        actions={
          <Button onClick={openCreate}>
            <FaPlus className="text-xs" /> إنشاء حملة
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي الحملات"    value={kpis.total}                    icon={FaBullhorn}      color="#1877f2" delay={0} />
        <KpiCard title="حملات نشطة"        value={kpis.active}                   icon={FaPlay}          color="#059669" delay={0.06} />
        <KpiCard title="المصروف الإجمالي"  value={`${fmt(kpis.totalSpent)} ج.م`} icon={FaMoneyBillWave} color="#dc2626" delay={0.12} />
        <KpiCard title="عملاء محتملون"     value={kpis.totalLeads}               icon={FaUsers}         color="#7c3aed" delay={0.18} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>إجمالي المشاهدات</p>
            <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-text-dark)' }}>
              {(kpis.totalImpr / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#eff6ff' }}>
            <FaEye style={{ color: '#2563eb' }} />
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>متوسط CTR</p>
            <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-text-dark)' }}>
              {kpis.avgCtr}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f0fdf4' }}>
            <FaMousePointer style={{ color: '#059669' }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        activeCount={[search, statusFilter, objectiveFilter].filter(Boolean).length}
        onClear={() => { setSearch(''); setStatus(''); setObj(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم الحملة..." className="flex-1 min-w-[180px]" />
        <FilterSelect value={statusFilter} onChange={setStatus}
          options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          placeholder="الحالة" />
        <FilterSelect value={objectiveFilter} onChange={setObj}
          options={OBJECTIVE_OPTIONS}
          placeholder="الهدف" />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={ads}
        loading={false}
        total={ads.length}
        page={1}
        pages={1}
      />

      {/* ── Create / Edit Modal ── */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل حملة إعلانية' : 'إنشاء حملة إعلانية جديدة'}
        size="xl"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={handleSave}>
            <FaFacebook /> {editing ? 'تحديث' : 'إنشاء الحملة'}
          </Button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="اسم الحملة *" value={form.name} onChange={set('name')}
              placeholder="مثال: حملة شقق النيل — يونيو 2025" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              هدف الحملة
            </label>
            <select value={form.objective} onChange={set('objective')}
              className="input w-full">
              {OBJECTIVE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              تنسيق الإعلان
            </label>
            <select value={form.format} onChange={set('format')} className="input w-full">
              {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <Input label="الميزانية (ج.م) *" type="number" value={form.budget} onChange={set('budget')}
            placeholder="5000" />

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              نوع الميزانية
            </label>
            <select value={form.budgetType} onChange={set('budgetType')} className="input w-full">
              <option value="daily">يومي</option>
              <option value="monthly">شهري</option>
              <option value="total">إجمالي</option>
            </select>
          </div>

          <Input label="تاريخ البدء" type="date" value={form.startDate} onChange={set('startDate')} />
          <Input label="تاريخ الانتهاء" type="date" value={form.endDate} onChange={set('endDate')} />

          <div className="sm:col-span-2">
            <Input label="الجمهور المستهدف" value={form.targetAudience} onChange={set('targetAudience')}
              placeholder="مثال: رجال 25-45 سنة، القاهرة، مهتمون بالعقارات" />
          </div>

          <div className="sm:col-span-2">
            <Input label="عنوان الإعلان (Headline)" value={form.headline} onChange={set('headline')}
              placeholder="مثال: شقق فاخرة على النيل — بادئ الحجز 10%" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              نص الإعلان
            </label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className="input w-full resize-none"
              placeholder="وصف الإعلان الذي سيظهر للمستخدمين..." />
          </div>

          <Input label="زر الدعوة (CTA)" value={form.callToAction} onChange={set('callToAction')}
            placeholder="تواصل معنا" />

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              الحالة
            </label>
            <select value={form.status} onChange={set('status')} className="input w-full">
              <option value="draft">مسودة</option>
              <option value="active">نشط</option>
              <option value="paused">موقوف</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-medium)' }}>
              ملاحظات
            </label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              className="input w-full resize-none" placeholder="ملاحظات داخلية..." />
          </div>
        </div>
      </Modal>

      {/* ── Detail Modal ── */}
      {detailAd && (
        <Modal open={!!detailAd} onClose={() => setDetailAd(null)}
          title={detailAd.name} size="lg"
          footer={<Button variant="outline" onClick={() => setDetailAd(null)}>إغلاق</Button>}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailAd.status} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {OBJECTIVE_OPTIONS.find(o => o.value === detailAd.objective)?.label}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {detailAd.startDate} ← {detailAd.endDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'الميزانية',   value: `${fmt(detailAd.budget)} ج.م` },
                { label: 'المصروف',     value: `${fmt(detailAd.spent)} ج.م`  },
                { label: 'المشاهدات',  value: fmt(detailAd.impressions)        },
                { label: 'النقرات',    value: fmt(detailAd.clicks)             },
                { label: 'عملاء',      value: detailAd.leads                   },
                { label: 'CTR',         value: `${detailAd.ctr}%`              },
                { label: 'CPL',         value: detailAd.cpl > 0 ? `${detailAd.cpl} ج.م` : '—' },
                { label: 'التنسيق',    value: FORMAT_OPTIONS.find(f => f.value === detailAd.format)?.label },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--color-bg)' }}>
                  <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <p className="text-sm font-black" style={{ color: 'var(--color-text-dark)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                نسبة الإنفاق
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-border)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, detailAd.budget ? Math.round((detailAd.spent / detailAd.budget) * 100) : 0)}%`,
                      background: 'var(--color-primary)',
                    }} />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-dark)' }}>
                  {detailAd.budget ? Math.round((detailAd.spent / detailAd.budget) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="حذف الحملة" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDelId(null)}>إلغاء</Button>
          <Button variant="danger" onClick={handleDelete}>حذف</Button>
        </>}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-medium)' }}>
          هل أنت متأكد من حذف هذه الحملة الإعلانية؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
      </Modal>
    </div>
  );
}
