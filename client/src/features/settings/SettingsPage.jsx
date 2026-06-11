import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, companiesAPI, mediaAPI } from '../../api/services';
import { updateUser, updateCompany } from '../../store/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import {
  FaFloppyDisk, FaLock, FaUser, FaBell, FaLink, FaCrown,
  FaBuilding, FaWhatsapp, FaCircleCheck, FaTriangleExclamation,
  FaToggleOn, FaToggleOff, FaKey, FaEnvelope, FaPhone,
  FaLocationDot, FaGlobe, FaCamera, FaImage,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'profile',       label: 'الملف الشخصي',    icon: FaUser },
  { key: 'password',      label: 'كلمة المرور',       icon: FaLock },
  { key: 'company',       label: 'إعدادات الشركة',   icon: FaBuilding },
  { key: 'notifications', label: 'الإشعارات',         icon: FaBell },
  { key: 'integrations',  label: 'التوصيلات',         icon: FaLink },
  { key: 'subscription',  label: 'الاشتراك',          icon: FaCrown },
];

const SectionCard = ({ title, subtitle, children }) => (
  <div className="card p-6 mb-4">
    {title && (
      <div className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-base">{title}</h3>
        {subtitle && <p className="text-xs opacity-50 mt-0.5">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <div>
      <p className="text-sm font-medium">{label}</p>
      {desc && <p className="text-xs opacity-50 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)} className="text-2xl transition-colors"
      style={{ color: value ? 'var(--color-primary)' : 'var(--color-border)' }}>
      {value ? <FaToggleOn /> : <FaToggleOff />}
    </button>
  </div>
);

// ── Tabs content ────────────────────────────────────────────

const ProfileTab = ({ user, dispatch }) => {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const mut = useMutation({
    mutationFn: () => import('../../api/services').then(m => m.usersAPI.updateProfile(form)),
    onSuccess: (res) => { dispatch(updateUser(res.data.data)); toast.success('تم تحديث الملف الشخصي'); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });
  return (
    <div className="max-w-xl">
      <SectionCard title="معلوماتك الشخصية" subtitle="ستظهر هذه البيانات في ملفك داخل النظام">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-base">{user?.name}</p>
            <p className="text-xs opacity-50">{user?.email}</p>
            <Badge color="primary" className="mt-1 text-[10px]">{user?.role?.label || 'مستخدم'}</Badge>
          </div>
        </div>
        <div className="space-y-3">
          <Input label="الاسم الكامل" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            prefix={<FaUser className="text-xs opacity-40" />} />
          <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            prefix={<FaPhone className="text-xs opacity-40" />} />
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input className="input text-sm opacity-60" value={user?.email} readOnly
              style={{ background: 'var(--color-background)' }} />
            <p className="text-xs opacity-40 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => mut.mutate()} loading={mut.isPending}><FaFloppyDisk /> حفظ التغييرات</Button>
        </div>
      </SectionCard>
    </div>
  );
};

const PasswordTab = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const mut = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => { toast.success('تم تغيير كلمة المرور بنجاح'); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });
  const handle = () => {
    if (form.newPassword !== form.confirmPassword) return toast.error('كلمتا المرور غير متطابقتان');
    if (form.newPassword.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    mut.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  };
  return (
    <div className="max-w-md">
      <SectionCard title="تغيير كلمة المرور" subtitle="استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز">
        <div className="space-y-3">
          <Input label="كلمة المرور الحالية" type="password" value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            prefix={<FaKey className="text-xs opacity-40" />} />
          <Input label="كلمة المرور الجديدة" type="password" value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            prefix={<FaLock className="text-xs opacity-40" />} />
          <Input label="تأكيد كلمة المرور الجديدة" type="password" value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            prefix={<FaLock className="text-xs opacity-40" />} />
        </div>
        <div className="mt-4">
          <Button onClick={handle} loading={mut.isPending}><FaFloppyDisk /> تغيير كلمة المرور</Button>
        </div>
      </SectionCard>
    </div>
  );
};

const CompanyTab = ({ company }) => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: company?.name || '',
    phone: company?.phone || '',
    address: company?.address || '',
    city: company?.city || '',
    website: company?.website || '',
    taxNumber: company?.taxNumber || '',
    logo: company?.logo || '',
    settings: {
      currency: company?.settings?.currency || 'EGP',
      timezone: company?.settings?.timezone || 'Africa/Cairo',
      dateFormat: company?.settings?.dateFormat || 'DD/MM/YYYY',
      taxRate: company?.settings?.taxRate ?? 14,
      invoicePrefix: company?.settings?.invoicePrefix || 'INV-',
      paymentTermsDays: company?.settings?.paymentTermsDays ?? 30,
    },
  });
  const [logoUploading, setLogoUploading] = useState(false);

  const uploadLogo = async (file) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await mediaAPI.upload(fd);
      const url = res.data?.data?.url || res.data?.url || '';
      setForm(f => ({ ...f, logo: url }));
      toast.success('تم رفع الشعار');
    } catch {
      toast.error('فشل رفع الشعار');
    } finally {
      setLogoUploading(false);
    }
  };

  const mut = useMutation({
    mutationFn: (d) => companiesAPI.update(company?._id, d),
    onSuccess: (res) => {
      const updated = res.data?.data || res.data;
      dispatch(updateCompany({ name: form.name, logo: form.logo }));
      qc.invalidateQueries(['me']);
      toast.success('تم تحديث بيانات الشركة');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });
  if (!company) return <div className="card p-8 text-center opacity-40">لا توجد بيانات شركة</div>;
  return (
    <div className="max-w-2xl space-y-4">
      <SectionCard title="شعار وهوية الشركة" subtitle="سيظهر الشعار في ملفات PDF وعلى صفحة تسجيل الدخول">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
            {form.logo
              ? <img src={form.logo} className="w-full h-full object-contain p-1" alt="شعار الشركة" />
              : <FaBuilding className="text-3xl opacity-20" />
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">{form.logo ? 'تغيير الشعار' : 'رفع شعار الشركة'}</p>
            <p className="text-xs opacity-50 mb-3">PNG أو SVG بخلفية شفافة — أبعاد مربعة مفضلة</p>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => uploadLogo(e.target.files?.[0])} disabled={logoUploading} />
              <span className="btn btn-outline text-sm flex items-center gap-2 w-fit px-4 py-2 rounded-xl border transition-all"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dark)' }}>
                {logoUploading ? <span className="animate-spin">⋯</span> : <FaCamera />}
                {logoUploading ? 'جارٍ الرفع...' : 'اختر صورة'}
              </span>
            </label>
          </div>
          {form.logo && (
            <button onClick={() => setForm(f => ({ ...f, logo: '' }))}
              className="text-xs opacity-40 hover:opacity-70 transition-opacity">
              إزالة
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="بيانات الشركة الأساسية">
        <div className="grid grid-cols-2 gap-3">
          <Input label="اسم الشركة" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            prefix={<FaBuilding className="text-xs opacity-40" />} className="col-span-2" />
          <Input label="الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            prefix={<FaPhone className="text-xs opacity-40" />} />
          <Input label="الموقع الإلكتروني" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            prefix={<FaGlobe className="text-xs opacity-40" />} />
          <Input label="المدينة" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            prefix={<FaLocationDot className="text-xs opacity-40" />} />
          <Input label="الرقم الضريبي" value={form.taxNumber} onChange={e => setForm(f => ({ ...f, taxNumber: e.target.value }))} />
          <Input label="العنوان" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="col-span-2" />
        </div>
      </SectionCard>

      <SectionCard title="إعدادات النظام" subtitle="العملة والتوقيت وتنسيق التاريخ">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">العملة</label>
            <select className="input text-sm" value={form.settings.currency}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, currency: e.target.value } }))}>
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
          <div>
            <label className="label">المنطقة الزمنية</label>
            <select className="input text-sm" value={form.settings.timezone}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, timezone: e.target.value } }))}>
              <option value="Africa/Cairo">القاهرة (UTC+2/+3)</option>
              <option value="Asia/Riyadh">الرياض (UTC+3)</option>
              <option value="Asia/Dubai">دبي (UTC+4)</option>
            </select>
          </div>
          <div>
            <label className="label">تنسيق التاريخ</label>
            <select className="input text-sm" value={form.settings.dateFormat}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, dateFormat: e.target.value } }))}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="الإعدادات المالية" subtitle="تُستخدم في الفواتير والعقود الجديدة">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">نسبة الضريبة (%)</label>
            <input type="number" min="0" max="100" step="0.5" className="input text-sm"
              value={form.settings.taxRate}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, taxRate: Number(e.target.value) } }))} />
          </div>
          <div>
            <label className="label">بادئة رقم الفاتورة</label>
            <input className="input text-sm" style={{ direction: 'ltr' }}
              value={form.settings.invoicePrefix}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, invoicePrefix: e.target.value } }))} />
          </div>
          <div>
            <label className="label">مهلة السداد (يوم)</label>
            <input type="number" min="0" className="input text-sm"
              value={form.settings.paymentTermsDays}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, paymentTermsDays: Number(e.target.value) } }))} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => mut.mutate(form)} loading={mut.isPending}><FaFloppyDisk /> حفظ الإعدادات</Button>
        </div>
      </SectionCard>
    </div>
  );
};

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    email_contracts: true,
    email_installments: true,
    email_users: false,
    push_contracts: true,
    push_installments: true,
    push_tasks: true,
    push_mentions: true,
    sound: true,
  });
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  return (
    <div className="max-w-xl">
      <SectionCard title="إشعارات البريد الإلكتروني" subtitle="اختر ما تريد تلقي بريد إلكتروني بشأنه">
        <ToggleRow label="العقود الجديدة" desc="عند إضافة عقد جديد" value={prefs.email_contracts} onChange={() => toggle('email_contracts')} />
        <ToggleRow label="الأقساط المستحقة" desc="قبل موعد القسط بـ 3 أيام" value={prefs.email_installments} onChange={() => toggle('email_installments')} />
        <ToggleRow label="مستخدمون جدد" desc="عند انضمام مستخدم للشركة" value={prefs.email_users} onChange={() => toggle('email_users')} />
      </SectionCard>
      <SectionCard title="الإشعارات الفورية" subtitle="إشعارات داخل النظام بالوقت الفعلي">
        <ToggleRow label="العقود والأقساط" value={prefs.push_contracts} onChange={() => toggle('push_contracts')} />
        <ToggleRow label="تذكيرات الأقساط" value={prefs.push_installments} onChange={() => toggle('push_installments')} />
        <ToggleRow label="المهام الجديدة" value={prefs.push_tasks} onChange={() => toggle('push_tasks')} />
        <ToggleRow label="الإشارة إليك" desc="عند ذكر اسمك في تعليق أو ملاحظة" value={prefs.push_mentions} onChange={() => toggle('push_mentions')} />
        <ToggleRow label="صوت الإشعارات" value={prefs.sound} onChange={() => toggle('sound')} />
      </SectionCard>
      <Button><FaFloppyDisk /> حفظ التفضيلات</Button>
    </div>
  );
};

