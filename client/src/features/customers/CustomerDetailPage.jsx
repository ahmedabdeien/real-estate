import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI, contractsAPI, invoicesAPI, documentsAPI, aiAPI } from '../../api/services';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Avatar } from '../../components/UI/Avatar';
import toast from 'react-hot-toast';
import {
  FaArrowRight, FaPhone, FaEnvelope, FaLocationDot, FaIdCard, FaWandMagicSparkles,
  FaFileContract, FaFileInvoice, FaFolder, FaDownload,
  FaFileLines, FaFileImage, FaFile, FaMoneyBillWave,
  FaPlus, FaTrash, FaPhone as FaPhoneAlt, FaLocationPin,
  FaComments, FaUsers, FaCalendarDays, FaCircle,
  FaArrowsLeftRight, FaUserTie, FaNoteSticky,
} from 'react-icons/fa6';

const fmt     = (n) => Number(n || 0).toLocaleString('en-US');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtAgo  = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
};

const PIPELINE_STAGES = [
  { id: 'new_lead',    label: 'عميل جديد',      color: '#6366f1' },
  { id: 'contacted',  label: 'تم التواصل',       color: '#f59e0b' },
  { id: 'interested', label: 'مهتم',             color: '#3b82f6' },
  { id: 'negotiating',label: 'في التفاوض',       color: '#da1f27' },
  { id: 'contracted', label: 'تم التعاقد',       color: '#009756' },
  { id: 'lost',       label: 'فرصة ضائعة',      color: '#9ca3af' },
];

const ACTIVITY_TYPES = [
  { id: 'note',     label: 'ملاحظة',     icon: FaNoteSticky,  color: '#6b7280' },
  { id: 'call',     label: 'مكالمة',     icon: FaPhoneAlt,    color: '#2563eb' },
  { id: 'visit',    label: 'زيارة',      icon: FaLocationPin, color: '#059669' },
  { id: 'meeting',  label: 'اجتماع',    icon: FaUsers,       color: '#7c3aed' },
  { id: 'whatsapp', label: 'واتساب',    icon: FaComments,    color: '#25d366' },
  { id: 'email',    label: 'بريد',       icon: FaEnvelope,    color: '#f59e0b' },
];

const CONTRACT_STATUS = {
  active:    { l: 'نشط',    c: 'success' },
  completed: { l: 'منتهي',  c: 'info'    },
  cancelled: { l: 'ملغي',   c: 'danger'  },
  draft:     { l: 'مسودة',  c: 'default' },
};
const INVOICE_STATUS = {
  paid:    { l: 'مدفوعة',  c: 'success' },
  partial: { l: 'جزئية',   c: 'warning' },
  overdue: { l: 'متأخرة',  c: 'danger'  },
  sent:    { l: 'مرسلة',   c: 'info'    },
  draft:   { l: 'مسودة',   c: 'default' },
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <Icon className="text-sm opacity-40 flex-shrink-0" />
    <span className="text-xs opacity-50 w-24 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium">{value || '—'}</span>
  </div>
);

