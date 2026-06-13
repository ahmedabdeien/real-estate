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
  FaChartBar, FaBell, FaGear, FaWarehouse, FaImages, FaCopy,
  FaCrown, FaLayerGroup, FaCreditCard, FaWandMagicSparkles, FaUserGroup,
  FaWhatsapp, FaLock,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const MODULE_LABELS = {
  users:'المستخدمون', roles:'الأدوار', properties:'المشاريع', units:'الوحدات',
  customers:'العملاء', contracts:'العقود', installments:'الأقساط', invoices:'الفواتير',
  payments:'المدفوعات', expenses:'المصروفات', reports:'التقارير', tasks:'المهام',
  notifications:'الإشعارات', whatsapp:'واتساب', media:'مكتبة الصور',
  warehouse:'المستودع', purchasing:'المشتريات', settings:'الإعدادات',
  theme:'المظهر', documents:'الوثائق', audit:'سجل العمليات', activity:'النشاط',
  companies:'الشركات', plans:'خطط الاشتراك', billing:'الفواتير والاشتراكات',
  platformRoles:'أدوار المنصة', team:'فريق المنصة', sitePages:'صفحات الموقع',
  platformSettings:'إعدادات المنصة', platformReports:'تقارير المنصة',
};
const MODULE_ICONS = {
  users:FaUsers, roles:FaShield, properties:FaBuilding, units:FaBuilding,
  customers:FaUsers, contracts:FaFileContract, installments:FaChartBar,
  invoices:FaChartBar, payments:FaChartBar, expenses:FaChartBar,
  reports:FaChartBar, tasks:FaBell, notifications:FaBell, whatsapp:FaWhatsapp,
  media:FaImages, warehouse:FaWarehouse, purchasing:FaWarehouse,
  settings:FaGear, theme:FaGear, documents:FaImages, audit:FaGear, activity:FaGear,
  companies:FaLayerGroup, plans:FaCreditCard, billing:FaCreditCard,
  platformRoles:FaCrown, team:FaUserGroup, sitePages:FaWandMagicSparkles,
  platformSettings:FaGear, platformReports:FaChartBar,
};
const COLORS = ['#da1f27','#009756','#fbb140','#2563eb','#7c3aed','#0d9488','#db2777','#231f20'];
const emptyForm = { name:'', label:'', description:'', permissions:[], color:'#da1f27' };

// ── RoleCard ──────────────────────────────────────────────────────────────────
function RoleCard({ role, permsData, readOnly, onEdit, onDelete, onDuplicate }) {
  const total = Object.values(permsData||{}).reduce((a,ps)=>a+ps.length,0);
  const count = role.permissions?.length||0;
  const pct   = total ? Math.min(100,Math.round((count/total)*100)) : 0;
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: role.color||'#da1f27' }}>
            {role.scope==='platform' ? <FaCrown size={14}/> : <FaShield size={14}/>}
          </div>
          <div>
            <h3 className="font-bold text-sm">{role.label}</h3>
            <p className="text-xs opacity-50 font-mono">{role.name}</p>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          {(readOnly||role.isSystem) ? (
            <Badge color="primary"><FaLock size={9} className="inline mr-1"/>نظام</Badge>
          ) : (
            <>
              <Button variant="ghost" size="icon" title="نسخ" onClick={()=>onDuplicate(role._id)} className="text-blue-600 hover:bg-blue-50"><FaCopy size={12}/></Button>
              <Button variant="ghost" size="icon" title="تعديل" onClick={()=>onEdit(role)}><FaPen size={12}/></Button>
              <Button variant="ghost" size="icon" title="حذف" onClick={()=>onDelete(role._id)} className="text-red-600 hover:bg-red-50"><FaTrash size={12}/></Button>
            </>
          )}
        </div>
      </div>
      <p className="text-xs opacity-60 leading-relaxed">{role.description||'—'}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'#f3f4f6',color:'#6b7280'}}>
          <FaUsers size={9} className="inline mr-1"/>{role.usersCount??0} مستخدم
        </span>
        {role.scope==='platform' && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(251,177,64,.15)',color:'#92400e'}}>
            <FaCrown size={9} className="inline mr-1"/>منصة
          </span>
        )}
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold" style={{color:role.color||'#da1f27'}}>{count} صلاحية</span>
          <span className="text-xs opacity-40">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:role.color||'#da1f27'}}/>
        </div>
      </div>
    </div>
  );
}

