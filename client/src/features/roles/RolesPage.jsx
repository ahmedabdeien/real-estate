import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { rolesAPI, companiesAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FaPlus, FaPen, FaTrash, FaShield, FaUsers, FaBuilding, FaFileContract,
  FaChartBar, FaBell, FaWhatsapp, FaGear, FaWarehouse, FaImages, FaCopy,
  FaCrown, FaLayerGroup, FaCreditCard, FaWandMagicSparkles, FaUserGroup,
} from 'react-icons/fa6';
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
  // platform modules
  companies: 'الشركات', plans: 'خطط الاشتراك', billing: 'الاشتراكات والفوترة',
  platformRoles: 'أدوار المنصة', team: 'فريق المنصة', sitePages: 'صفحات الموقع',
  platformSettings: 'إعدادات المنصة', platformReports: 'تقارير المنصة',
};

const MODULE_ICONS = {
  users: FaUsers, roles: FaShield, properties: FaBuilding, units: FaBuilding,
  customers: FaUsers, contracts: FaFileContract, installments: FaChartBar,
  invoices: FaChartBar, payments: FaChartBar, expenses: FaChartBar,
  reports: FaChartBar, tasks: FaBell, notifications: FaBell,
  whatsapp: FaWhatsapp, media: FaImages, warehouse: FaWarehouse,
  purchasing: FaWarehouse, settings: FaGear, theme: FaGear,
  documents: FaImages, audit: FaGear, activity: FaGear,
  companies: FaLayerGroup, plans: FaCreditCard, billing: FaCreditCard,
  platformRoles: FaCrown, team: FaUserGroup, sitePages: FaWandMagicSparkles,
  platformSettings: FaGear, platformReports: FaChartBar,
};

const ROLE_COLORS = ['#da1f27', '#009756', '#fbb140', '#2563eb', '#7c3aed', '#0d9488', '#db2777', '#231f20'];

const defaultForm = { name: '', label: '', description: '', permissions: [], color: '#da1f27' };

const RolesPage = () => {
  const qc = useQueryClient();
  const { user } = useSelector(s => s.auth);
  const isSuper = !!user?.isSuperAdmin;

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);
  // '' = أدوار المنصة (للسوبر أدمن) — أو companyId محدد
  const [companyFilter, setCompanyFilter] = useState('');

  const params = isSuper && companyFilter ? { companyId: companyFilter } : undefined;

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', companyFilter],
    queryFn: () => rolesAPI.getAll(params).then(r => r.data.data),
  });
  const { data: permsData } = useQuery({
    queryKey: ['permissions', companyFilter],
    queryFn: () => rolesAPI.getPermissions(params).then(r => r.data.data),
  });
  const { data: companies } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => companiesAPI.getAll().then(r => r.data.data),
    enabled: isSuper,
  });

  const save = useMutation({
    mutationFn: (d) => editing ? rolesAPI.update(editing._id, d) : rolesAPI.create(companyFilter ? { ...d, companyId: companyFilter } : d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success(editing ? 'تم التحديث' : 'تم الإنشاء'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: rolesAPI.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('تم الحذف'); setDelId(null); },
    onError: (e) => { toast.error(e.response?.data?.message || 'حدث خطأ'); setDelId(null); },
  });

  const duplicate = useMutation({
    mutationFn: rolesAPI.duplicate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('تم نسخ الدور'); },
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

  const selectAll = () => {
    const all = Object.values(permsData || {}).flatMap(ps => ps.map(p => p.name));
    setForm(f => ({ ...f, permissions: f.permissions.length === all.length ? [] : all }));
  };

  if (isLoading) return <LoadingSpinner />;

  const isPlatformMode = isSuper && !companyFilter;

  return (
    <div>
      <PageHeader
        title={isPlatformMode ? 'أدوار المنصة' : 'الأدوار والصلاحيات'}
        subtitle={isPlatformMode
          ? 'أدوار فريق إدارة المنصة — منفصلة تماماً عن أدوار الشركات'
          : 'إدارة أدوار المستخدمين وصلاحياتهم'}
        actions={
          <div className="flex items-center gap-2">
            {isSuper && (
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="input text-sm py-2"
                style={{ minWidth: 180 }}
              >
                <option value="">أدوار المنصة</option>
                {(companies || []).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
            <Button onClick={openCreate}><FaPlus /> إضافة دور</Button>
          </div>
        }
      />

      {isPlatformMode && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(251,177,64,0.12)', color: '#92400e', border: '1px solid rgba(251,177,64,0.35)' }}>
          <FaCrown />
          أنت في وضع المنصة — هذه الأدوار لفريقك أنت (مالك المشروع)، ولا تظهر لأي شركة.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(roles || []).map((role) => (
          <div key={role._id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: role.color || 'var(--color-primary)' }}>
                  {role.scope === 'platform' ? <FaCrown /> : <FaShield />}
                </div>
                <div>
                  <h3 className="font-semibold">{role.label}</h3>
                  <p className="text-xs opacity-60">{role.name}</p>
                </div>
              </div>
              <div className="flex gap-1 items-center">
                <Button variant="ghost" size="icon" title="نسخ الدور" onClick={() => duplicate.mutate(role._id)} className="text-blue-600 hover:bg-blue-50"><FaCopy /></Button>
                {!role.isSystem && (
                  <>
                    <Button variant="ghost" size="icon" title="تعديل" onClick={() => openEdit(role)}><FaPen /></Button>
                    <Button variant="ghost" size="icon" title="حذف" onClick={() => setDelId(role._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
                  </>
                )}
                {role.isSystem && <Badge color="primary">نظام</Badge>}
              </div>
            </div>
            <p className="text-sm opacity-60 mb-3">{role.description || 'لا يوجد وصف'}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--color-background)', color: 'var(--color-text-muted, #6b7280)' }}>
                <FaUsers className="text-[10px]" />
                {role.usersCount ?? 0} مستخدم
              </span>
              {role.scope === 'platform' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(251,177,64,0.15)', color: '#92400e' }}>
                  <FaCrown className="text-[10px]" /> منصة
                </span>
              )}
            </div>

            {(() => {
              const total = Object.values(permsData || {}).reduce((a, perms) => a + perms.length, 0);
              const count = role.permissions?.length || 0;
              const pct = total ? Math.min(100, Math.round((count / total) * 100)) : 0;
              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>{count} صلاحية</p>
                    <p className="text-[10px] opacity-50">{pct}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: role.color || 'var(--color-primary)' }} />
                  </div>
                </div>
              );
            })()}
          </div>
        ))}

        {(roles || []).length === 0 && (
          <div className="col-span-full text-center py-16 opacity-50 text-sm">
            لا توجد أدوار بعد — أنشئ أول دور من زر «إضافة دور»
          </div>
        )}
      </div>

      <Modal open={modal} onClose={closeModal}
        title={editing ? 'تعديل الدور' : isPlatformMode ? 'إضافة دور منصة جديد' : 'إضافة دور جديد'} size="xl"
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
          <Input label="الوصف" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر لمهام هذا الدور" />

          <div>
            <label className="label">لون الدور</label>
            <div className="flex gap-2">
              {ROLE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    border: form.color === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                    cursor: 'pointer',
                  }} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">الصلاحيات</label>
              <button type="button" onClick={selectAll}
                className="text-xs font-bold cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--color-primary)' }}>
                تحديد / إلغاء الكل
              </button>
            </div>
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