const TABS = [
  { id: 'overview',   label: 'نظرة عامة' },
  { id: 'activity',   label: 'النشاط والملاحظات' },
  { id: 'contracts',  label: 'العقود' },
  { id: 'invoices',   label: 'الفواتير' },
  { id: 'documents',  label: 'المستندات' },
];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab]           = useState('overview');
  const [actType, setActType]   = useState('note');
  const [actContent, setActContent] = useState('');
  const [aiProfile, setAiProfile]   = useState('');
  const [aiLoading, setAiLoading]   = useState(false);

  const { data: custData, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersAPI.getOne(id).then(r => r.data.data),
  });
  const { data: contractsData } = useQuery({
    queryKey: ['customer-contracts', id],
    queryFn: () => contractsAPI.getAll({ customerId: id, limit: 50 }).then(r => r.data),
    enabled: !!id,
  });
  const { data: invoicesData } = useQuery({
    queryKey: ['customer-invoices', id],
    queryFn: () => invoicesAPI.getAll({ customerId: id, limit: 50 }).then(r => r.data),
    enabled: !!id,
  });
  const { data: docsData } = useQuery({
    queryKey: ['customer-docs', id],
    queryFn: () => documentsAPI.getByRelated('customer', id).then(r => r.data),
    enabled: !!id,
  });

  const addActivity = useMutation({
    mutationFn: (data) => customersAPI.addActivity(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      setActContent('');
      toast.success('تمت الإضافة');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const delActivity = useMutation({
    mutationFn: (actId) => customersAPI.deleteActivity(id, actId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', id] }),
  });

  const updateStage = useMutation({
    mutationFn: (stage) => customersAPI.updateStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', id] }),
  });

  if (isLoading) return <LoadingSpinner />;

  const c = custData || {};

  const analyzeCustomer = async () => {
    setAiLoading(true);
    setAiProfile('');
    try {
      const stage = PIPELINE_STAGES.find(s => s.id === c.pipelineStage)?.label || 'جديد';
      const lastActivity = c.activities?.slice(-1)[0];
      const summary = `
العميل: ${c.name}
النوع: ${c.type === 'company' ? 'شركة' : 'فرد'}
مرحلة المبيعات: ${stage}
عدد العقود: ${contracts.length}
عدد الفواتير: ${invoices.length}
آخر نشاط: ${lastActivity ? `${lastActivity.type} - ${fmtAgo(lastActivity.createdAt)}` : 'لا يوجد'}
عدد الأنشطة: ${c.activities?.length || 0}
`.trim();
      const res = await aiAPI.chat({
        messages: [{
          role: 'user',
          content: `أنت مستشار مبيعات عقارية. حلّل ملف هذا العميل وقدّم:
1. تقييم احتمالية الإغلاق (مرتفع/متوسط/منخفض) مع السبب
2. الخطوة التالية الموصى بها
3. أسلوب التواصل المناسب معه
4. تحذيرات أو مخاطر

البيانات:
${summary}`
        }],
        context: `شركة عقارية تبيع وحدات سكنية وتجارية`,
      });
      setAiProfile(res.data.reply);
    } catch {
      toast.error('فشل التحليل');
    } finally {
      setAiLoading(false);
    }
  };
  const contracts  = contractsData?.data  || [];
  const invoices   = invoicesData?.data   || [];
  const docs       = docsData?.data       || [];
  const activities = c.activities         || [];
  const totalPaid  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalDue   = invoices.reduce((s, i) => s + (i.balance || 0), 0);
  const currentStage = PIPELINE_STAGES.find(s => s.id === c.pipelineStage) || PIPELINE_STAGES[0];

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title={c.name || 'ملف العميل'}
        subtitle="ملف العميل الكامل"
        actions={
          <div className="flex gap-2">
            <button onClick={analyzeCustomer} disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff' }}>
              <FaWandMagicSparkles className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? 'جاري التحليل...' : 'تحليل AI'}
            </button>
            <Button variant="outline" onClick={() => navigate('/customers')}>
              <FaArrowRight /> رجوع
            </Button>
          </div>
        }
      />

      {aiProfile && (
        <div className="card p-4" style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #c4b5fd' }}>
          <div className="flex items-center gap-2 mb-3">
            <FaWandMagicSparkles className="text-purple-600" />
            <span className="font-bold text-sm text-purple-700">تحليل AI للعميل</span>
            <button onClick={() => setAiProfile('')} className="mr-auto text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{aiProfile}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* ── Sidebar: profile card ── */}
        <div className="space-y-4">
          <div className="card p-5 text-center">
            <Avatar name={c.name} size={64} className="mx-auto mb-3" />
            <h2 className="font-bold text-base">{c.name}</h2>
            <p className="text-xs opacity-50 mt-0.5">
              {c.type === 'company' ? 'شركة' : 'فرد'}
            </p>

            {/* Pipeline stage badge */}
            <div className="mt-3">
              <select
                value={c.pipelineStage || 'new_lead'}
                onChange={e => updateStage.mutate(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border-0 text-center cursor-pointer"
                style={{
                  background: currentStage.color + '18',
                  color: currentStage.color,
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                {PIPELINE_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex justify-center mt-2">
              <Badge color={c.status === 'active' ? 'success' : c.status === 'blacklisted' ? 'danger' : 'default'}>
                {c.status === 'active' ? 'نشط' : c.status === 'blacklisted' ? 'محظور' : 'غير نشط'}
              </Badge>
            </div>
          </div>

          {/* Contact info */}
          <div className="card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-50">بيانات التواصل</h3>
            <InfoRow icon={FaPhone}      label="الهاتف"      value={c.phone} />
            <InfoRow icon={FaEnvelope}   label="البريد"       value={c.email} />
            <InfoRow icon={FaIdCard}     label="الهوية"       value={c.nationalId} />
            <InfoRow icon={FaLocationDot}label="العنوان"      value={c.address} />
            <InfoRow icon={FaUserTie}    label="الجنسية"      value={c.nationality} />
            {c.assignedTo && (
              <InfoRow icon={FaUsers} label="المسؤول" value={c.assignedTo.name} />
            )}
          </div>

          {/* Financial summary */}
          <div className="card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-50">الملخص المالي</h3>
            {[
              { label: 'إجمالي المشتريات', value: fmt(c.totalPurchases) + ' ج.م', color: '#1a56db' },
              { label: 'إجمالي المدفوع',   value: fmt(totalPaid) + ' ج.م',        color: '#16a34a' },
              { label: 'المتبقي',           value: fmt(totalDue) + ' ج.م',          color: '#dc2626' },
              { label: 'العقود',            value: contracts.length },
              { label: 'الفواتير',          value: invoices.length },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-xs opacity-60">{item.label}</span>
                <span className="text-sm font-bold" style={item.color ? { color: item.color } : {}}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-fit"
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === t.id ? 'var(--color-surface)' : 'transparent',
                  color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  border: 'none', cursor: 'pointer',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Pipeline progress */}
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <FaArrowsLeftRight style={{ color: 'var(--color-primary)' }} />
                  مرحلة المسار
                </h3>
                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.map((s, i) => {
                    const currentIdx = PIPELINE_STAGES.findIndex(x => x.id === (c.pipelineStage || 'new_lead'));
                    const done = i <= currentIdx && s.id !== 'lost';
                    const active = s.id === (c.pipelineStage || 'new_lead');
                    return (
                      <React.Fragment key={s.id}>
                        <button
                          onClick={() => updateStage.mutate(s.id)}
                          className="flex flex-col items-center gap-1 flex-1 min-w-0"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all mx-auto"
                            style={{
                              background: active ? s.color : done ? s.color + '30' : '#f3f4f6',
                              border: active ? `2px solid ${s.color}` : 'none',
                            }}>
                            <FaCircle className="text-[6px]"
                              style={{ color: active ? '#fff' : done ? s.color : '#d1d5db' }} />
                          </div>
                          <span className="text-[10px] font-medium text-center leading-tight"
                            style={{ color: active ? s.color : done ? '#374151' : '#9ca3af' }}>
                            {s.label}
                          </span>
                        </button>
                        {i < PIPELINE_STAGES.length - 1 && (
                          <div className="h-0.5 flex-1 mb-4 rounded-full"
                            style={{ background: i < (PIPELINE_STAGES.findIndex(x => x.id === (c.pipelineStage || 'new_lead'))) ? currentStage.color + '50' : '#e5e7eb' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {c.notes && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold mb-2">ملاحظات</h3>
                  <p className="text-sm opacity-70 leading-relaxed">{c.notes}</p>
                </div>
              )}

              {/* Recent activity preview */}
              {activities.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">آخر النشاطات</h3>
                    <button onClick={() => setTab('activity')}
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-primary)', border: 'none', background: 'none', cursor: 'pointer' }}>
                      عرض الكل
                    </button>
                  </div>
                  {activities.slice(0, 3).map(a => {
                    const at = ACTIVITY_TYPES.find(x => x.id === a.type) || ACTIVITY_TYPES[0];
                    const Icon = at.icon;
                    return (
                      <div key={a._id} className="flex gap-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: at.color + '18', color: at.color }}>
                          <Icon className="text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: '#374151' }}>{a.content}</p>
                          <p className="text-[10px] opacity-50 mt-0.5">{fmtAgo(a.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Activity ── */}
          {tab === 'activity' && (
            <div className="space-y-4">
              {/* Add activity */}
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-3">إضافة نشاط</h3>

                {/* Type selector */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {ACTIVITY_TYPES.map(at => {
                    const Icon = at.icon;
                    const active = actType === at.id;
                    return (
                      <button key={at.id} onClick={() => setActType(at.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: active ? at.color + '18' : '#f3f4f6',
                          color: active ? at.color : '#6b7280',
                          border: active ? `1px solid ${at.color}40` : '1px solid transparent',
                          cursor: 'pointer',
                        }}>
                        <Icon className="text-[10px]" />
                        {at.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={actContent}
                    onChange={e => setActContent(e.target.value)}
                    placeholder="اكتب ملاحظة، سجّل مكالمة، أو أي نشاط..."
                    className="input flex-1 text-sm"
                    rows={2}
                    style={{ resize: 'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey && actContent.trim()) {
                        addActivity.mutate({ type: actType, content: actContent.trim() });
                      }
                    }}
                  />
                  <Button
                    onClick={() => actContent.trim() && addActivity.mutate({ type: actType, content: actContent.trim() })}
                    loading={addActivity.isPending}
                    disabled={!actContent.trim()}
                  >
                    <FaPlus />
                  </Button>
                </div>
                <p className="text-[10px] opacity-40 mt-1">Ctrl+Enter للإرسال السريع</p>
              </div>

              {/* Activity timeline */}
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4">سجل النشاط ({activities.length})</h3>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-sm opacity-40">لا توجد نشاطات بعد</div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute right-3 top-0 bottom-0 w-0.5"
                      style={{ background: 'var(--color-border)' }} />
                    <div className="space-y-4">
                      {activities.map(a => {
                        const at = ACTIVITY_TYPES.find(x => x.id === a.type) || ACTIVITY_TYPES[0];
                        const Icon = at.icon;
                        return (
                          <div key={a._id} className="flex gap-4 group">
                            {/* Icon dot */}
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                              style={{ background: at.color, color: '#fff' }}>
                              <Icon className="text-[10px]" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: at.color + '15', color: at.color }}>
                                    {at.label}
                                  </span>
                                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#374151' }}>{a.content}</p>
                                  <p className="text-[10px] opacity-40 mt-1">
                                    {a.createdBy?.name && `${a.createdBy.name} · `}{fmtAgo(a.createdAt)} · {fmtDate(a.createdAt)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => delActivity.mutate(a._id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ color: '#dc2626', background: '#fee2e2' }}>
                                  <FaTrash className="text-[9px]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Contracts ── */}
          {tab === 'contracts' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2 font-semibold text-sm"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <FaFileContract style={{ color: 'var(--color-primary)' }} />
                العقود ({contracts.length})
              </div>
              {contracts.length === 0 ? (
                <p className="text-center py-10 text-sm opacity-40">لا توجد عقود</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table text-sm w-full">
                    <thead>
                      <tr><th>رقم العقد</th><th>المشروع</th><th>النوع</th><th>القيمة</th><th>الحالة</th><th>التاريخ</th></tr>
                    </thead>
                    <tbody>
                      {contracts.map(con => {
                        const s = CONTRACT_STATUS[con.status] || { l: con.status, c: 'default' };
                        return (
                          <tr key={con._id}>
                            <td className="font-mono text-xs">{con.contractNumber}</td>
                            <td>{con.propertyId?.name}</td>
                            <td><Badge color="info">{con.type === 'sale' ? 'بيع' : 'إيجار'}</Badge></td>
                            <td className="font-bold">{fmt(con.totalPrice)} ج.م</td>
                            <td><Badge color={s.c}>{s.l}</Badge></td>
                            <td className="text-xs opacity-60">{fmtDate(con.startDate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Invoices ── */}
          {tab === 'invoices' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2 font-semibold text-sm"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <FaFileInvoice style={{ color: 'var(--color-primary)' }} />
                الفواتير ({invoices.length})
              </div>
              {invoices.length === 0 ? (
                <p className="text-center py-10 text-sm opacity-40">لا توجد فواتير</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table text-sm w-full">
                    <thead>
                      <tr><th>رقم الفاتورة</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>الاستحقاق</th></tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => {
                        const s = INVOICE_STATUS[inv.status] || { l: inv.status, c: 'default' };
                        return (
                          <tr key={inv._id}>
                            <td className="font-mono text-xs">{inv.invoiceNumber}</td>
                            <td className="font-bold">{fmt(inv.total)} ج.م</td>
                            <td className="text-green-700">{fmt(inv.paidAmount)} ج.م</td>
                            <td className="text-red-700">{fmt(inv.balance)} ج.م</td>
                            <td><Badge color={s.c}>{s.l}</Badge></td>
                            <td className="text-xs opacity-60">{fmtDate(inv.dueDate)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Documents ── */}
          {tab === 'documents' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2 font-semibold text-sm"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <FaFolder style={{ color: 'var(--color-primary)' }} />
                المستندات ({docs.length})
              </div>
              {docs.length === 0 ? (
                <p className="text-center py-10 text-sm opacity-40">لا توجد مستندات</p>
              ) : (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {docs.map(doc => {
                    const DocIcon = doc.mimeType?.includes('image') ? FaFileImage
                      : doc.mimeType?.includes('pdf') ? FaFileLines : FaFile;
                    return (
                      <a key={doc._id} href={doc.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: '#fee2e218', color: '#c8161d' }}>
                          <DocIcon className="text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{doc.name}</p>
                          <p className="text-[10px] opacity-50">{doc.type}</p>
                        </div>
                        <FaDownload className="text-xs opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