// ── RoleFormModal ─────────────────────────────────────────────────────────────
function RoleFormModal({ open, onClose, editing, onSave, isPending, permsData }) {
  const [form, setForm] = useState(emptyForm);
  React.useEffect(()=>{ setForm(editing ? {...emptyForm,...editing} : emptyForm); },[editing,open]);

  const toggle = (perm) => setForm(f=>({...f,
    permissions: f.permissions.includes(perm) ? f.permissions.filter(p=>p!==perm) : [...f.permissions,perm],
  }));
  const toggleMod = (mod, perms) => {
    const allSel = perms.every(p=>form.permissions.includes(p.name));
    setForm(f=>({...f, permissions: allSel
      ? f.permissions.filter(p=>!perms.map(x=>x.name).includes(p))
      : [...new Set([...f.permissions,...perms.map(x=>x.name)])],
    }));
  };
  const toggleAll = () => {
    const all = Object.values(permsData||{}).flatMap(ps=>ps.map(p=>p.name));
    setForm(f=>({...f, permissions: f.permissions.length===all.length ? [] : all}));
  };
  return (
    <Modal open={open} onClose={onClose} title={editing?'تعديل الدور':'إضافة دور جديد'} size="xl"
      footer={<><Button variant="outline" onClick={onClose}>إلغاء</Button><Button onClick={()=>onSave(form)} loading={isPending}>حفظ</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="اسم الدور (إنجليزي)" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="sales_manager"/>
          <Input label="اسم الدور (عربي)" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} placeholder="مدير المبيعات"/>
        </div>
        <Input label="الوصف" value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
        <div>
          <label className="label">اللون</label>
          <div className="flex gap-2">
            {COLORS.map(c=>(
              <button key={c} type="button" onClick={()=>setForm(f=>({...f,color:c}))}
                className="w-7 h-7 rounded-full transition-transform"
                style={{background:c, transform:form.color===c?'scale(1.25)':'scale(1)',
                  border:form.color===c?'2px solid #fff':'2px solid transparent',
                  boxShadow:form.color===c?`0 0 0 2px ${c}`:'none'}}/>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">الصلاحيات</label>
            <button type="button" onClick={toggleAll} className="text-xs font-bold border-none bg-transparent cursor-pointer" style={{color:'var(--color-primary)'}}>تحديد / إلغاء الكل</button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto border rounded-xl p-3" style={{borderColor:'var(--color-border)'}}>
            {Object.entries(permsData||{}).map(([mod,perms])=>{
              const allSel=perms.every(p=>form.permissions.includes(p.name));
              const Icon=MODULE_ICONS[mod]||FaShield;
              return (
                <div key={mod} className="rounded-lg p-3" style={{background:'var(--color-background)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={allSel} onChange={()=>toggleMod(mod,perms)} className="w-4 h-4" style={{accentColor:'var(--color-primary)'}}/>
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                      <Icon size={11} style={{color:'var(--color-primary)'}}/>{MODULE_LABELS[mod]||mod}
                    </label>
                    <span className="text-xs opacity-40 mr-auto">{perms.filter(p=>form.permissions.includes(p.name)).length}/{perms.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mr-6">
                    {perms.map(p=>(
                      <label key={p.name} className="flex items-center gap-1.5 text-xs cursor-pointer px-2 py-1 rounded hover:bg-white">
                        <input type="checkbox" checked={form.permissions.includes(p.name)} onChange={()=>toggle(p.name)} className="w-3.5 h-3.5" style={{accentColor:'var(--color-primary)'}}/>
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
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const qc = useQueryClient();
  const { user } = useSelector(s=>s.auth);
  const isSuper = !!user?.isSuperAdmin;

  const [tab, setTab]         = useState(isSuper ? 'platform' : 'company');
  const [companyId, setCompanyId] = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [delId, setDelId]     = useState(null);

  // أدوار المنصة — فقط للسوبر أدمن
  const platformRolesQ = useQuery({
    queryKey: ['roles','platform'],
    queryFn: ()=>rolesAPI.getAll({}).then(r=>r.data.data),
    enabled: isSuper && tab==='platform',
  });
  const platformPermsQ = useQuery({
    queryKey: ['permissions','platform'],
    queryFn: ()=>rolesAPI.getPermissions({}).then(r=>r.data.data),
    enabled: isSuper && tab==='platform',
  });

  // أدوار الشركة
  const companyRolesQ = useQuery({
    queryKey: ['roles','company', companyId||'mine'],
    queryFn: ()=>rolesAPI.getAll({ scope:'company', ...(isSuper&&companyId?{companyId}:{}) }).then(r=>r.data.data),
    enabled: tab==='company',
  });
  const companyPermsQ = useQuery({
    queryKey: ['permissions','company', companyId||'mine'],
    queryFn: ()=>rolesAPI.getPermissions({ scope:'company', ...(isSuper&&companyId?{companyId}:{}) }).then(r=>r.data.data),
    enabled: tab==='company',
  });

  const companiesQ = useQuery({
    queryKey: ['companies-list'],
    queryFn: ()=>companiesAPI.getAll().then(r=>r.data.data),
    enabled: isSuper,
  });

  const roles     = tab==='platform' ? platformRolesQ.data : companyRolesQ.data;
  const permsData = tab==='platform' ? platformPermsQ.data : companyPermsQ.data;
  const isLoading = tab==='platform' ? platformRolesQ.isLoading : companyRolesQ.isLoading;

  const saveMut = useMutation({
    mutationFn: (form)=>{
      const payload = { ...form, scope:'company', ...(isSuper&&companyId?{companyId}:{}) };
      return editing ? rolesAPI.update(editing._id,payload) : rolesAPI.create(payload);
    },
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:['roles','company']}); toast.success(editing?'تم التحديث':'تم الإنشاء'); setModal(false); setEditing(null); },
    onError: e=>toast.error(e.response?.data?.message||'حدث خطأ'),
  });
  const delMut = useMutation({
    mutationFn: rolesAPI.remove,
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:['roles','company']}); toast.success('تم الحذف'); setDelId(null); },
    onError: e=>{ toast.error(e.response?.data?.message||'حدث خطأ'); setDelId(null); },
  });
  const dupMut = useMutation({
    mutationFn: rolesAPI.duplicate,
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:['roles','company']}); toast.success('تم النسخ'); },
    onError: e=>toast.error(e.response?.data?.message||'حدث خطأ'),
  });

  return (
    <div>
      <PageHeader title="الأدوار والصلاحيات"
        subtitle="أدوار المنصة ثابتة بالكود — أدوار الشركة قابلة للإدارة"
        actions={
          <div className="flex items-center gap-2">
            {isSuper && tab==='company' && (
              <select value={companyId} onChange={e=>setCompanyId(e.target.value)} className="input text-sm py-2" style={{minWidth:180}}>
                <option value="">كل الشركات</option>
                {(companiesQ.data||[]).map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
            {tab==='company' && (
              <Button onClick={()=>{ setEditing(null); setModal(true); }}>
                <FaPlus size={12}/> إضافة دور
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs — للسوبر فقط */}
      {isSuper && (
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{background:'var(--color-background)'}}>
          {[{id:'platform',label:'أدوار المنصة',icon:FaCrown},{id:'company',label:'أدوار الشركات',icon:FaBuilding}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab===t.id
                ?{background:'var(--color-surface)',boxShadow:'0 1px 4px rgba(0,0,0,.08)',color:'var(--color-primary)'}
                :{color:'var(--color-text-muted,#6b7280)'}}>
              <t.icon size={13}/>{t.label}
            </button>
          ))}
        </div>
      )}

      {/* بانر المنصة */}
      {tab==='platform' && (
        <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{background:'rgba(251,177,64,.12)',color:'#92400e',border:'1px solid rgba(251,177,64,.3)'}}>
          <FaLock size={13}/>
          أدوار المنصة ثابتة ومُدارة بالكود فقط — لا يمكن تعديلها أو إضافتها من هنا.
        </div>
      )}

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=><div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roles||[]).map(role=>(
            <RoleCard key={role._id} role={role} permsData={permsData}
              readOnly={tab==='platform'}
              onEdit={r=>{ setEditing(r); setModal(true); }}
              onDelete={setDelId}
              onDuplicate={dupMut.mutate}/>
          ))}
          {!(roles||[]).length && (
            <div className="col-span-full text-center py-16 opacity-40 text-sm">لا توجد أدوار</div>
          )}
        </div>
      )}

      <RoleFormModal open={modal} onClose={()=>{ setModal(false); setEditing(null); }}
        editing={editing} onSave={saveMut.mutate} isPending={saveMut.isPending}
        permsData={companyPermsQ.data}/>

      <ConfirmDialog open={!!delId} onClose={()=>setDelId(null)}
        onConfirm={()=>delMut.mutate(delId)} loading={delMut.isPending}/>
    </div>
  );
}
