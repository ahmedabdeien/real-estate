import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsAPI, customersAPI, propertiesAPI, unitsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { FaPlus, FaPen, FaTrash, FaFilePdf, FaEye, FaFileContract, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { exportContractPDF } from '../../utils/pdfExport';
import { usePagination } from '../../hooks/usePagination';

const STATUS = { draft: { l: 'مسودة', c: 'default' }, active: { l: 'نشط', c: 'success' }, completed: { l: 'منتهي', c: 'info' }, cancelled: { l: 'ملغي', c: 'danger' }, terminated: { l: 'مُنهى', c: 'warning' } };

const defaultForm = { customerId: '', unitId: '', propertyId: '', type: 'sale', totalPrice: '', downPayment: '', installmentCount: 1, startDate: '', notes: '' };

const ContractsPage = () => {
  const company = useSelector(s => s.auth.company);
  const qc = useQueryClient();
  const { page, setPage, dSearch, handleSearch, limit } = usePagination();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);
  const [viewContract, setViewContract] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', page, dSearch],
    queryFn: () => contractsAPI.getAll({ page, limit, search: dSearch }).then(r => r.data),
  });

  const { data: cData } = useQuery({ queryKey: ['customers-list'], queryFn: () => customersAPI.getAll({ limit: 200 }).then(r => r.data) });
  const { data: pData } = useQuery({ queryKey: ['properties-list'], queryFn: () => propertiesAPI.getAll({ limit: 100 }).then(r => r.data) });
  const { data: uData } = useQuery({
    queryKey: ['units-list', form.propertyId],
    queryFn: () => unitsAPI.getAll({ propertyId: form.propertyId, limit: 200, status: 'available' }).then(r => r.data),
    enabled: !!form.propertyId,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? contractsAPI.update(editing._id, d) : contractsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['contracts']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء العقد'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: contractsAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['contracts']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row, customerId: row.customerId?._id || row.customerId, unitId: row.unitId?._id || row.unitId, propertyId: row.propertyId?._id || row.propertyId }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { header: 'رقم العقد', render: (r) => <span className="font-mono text-xs font-semibold">{r.contractNumber}</span> },
    { header: 'العميل', render: (r) => r.customerId?.name },
    { header: 'المشروع / الوحدة', render: (r) => (
      <div>
        <p className="text-sm">{r.propertyId?.name}</p>
        <p className="text-xs opacity-60">وحدة: {r.unitId?.unitNumber}</p>
      </div>
    )},
    { header: 'النوع', render: (r) => <Badge color="info">{r.type === 'sale' ? 'بيع' : 'إيجار'}</Badge> },
    { header: 'القيمة', render: (r) => <span className="font-semibold">{r.totalPrice?.toLocaleString('ar-EG')} ج.م</span> },
    { header: 'الحالة', render: (r) => { const s = STATUS[r.status] || { l: r.status, c: 'default' }; return <Badge color={s.c}>{s.l}</Badge>; } },
    { header: 'الإجراءات', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" title="عرض التفاصيل" onClick={() => setViewContract(r)}><FaEye className="text-blue-600" /></Button>
        <Button variant="ghost" size="icon" title="تصدير PDF" onClick={() => exportContractPDF(r, company)}><FaFilePdf className="text-red-600" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="إدارة العقود" subtitle="جميع عقود البيع والإيجار"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة عقد</Button>}
        stats={[
          { label: 'الإجمالي', value: data?.pagination?.total ?? '—', icon: FaFileContract, color: '#da1f27' },
          { label: 'نشطة', value: (data?.data || []).filter(c => c.status === 'active').length, icon: FaCircleCheck, color: '#009756' },
          { label: 'ملغية', value: (data?.data || []).filter(c => c.status === 'cancelled').length, icon: FaCircleXmark, color: '#b91c1c' },
        ]}
      />

      <DataTable columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page} pages={data?.pagination?.pages || 1} limit={limit}
        onPageChange={setPage} onSearch={handleSearch} searchPlaceholder="بحث برقم العقد..." />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل العقد' : 'إضافة عقد جديد'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select label="العميل" value={form.customerId} onChange={e => set('customerId', e.target.value)}
            options={(cData?.data || []).map(c => ({ value: c._id, label: `${c.name} - ${c.phone}` }))}
            placeholder="اختر العميل" className="col-span-2" />
          <Select label="المشروع" value={form.propertyId} onChange={e => { set('propertyId', e.target.value); set('unitId', ''); }}
            options={(pData?.data || []).map(p => ({ value: p._id, label: p.name }))} placeholder="اختر المشروع" />
          <Select label="الوحدة" value={form.unitId} onChange={e => set('unitId', e.target.value)}
            options={(uData?.data || []).map(u => ({ value: u._id, label: `${u.unitNumber} - ${u.area}م²` }))}
            placeholder="اختر الوحدة" disabled={!form.propertyId} />
          <Select label="نوع العقد" value={form.type} onChange={e => set('type', e.target.value)}
            options={[{ value: 'sale', label: 'بيع' }, { value: 'rent', label: 'إيجار' }]} />
          <Input label="تاريخ البداية" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          <Input label="القيمة الإجمالية" type="number" value={form.totalPrice} onChange={e => set('totalPrice', Number(e.target.value))} required />
          <Input label="المقدم" type="number" value={form.downPayment} onChange={e => set('downPayment', Number(e.target.value))} />
          <Input label="عدد الأقساط" type="number" value={form.installmentCount} onChange={e => set('installmentCount', Number(e.target.value))} />
          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />

      {/* Contract Detail Modal */}
      <Modal open={!!viewContract} onClose={() => setViewContract(null)} title={`تفاصيل العقد: ${viewContract?.contractNumber}`} size="xl"
        footer={<>
          <Button variant="outline" onClick={() => setViewContract(null)}>إغلاق</Button>
          <Button onClick={() => exportContractPDF(viewContract, company)}><FaFilePdf /> تصدير PDF</Button>
        </>}
      >
        {viewContract && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs font-bold uppercase opacity-50 mb-2">بيانات العميل</p>
                <p className="text-sm"><span className="opacity-60">الاسم: </span><strong>{viewContract.customerId?.name}</strong></p>
                <p className="text-sm"><span className="opacity-60">الهاتف: </span>{viewContract.customerId?.phone}</p>
              </div>
              <div className="rounded-lg p-4 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs font-bold uppercase opacity-50 mb-2">بيانات الوحدة</p>
                <p className="text-sm"><span className="opacity-60">المشروع: </span><strong>{viewContract.propertyId?.name}</strong></p>
                <p className="text-sm"><span className="opacity-60">الوحدة: </span>{viewContract.unitId?.unitNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'القيمة الإجمالية', value: `${(viewContract.totalPrice || 0).toLocaleString('ar-EG')} ج.م`, color: '#1f6f38' },
                { label: 'المقدم المدفوع', value: `${(viewContract.downPayment || 0).toLocaleString('ar-EG')} ج.م`, color: '#1a56db' },
                { label: 'المتبقي', value: `${(viewContract.remainingAmount || 0).toLocaleString('ar-EG')} ج.م`, color: '#b91c1c' },
              ].map(item => (
                <div key={item.label} className="rounded-lg p-3 text-center" style={{ border: `1px solid var(--color-border)` }}>
                  <p className="text-xs opacity-50 mb-1">{item.label}</p>
                  <p className="font-bold text-sm" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            {viewContract.installments?.length > 0 && (
              <div>
                <p className="text-sm font-bold mb-2">جدول الأقساط ({viewContract.installments.length} قسط)</p>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
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
                          <td className="px-3 py-2">{new Date(inst.dueDate).toLocaleDateString('ar-EG')}</td>
                          <td className="px-3 py-2 font-medium">{(inst.amount || 0).toLocaleString('ar-EG')} ج.م</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              inst.status === 'paid'    ? 'bg-green-100 text-green-700' :
                              inst.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                          'bg-gray-100 text-gray-600'
                            }`}>
                              {inst.status === 'paid' ? 'مدفوع' : inst.status === 'overdue' ? 'متأخر' : 'قيد الانتظار'}
                            </span>
                          </td>
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
};

export default ContractsPage;
