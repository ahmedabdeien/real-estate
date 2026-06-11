import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaBuilding, FaCircleCheck,
  FaHelmetSafety, FaLayerGroup, FaEye, FaHouseCircleCheck,
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
import { usePagination } from '../../hooks/usePagination';

const STATUS_MAP = {
  active:             { label: 'نشط',         sbKey: 'active' },
  inactive:           { label: 'غير نشط',     sbKey: 'inactive' },
  completed:          { label: 'مكتمل',        sbKey: 'completed' },
  under_construction: { label: 'قيد الإنشاء', sbKey: 'maintenance' },
};

const TYPE_MAP = {
  residential: 'سكني', commercial: 'تجاري', mixed: 'مختلط',
  land: 'أرض', villa: 'فيلا', compound: 'كمبوند',
};

const TYPE_COLORS = {
  residential: '#2563eb', commercial: '#7c3aed', mixed: '#0891b2',
  land: '#d97706', villa: '#be185d', compound: '#059669',
};

const defaultForm = {
  name: '', type: 'residential', status: 'active',
  location: { address: '', city: '', district: '' },
  description: '', developer: '',
};

export default function PropertiesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, limit } = usePagination();
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [modal, setModal]               = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(defaultForm);
  const [delId, setDelId]               = useState(null);

  const activeFilters = [search, statusFilter, typeFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['properties', page, search, statusFilter, typeFilter],
    queryFn: () => propertiesAPI.getAll({
      page, limit,
      search: search   || undefined,
      status: statusFilter || undefined,
      type:   typeFilter   || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? propertiesAPI.update(editing._id, d) : propertiesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['properties']); toast.success(editing ? 'تم التحديث' : 'تم الإنشاء'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: propertiesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['properties']); toast.success('تم الحذف'); setDelId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLoc = (k, v) => setForm(f => ({ ...f, location: { ...f.location, [k]: v } }));

  const properties   = data?.data || [];
  const total        = data?.pagination?.total || 0;
  const activeCount  = useMemo(() => properties.filter(p => p.status === 'active').length, [properties]);
  const underConstr  = useMemo(() => properties.filter(p => p.status === 'under_construction').length, [properties]);
  const completedCnt = useMemo(() => properties.filter(p => p.status === 'completed').length, [properties]);

  const columns = [
    {
      header: 'المشروع',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: (TYPE_COLORS[r.type] || '#c8161d') + '20', color: TYPE_COLORS[r.type] || '#c8161d' }}>
            <FaBuilding className="text-sm" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-dark)' }}>{r.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {TYPE_MAP[r.type]} · {r.location?.city || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'الوحدات',
      render: (r) => (
        <div className="text-sm">
          <span className="font-bold" style={{ color: 'var(--color-text-dark)' }}>{r.totalUnits || 0}</span>
          <span className="text-xs opacity-50"> إجمالي</span>
          {' · '}
          <span className="font-semibold" style={{ color: '#059669' }}>{r.availableUnits || 0}</span>
          <span className="text-xs opacity-50"> متاح</span>
        </div>
      ),
    },
    {
      header: 'المطور',
      render: (r) => <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.developer || '—'}</span>,
    },
    {
      header: 'الحالة',
      render: (r) => {
        const s = STATUS_MAP[r.status] || { sbKey: 'inactive' };
        return <StatusBadge status={s.sbKey} label={s.label} />;
      },
    },
    {
      header: '',
      render: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="الوحدات" onClick={() => navigate(`/properties/${r._id}`)}>
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
        title="المشاريع العقارية"
        subtitle={`${total.toLocaleString('en-US')} مشروع عقاري`}
        icon={FaLayerGroup}
        actions={<Button onClick={openCreate}><FaPlus className="text-xs" /> إضافة مشروع</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي المشاريع" value={total} icon={FaLayerGroup} color="#c8161d" delay={0} />
        <KpiCard title="نشطة" value={activeCount} icon={FaCircleCheck} color="#059669" delay={0.06}
          active={statusFilter === 'active'} onClick={() => setStatusFilter(p => p === 'active' ? '' : 'active')} />
        <KpiCard title="قيد الإنشاء" value={underConstr} icon={FaHelmetSafety} color="#d97706" delay={0.12}
          active={statusFilter === 'under_construction'} onClick={() => setStatusFilter(p => p === 'under_construction' ? '' : 'under_construction')} />
        <KpiCard title="مكتملة" value={completedCnt} icon={FaHouseCircleCheck} color="#2563eb" delay={0.18}
          active={statusFilter === 'completed'} onClick={() => setStatusFilter(p => p === 'completed' ? '' : 'completed')} />
      </div>

      {/* Filters */}
      <FilterBar activeCount={activeFilters} onClear={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث في المشاريع..." className="flex-1 min-w-[200px]" />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(STATUS_MAP).map(([v, s]) => ({ value: v, label: s.label }))}
          placeholder="الحالة"
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(TYPE_MAP).map(([v, l]) => ({ value: v, label: l }))}
          placeholder="النوع"
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={properties}
        loading={isLoading}
        total={total}
        page={page}
        pages={data?.pagination?.pages || 1}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Modal */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل المشروع' : 'إضافة مشروع جديد'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم المشروع *" value={form.name} onChange={e => set('name', e.target.value)} className="col-span-2" />
          <Select label="النوع" value={form.type} onChange={e => set('type', e.target.value)}
            options={Object.entries(TYPE_MAP).map(([v, l]) => ({ value: v, label: l }))} />
          <Select label="الحالة" value={form.status} onChange={e => set('status', e.target.value)}
            options={Object.entries(STATUS_MAP).map(([v, s]) => ({ value: v, label: s.label }))} />
          <Input label="المدينة" value={form.location?.city || ''} onChange={e => setLoc('city', e.target.value)} />
          <Input label="الحي / المنطقة" value={form.location?.district || ''} onChange={e => setLoc('district', e.target.value)} />
          <Input label="العنوان الكامل" value={form.location?.address || ''} onChange={e => setLoc('address', e.target.value)} className="col-span-2" />
          <Input label="المطور" value={form.developer || ''} onChange={e => set('developer', e.target.value)} />
          <Textarea label="الوصف" value={form.description || ''} onChange={e => set('description', e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending}
        message="هل تريد حذف هذا المشروع؟ سيتم حذف جميع البيانات المرتبطة به."
      />
    </div>
  );
}
