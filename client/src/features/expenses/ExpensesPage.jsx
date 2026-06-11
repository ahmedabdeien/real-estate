import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaReceipt, FaSackXmark,
  FaChartPie, FaArrowTrendDown,
} from 'react-icons/fa6';
import { expensesAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { KpiCard } from '../../components/ui/KpiCard';
import { FilterBar, SearchInput, FilterSelect } from '../../components/ui/FilterBar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { usePagination } from '../../hooks/usePagination';

const CATEGORIES = ['رواتب', 'صيانة', 'مرافق', 'تسويق', 'إيجار مكتب', 'سفر وانتقالات', 'مستلزمات', 'عمولات', 'رسوم قانونية', 'أخرى'];

const CAT_COLORS = {
  'رواتب': '#c8161d', 'صيانة': '#f59e0b', 'مرافق': '#2563eb',
  'تسويق': '#7c3aed', 'إيجار مكتب': '#059669', 'سفر وانتقالات': '#0891b2',
  'مستلزمات': '#d97706', 'عمولات': '#be185d', 'رسوم قانونية': '#6b7280', 'أخرى': '#9ca3af',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const defaultForm = { category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', vendor: '', reference: '' };

export default function ExpensesPage() {
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const activeFilters = [search, catFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', page, search, catFilter],
    queryFn: () => expensesAPI.getAll({
      page, limit,
      search: search || undefined,
      category: catFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? expensesAPI.update(editing._id, d) : expensesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success(editing ? 'تم التحديث' : 'تم تسجيل المصروف'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: expensesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const expenses = data?.data || [];
  const total    = data?.pagination?.total || 0;

  const totalAmount = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);

  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses]);

  const columns = [
    { header: 'المصروف', render: (r) => (
      <div>
        <p className="font-semibold text-sm">{r.description}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
          style={{ background: (CAT_COLORS[r.category] || '#9ca3af') + '18', color: CAT_COLORS[r.category] || '#9ca3af' }}>
          {r.category}
        </span>
      </div>
    )},
    { header: 'المورد', render: (r) => r.vendor || '—' },
    { header: 'المبلغ', render: (r) => (
      <span className="font-black" style={{ color: '#dc2626' }}>
        {fmt(r.amount)} <span className="text-xs font-normal opacity-60">ج.م</span>
      </span>
    )},
    { header: 'التاريخ', render: (r) => (
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {new Date(r.date).toLocaleDateString('ar-EG-u-nu-latn')}
      </span>
    )},
    { header: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDelId(r._id)}><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="إدارة المصروفات"
        subtitle={`${total.toLocaleString('en-US')} مصروف مسجل`}
        icon={FaSackXmark}
        actions={<Button onClick={openCreate}><FaPlus className="text-xs" /> إضافة مصروف</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="إجمالي المصروفات" value={total} icon={FaReceipt} color="#c8161d" delay={0} />
        <KpiCard title="إجمالي المبالغ" value={fmt(totalAmount)} suffix="ج.م" icon={FaArrowTrendDown} color="#dc2626" delay={0.06} />
        <KpiCard title="متوسط المصروف" value={total ? fmt(Math.round(totalAmount / total)) : '—'} suffix="ج.م" icon={FaChartPie} color="#7c3aed" delay={0.12} />
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="rounded-2xl border p-5 space-y-3"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-dark)' }}>أكثر التصنيفات إنفاقاً</p>
          {byCategory.map(([cat, amt]) => (
            <ProgressBar
              key={cat}
              label={cat}
              value={amt}
              max={byCategory[0]?.[1] || 1}
              color={CAT_COLORS[cat] || '#c8161d'}
              height={6}
              showPercent
              animated
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setCatFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث في المصروفات..." className="flex-1 min-w-[180px]" />
        <FilterSelect
          value={catFilter}
          onChange={setCatFilter}
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
          placeholder="التصنيف"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل المصروف' : 'إضافة مصروف جديد'} size="md"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-4">
          <Select label="التصنيف *" value={form.category} onChange={setF('category')}
            options={CATEGORIES.map(c => ({ value: c, label: c }))} placeholder="اختر التصنيف" />
          <Input label="الوصف *" value={form.description} onChange={setF('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="المبلغ (ج.م) *" type="number" value={form.amount} onChange={setF('amount')} />
            <Input label="التاريخ" type="date" value={form.date} onChange={setF('date')} />
          </div>
          <Select label="طريقة الدفع" value={form.paymentMethod} onChange={setF('paymentMethod')}
            options={[
              { value: 'cash', label: 'نقداً' },
              { value: 'bank_transfer', label: 'تحويل بنكي' },
              { value: 'check', label: 'شيك' },
              { value: 'card', label: 'بطاقة' },
            ]} />
          <Input label="المورد / الجهة" value={form.vendor} onChange={setF('vendor')} />
          <Input label="المرجع" value={form.reference} onChange={setF('reference')} />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
}
