import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaEye, FaUsers, FaUserCheck,
  FaBan, FaUserClock, FaGlobe, FaShareNodes,
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
import { Avatar } from '../../components/ui/Avatar';
import { usePagination } from '../../hooks/usePagination';

const SOURCE_LABELS = {
  walk_in: 'زيارة مباشرة', referral: 'إحالة', online: 'إنترنت',
  social_media: 'سوشيال ميديا', other: 'أخرى',
};
const SOURCE_COLORS = {
  walk_in: '#059669', referral: '#7c3aed', online: '#2563eb',
  social_media: '#be185d', other: '#6b7280',
};

const defaultForm = {
  name: '', phone: '', email: '', nationalId: '', type: 'individual',
  nationality: 'مصري', source: 'walk_in', status: 'active', address: '', notes: '',
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const activeFilters = [search, statusFilter, sourceFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, statusFilter, sourceFilter],
    queryFn: () => customersAPI.getAll({
      page, limit,
      search: search || undefined,
      status: statusFilter || undefined,
      source: sourceFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? customersAPI.update(editing._id, d) : customersAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['customers']);
      toast.success(editing ? 'تم التحديث' : 'تم إنشاء العميل');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: customersAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['customers']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const customers = data?.data || [];
  const total     = data?.pagination?.total || 0;
  const active    = customers.filter(c => c.status === 'active').length;
  const blacklist = customers.filter(c => c.status === 'blacklisted').length;

  const columns = [
    {
      header: 'العميل',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size={38} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-dark)' }}>{r.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'البريد الإلكتروني',
      render: (r) => (
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.email || '—'}</span>
      ),
    },
    {
      header: 'المصدر',
      render: (r) => {
        const color = SOURCE_COLORS[r.source] || '#6b7280';
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold"
            style={{ background: color + '18', color }}>
            {SOURCE_LABELS[r.source] || r.source}
          </span>
        );
      },
    },
    {
      header: 'الرصيد',
      render: (r) => (
        <span className="font-bold text-sm" style={{ color: '#059669' }}>
          {(r.totalBalance || 0).toLocaleString('en-US')}
          <span className="text-xs font-normal opacity-60"> ج.م</span>
        </span>
      ),
    },
    {
      header: 'الحالة',
      render: (r) => (
        <StatusBadge
          status={r.status === 'blacklisted' ? 'inactive' : r.status === 'active' ? 'active' : 'inactive'}
          label={r.status === 'active' ? 'نشط' : r.status === 'blacklisted' ? 'محظور' : 'غير نشط'}
        />
      ),
    },
    {
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="ملف العميل" onClick={() => navigate(`/customers/${r._id}`)}>
            <FaEye style={{ color: '#2563eb' }} />
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
        title="إدارة العملاء"
        subtitle={`${total.toLocaleString('en-US')} عميل مسجل`}
        icon={FaUsers}
        actions={<Button onClick={openCreate}><FaPlus className="text-xs" /> إضافة عميل</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي العملاء" value={total} icon={FaUsers} color="#c8161d" delay={0} />
        <KpiCard title="عملاء نشطون" value={active} icon={FaUserCheck} color="#059669" delay={0.06}
          active={statusFilter === 'active'} onClick={() => setStatusFilter(p => p === 'active' ? '' : 'active')} />
        <KpiCard title="غير نشطين" value={customers.filter(c => c.status === 'inactive').length} icon={FaUserClock} color="#d97706" delay={0.12}
          active={statusFilter === 'inactive'} onClick={() => setStatusFilter(p => p === 'inactive' ? '' : 'inactive')} />
        <KpiCard title="محظورون" value={blacklist} icon={FaBan} color="#dc2626" delay={0.18}
          active={statusFilter === 'blacklisted'} onClick={() => setStatusFilter(p => p === 'blacklisted' ? '' : 'blacklisted')} />
      </div>

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو الهاتف..." className="flex-1 min-w-[200px]" />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'active',      label: 'نشط' },
            { value: 'inactive',    label: 'غير نشط' },
            { value: 'blacklisted', label: 'محظور' },
          ]}
          placeholder="الحالة"
        />
        <FilterSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          options={Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          placeholder="المصدر"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل العميل' : 'إضافة عميل جديد'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الكامل *" value={form.name} onChange={e => set('name', e.target.value)} className="col-span-2" />
          <Input label="رقم الهاتف *" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="رقم الهوية الوطنية" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
          <Input label="الجنسية" value={form.nationality} onChange={e => set('nationality', e.target.value)} />
          <Select label="نوع العميل" value={form.type} onChange={e => set('type', e.target.value)}
            options={[{ value: 'individual', label: 'فرد' }, { value: 'company', label: 'شركة' }]} />
          <Select label="مصدر العميل" value={form.source} onChange={e => set('source', e.target.value)}
            options={Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <Input label="العنوان" value={form.address} onChange={e => set('address', e.target.value)} className="col-span-2" />
          <Textarea label="ملاحظات" value={form.notes} onChange={e => set('notes', e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
}
