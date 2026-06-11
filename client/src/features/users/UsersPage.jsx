import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, rolesAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { FaPlus, FaPen, FaTrash, FaUsers, FaUserCheck, FaUserXmark } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';

const defaultForm = { name: '', email: '', password: '', phone: '', role: '', status: 'active' };

const UsersPage = () => {
  const qc = useQueryClient();
  const { page, setPage, dSearch, handleSearch, limit } = usePagination();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, dSearch],
    queryFn: () => usersAPI.getAll({ page, limit, search: dSearch }).then(r => r.data),
  });

  const { data: rolesData } = useQuery({ queryKey: ['roles-list'], queryFn: () => rolesAPI.getAll().then(r => r.data) });

  const save = useMutation({
    mutationFn: (d) => editing ? usersAPI.update(editing._id, d) : usersAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء المستخدم'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: usersAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row, role: row.role?._id || row.role }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { header: 'المستخدم', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
            {r.name?.charAt(0)}
          </div>
          <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${r.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs opacity-60">{r.email}</p>
        </div>
      </div>
    )},
    { header: 'الدور', render: (r) => r.role?.label || '-' },
    { header: 'الهاتف', accessor: 'phone' },
    { header: 'الحالة', render: (r) => (
      <Badge color={r.status === 'active' ? 'success' : r.status === 'suspended' ? 'danger' : 'default'}>
        {r.status === 'active' ? 'نشط' : r.status === 'suspended' ? 'موقوف' : 'غير نشط'}
      </Badge>
    )},
    { header: 'آخر ظهور', render: (r) => (
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {r.isOnline ? <span className="text-green-600 font-medium">متصل الآن</span> : r.lastSeen ? new Date(r.lastSeen).toLocaleDateString('ar-EG') : '—'}
      </span>
    )},
    { header: 'الإجراءات', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="إدارة المستخدمين" subtitle="جميع مستخدمي النظام"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة مستخدم</Button>}
        stats={[
          { label: 'الإجمالي', value: data?.pagination?.total ?? '—', icon: FaUsers, color: '#da1f27' },
          { label: 'نشطون', value: (data?.data || []).filter(u => u.status === 'active').length, icon: FaUserCheck, color: '#009756' },
          { label: 'موقوفون', value: (data?.data || []).filter(u => u.status === 'suspended').length, icon: FaUserXmark, color: '#b91c1c' },
        ]}
      />

      <DataTable columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page} pages={data?.pagination?.pages || 1} limit={limit}
        onPageChange={setPage} onSearch={handleSearch} searchPlaceholder="بحث بالاسم أو البريد..." />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'} size="md"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="الاسم الكامل" value={form.name} onChange={e => set('name', e.target.value)} required />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          {!editing && <Input label="كلمة المرور" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />}
          <Input label="رقم الهاتف" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Select label="الدور" value={form.role} onChange={e => set('role', e.target.value)}
            options={(rolesData?.data || []).map(r => ({ value: r._id, label: r.label }))} placeholder="اختر الدور" />
          <Select label="الحالة" value={form.status} onChange={e => set('status', e.target.value)}
            options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }, { value: 'suspended', label: 'موقوف' }]} />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default UsersPage;
