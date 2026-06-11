import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsAPI, customersAPI, propertiesAPI, unitsAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaFilePdf, FaEye, FaFileContract,
  FaCircleCheck, FaCircleXmark, FaPenToSquare, FaHourglassHalf,
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
import { exportContractPDF } from '../../utils/pdfExport';
import { usePagination } from '../../hooks/usePagination';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const defaultForm = {
  customerId: '', unitId: '', propertyId: '', type: 'sale',
  totalPrice: '', downPayment: '', installmentCount: 1, startDate: '', notes: '',
};

export default function ContractsPage() {
  const company = useSelector(s => s.auth.company);
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [modal, setModal]               = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(defaultForm);
  const [delId, setDelId]               = useState(null);
  const [viewContract, setViewContract] = useState(null);

  const activeFilters = [search, statusFilter, typeFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', page, search, statusFilter, typeFilter],
    queryFn: () => contractsAPI.getAll({
      page, limit,
      search: search || undefined,
      status: statusFilter || undefined,
      type:   typeFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: cData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersAPI.getAll({ limit: 200 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
  const { data: pData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => propertiesAPI.getAll({ limit: 100 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
  const { data: uData } = useQuery({
    queryKey: ['units-list', form.propertyId],
    queryFn: () => unitsAPI.getAll({ propertyId: form.propertyId, limit: 200, status: 'available' }).then(r => r.data),
    enabled: !!form.propertyId,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? contractsAPI.update(editing._id, d) : contractsAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['contracts']);
      toast.success(editing ? 'تم التحديث' : 'تم إنشاء العقد');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: contractsAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['contracts']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({
      ...defaultForm, ...row,
      customerId:  row.customerId?._id  || row.customerId,
      unitId:      row.unitId?._id      || row.unitId,
      propertyId:  row.propertyId?._id  || row.propertyId,
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const contracts = data?.data || [];
  const total     = data?.pagination?.total || 0;
  const active    = useMemo(() => contracts.filter(c => c.status === 'active').length, [contracts]);
  const cancelled = useMemo(() => contracts.filter(c => c.status === 'cancelled').length, [contracts]);
  const completed = useMemo(() => contracts.filter(c => c.status === 'completed').length, [contracts]);

  const columns = [
    {
      header: 'رقم العقد',
      render: (r) => (
        <span className="font-mono text-xs font-black" style={{ color: 'var(--color-primary)' }}>
          {r.contractNumber}
        </span>
      ),
    },
    {
      header: 'العميل',
      render: (r) => <span className="font-medium text-sm">{r.customerId?.name || '—'}</span>,
    },
    {
      header: 'المشروع / الوحدة',
      render: (r) => (
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-dark)' }}>{r.propertyId?.name}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>وحدة: {r.unitId?.unitNumber}</p>
        </div>
      ),
    },
    {
      header: 'النوع',
      render: (r) => (
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
          style={{
            background: r.type === 'sale' ? '#dbeafe' : '#fef3c7',
            color:      r.type === 'sale' ? '#1d4ed8' : '#d97706',
          }}>
          {r.type === 'sale' ? 'بيع' : 'إيجار'}
        </span>
      ),
    },
    {
      header: 'القيمة / المتبقي',
      render: (r) => {
        const pct = r.totalPrice ? ((r.downPayment || 0) / r.totalPrice) * 100 : 0;
        return (
          <div className="min-w-[110px] space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>{fmt(r.totalPrice)}</span>
              <span style={{ color: '#dc2626' }}>{fmt(r.remainingAmount)}</span>
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
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="التفاصيل" onClick={() => setViewContract(r)}>
            <FaEye style={{ color: '#2563eb' }} />
          </Button>
          <Button variant="ghost" size="icon" title="PDF" onClick={() => exportContractPDF(r, company)}>
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
        title="إدارة العقود"
        subtitle={`${total.toLocaleString('en-US')} عقد مسجل`}
        icon={FaFileContract}
        actions={<Button onClick={openCreate}><FaPlus className="text-xs" /> إضافة عقد</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي العقود" value={total} icon={FaFileContract} color="#c8161d" delay={0} />
        <KpiCard title="عقود نشطة" value={active} icon={FaCircleCheck} color="#059669" delay={0.06}
          active={statusFilter === 'active'} onClick={() => setStatusFilter(p => p === 'active' ? '' : 'active')} />
        <KpiCard title="منتهية" value={completed} icon={FaHourglassHalf} color="#2563eb" delay={0.12}
          active={statusFilter === 'completed'} onClick={() => setStatusFilter(p => p === 'completed' ? '' : 'completed')} />
        <KpiCard title="ملغية" value={cancelled} icon={FaCircleXmark} color="#dc2626" delay={0.18}
          active={statusFilter === 'cancelled'} onClick={() => setStatusFilter(p => p === 'cancelled' ? '' : 'cancelled')} />
      </div>

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث برقم العقد أو العميل..." className="flex-1 min-w-[200px]" />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'draft',      label: 'مسودة' },
            { value: 'active',     label: 'نشط' },
            { value: 'completed',  label: 'منتهي' },
            { value: 'cancelled',  label: 'ملغي' },
            { value: 'terminated', label: 'مُنهى' },
          ]}
          placeholder="الحالة"
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[{ value: 'sale', label: 'بيع' }, { value: 'rent', label: 'إيجار' }]}
          placeholder="النوع"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={contracts}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل العقد' : 'إضافة عقد جديد'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select label="العميل *" value={form.customerId} onChange={e => set('customerId', e.target.value)}
            options={(cData?.data || []).map(c => ({ value: c._id, label: `${c.name} - ${c.phone}` }))}
            placeholder="اختر العميل" className="col-span-2" />
          <Select label="المشروع" value={form.propertyId} onChange={e => { set('propertyId', e.target.value); set('unitId', ''); }}
            options={(pData?.data || []).map(p => ({ value: p._id, label: p.name }))}
            placeholder="اختر المشروع" />
          <Select label="الوحدة" value={form.unitId} onChange={e => set('unitId', e.target.value)}
            options={(uData?.data || []).map(u => ({ value: u._id, label: `${u.unitNumber} - ${u.area}م²` }))}
            placeholder="اختر الوحدة" disabled={!form.propertyId} />
          <Select label="نوع العقد" value={form.type} onChange={e => set('type', e.target.value)}
            options={[{ value: 'sale', label: 'بيع' }, { value: 'rent', label: 'إيجار' }]} />
          <Input label="تاريخ البداية" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          <Input label="القيمة الإجمالية (ج.م) *" type="number" value={form.totalPrice} onChange={e => set('totalPrice', Number(e.target.value))} />
          <Input label="المقدم (ج.م)" type="number" value={form.downPayment} onChange={e => set('downPayment', Number(e.target.value))} />
          <Input label="عدد الأقساط" type="number" value={form.installmentCount} onChange={e => set('installmentCount', Number(e.target.value))} />
          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />

      {/* Contract Detail Modal */}
      <Modal open={!!viewContract} onClose={() => setViewContract(null)}
        title={`تفاصيل العقد: ${viewContract?.contractNumber}`} size="xl"
        footer={<>
          <Button variant="outline" onClick={() => setViewContract(null)}>إغلاق</Button>
          <Button onClick={() => exportContractPDF(viewContract, company)}>
            <FaFilePdf className="text-xs" /> تصدير PDF
          </Button>
        </>}
      >
        {viewContract && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 space-y-2"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs font-bold uppercase opacity-50 mb-2">بيانات العميل</p>
                <p className="text-sm"><span className="opacity-60">الاسم: </span><strong>{viewContract.customerId?.name}</strong></p>
                <p className="text-sm"><span className="opacity-60">الهاتف: </span>{viewContract.customerId?.phone}</p>
              </div>
              <div className="rounded-xl p-4 space-y-2"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs font-bold uppercase opacity-50 mb-2">بيانات الوحدة</p>
                <p className="text-sm"><span className="opacity-60">المشروع: </span><strong>{viewContract.propertyId?.name}</strong></p>
                <p className="text-sm"><span className="opacity-60">الوحدة: </span>{viewContract.unitId?.unitNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'القيمة الإجمالية', value: `${fmt(viewContract.totalPrice)} ج.م`, color: '#059669' },
                { label: 'المقدم المدفوع',   value: `${fmt(viewContract.downPayment)} ج.م`,  color: '#2563eb' },
                { label: 'المتبقي',          value: `${fmt(viewContract.remainingAmount)} ج.م`, color: '#dc2626' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center"
                  style={{ border: '1px solid var(--color-border)' }}>
                  <p className="text-xs opacity-50 mb-1">{item.label}</p>
                  <p className="font-bold text-sm" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            {viewContract.installments?.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-2">جدول الأقساط ({viewContract.installments.length} قسط)</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <table className="w-full text-sm">
                    <thead style={{ background: 'var(--color-surface)' }}>
                      <tr>
                        {['#', 'تاريخ الاستحقاق', 'المبلغ', 'الحالة'].map(h => (
                          <th key={h} className="px-3 py-2 text-right text-xs font-semibold opacity-60">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {viewContract.installments.map((inst, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                          <td className="px-3 py-2 text-center text-xs opacity-50">{i + 1}</td>
                          <td className="px-3 py-2">{new Date(inst.dueDate).toLocaleDateString('ar-EG-u-nu-latn')}</td>
                          <td className="px-3 py-2 font-medium">{fmt(inst.amount)} ج.م</td>
                          <td className="px-3 py-2"><StatusBadge status={inst.status === 'pending' ? 'pending' : inst.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
