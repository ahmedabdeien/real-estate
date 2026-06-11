import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesAPI, plansAPI } from '../../api/services';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { FaPlus, FaPen, FaTrash, FaArrowRightToBracket, FaBuilding, FaCrown, FaCalendarDays, FaCheck, FaXmark } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';

const defaultForm = {
  name: '', slug: '', email: '', phone: '', address: '', city: '',
  plan: '', planExpiry: '',
  adminName: '', adminEmail: '', adminPassword: 'Admin@123',
};

const CompaniesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, dSearch, handleSearch, limit } = usePagination();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', page, dSearch],
    queryFn: () => companiesAPI.getAll({ page, limit, search: dSearch }).then(r => r.data),
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansAPI.getAll().then(r => r.data.data || []),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? companiesAPI.update(editing._id, d) : companiesAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['companies']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء الشركة'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: companiesAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['companies']); toast.success('تم الحذف'); setDelId(null); },
  });

  const impersonate = useMutation({
    mutationFn: companiesAPI.impersonate,
    onSuccess: (res) => {
      dispatch(setCredentials(res.data.data));
      toast.success('تم الدخول كمدير الشركة');
      navigate('/dashboard');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ ...defaultForm, ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const columns = [
    { header: 'الشركة', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          {r.logo ? <img src={r.logo} className="w-full h-full object-cover rounded-lg" /> : <FaBuilding />}
        </div>
        <div>
          <p className="font-semibold">{r.name}</p>
          <p className="text-xs opacity-60">{r.slug}</p>
        </div>
      </div>
    )},
    { header: 'البريد الإلكتروني', accessor: 'email' },
    { header: 'المدينة', render: (r) => r.city || '-' },
    { header: 'الباقة', render: (r) => r.plan
      ? <Badge color="primary"><FaCrown className="text-[10px]" /> {r.plan?.nameAr || r.plan?.label}</Badge>
      : <span className="text-xs opacity-40">بدون باقة</span>
    },
    { header: 'الحالة', render: (r) => (
      <Badge color={r.status === 'active' ? 'success' : r.status === 'suspended' ? 'danger' : 'default'}>
        {r.status === 'active' ? 'نشطة' : r.status === 'suspended' ? 'موقوفة' : 'غير نشطة'}
      </Badge>
    )},
    { header: 'الإجراءات', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => impersonate.mutate(r._id)} title="دخول كمدير">
          <FaArrowRightToBracket className="text-blue-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><FaPen /></Button>
        <Button variant="ghost" size="icon" onClick={() => setDelId(r._id)} className="text-red-600 hover:bg-red-50"><FaTrash /></Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="إدارة الشركات" subtitle="جميع الشركات المسجلة في المنظومة"
        actions={<Button onClick={openCreate}><FaPlus /> إضافة شركة</Button>} />

      <DataTable columns={columns} data={data?.data || []} loading={isLoading}
        total={data?.pagination?.total || 0} page={page} pages={data?.pagination?.pages || 1} limit={limit}
        onPageChange={setPage} onSearch={handleSearch} searchPlaceholder="بحث في الشركات..." />

      <Modal open={modal} onClose={closeModal} title={editing ? 'تعديل الشركة' : 'إضافة شركة جديدة'} size="lg"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending}>حفظ</Button>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="اسم الشركة" value={form.name} onChange={e => set('name', e.target.value)} required className="col-span-2" />
          <Input label="الرابط (Slug)" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} required placeholder="company-name" />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          <Input label="الهاتف" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="المدينة" value={form.city} onChange={e => set('city', e.target.value)} />
          <Input label="العنوان" value={form.address} onChange={e => set('address', e.target.value)} className="col-span-2" />

          {/* ── الباقة */}
          <div className="col-span-2 border-t pt-4 mt-1" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><FaCrown className="text-yellow-500" /> الباقة والاشتراك</p>
          </div>
          <div>
            <label className="label">اختر الباقة</label>
            <select className="input text-sm" value={form.plan} onChange={e => set('plan', e.target.value)}>
              <option value="">بدون باقة</option>
              {(plansData || []).map(p => (
                <option key={p._id} value={p._id}>{p.nameAr || p.label} — {p.price?.toLocaleString('en-US')} ج.م/شهر</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1"><FaCalendarDays className="text-xs" /> تاريخ انتهاء الباقة</label>
            <input type="date" className="input text-sm" value={form.planExpiry}
              onChange={e => set('planExpiry', e.target.value)} />
          </div>

          {/* Plan features preview */}
          {form.plan && (() => {
            const selectedPlan = (plansData || []).find(p => p._id === form.plan);
            if (!selectedPlan) return null;
            const ALL_MODULES = ['properties','units','contracts','installments','accounting','reports','advanced_reports','whatsapp','tasks','media','warehouse','purchasing','multi_branch'];
            const MODULE_NAMES = { properties:'المشاريع',units:'الوحدات',contracts:'العقود',installments:'الأقساط',accounting:'المحاسبة',reports:'التقارير',advanced_reports:'تقارير متقدمة',whatsapp:'واتساب',tasks:'المهام',media:'مكتبة الوسائط',warehouse:'المستودع',purchasing:'المشتريات',multi_branch:'متعدد الفروع' };
            return (
              <div className="col-span-2 rounded-xl p-4" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <FaCrown className="text-yellow-500" />
                    {selectedPlan.nameAr || selectedPlan.label}
                  </p>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {selectedPlan.price?.toLocaleString('en-US')} ج.م/شهر
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_MODULES.map(m => {
                    const included = !selectedPlan.modules?.length || selectedPlan.modules.includes(m);
                    return (
                      <div key={m} className="flex items-center gap-1.5 text-xs py-0.5">
                        {included
                          ? <FaCheck className="text-green-500 flex-shrink-0" />
                          : <FaXmark className="text-red-400 flex-shrink-0 opacity-40" />}
                        <span style={{ color: included ? 'var(--color-text-dark)' : 'var(--color-text-muted)', opacity: included ? 1 : 0.5 }}>
                          {MODULE_NAMES[m] || m}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {selectedPlan.maxUsers && (
                  <p className="text-xs mt-3 opacity-60">
                    الحد الأقصى للمستخدمين: <strong>{selectedPlan.maxUsers === -1 ? 'غير محدود' : selectedPlan.maxUsers}</strong>
                  </p>
                )}
              </div>
            );
          })()}

          {editing && (
            <div>
              <label className="label">حالة الشركة</label>
              <select className="input text-sm" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">نشطة</option>
                <option value="inactive">غير نشطة</option>
                <option value="suspended">موقوفة</option>
              </select>
            </div>
          )}

          {!editing && (
            <>
              <div className="col-span-2 border-t pt-4 mt-2" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold mb-3">بيانات مدير الشركة</p>
              </div>
              <Input label="اسم المدير" value={form.adminName} onChange={e => set('adminName', e.target.value)} />
              <Input label="بريد المدير" type="email" value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} />
              <Input label="كلمة المرور" value={form.adminPassword} onChange={e => set('adminPassword', e.target.value)} />
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending}
        message="هل تريد حذف هذه الشركة؟ سيتم حذف جميع بياناتها بشكل نهائي." />
    </div>
  );
};

export default CompaniesPage;
