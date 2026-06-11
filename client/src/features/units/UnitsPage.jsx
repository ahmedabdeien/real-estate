import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaPlus, FaPen, FaTrash, FaDoorOpen, FaDoorClosed,
  FaLayerGroup, FaTableCells, FaList, FaBed, FaBath,
  FaRulerCombined, FaBuilding, FaMagnifyingGlass,
} from 'react-icons/fa6';
import { unitsAPI, propertiesAPI } from '../../api/services';
import { setView } from '../../store/viewSlice';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KpiCard } from '../../components/ui/KpiCard';
import { FilterBar, SearchInput, FilterSelect, ViewToggle } from '../../components/ui/FilterBar';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { usePagination } from '../../hooks/usePagination';

const STATUS_LABELS = { available: 'متاحة', reserved: 'محجوزة', sold: 'مباعة', rented: 'مؤجرة', maintenance: 'صيانة' };
const STATUS_COLORS  = { available: '#059669', reserved: '#2563eb', sold: '#6b7280', rented: '#7c3aed', maintenance: '#f59e0b' };
const TYPE_LABELS   = { apartment: 'شقة', studio: 'استوديو', villa: 'فيلا', duplex: 'دوبلكس', penthouse: 'بنتهاوس', shop: 'محل', office: 'مكتب', warehouse: 'مخزن', land: 'أرض' };
const FINISH_LABELS = { raw: 'خام', semi_finished: 'نص تشطيب', fully_finished: 'تشطيب كامل', super_lux: 'سوبر لوكس' };

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG');
const defaultForm = { unitNumber: '', propertyId: '', type: 'apartment', floor: '', rooms: '', bathrooms: '', area: '', price: '', finishingType: 'raw', status: 'available', description: '' };