const IntegrationsTab = ({ can }) => {
  const integrations = [
    {
      key: 'whatsapp',
      name: 'واتساب API',
      desc: 'إرسال إشعارات وتنبيهات الأقساط تلقائياً عبر واتساب',
      icon: FaWhatsapp,
      color: '#25D366',
      module: 'whatsapp',
      status: 'disconnected',
      fields: [
        { label: 'رقم الهاتف', placeholder: '+20xxxxxxxxxx' },
        { label: 'API Token', placeholder: 'Bearer token...' },
      ],
    },
    {
      key: 'email',
      name: 'البريد الإلكتروني SMTP',
      desc: 'إعداد خادم البريد لإرسال الإشعارات والفواتير',
      icon: FaEnvelope,
      color: '#da1f27',
      module: null,
      status: 'connected',
      fields: [
        { label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
        { label: 'SMTP Port', placeholder: '587' },
        { label: 'المستخدم', placeholder: 'your@email.com' },
        { label: 'كلمة المرور', placeholder: '••••••••' },
      ],
    },
    {
      key: 'cloudinary',
      name: 'Cloudinary للصور',
      desc: 'تخزين الصور والملفات في السحابة',
      icon: FaGlobe,
      color: '#3448C5',
      module: null,
      status: 'connected',
      fields: [
        { label: 'Cloud Name', placeholder: 'your-cloud' },
        { label: 'API Key', placeholder: '123456789' },
        { label: 'API Secret', placeholder: '••••••••' },
      ],
    },
  ];

  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-2xl space-y-3">
      {integrations.map(intg => {
        const Icon = intg.icon;
        const locked = intg.module && !can(intg.module);
        const isOpen = expanded === intg.key;
        return (
          <div key={intg.key} className="card overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => !locked && setExpanded(isOpen ? null : intg.key)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: intg.color }}>
                <Icon />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{intg.name}</p>
                <p className="text-xs opacity-50">{intg.desc}</p>
              </div>
              {locked
                ? <Badge color="default" className="text-xs">يحتاج ترقية</Badge>
                : intg.status === 'connected'
                  ? <Badge color="success"><FaCircleCheck className="text-[10px]" /> متصل</Badge>
                  : <Badge color="default">غير متصل</Badge>
              }
            </div>
            {isOpen && !locked && (
              <div className="px-4 pb-4 border-t pt-4 grid grid-cols-2 gap-3" style={{ borderColor: 'var(--color-border)' }}>
                {intg.fields.map((f, i) => (
                  <Input key={i} label={f.label} placeholder={f.placeholder} />
                ))}
                <div className="col-span-2 flex gap-2">
                  <Button size="sm"><FaFloppyDisk /> حفظ</Button>
                  <Button size="sm" variant="outline">اختبار الاتصال</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SubscriptionTab = ({ company }) => {
  const plan = company?.plan;
  const expiry = company?.planExpiry ? new Date(company.planExpiry) : null;
  const isExpired = expiry && expiry < new Date();
  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="max-w-2xl">
      <SectionCard title="باقتك الحالية">
        {plan ? (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
                <FaCrown className="text-lg" />
              </div>
              <div>
                <p className="font-black text-lg">{plan.nameAr || plan.label}</p>
                <p className="text-sm opacity-50">{plan.description}</p>
              </div>
              <div className="mr-auto">
                <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>
                  {plan.price?.toLocaleString('en-US')} ج.م
                  <span className="text-xs font-normal opacity-50"> / شهر</span>
                </p>
              </div>
            </div>

            {expiry && (
              <div className={`rounded-xl p-3 flex items-center gap-3 mb-4 ${isExpired ? 'bg-red-50' : daysLeft < 14 ? 'bg-amber-50' : 'bg-green-50'}`}>
                {isExpired
                  ? <FaTriangleExclamation className="text-red-600" />
                  : <FaCircleCheck className="text-green-600" />
                }
                <p className="text-sm font-medium">
                  {isExpired
                    ? 'انتهى الاشتراك — يرجى التجديد'
                    : daysLeft < 14
                      ? `ينتهي الاشتراك خلال ${daysLeft} يوم`
                      : `الاشتراك نشط حتى ${expiry.toLocaleDateString('ar-EG-u-nu-latn')}`
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'المستخدمون', value: plan.maxUsers === -1 ? '∞' : plan.maxUsers },
                { label: 'المشاريع', value: plan.maxProperties === -1 ? '∞' : plan.maxProperties },
                { label: 'الوحدات', value: plan.maxUnits === -1 ? '∞' : plan.maxUnits },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--color-background)' }}>
                  <p className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>{item.value}</p>
                  <p className="text-xs opacity-50">{item.label}</p>
                </div>
              ))}
            </div>

            {plan.features?.length > 0 && (
              <div className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <FaCircleCheck className="text-green-600 text-xs flex-shrink-0" />
                    <span className="opacity-70">{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <FaCrown className="text-4xl mx-auto mb-3 opacity-20" />
            <p className="opacity-40 mb-3">لا توجد باقة مفعّلة</p>
          </div>
        )}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Button><FaCrown /> ترقية أو تجديد الباقة</Button>
        </div>
      </SectionCard>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────

const SettingsPage = () => {
  const { user, company } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');
  const { can } = usePlanFeatures();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':       return <ProfileTab user={user} dispatch={dispatch} />;
      case 'password':      return <PasswordTab />;
      case 'company':       return <CompanyTab company={company} />;
      case 'notifications': return <NotificationsTab />;
      case 'integrations':  return <IntegrationsTab can={can} />;
      case 'subscription':  return <SubscriptionTab company={company} />;
      default:              return null;
    }
  };

  return (
    <div>
      <PageHeader title="الإعدادات" subtitle="إدارة إعدادات حسابك وشركتك" />

      <div className="flex gap-6">
        {/* Vertical tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="card p-2 space-y-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-right"
                  style={{
                    backgroundColor: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab.key ? '#fff' : 'inherit',
                    opacity: activeTab === tab.key ? 1 : 0.7,
                  }}>
                  <Icon className="text-xs flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
