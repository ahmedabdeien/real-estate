import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI, customersAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaFilePdf, FaFileInvoice,
  FaCircleCheck, FaTriangleExclamation, FaHourglassHalf, FaCircleXmark,
} from 'react-icons/fa6';
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
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { exportInvoicePDF } from '../../utils/pdfExport';
import { usePagination } from '../../hooks/usePagination';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const defaultForm = {
  customerId: '',
  items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  subtotal: 0, taxRate: 0, discount: 0, dueDate: '', notes: '',
};

export default function InvoicesPage() {
  const company = useSelector(s => s.auth.company);
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(defaultForm);
  const [delId, setDelId]             = useState(null);

  const activeFilters = [search, statusFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, search, statusFilter],
    queryFn: () => invoicesAPI.getAll({
      page, limit,
      search: search || undefined,
      status: statusFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: cData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersAPI.getAll({ limit: 200 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? invoicesAPI.update(editing._id, d) : invoicesAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['invoices']);
      toast.success(editing ? 'تم التحديث' : 'تم إنشاء الفاتورة');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: invoicesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['invoices']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({ ...defaultForm, ...row, customerId: row.customerId?._id || row.customerId });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    if (k === 'quantity' || k === 'unitPrice') {
      items[i].total = (items[i].quantity || 0) * (items[i].unitPrice || 0);
    }
    const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
    setForm(f => ({ ...f, items, subtotal }));
  };
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
  const removeItem = (i) => {
    const items = form.items.filter((_, idx) => idx !== i);
    setForm(f => ({ ...f, items, subtotal: items.reduce((s, it) => s + (it.total || 0), 0) }));
  };

  const invoices = data?.data || [];
  const total    = data?.pagination?.total || 0;

  const totalAmount = useMemo(() => invoices.reduce((s, i) => s + (i.total || 0), 0), [invoices]);
  const paidCount   = useMemo(() => invoices.filter(i => i.status === 'paid').length, [invoices]);
  const overdueCount = useMemo(() => invoices.filter(i => i.status === 'overdue').length, [invoices]);

  const columns = [
    {
      header: 'رقم الفاتورة',
      render: (r) => <span className="font-mono text-xs font-black" style={{ color: 'var(--color-primary)' }}>{r.invoiceNumber}</span>,
    },
    {
      header: 'العميل',
      render: (r) => (
        <span className="font-medium text-sm">{r.customerId?.name || '—'}</span>
      ),
    },
    {
      header: 'الإجمالي',
      render: (r) => (
        <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>
          {fmt(r.total)} <span className="text-xs font-normal opacity-50">ج.م</span>
        </span>
      ),
    },
    {
      header: 'المدفوع / المتبقي',
      render: (r) => {
        const pct = r.total ? ((r.paidAmount || 0) / r.total) * 100 : 0;
        return (
          <div className="min-w-[110px] space-y-1">
            <div className="flex justify-between text-[10px]">
              <span style={{ color: '#059669' }}>{fmt(r.paidAmount)}</span>
              <span style={{ color: '#dc2626' }}>{fmt(r.balance)}</span>
            </div>
            <ProgressBar value={pct} max={100} color="#059669" height={4} animated />
          </div>
        );
      },
    },
    {
      header: 'الحالة',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'الاستحقاق',
      render: (r) => r.dueDate ? (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {new Date(r.dueDate).toLocaleDateString('ar-EG-u-nu-latn')}
        </span>
      ) : '—',
    },
    {
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="PDF" onClick={() => exportInvoicePDF(r, company)}>
            <FaFilePdf style={{ color: '#dc2626' }} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDelId(r._id)}><FaTrash /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="إدارة الفواتير"
        subtitle={`${total.toLocaleString('en-US')} فاتورة`}
        icon={FaFileInvoice}
        actions={<Button onClick={openCreate}><FaPlus className="text-xs" /> إضافة فاتورة</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي الفواتير" value={total} icon={FaFileInvoice} color="#c8161d" delay={0} />
        <KpiCard title="إجمالي المبالغ" value={fmt(totalAmount)} suffix="ج.م" icon={FaFileInvoice} color="#059669" delay={0.06} />
        <KpiCard title="مدفوعة" value={paidCount} icon={FaCircleCheck} color="#059669" delay={0.12}
          active={statusFilter === 'paid'} onClick={() => setStatusFilter(p => p === 'paid' ? '' : 'paid')} />
        <KpiCard title="متأخرة" value={overdueCount} icon={FaTriangleExclamation} color="#dc2626" delay={0.18}
          active={statusFilter === 'overdue'} onClick={() => setStatusFilter(p => p === 'overdue' ? '' : 'overdue')} />
      </div>

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setStatusFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث برقم الفاتورة أو العميل..." className="flex-1 min-w-[200px]" />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'draft',     label: 'مسودة' },
            { value: 'sent',      label: 'مرسلة' },
            { value: 'paid',      label: 'مدفوعة' },
            { value: 'partial',   label: 'جزئية' },
            { value: 'overdue',   label: 'متأخرة' },
            { value: 'cancelled', label: 'ملغية' },
          ]}
          placeholder="الحالة"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'} size="xl"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="العميل *" value={form.customerId} onChange={e => set('customerId', e.target.value)}
              options={(cData?.data || []).map(c => ({ value: c._id, label: c.name }))}
              placeholder="اختر العميل" className="col-span-2" />
            <Input label="تاريخ الاستحقاق" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>البنود</label>
              <Button variant="outline" size="sm" onClick={addItem}><FaPlus className="text-[10px]" /> إضافة بند</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <input className="input text-sm py-2" placeholder="الوصف" value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input className="input text-sm py-2" type="number" placeholder="الكمية" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                    <input className="input text-sm py-2" type="number" placeholder="سعر الوحدة" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-sm font-bold text-center" style={{ color: '#059669' }}>
                    {fmt(item.total)}
                  </div>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="col-span-1 text-red-500 hover:text-red-700 text-lg font-bold">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-sm pt-2">
              <span className="opacity-60">المجموع الفرعي: </span>
              <strong>{fmt(form.subtotal)} ج.م</strong>
            </div>
            <Input label="نسبة الضريبة %" type="number" value={form.taxRate} onChange={e => set('taxRate', Number(e.target.value))} />
            <Input label="الخصم (ج.م)" type="number" value={form.discount} onChange={e => set('discount', Number(e.target.value))} />
          </div>

          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
}
