import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { FaPlus, FaPen, FaTrash, FaBuilding, FaCircleCheck, FaHelmetSafety, FaLayerGroup } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

const STATUS_MAP = {
  active: { label: 'نشط', color: 'success' },
  inactive: { label: 'غير نشط', color: 'default' },
  completed: { label: 'مكتمل', color: 'info' },
  under_construction: { label: 'قيد الإنشاء', color: 'warning' },
};

const TYPE_MAP = {
  residential: 'سكني', commercial: 'تجاري', mixed: 'مختلط',
  land: 'أرض', villa: 'فيلا', compound: 'كمبوند',
};

const defaultForm = { name: '', type: 'residential', status: 'active', location: { address: '', city: '', district: '' }, description: '', developer: '' };

const PropertiesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const dSearch = useDebounce(search, 400);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', page, dSearch],
    queryFn: () => propertiesAPI.getAll({ page, limit: 15, search: dSearch }).then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? propertiesAPI.update(editing._id, d) : propertiesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['properties']); toast.success(editing ? 'تم التحديث' : 'تم الإنشاء'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: (id) => propertiesAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['properties']); toast.success('تم الحذف'); setDelId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = (e) => { e.preventDefault(); save.mutate(form); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLoc = (k, v) => setForm(f => ({ ...f, location: { ...f.location, [k]: v } }));

  const columns = [
    { header: 'المشروع', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <FaBuilding className="text-sm" />
        </div>
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs opacity-60">{TYPE_MAP[r.type]}</p>
        </div>
      </div>
    )},
    { header: 'المدينة', render: (r) => r.location?.city || '-' },
    { header: 'الوحدات', render: (r) => (
      <span>{r.totalUnits} <span className="text-xs opacity-60">({r.availableUnits} متاح)</span></span>
    )},
    { header: 'الحالة', render: (r) => {
      const s = STATUS_MAP[r.status] || { label: r.status, color: 'default' };
      return <Badge color={s.color}>{s.label}</Badge>;
    }},
    { header: 'الإجراءات', render: (r) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="عرض الوحدات" onClick={() => navigate(`/properties/${r._id}`)}><FaBuilding className="text-blue-600" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="المشاريع العقارية"
        subtitle="إدارة جميع مشاريعك العقارية"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة مشروع</Button>}
        stats={[
          { label: 'الإجمالي', value: data?.pagination?.total ?? '—', icon: FaLayerGroup, color: '#da1f27' },
          { label: 'نشطة', value: (data?.data || []).filter(p => p.status === 'active').length, icon: FaCircleCheck, color: '#009756' },
          { label: 'قيد الإنشاء', value: (data?.data || []).filter(p => p.status === 'under_construction').length, icon: FaHelmetSafety, color: '#f59e0b' },
        ]}
      />

      <DataTable
        columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page}
        pages={data?.pagination?.pages || 1} limit={15}
        onPageChange={setPage} onSearch={setSearch}
        searchPlaceholder="بحث في المشاريع..."
      />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل المشروع' : 'إضافة مشروع جديد'} size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>إلغاء</Button>
            <Button onClick={handleSubmit} loading={save.isPending}>حفظ</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم المشروع" value={form.name} onChange={e => set('name', e.target.value)} required className="col-span-2" />
          <Select label="النوع" value={form.type} onChange={e => set('type', e.target.value)}
            options={Object.entries(TYPE_MAP).map(([v, l]) => ({ value: v, label: l }))} />
          <Select label="الحالة" value={form.status} onChange={e => set('status', e.target.value)}
            options={Object.entries(STATUS_MAP).map(([v, s]) => ({ value: v, label: s.label }))} />
          <Input label="المدينة" value={form.location?.city || ''} onChange={e => setLoc('city', e.target.value)} />
          <Input label="الحي / المنطقة" value={form.location?.district || ''} onChange={e => setLoc('district', e.target.value)} />
          <Input label="العنوان" value={form.location?.address || ''} onChange={e => setLoc('address', e.target.value)} className="col-span-2" />
          <Input label="المطور" value={form.developer || ''} onChange={e => set('developer', e.target.value)} />
          <Textarea label="الوصف" value={form.description || ''} onChange={e => set('description', e.target.value)} className="col-span-2" />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => del.mutate(delId)} loading={del.isPending}
        message="هل تريد حذف هذا المشروع؟ سيتم حذف جميع البيانات المرتبطة به."
      />
    </div>
  );
};

export default PropertiesPage;
