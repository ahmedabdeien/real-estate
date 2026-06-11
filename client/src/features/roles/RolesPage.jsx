import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaPlus, FaPen, FaTrash, FaShield, FaUsers, FaBuilding, FaFileContract, FaChartBar, FaBell, FaWhatsapp, FaGear, FaWarehouse, FaImages } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const MODULE_LABELS = {
  users: 'المستخدمون', roles: 'الأدوار', properties: 'المشاريع العقارية',
  units: 'الوحدات', customers: 'العملاء', contracts: 'العقود',
  installments: 'الأقساط', invoices: 'الفواتير', payments: 'المدفوعات',
  expenses: 'المصروفات', reports: 'التقارير', tasks: 'المهام',
  notifications: 'الإشعارات', whatsapp: 'واتساب', media: 'مكتبة الصور',
  warehouse: 'المستودع', purchasing: 'المشتريات', settings: 'الإعدادات',
  theme: 'المظهر', documents: 'الوثائق', audit: 'سجل العمليات',
  activity: 'سجل النشاط',
};

const MODULE_ICONS = {
  users: FaUsers, roles: FaShield, properties: FaBuilding, units: FaBuilding,
  customers: FaUsers, contracts: FaFileContract, installments: FaChartBar,
  invoices: FaChartBar, payments: FaChartBar, expenses: FaChartBar,
  reports: FaChartBar, tasks: FaBell, notifications: FaBell,
  whatsapp: FaWhatsapp, media: FaImages, warehouse: FaWarehouse,
  purchasing: FaWarehouse, settings: FaGear, theme: FaGear,
  documents: FaImages, audit: FaGear, activity: FaGear,
};

const defaultForm = { name: '', label: '', description: '', permissions: [] };

const RolesPage = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => rolesAPI.getAll().then(r => r.data.data) });
  const { data: permsData } = useQuery({ queryKey: ['permissions'], queryFn: () => rolesAPI.getPermissions().then(r => r.data.data) });

  const save = useMutation({
    mutationFn: (d) => editing ? rolesAPI.update(editing._id, d) : rolesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success(editing ? 'تم التحديث' : 'تم الإنشاء'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: rolesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success('تم الحذف'); setDelId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const togglePerm = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter(p => p !== perm) : [...f.permissions, perm],
    }));
  };

  const toggleModule = (module, perms) => {
    const allSelected = perms.every(p => form.permissions.includes(p.name));
    if (allSelected) {
      setForm(f => ({ ...f, permissions: f.permissions.filter(p => !perms.map(x => x.name).includes(p)) }));
    } else {
      setForm(f => ({ ...f, permissions: [...new Set([...f.permissions, ...perms.map(x => x.name)])] }));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="الأدوار والصلاحيات" subtitle="إدارة أدوار المستخدمين وصلاحياتهم"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة دور</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(roles || []).map((role) => (
          <div key={role._id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <FaShield />
                </div>
                <div>
                  <h3 className="font-semibold">{role.label}</h3>
                  <p className="text-xs opacity-60">{role.name}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {!role.isSystem && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}><FaPen /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(role._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
                  </>
                )}
                {role.isSystem && <Badge color="primary">نظام</Badge>}
              </div>
            </div>
            <p className="text-sm opacity-60 mb-3">{role.description || 'لا يوجد وصف'}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              {role.permissions?.length || 0} صلاحية
            </p>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل الدور' : 'إضافة دور جديد'} size="xl"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم الدور (بالإنجليزية)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="company_manager" required />
            <Input label="اسم الدور (بالعربية)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="مدير الشركة" required />
          </div>
          <div>
            <label className="label">الصلاحيات</label>
            <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4" style={{ borderColor: 'var(--color-border)' }}>
              {Object.entries(permsData || {}).map(([module, perms]) => {
                const allSelected = perms.every(p => form.permissions.includes(p.name));
                const ModIcon = MODULE_ICONS[module] || FaShield;
                return (
                  <div key={module} className="rounded-xl p-3" style={{ background: 'var(--color-background)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <input type="checkbox" id={`mod-${module}`} checked={allSelected}
                        onChange={() => toggleModule(module, perms)} className="w-4 h-4"
                        style={{ accentColor: 'var(--color-primary)' }} />
                      <label htmlFor={`mod-${module}`} className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <ModIcon className="text-xs" style={{ color: 'var(--color-primary)' }} />
                        {MODULE_LABELS[module] || module}
                      </label>
                      <span className="text-xs opacity-40 mr-auto">{perms.filter(p => form.permissions.includes(p.name)).length}/{perms.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mr-6">
                      {perms.map(p => (
                        <label key={p.name} className="flex items-center gap-2 text-xs cursor-pointer py-1 px-2 rounded-lg hover:bg-white transition-colors">
                          <input type="checkbox" checked={form.permissions.includes(p.name)}
                            onChange={() => togglePerm(p.name)} className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ accentColor: 'var(--color-primary)' }} />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default RolesPage;
