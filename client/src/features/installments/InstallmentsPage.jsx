import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarDays, FaTriangleExclamation, FaClock, FaCircleCheck,
  FaMoneyBillWave, FaTableList, FaCircleXmark,
} from 'react-icons/fa6';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { KpiCard } from '../../components/ui/KpiCard';
import { FilterBar, SearchInput, ViewToggle } from '../../components/ui/FilterBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { Tooltip } from '../../components/ui/Tooltip';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG');
const daysOverdue = (d) => Math.ceil((new Date() - new Date(d)) / 86400000);
const daysUntil   = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

function DueDateBadge({ dueDate, status }) {
  if (status === 'paid') return <span className="text-xs font-bold text-green-600">مدفوع</span>;
  const due = new Date(dueDate);
  const isOver = due < new Date();
  const days = isOver ? daysOverdue(dueDate) : daysUntil(dueDate);
  if (isOver)    return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">متأخر {days} يوم</span>;
  if (days === 0) return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">اليوم</span>;
  if (days <= 7)  return <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">{days} أيام</span>;
  return <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{days} يوم</span>;
}

function InstallmentRow({ row, onPay, payPending }) {
  const inst      = row.installments;
  const dueDate   = new Date(inst?.dueDate);
  const isOver    = dueDate < new Date() && inst?.status !== 'paid';
  const remaining = (inst?.amount || 0) - (inst?.paidAmount || 0);
  const paidPct   = inst?.amount ? ((inst?.paidAmount || 0) / inst.amount) * 100 : 0;
  const customer  = row.customer?.[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition-all ${isOver ? 'border-red-200' : ''}`}
      style={{
        background: isOver ? '#fff8f8' : 'var(--color-surface)',
        borderColor: isOver ? '#fecaca' : 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar name={customer?.name || '؟'} size={40} className="flex-shrink-0" />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>
                {customer?.name || '—'}
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>
                {row.contractNumber}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DueDateBadge dueDate={inst?.dueDate} status={inst?.status} />
              <StatusBadge status={isOver ? 'overdue' : inst?.status || 'pending'} />
            </div>
          </div>

          {/* Amount + progress */}
          <div className="mt-2.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>
                المدفوع: <strong style={{ color: '#059669' }}>{fmt(inst?.paidAmount)} ج.م</strong>
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                الإجمالي: <strong style={{ color: 'var(--color-text-dark)' }}>{fmt(inst?.amount)} ج.م</strong>
              </span>
            </div>
            <ProgressBar value={paidPct} max={100} color={isOver ? '#ef4444' : '#059669'} height={5} animated />
            {remaining > 0 && (
              <p className="text-xs font-bold" style={{ color: isOver ? '#dc2626' : 'var(--color-text-muted)' }}>
                المتبقي: {fmt(remaining)} ج.م
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        {inst?.status !== 'paid' && (
          <Tooltip content="تأكيد الدفع" placement="left">
            <button
              onClick={() => onPay({ contractId: row._id, installmentId: inst?._id })}
              disabled={payPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: '#d1fae5', color: '#059669' }}
            >
              <FaCircleCheck className="text-sm" />
            </button>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: 'all',      label: 'الكل',          icon: FaCalendarDays },
  { id: 'overdue',  label: 'متأخرة',        icon: FaTriangleExclamation },
  { id: 'upcoming', label: 'قادمة (30 يوم)', icon: FaClock },
  { id: 'paid',     label: 'مدفوعة',        icon: FaCircleCheck },
];

export default function InstallmentsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['installments', filter],
    queryFn: () => {
      const params = {};
      if (filter === 'overdue')  params.status = 'overdue';
      if (filter === 'upcoming') { params.status = 'upcoming'; params.days = 30; }
      if (filter === 'paid')     params.status = 'paid';
      return api.get('/reports/installments', { params }).then(r => r.data.data || []);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ contractId, installmentId }) =>
      api.put(`/contracts/${contractId}/installments/${installmentId}`, { status: 'paid', paidAt: new Date() }),
    onSuccess: () => { qc.invalidateQueries(['installments']); toast.success('تم تأكيد الدفع'); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => {
      const name = r.customer?.[0]?.name || '';
      const num  = r.contractNumber || '';
      return name.includes(q) || num.includes(q);
    });
  }, [data, search]);

  const overdueCount = useMemo(() =>
    data.filter(r => new Date(r.installments?.dueDate) < new Date() && r.installments?.status !== 'paid').length,
    [data]
  );

  const totalDue = useMemo(() =>
    data.reduce((s, r) => s + Math.max(0, (r.installments?.amount || 0) - (r.installments?.paidAmount || 0)), 0),
    [data]
  );

  const thisMonth = useMemo(() => {
    const now = new Date();
    return data.filter(r => {
      const d = new Date(r.installments?.dueDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [data]);

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="تتبع الأقساط"
        subtitle="جميع أقساط العقود ومواعيد الاستحقاق"
        icon={FaCalendarDays}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي الأقساط"   value={data.length}    icon={FaCalendarDays}       color="#c8161d" delay={0}    onClick={() => setFilter('all')}      active={filter === 'all'} />
        <KpiCard title="أقساط متأخرة"     value={overdueCount}   icon={FaTriangleExclamation} color="#dc2626" delay={0.06} onClick={() => setFilter('overdue')}  active={filter === 'overdue'} />
        <KpiCard title="إجمالي المستحق"   value={fmt(totalDue)}  suffix="ج.م" icon={FaMoneyBillWave} color="#d97706" delay={0.12} />
        <KpiCard title="هذا الشهر"        value={thisMonth}      icon={FaClock}               color="#2563eb" delay={0.18} onClick={() => setFilter('upcoming')} active={filter === 'upcoming'} />
      </div>

      {/* Filters */}
      <FilterBar activeCount={search ? 1 : 0} onClear={() => setSearch('')}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث بالعميل أو رقم العقد..." className="flex-1 min-w-[200px]" />
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
              style={filter === t.id ? {
                background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)',
              } : {
                background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)',
              }}
            >
              <t.icon className="text-[11px]" />
              {t.label}
              {t.id === 'overdue' && overdueCount > 0 && (
                <span className="bg-red-100 text-red-700 rounded-full px-1.5 text-[10px] font-black">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </FilterBar>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FaCalendarDays} title="لا توجد أقساط" message="لا توجد أقساط تطابق الفلتر المحدد" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((row, i) => (
              <InstallmentRow
                key={`${row._id}-${row.installments?._id}`}
                row={row}
                onPay={markPaidMutation.mutate}
                payPending={markPaidMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
