import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaLayerGroup, FaUsers, FaBuilding, FaCity,
  FaFileContract, FaMoneyBillWave, FaArrowRightToBracket,
  FaCircleCheck, FaCircleXmark, FaPlus, FaChartLine,
  FaCrown,
} from 'react-icons/fa6';
import { reportsAPI, companiesAPI } from '../../api/services';
import { impersonateCompany } from '../../store/authSlice';
import { KpiCard } from '../../components/ui/KpiCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const RED   = '#da1f27';
const GREEN = '#009756';
const DARK  = '#231f20';
const GOLD  = '#fbb140';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');

export default function SuperAdminDashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-stats'],
    queryFn: () => reportsAPI.getSuperStats().then(r => r.data.data),
    staleTime: 30000,
  });

  const impersonate = useMutation({
    mutationFn: companiesAPI.impersonate,
    onSuccess: (res) => {
      dispatch(impersonateCompany({ token: res.data.data.token, user: res.data.data.user }));
      toast.success('تم الدخول كمدير الشركة');
      navigate('/dashboard');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const s = stats || {};

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="rounded-2xl border p-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${GOLD}20` }}>
              <FaCrown className="text-lg" style={{ color: GOLD }} />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--color-text-dark)' }}>
                لوحة المشرف العام
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                نظرة شاملة على منصة EgyEstate
              </p>
            </div>
          </div>
          <Link to="/super/companies"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: RED }}>
            <FaPlus className="text-xs" />
            شركة جديدة
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard title="إجمالي الشركات"    value={s.totalCompanies}  icon={FaLayerGroup}    color={RED}   sub={`${s.activeCompanies || 0} نشطة`}       delay={0} />
        <KpiCard title="إجمالي المستخدمين" value={s.totalUsers}      icon={FaUsers}         color="#2563eb" sub="عبر كل الشركات"                       delay={0.06} />
        <KpiCard title="إجمالي المشاريع"   value={s.totalProperties} icon={FaCity}          color={GREEN}  sub={`${s.totalUnits || 0} وحدة`}           delay={0.12} />
        <KpiCard title="إجمالي العملاء"    value={s.totalCustomers}  icon={FaUsers}         color="#7c3aed" sub="في كل الشركات"                        delay={0.18} />
        <KpiCard title="العقود النشطة"     value={s.totalContracts}  icon={FaFileContract}  color="#d97706" sub="عقد نشط حالياً"                      delay={0.24} />
        <KpiCard title="إجمالي الإيرادات" value={s.totalRevenue}    icon={FaMoneyBillWave} color={GREEN}  suffix="ج.م" sub="عبر كل الشركات"            delay={0.30} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إدارة الشركات',  to: '/super/companies', color: RED,    icon: FaLayerGroup },
          { label: 'خطط الاشتراك',   to: '/super/plans',     color: '#2563eb', icon: FaChartLine },
          { label: 'سجل التحديثات',  to: '/updates',         color: GREEN,  icon: FaCircleCheck },
          { label: 'الإعدادات',       to: '/settings',        color: DARK,   icon: FaBuilding },
        ].map(({ label, to, color, icon: Icon }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, color }}>
              <Icon className="text-sm" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-dark)' }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Companies list */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-sm" style={{ color: RED }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>
              الشركات المسجلة
            </h3>
          </div>
          <Link to="/super/companies"
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: RED }}>
            عرض الكل
          </Link>
        </div>

        {!s.recentCompanies?.length ? (
          <div className="px-5 py-12 text-center">
            <FaLayerGroup className="text-3xl mx-auto mb-3 opacity-10" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>لا توجد شركات مسجلة بعد</p>
          </div>
        ) : (
          <div>
            {s.recentCompanies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/50"
                style={{ borderBottom: i < s.recentCompanies.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                {/* Logo/avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: RED }}>
                  {company.name?.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-dark)' }}>
                      {company.name}
                    </p>
                    {company.plan?.nameAr && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${GOLD}20`, color: '#b8860b' }}>
                        {company.plan.nameAr}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {company.email} · {company.slug}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0">
                  {company.isActive !== false ? (
                    <><FaCircleCheck style={{ color: GREEN }} /><span style={{ color: GREEN }}>نشطة</span></>
                  ) : (
                    <><FaCircleXmark style={{ color: '#dc2626' }} /><span style={{ color: '#dc2626' }}>موقوفة</span></>
                  )}
                </div>

                {/* Enter company button */}
                <button
                  onClick={() => impersonate.mutate(company._id)}
                  disabled={impersonate.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ background: DARK }}
                  title="الدخول كمدير الشركة"
                >
                  <FaArrowRightToBracket className="text-[10px]" />
                  دخول
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