function UnitCard({ unit, onEdit, onDelete }) {
  const statusColor = STATUS_COLORS[unit.status] || '#6b7280';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border overflow-hidden group hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Color header */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${statusColor}, ${statusColor}44)` }} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black" style={{ color: 'var(--color-text-dark)' }}>
                {unit.unitNumber}
              </span>
              <StatusBadge status={unit.status} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {unit.propertyId?.name} · الدور {unit.floor || '—'}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(unit)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50">
              <FaPen className="text-xs text-blue-500" />
            </button>
            <button onClick={() => onDelete(unit._id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50">
              <FaTrash className="text-xs text-red-500" />
            </button>
          </div>
        </div>

        {/* Type chip */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
          {TYPE_LABELS[unit.type] || unit.type}
        </span>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <FaRulerCombined className="text-[9px]" />
            </div>
            <p className="text-xs font-black" style={{ color: 'var(--color-text-dark)' }}>{unit.area || '—'} م²</p>
          </div>
          <div className="text-center border-x" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-center gap-1 text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <FaBed className="text-[9px]" />
            </div>
            <p className="text-xs font-black" style={{ color: 'var(--color-text-dark)' }}>{unit.rooms || '—'}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <FaBath className="text-[9px]" />
            </div>
            <p className="text-xs font-black" style={{ color: 'var(--color-text-dark)' }}>{unit.bathrooms || '—'}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>السعر</span>
          <span className="text-base font-black" style={{ color: 'var(--color-primary)' }}>
            {fmt(unit.price)} <span className="text-xs font-normal">ج.م</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function UnitsPage() {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const view = useSelector(s => s.view.units);

  const { page, setPage, limit } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const activeFilters = [statusFilter, typeFilter, propertyFilter].filter(Boolean).length;

  const { data, isLoading } = useQuery({
    queryKey: ['units', page, search, statusFilter, typeFilter, propertyFilter],
    queryFn: () => unitsAPI.getAll({
      page, limit,
      search: search || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      propertyId: propertyFilter || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => propertiesAPI.getAll({ limit: 100 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? unitsAPI.update(editing._id, d) : unitsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['units']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء الوحدة'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: unitsAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['units']); toast.success('تم حذف الوحدة'); setDelId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit   = (row) => { setEditing(row); setForm({ ...defaultForm, ...row, propertyId: row.propertyId?._id || row.propertyId }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const setF = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setPropertyFilter(''); };

  const units = data?.data || [];
  const total = data?.pagination?.total || 0;

  const statusCounts = useMemo(() => units.reduce((acc, u) => { acc[u.status] = (acc[u.status] || 0) + 1; return acc; }, {}), [units]);

  const propertyOptions = (propertiesData?.data || []).map(p => ({ value: p._id, label: p.name }));

  const columns = [
    { header: 'الوحدة', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ background: STATUS_COLORS[r.status] || '#7c3aed' }}>
          {r.floor || '؟'}
        </div>
        <div>
          <p className="font-bold">{r.unitNumber}</p>
          <p className="text-xs opacity-60">{r.propertyId?.name} · {TYPE_LABELS[r.type] || r.type}</p>
        </div>
      </div>
    )},
    { header: 'المساحة', render: (r) => `${r.area || '—'} م²` },
    { header: 'السعر', render: (r) => <span className="font-semibold">{fmt(r.price)} ج.م</span> },
    { header: 'الغرف', render: (r) => r.rooms ? <span className="flex items-center gap-1"><FaBed className="text-xs opacity-50" />{r.rooms}</span> : '—' },
    { header: 'التشطيب', render: (r) => FINISH_LABELS[r.finishingType] || r.finishingType },
    { header: 'الحالة', render: (r) => <StatusBadge status={r.status} /> },
    { header: '', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setDelId(r._id)}><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <PageHeader
        title="إدارة الوحدات"
        subtitle={`${total.toLocaleString('ar-EG')} وحدة عقارية`}
        icon={FaLayerGroup}
        actions={
          <Button onClick={openCreate}>
            <FaPlus className="text-xs" /> إضافة وحدة
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: 'available', label: 'متاحة',    color: '#059669' },
          { key: 'reserved',  label: 'محجوزة',   color: '#2563eb' },
          { key: 'sold',      label: 'مباعة',     color: '#6b7280' },
          { key: 'rented',    label: 'مؤجرة',     color: '#7c3aed' },
        ].map((s, i) => (
          <KpiCard
            key={s.key}
            title={s.label}
            value={statusCounts[s.key] || 0}
            color={s.color}
            delay={i * 0.06}
            active={statusFilter === s.key}
            onClick={() => setStatusFilter(p => p === s.key ? '' : s.key)}
          />
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        activeCount={activeFilters}
        onClear={clearFilters}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث برقم الوحدة..."
          className="flex-1 min-w-[180px]"
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          placeholder="الحالة"
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          placeholder="النوع"
        />
        <FilterSelect
          value={propertyFilter}
          onChange={setPropertyFilter}
          options={propertyOptions}
          placeholder="المشروع"
        />
        <ViewToggle
          view={view}
          onChange={v => dispatch(setView({ page: 'units', view: v }))}
          options={[
            { value: 'grid', icon: FaTableCells, label: 'شبكة' },
            { value: 'table', icon: FaList, label: 'جدول' },
          ]}
        />
      </FilterBar>

      {/* Content */}
      {isLoading ? (
        view === 'grid'
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          : <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="h-64 animate-pulse rounded-xl" style={{ background: 'var(--color-border)' }} />
            </div>
      ) : view === 'grid' ? (
        <AnimatePresence mode="popLayout">
          {units.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <FaBuilding className="text-4xl mx-auto mb-3 opacity-20" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>لا توجد وحدات</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {units.map(u => (
                <UnitCard key={u._id} unit={u} onEdit={openEdit} onDelete={setDelId} />
              ))}
            </div>
          )}
        </AnimatePresence>
      ) : (
        <DataTable
          columns={columns}
          data={units}
          loading={false}
          total={total}
          page={page}
          pages={data?.pagination?.pages || 1}
          limit={limit}
          onPageChange={setPage}
        />
      )}

      {/* Pagination for grid */}
      {view === 'grid' && (data?.pagination?.pages || 1) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            الصفحة {page} من {data?.pagination?.pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
            <Button size="sm" disabled={page >= data?.pagination?.pages} onClick={() => setPage(p => p + 1)}>التالي</Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select label="المشروع *" value={form.propertyId}
            onChange={e => setF('propertyId')(e.target.value)}
            options={propertyOptions} placeholder="اختر المشروع" className="col-span-2" />
          <Input label="رقم الوحدة *" value={form.unitNumber}
            onChange={e => setF('unitNumber')(e.target.value)} />
          <Select label="النوع" value={form.type}
            onChange={e => setF('type')(e.target.value)}
            options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <Input label="الدور" type="number" value={form.floor}
            onChange={e => setF('floor')(e.target.value)} />
          <Input label="المساحة (م²) *" type="number" value={form.area}
            onChange={e => setF('area')(e.target.value)} />
          <Input label="السعر (ج.م) *" type="number" value={form.price}
            onChange={e => setF('price')(e.target.value)} />
          <Input label="عدد الغرف" type="number" value={form.rooms}
            onChange={e => setF('rooms')(e.target.value)} />
          <Input label="دورات المياه" type="number" value={form.bathrooms}
            onChange={e => setF('bathrooms')(e.target.value)} />
          <Select label="التشطيب" value={form.finishingType}
            onChange={e => setF('finishingType')(e.target.value)}
            options={Object.entries(FINISH_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <Select label="الحالة" value={form.status}
            onChange={e => setF('status')(e.target.value)}
            options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <Textarea label="الوصف" value={form.description}
            onChange={e => setF('description')(e.target.value)} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
}
