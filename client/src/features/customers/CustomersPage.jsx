import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI, usersAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { FaPlus, FaPen, FaTrash, FaEye, FaUsers, FaUserCheck, FaBan } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';

const defaultForm = { name: '', phone: '', email: '', nationalId: '', type: 'individual', nationality: 'مصري', source: 'walk_in', status: 'active', address: '', notes: '' };

const CustomersPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, dSearch, handleSearch, limit } = usePagination();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, dSearch],
    queryFn: () => customersAPI.getAll({ page, limit, search: dSearch }).then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? customersAPI.update(editing._id, d) : customersAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['customers']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء العميل'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: customersAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['customers']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { header: 'العميل', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
          {r.name?.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs opacity-60">{r.phone}</p>
        </div>
      </div>
    )},
    { header: 'البريد الإلكتروني', accessor: 'email' },
    { header: 'الجنسية', accessor: 'nationality' },
    { header: 'المصدر', render: (r) => {
      const map = { walk_in: 'زيارة', referral: 'إحالة', online: 'إنترنت', social_media: 'سوشيال ميديا', other: 'أخرى' };
      return <Badge color="info">{map[r.source] || r.source}</Badge>;
    }},
    { header: 'الرصيد', render: (r) => (
      <span className="font-medium">{(r.totalBalance || 0).toLocaleString('ar-EG')} ج.م</span>
    )},
    { header: 'الحالة', render: (r) => (
      <Badge color={r.status === 'active' ? 'success' : r.status === 'blacklisted' ? 'danger' : 'default'}>
        {r.status === 'active' ? 'نشط' : r.status === 'blacklisted' ? 'محظور' : 'غير نشط'}
      </Badge>
    )},
    { header: 'الإجراءات', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" title="ملف العميل" onClick={() => navigate(`/customers/${r._id}`)}><FaEye className="text-blue-600" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="إدارة العملاء" subtitle="قائمة جميع العملاء المسجلين"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة عميل</Button>}
        stats={[
          { label: 'الإجمالي', value: data?.pagination?.total ?? '—', icon: FaUsers, color: '#da1f27' },
          { label: 'نشطون', value: (data?.data || []).filter(c => c.status === 'active').length, icon: FaUserCheck, color: '#009756' },
          { label: 'محظورون', value: (data?.data || []).filter(c => c.status === 'blacklisted').length, icon: FaBan, color: '#b91c1c' },
        ]}
      />

      <DataTable columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page} pages={data?.pagination?.pages || 1} limit={limit}
        onPageChange={setPage} onSearch={handleSearch} searchPlaceholder="بحث بالاسم أو الهاتف..." />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل العميل' : 'إضافة عميل جديد'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الكامل" value={form.name} onChange={e => set('name', e.target.value)} required className="col-span-2" />
          <Input label="رقم الهاتف" value={form.phone} onChange={e => set('phone', e.target.value)} required />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="رقم الهوية الوطنية" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
          <Input label="الجنسية" value={form.nationality} onChange={e => set('nationality', e.target.value)} />
          <Select label="نوع العميل" value={form.type} onChange={e => set('type', e.target.value)}
            options={[{ value: 'individual', label: 'فرد' }, { value: 'company', label: 'شركة' }]} />
          <Select label="مصدر العميل" value={form.source} onChange={e => set('source', e.target.value)}
            options={[
              { value: 'walk_in', label: 'زيارة مباشرة' },
              { value: 'referral', label: 'إحالة' },
              { value: 'online', label: 'إنترنت' },
              { value: 'social_media', label: 'سوشيال ميديا' },
              { value: 'other', label: 'أخرى' },
            ]} />
          <Input label="العنوان" value={form.address} onChange={e => set('address', e.target.value)} className="col-span-2" />
          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default CustomersPage;
