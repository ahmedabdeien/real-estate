import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { plansAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FaPlus, FaTrash, FaPen, FaCircleCheck, FaCrown, FaStar,
  FaRocket, FaToggleOn, FaToggleOff, FaUsers, FaBuilding, FaLayerGroup
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const PLAN_ICONS = [FaStar, FaRocket, FaCrown];
const PLAN_GRADIENTS = [
  'linear-gradient(135deg,#1a56db,#1e40af)',
  'linear-gradient(135deg,#da1f27,#b01820)',
  'linear-gradient(135deg,#047857,#065f46)',
  'linear-gradient(135deg,#7c3aed,#5b21b6)',
  'linear-gradient(135deg,#b45309,#92400e)',
];

const defaultForm = {
  name: '', nameAr: '', description: '',
  price: '', duration: 30,
  maxUsers: 10, maxProperties: 5, maxUnits: 100,
  features: [], isActive: true, isFeatured: false,
};

const PlansPage = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);
  const [featureInput, setFeatureInput] = useState('');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansAPI.getAll().then(r => r.data.data || []),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? plansAPI.update(editing._id, d) : plansAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['plans']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء الباقة'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: plansAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['plans']); toast.success('تم الحذف'); setDelId(null); },
  });

  const toggle = useMutation({
    mutationFn: (p) => plansAPI.update(p._id, { isActive: !p.isActive }),
    onSuccess: () => qc.invalidateQueries(['plans']),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setFeatureInput(''); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...defaultForm, ...p }); setFeatureInput(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFeature = () => {
    const t = featureInput.trim();
    if (t) { set('features', [...(form.features || []), t]); setFeatureInput(''); }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="خطط الاشتراك" subtitle="إدارة باقات الاشتراك المعروضة للشركات"
        actions={<Button onClick={openCreate}><FaPlus /> باقة جديدة</Button>} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><FaLayerGroup /></div>
          <div><p className="text-xl font-black">{plans.length}</p><p className="text-xs opacity-50">إجمالي الباقات</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white"><FaCircleCheck /></div>
          <div><p className="text-xl font-black">{plans.filter(p => p.isActive).length}</p><p className="text-xs opacity-50">باقات نشطة</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}><FaCrown /></div>
          <div><p className="text-xl font-black">{plans.filter(p => p.isFeatured).length}</p><p className="text-xs opacity-50">باقات مميزة</p></div>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="card p-16 text-center">
          <FaCrown className="text-5xl mx-auto mb-4 opacity-20" />
          <p className="opacity-40 mb-4">لا توجد باقات بعد</p>
          <Button onClick={openCreate}><FaPlus /> إنشاء أول باقة</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
            const gradient = PLAN_GRADIENTS[i % PLAN_GRADIENTS.length];
            return (
              <motion.div key={plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`card overflow-hidden relative ${!plan.isActive ? 'opacity-60' : ''}`}>

                {plan.isFeatured && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: '#fef3c7', color: '#92400e' }}>
                      الأكثر شيوعاً
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="p-6 text-white relative overflow-hidden" style={{ background: gradient }}>
                  <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white" />
                  <div className="absolute -left-2 -bottom-8 w-32 h-32 rounded-full opacity-10 bg-white" />
                  <div className="flex items-start justify-between">
                    <div>
                      <Icon className="text-2xl mb-2 opacity-80" />
                      <h3 className="text-xl font-black">{plan.nameAr || plan.name}</h3>
                      {plan.description && <p className="text-xs opacity-70 mt-1">{plan.description}</p>}
                    </div>
                    <button onClick={() => toggle.mutate(plan)} className="opacity-80 hover:opacity-100 transition-opacity">
                      {plan.isActive ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black">{Number(plan.price || 0).toLocaleString('ar-EG')}</span>
                    <span className="text-sm opacity-70 mr-1">ج.م / {plan.duration} يوم</span>
                  </div>
                </div>

                {/* Limits */}
                <div className="px-5 py-4 space-y-2">
                  {[
                    { icon: FaUsers, label: 'مستخدمون', value: plan.maxUsers },
                    { icon: FaBuilding, label: 'مشاريع', value: plan.maxProperties },
                    { icon: FaLayerGroup, label: 'وحدات', value: plan.maxUnits },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5"
                      style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div className="flex items-center gap-2 text-sm opacity-60">
                        <item.icon className="text-xs" />{item.label}
                      </div>
                      <span className="text-sm font-bold">{item.value === -1 ? 'غير محدود' : item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                {plan.features?.length > 0 && (
                  <div className="px-5 pb-4 space-y-1.5">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2 text-sm">
                        <FaCircleCheck className="text-green-600 text-xs flex-shrink-0" />
                        <span className="opacity-80">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openEdit(plan)}>
                    <FaPen /> تعديل
                  </Button>
                  <Button variant="ghost" onClick={() => setDelId(plan._id)} className="text-red-600 hover:bg-red-50">
                    <FaTrash />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل الباقة' : 'باقة جديدة'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="الاسم (عربي)" value={form.nameAr} onChange={e => set('nameAr', e.target.value)} required />
            <Input label="الاسم (إنجليزي)" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">الوصف</label>
            <textarea className="input h-20 resize-none text-sm" value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="وصف قصير للباقة..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="السعر (ج.م)" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
            <Input label="المدة (أيام)" type="number" value={form.duration} onChange={e => set('duration', Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="المستخدمون" type="number" value={form.maxUsers} onChange={e => set('maxUsers', Number(e.target.value))} />
            <Input label="المشاريع" type="number" value={form.maxProperties} onChange={e => set('maxProperties', Number(e.target.value))} />
            <Input label="الوحدات" type="number" value={form.maxUnits} onChange={e => set('maxUnits', Number(e.target.value))} />
          </div>

          {/* Features */}
          <div>
            <label className="label">المميزات</label>
            <div className="flex gap-2 mb-3">
              <input className="input flex-1 text-sm py-2" placeholder="أضف ميزة واضغط Enter..."
                value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <Button variant="outline" size="sm" onClick={addFeature}><FaPlus /></Button>
            </div>
            {(form.features || []).length > 0 && (
              <div className="space-y-1.5">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <FaCircleCheck className="text-green-600 text-xs flex-shrink-0" />
                    <span className="flex-1 text-sm">{f}</span>
                    <button onClick={() => set('features', form.features.filter((_, fi) => fi !== i))}
                      className="text-red-400 hover:text-red-600 text-xs"><FaTrash /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium">باقة نشطة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-medium">الأكثر شيوعاً (مميزة)</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default PlansPage;
