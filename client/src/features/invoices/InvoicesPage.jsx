import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI, customersAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { FaPlus, FaPen, FaTrash, FaFilePdf, FaFileInvoice, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { exportInvoicePDF } from '../../utils/pdfExport';
import { usePagination } from '../../hooks/usePagination';

const STATUS = { draft: { l: 'مسودة', c: 'default' }, sent: { l: 'مرسلة', c: 'info' }, paid: { l: 'مدفوعة', c: 'success' }, partial: { l: 'جزئية', c: 'warning' }, overdue: { l: 'متأخرة', c: 'danger' }, cancelled: { l: 'ملغية', c: 'default' } };

const defaultForm = { customerId: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }], subtotal: 0, taxRate: 0, discount: 0, dueDate: '', notes: '' };

const InvoicesPage = () => {
  const company = useSelector(s => s.auth.company);
  const qc = useQueryClient();
  const { page, setPage, dSearch, handleSearch, limit } = usePagination();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, dSearch],
    queryFn: () => invoicesAPI.getAll({ page, limit, search: dSearch }).then(r => r.data),
  });

  const { data: cData } = useQuery({ queryKey: ['customers-list'], queryFn: () => customersAPI.getAll({ limit: 200 }).then(r => r.data) });

  const save = useMutation({
    mutationFn: (d) => editing ? invoicesAPI.update(editing._id, d) : invoicesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['invoices']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء الفاتورة'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: invoicesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['invoices']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row, customerId: row.customerId?._id || row.customerId }); setModal(true); };
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

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
  const removeItem = (i) => {
    const items = form.items.filter((_, idx) => idx !== i);
    setForm(f => ({ ...f, items, subtotal: items.reduce((s, it) => s + (it.total || 0), 0) }));
  };

  const columns = [
    { header: 'رقم الفاتورة', render: (r) => <span className="font-mono text-xs font-bold">{r.invoiceNumber}</span> },
    { header: 'العميل', render: (r) => r.customerId?.name },
    { header: 'الإجمالي', render: (r) => <span className="font-semibold">{r.total?.toLocaleString('ar-EG')} ج.م</span> },
    { header: 'المدفوع', render: (r) => <span className="text-green-700">{(r.paidAmount || 0).toLocaleString('ar-EG')} ج.م</span> },
    { header: 'المتبقي', render: (r) => <span className="text-red-700">{(r.balance || 0).toLocaleString('ar-EG')} ج.م</span> },
    { header: 'الحالة', render: (r) => { const s = STATUS[r.status] || { l: r.status, c: 'default' }; return <Badge color={s.c}>{s.l}</Badge>; } },
    { header: 'الإجراءات', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" title="تصدير PDF" onClick={() => exportInvoicePDF(r, company)}><FaFilePdf className="text-red-600" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="إدارة الفواتير" subtitle="جميع الفواتير والمستحقات"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة فاتورة</Button>}
        stats={[
          { label: 'الإجمالي', value: data?.pagination?.total ?? '—', icon: FaFileInvoice, color: '#da1f27' },
          { label: 'مدفوعة', value: (data?.data || []).filter(i => i.status === 'paid').length, icon: FaCircleCheck, color: '#009756' },
          { label: 'متأخرة', value: (data?.data || []).filter(i => i.status === 'overdue').length, icon: FaTriangleExclamation, color: '#b91c1c' },
        ]}
      />

      <DataTable columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page} pages={data?.pagination?.pages || 1} limit={limit}
        onPageChange={setPage} onSearch={handleSearch} searchPlaceholder="بحث برقم الفاتورة..." />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'} size="xl"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="العميل" value={form.customerId} onChange={e => set('customerId', e.target.value)}
              options={(cData?.data || []).map(c => ({ value: c._id, label: c.name }))} placeholder="اختر العميل" className="col-span-2" />
            <Input label="تاريخ الاستحقاق" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">البنود</label>
              <Button variant="outline" size="sm" onClick={addItem}><FaPlus /> إضافة بند</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <input className="input text-sm py-2" placeholder="الوصف" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input className="input text-sm py-2" type="number" placeholder="الكمية" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                    <input className="input text-sm py-2" type="number" placeholder="سعر الوحدة" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-sm font-medium text-center">{item.total?.toLocaleString('ar-EG')}</div>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="col-span-1 text-red-500 hover:text-red-700 text-lg">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-sm"><span className="opacity-60">المجموع الفرعي:</span> <strong>{form.subtotal?.toLocaleString('ar-EG')} ج.م</strong></div>
            <Input label="نسبة الضريبة %" type="number" value={form.taxRate} onChange={e => set('taxRate', Number(e.target.value))} />
            <Input label="الخصم" type="number" value={form.discount} onChange={e => set('discount', Number(e.target.value))} />
          </div>
          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default InvoicesPage;
