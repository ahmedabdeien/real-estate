import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesAPI, unitsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaArrowRight, FaBuilding, FaPlus, FaPen, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const UNIT_STATUS = {
  available:  { label: 'متاحة',    color: '#16a34a', bg: '#dcfce7' },
  reserved:   { label: 'محجوزة',   color: '#d97706', bg: '#fef3c7' },
  sold:       { label: 'مباعة',    color: '#dc2626', bg: '#fee2e2' },
  rented:     { label: 'مؤجرة',    color: '#2563eb', bg: '#dbeafe' },
  maintenance:{ label: 'صيانة',    color: '#7c3aed', bg: '#ede9fe' },
};

const defaultUnit = { unitNumber: '', floor: '', area: '', type: 'apartment', bedrooms: 2, bathrooms: 1, price: '', status: 'available', notes: '' };

const UnitCard = ({ unit, onEdit }) => {
  const s = UNIT_STATUS[unit.status] || UNIT_STATUS.available;
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{ border: '1px solid var(--color-border)', background: '#fff' }}
      onClick={() => onEdit(unit)}
    >
      <div className="h-2" style={{ backgroundColor: s.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-base">وحدة {unit.unitNumber}</p>
            <p className="text-xs opacity-50">الدور {unit.floor || '—'}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
            {s.label}
          </span>
        </div>
        <div className="flex gap-3 text-xs opacity-60 mb-3">
          {unit.area && <span className="flex items-center gap-1"><FaRulerCombined />{unit.area} م²</span>}
          {unit.bedrooms && <span className="flex items-center gap-1"><FaBed />{unit.bedrooms}</span>}
          {unit.bathrooms && <span className="flex items-center gap-1"><FaBath />{unit.bathrooms}</span>}
        </div>
        {unit.price > 0 && (
          <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            {unit.price.toLocaleString('ar-EG')} ج.م
          </p>
        )}
      </div>
    </div>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultUnit);
  const [filter, setFilter] = useState('all');

  const { data: propData, isLoading: propLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesAPI.getOne(id).then(r => r.data.data),
  });

  const { data: unitsData, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', id],
    queryFn: () => unitsAPI.getAll({ propertyId: id, limit: 200 }).then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? unitsAPI.update(editing._id, d) : unitsAPI.create({ ...d, propertyId: id }),
    onSuccess: () => { qc.invalidateQueries(['units', id]); toast.success(editing ? 'تم التحديث' : 'تمت الإضافة'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultUnit); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ ...defaultUnit, ...u }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const units = unitsData?.data || [];
  const filtered = filter === 'all' ? units : units.filter(u => u.status === filter);

  const stats = Object.entries(UNIT_STATUS).map(([key, val]) => ({
    key, ...val,
    count: units.filter(u => u.status === key).length,
  }));

  if (propLoading) return <LoadingSpinner />;

  const prop = propData || {};

  return (
    <div>
      <PageHeader
        title={prop.name || 'تفاصيل المشروع'}
        subtitle={`${prop.location || ''} • ${units.length} وحدة`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/properties')}>
              <FaArrowRight /> رجوع
            </Button>
            <Button onClick={openCreate}><FaPlus /> إضافة وحدة</Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className="rounded-xl p-4 text-center transition-all"
          style={{
            border: filter === 'all' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: '#fff',
          }}
        >
          <p className="text-2xl font-black">{units.length}</p>
          <p className="text-xs opacity-60 mt-1">الكل</p>
        </button>
        {stats.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className="rounded-xl p-4 text-center transition-all"
            style={{
              border: filter === s.key ? `2px solid ${s.color}` : '1px solid var(--color-border)',
              background: filter === s.key ? s.bg : '#fff',
            }}
          >
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-1" style={{ color: s.color, opacity: 0.8 }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Units grid */}
      {unitsLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FaBuilding className="text-4xl mx-auto mb-3 opacity-20" />
          <p className="opacity-50">لا توجد وحدات</p>
          <Button className="mt-4" onClick={openCreate}><FaPlus /> إضافة وحدة</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(unit => (
            <UnitCard key={unit._id} unit={unit} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Unit Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? `تعديل وحدة ${editing.unitNumber}` : 'إضافة وحدة جديدة'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="رقم الوحدة" value={form.unitNumber} onChange={e => set('unitNumber', e.target.value)} required />
          <Input label="الدور" value={form.floor} onChange={e => set('floor', e.target.value)} />
          <Input label="المساحة (م²)" type="number" value={form.area} onChange={e => set('area', Number(e.target.value))} />
          <Select label="النوع" value={form.type} onChange={e => set('type', e.target.value)}
            options={[
              { value: 'apartment', label: 'شقة' },
              { value: 'villa', label: 'فيلا' },
              { value: 'office', label: 'مكتب' },
              { value: 'shop', label: 'محل تجاري' },
              { value: 'duplex', label: 'دوبلكس' },
              { value: 'penthouse', label: 'بنتهاوس' },
            ]}
          />
          <Input label="عدد غرف النوم" type="number" value={form.bedrooms} onChange={e => set('bedrooms', Number(e.target.value))} />
          <Input label="عدد الحمامات" type="number" value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} />
          <Input label="السعر" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} />
          <Select label="الحالة" value={form.status} onChange={e => set('status', e.target.value)}
            options={Object.entries(UNIT_STATUS).map(([v, { label }]) => ({ value: v, label }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetailPage;
