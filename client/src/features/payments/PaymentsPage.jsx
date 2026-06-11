import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaTrash, FaMoneyBillWave, FaSackDollar,
  FaCreditCard, FaBuildingColumns, FaFileInvoice, FaReceipt,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import { paymentsAPI, customersAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { KpiCard } from '../../components/ui/KpiCard';
import { FilterBar, SearchInput, FilterSelect } from '../../components/ui/FilterBar';
import { MultiProgress } from '../../components/ui/ProgressBar';
import { usePagination } from '../../hooks/usePagination';

const METHOD_CONFIG = {
  cash:          { label: 'نقداً',         icon: FaMoneyBillWave, color: '#059669', bg: '#d1fae5' },
  bank_transfer: { label: 'تحويل بنكي',   icon: FaBuildingColumns, color: '#2563eb', bg: '#dbeafe' },
  check:         { label: 'شيك',           icon: FaFileInvoice,   color: '#d97706', bg: '#fef3c7' },
  card:          { label: 'بطاقة',         icon: FaCreditCard,    color: '#7c3aed', bg: '#ede9fe' },
  online:        { label: 'إلكتروني',      icon: FaReceipt,       color: '#0891b2', bg: '#cffafe' },
};

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG');
const defaultForm = {
  customerId: '', amount: '', method: 'cash',
  date: new Date().toISOString().split('T')[0],
  reference: '', bankName: '', checkNumber: '', notes: '',
};

function MethodBadge({ method }) {
  const cfg = METHOD_CONFIG[method] || { label: method, color: '#6b7280', bg: '#f3f4f6', icon: FaMoneyBillWave };
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="text-[10px]" />
      {cfg.label}
    </span>
  );
}

export default function PaymentsPage() {
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const activeFilters = [search, methodFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search, methodFilter],
    queryFn: () => paymentsAPI.getAll({
      page, limit,
      search: search || undefined,
      method: methodFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: cData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersAPI.getAll({ limit: 200 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: paymentsAPI.create,
    onSuccess: () => {
      qc.invalidateQueries(['payments']);
      toast.success('تم تسجيل الدفعة بنجاح');
      setModal(false);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: paymentsAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['payments']); toast.success('تم الحذف'); setDelId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const payments = data?.data || [];
  const total    = data?.pagination?.total || 0;

  const totalAmount = useMemo(
    () => payments.reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

  const methodBreakdown = useMemo(() =>
    Object.entries(METHOD_CONFIG).map(([key, cfg]) => ({
      label: cfg.label,
      color: cfg.color,
      value: payments.filter(p => p.method === key).reduce((s, p) => s + (p.amount || 0), 0),
    })).filter(s => s.value > 0),
    [payments]
  );

  const columns = [
    { header: 'رقم الإيصال', render: (r) => (
      <span className="font-mono text-xs font-black" style={{ color: 'var(--color-text-dark)' }}>
        {r.receiptNumber}
      </span>
    )},
    { header: 'العميل', render: (r) => (
      <div>
        <p className="font-semibold text-sm">{r.customerId?.name || '—'}</p>
        {r.customerId?.phone && <p className="text-xs opacity-50">{r.customerId.phone}</p>}
      </div>
    )},
    { header: 'المبلغ', render: (r) => (
      <span className="text-base font-black" style={{ color: '#059669' }}>
        {fmt(r.amount)} <span className="text-xs font-normal opacity-60">ج.م</span>
      </span>
    )},
    { header: 'طريقة الدفع', render: (r) => <MethodBadge method={r.method} /> },
    { header: 'التاريخ', render: (r) => (
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {new Date(r.date || r.createdAt).toLocaleDateString('ar-EG')}
      </span>
    )},
    { header: 'المرجع', render: (r) => r.reference || r.checkNumber || '—' },
    { header: '', render: (r) => (
      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDelId(r._id)}>
        <FaTrash />
      </Button>
    )},
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="المدفوعات والإيصالات"
        subtitle={`${total.toLocaleString('ar-EG')} دفعة مسجلة`}
        icon={FaMoneyBillWave}
        actions={
          <Button onClick={() => setModal(true)}>
            <FaPlus className="text-xs" /> تسجيل دفعة
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي الدفعات" value={total} icon={FaReceipt} color="#c8161d" delay={0} />
        <KpiCard title="إجمالي المبالغ" value={fmt(totalAmount)} suffix="ج.م" icon={FaSackDollar} color="#059669" delay={0.06} />
        {Object.entries(METHOD_CONFIG).slice(0, 2).map(([key, cfg], i) => (
          <KpiCard
            key={key}
            title={cfg.label}
            value={payments.filter(p => p.method === key).length}
            icon={cfg.icon}
            color={cfg.color}
            delay={0.12 + i * 0.06}
            active={methodFilter === key}
            onClick={() => setMethodFilter(p => p === key ? '' : key)}
          />
        ))}
      </div>

      {/* Method breakdown bar */}
      {methodBreakdown.length > 0 && (
        <div className="rounded-2xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <MultiProgress
            label="توزيع المبالغ حسب طريقة الدفع"
            segments={methodBreakdown}
            height={12}
          />
        </div>
      )}

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setMethodFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث برقم الإيصال أو العميل..." className="flex-1 min-w-[200px]" />
        <FilterSelect
          value={methodFilter}
          onChange={setMethodFilter}
          options={Object.entries(METHOD_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          placeholder="طريقة الدفع"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(defaultForm); }}
        title="تسجيل دفعة جديدة" size="md"
        footer={<>
          <Button variant="outline" onClick={() => { setModal(false); setForm(defaultForm); }}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>تسجيل الدفعة</Button>
        </>}
      >
        <div className="space-y-4">
          <Select label="العميل *" value={form.customerId}
            onChange={setF('customerId')}
            options={(cData?.data || []).map(c => ({ value: c._id, label: `${c.name}${c.phone ? ' - ' + c.phone : ''}` }))}
            placeholder="اختر العميل" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="المبلغ (ج.م) *" type="number" value={form.amount} onChange={setF('amount')} />
            <Input label="التاريخ" type="date" value={form.date} onChange={setF('date')} />
          </div>
          <Select label="طريقة الدفع" value={form.method}
            onChange={setF('method')}
            options={Object.entries(METHOD_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))} />
          {(form.method === 'bank_transfer' || form.method === 'check') && (
            <Input label="اسم البنك" value={form.bankName} onChange={setF('bankName')} />
          )}
          {form.method === 'check' && (
            <Input label="رقم الشيك" value={form.checkNumber} onChange={setF('checkNumber')} />
          )}
          <Input label="مرجع (اختياري)" value={form.reference} onChange={setF('reference')} />
          <Input label="ملاحظات" value={form.notes} onChange={setF('notes')} />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
}
