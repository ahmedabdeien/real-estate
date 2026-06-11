import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShield, FaMagnifyingGlass,
  FaEye, FaFileExport, FaFileImport,
  FaArrowRightFromBracket, FaArrowRightToBracket,
  FaTrash, FaPlus, FaPen, FaBuilding, FaChevronDown, FaChevronRight,
} from 'react-icons/fa6';
import { auditAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ACTION_CONFIG = {
  create: { label: 'إنشاء',   icon: FaPlus,                  color: '#22c55e', bg: '#dcfce7' },
  update: { label: 'تعديل',   icon: FaPen,                   color: '#3b82f6', bg: '#dbeafe' },
  delete: { label: 'حذف',     icon: FaTrash,                 color: '#ef4444', bg: '#fee2e2' },
  view:   { label: 'عرض',     icon: FaEye,                   color: '#8b5cf6', bg: '#ede9fe' },
  export: { label: 'تصدير',   icon: FaFileExport,            color: '#f59e0b', bg: '#fef3c7' },
  import: { label: 'استيراد', icon: FaFileImport,            color: '#06b6d4', bg: '#cffafe' },
  login:  { label: 'دخول',    icon: FaArrowRightToBracket,   color: '#10b981', bg: '#d1fae5' },
  logout: { label: 'خروج',    icon: FaArrowRightFromBracket, color: '#6b7280', bg: '#f3f4f6' },
};

const MODULE_LABELS = {
  properties:   'المشاريع',    units:         'الوحدات',       customers:    'العملاء',
  contracts:    'العقود',      invoices:      'الفواتير',      payments:     'المدفوعات',
  expenses:     'المصروفات',   users:         'المستخدمين',    roles:        'الأدوار',
  companies:    'الشركات',     settings:      'الإعدادات',     theme:        'المظهر',
  auth:         'المصادقة',    reports:       'التقارير',      documents:    'المستندات',
  plans:        'الخطط',       installments:  'الأقساط',
};

const MODULES_LIST = Object.entries(MODULE_LABELS).map(([k, v]) => ({ value: k, label: v }));
const ACTIONS_LIST = Object.entries(ACTION_CONFIG).map(([k, v]) => ({ value: k, label: v.label }));

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 30) return `منذ ${d} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-EG');
}

function DiffViewer({ diff }) {
  if (!diff || !Object.keys(diff).length) return null;
  const FIELD_LABELS = {
    name: 'الاسم', status: 'الحالة', price: 'السعر', area: 'المساحة',
    phone: 'الهاتف', email: 'البريد', address: 'العنوان', notes: 'ملاحظات',
    amount: 'المبلغ', dueDate: 'تاريخ الاستحقاق', description: 'الوصف',
  };
  return (
    <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      <div className="px-4 py-2 text-xs font-bold" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
        التغييرات
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {Object.entries(diff).map(([field, { from, to }]) => (
          <div key={field} className="grid grid-cols-3 gap-3 px-4 py-2 text-xs">
            <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {FIELD_LABELS[field] || field}
            </span>
            <span className="line-through" style={{ color: '#ef4444' }}>
              {String(from ?? '—')}
            </span>
            <span className="font-semibold" style={{ color: '#22c55e' }}>
              {String(to ?? '—')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditEntry({ log, expanded, onToggle }) {
  const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.view;
  const Icon = cfg.icon;
  const hasDiff = log.diff && Object.keys(log.diff).length > 0;
  const userName = log.userId?.name || 'مستخدم محذوف';
  const moduleLabel = MODULE_LABELS[log.module] || log.module;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      {/* Timeline icon + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <Icon className="text-sm" />
        </div>
        <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-border)', minHeight: 20 }} />
      </div>

      {/* Card */}
      <div className="flex-1 pb-5">
        <div
          className="rounded-2xl border p-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg" style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                {moduleLabel}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>
                {log.description || `${cfg.label} في ${moduleLabel}`}
              </span>
              {log.resourceName && (
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>— {log.resourceName}</span>
              )}
            </div>
            {hasDiff && (
              <button
                onClick={onToggle}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                style={{ color: 'var(--color-primary)', background: 'var(--color-primary)12' }}
              >
                {expanded ? <FaChevronDown className="text-[9px]" /> : <FaChevronRight className="text-[9px]" />}
                {expanded ? 'إخفاء' : 'التفاصيل'}
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {userName.charAt(0)}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-dark)' }}>{userName}</span>
            </div>
            {log.companyId?.name && (
              <div className="flex items-center gap-1">
                <FaBuilding className="text-[10px]" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.companyId.name}</span>
              </div>
            )}
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {relativeTime(log.createdAt)}
            </span>
            <span className="text-xs hidden lg:block" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
              {new Date(log.createdAt).toLocaleString('ar-EG')}
            </span>
            {log.ip && (
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>{log.ip}</span>
            )}
          </div>

          {/* Diff */}
          <AnimatePresence>
            {expanded && hasDiff && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DiffViewer diff={log.diff} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function AuditPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 30 });
  const [expandedId, setExpandedId] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v || undefined, page: 1 }));

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditAPI.getLogs(filters).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditAPI.getStats().then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const logs  = data?.data || [];
  const total = data?.total || data?.pagination?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  const actionCounts = (statsData?.byAction || []).reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});
  const topModules   = statsData?.byModule || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="سجل النشاطات"
        subtitle={`${total.toLocaleString('ar-EG')} عملية مسجلة — من فعل ماذا ومتى`}
        icon={FaShield}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ACTION_CONFIG).slice(0, 4).map(([action, cfg]) => (
          <div key={action} className="rounded-2xl p-4 border" style={{ background: cfg.bg, borderColor: cfg.color + '30' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.color + '20' }}>
                <cfg.icon className="text-sm" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: cfg.color }}>
                  {(actionCounts[action] || 0).toLocaleString('ar-EG')}
                </p>
                <p className="text-xs font-semibold" style={{ color: cfg.color, opacity: 0.75 }}>{cfg.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="بحث في النشاطات..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
              onChange={e => setF('search', e.target.value)}
            />
          </div>

          {/* Module */}
          <select
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            onChange={e => setF('module', e.target.value)}
          >
            <option value="">كل الموديولات</option>
            {MODULES_LIST.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          {/* Action */}
          <select
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            onChange={e => setF('action', e.target.value)}
          >
            <option value="">كل العمليات</option>
            {ACTIONS_LIST.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>

          {/* Date range */}
          <input
            type="date"
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            onChange={e => setF('from', e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            onChange={e => setF('to', e.target.value)}
          />
        </div>

        {/* Top modules quick-filter chips */}
        {topModules.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>الأكثر نشاطاً:</span>
            {topModules.slice(0, 6).map(m => (
              <button
                key={m._id}
                onClick={() => setF('module', m._id)}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'var(--color-primary)18', color: 'var(--color-primary)' }}
              >
                {MODULE_LABELS[m._id] || m._id} ({m.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FaShield} title="لا توجد نشاطات" message="لم يتم تسجيل أي نشاطات بعد" />
        ) : (
          <div>
            {logs.map(log => (
              <AuditEntry
                key={log._id}
                log={log}
                expanded={expandedId === log._id}
                onToggle={() => setExpandedId(p => p === log._id ? null : log._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              الصفحة {filters.page} من {pages} — {total.toLocaleString('ar-EG')} سجل
            </p>
            <div className="flex gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
              >
                السابق
              </button>
              <button
                disabled={filters.page >= pages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
