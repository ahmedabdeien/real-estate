import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuperAdminDashboard from './SuperAdminDashboard';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { reportsAPI } from '../../api/services';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  FaCity, FaBuilding, FaUserTie, FaFileContract,
  FaMoneyBillWave, FaChartLine, FaArrowTrendUp,
  FaTriangleExclamation, FaCalendarDays, FaArrowLeft,
  FaChartBar, FaUsers, FaFileInvoice, FaPlus,
  FaCircleCheck, FaCircle,
} from 'react-icons/fa6';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const fmtDate = (d) => new Date(d).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const QuickBtn = ({ label, icon: Icon, to, color }) => (
  <Link to={to}
    className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm"
    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${color}15`, color }}>
      <Icon className="text-sm" />
    </div>
    <span className="text-[11px] font-bold text-center" style={{ color: 'var(--color-text-dark)' }}>
      {label}
    </span>
  </Link>
);

/* Error boundary to protect charts from crashing the whole page */
class ChartBoundary extends React.Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) return (
      <div className="flex items-center justify-center h-40 rounded-xl"
        style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: 13 }}>
        تعذّر تحميل الرسم البياني
      </div>
    );
    return this.props.children;
  }
}

export default function DashboardPage() {
  const { user, company } = useSelector(s => s.auth);

  if (user?.isSuperAdmin) return <SuperAdminDashboard />;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const s = stats || {};

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 11 + i);
    return { y: d.getFullYear(), m: d.getMonth() + 1, label: d.toLocaleDateString('ar-EG-u-nu-latn', { month: 'short' }) };
  });
  const revData = months.map(({ y, m }) => s.monthlyRevenue?.find(r => r._id?.year === y && r._id?.month === m)?.total || 0);
  const expData = months.map(({ y, m }) => s.monthlyExpenses?.find(r => r._id?.year === y && r._id?.month === m)?.total || 0);

  const areaOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Cairo, Tajawal, sans-serif', background: 'transparent', animations: { enabled: true, easing: 'easeinout', speed: 600 } },
    colors: ['#c8161d', '#94a3b8'],
    fill: { type: 'solid', opacity: [0.08, 0.05] },
    stroke: { curve: 'smooth', width: [2.5, 2] },
    xaxis: { categories: months.map(m => m.label), labels: { style: { fontSize: '10px', colors: Array(12).fill('#9ca3af') } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: v => `${(v / 1000).toFixed(0)}k`, style: { fontSize: '10px', colors: ['#9ca3af'] } } },
    tooltip: { y: { formatter: v => `${fmt(v)} ج.م` } },
    legend: { position: 'top', fontSize: '12px', labels: { colors: ['#c8161d', '#6b7280'] } },
    grid: { borderColor: 'var(--color-border)', strokeDashArray: 4 },
    dataLabels: { enabled: false },
  };

  const unitStatuses = ['available', 'sold', 'reserved', 'rented'];
  const unitLabels   = { available: 'متاحة', sold: 'مباعة', reserved: 'محجوزة', rented: 'مؤجرة' };
  const unitColors   = ['#059669', '#c8161d', '#d97706', '#2563eb'];
  const unitData     = unitStatuses.map(st => s.unitsByProperty?.find(u => u._id === st)?.count || 0);

  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'Cairo, Tajawal, sans-serif', animations: { enabled: true, speed: 600 } },
    colors: unitColors,
    labels: unitStatuses.map(st => unitLabels[st]),
    legend: { position: 'bottom', fontSize: '12px' },
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'الإجمالي', fontSize: '12px', color: '#6b7280', formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: v => `${v} وحدة` } },
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  })();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Welcome header */}
      <div className="rounded-2xl border p-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'U'} size={44} />
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{greeting}،</p>
              <h1 className="text-xl font-black" style={{ color: 'var(--color-text-dark)' }}>
                {user?.name?.split(' ')[0]}
              </h1>
              {company?.name && (
                <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{company.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {s.overdueCount > 0 && (
              <Link to="/installments"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FaTriangleExclamation className="text-[10px]" />
                {s.overdueCount} قسط متأخر
              </Link>
            )}
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="إجمالي المشاريع"  value={s.properties}      icon={FaCity}         color="#c8161d" sub={`${s.units?.total || 0} وحدة إجمالاً`}     delay={0} />
        <KpiCard title="الوحدات المتاحة"  value={s.units?.available} icon={FaBuilding}     color="#059669" sub={`من ${s.units?.total || 0} وحدة`}          delay={0.06} />
        <KpiCard title="إجمالي العملاء"   value={s.customers}        icon={FaUsers}        color="#2563eb" sub="مسجلون في النظام"                          delay={0.12} />
        <KpiCard title="العقود النشطة"    value={s.activeContracts}  icon={FaFileContract} color="#7c3aed" sub={`${s.draftContracts || 0} مسودة`}           delay={0.18} />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="إجمالي الإيرادات"  value={s.revenue}                    icon={FaMoneyBillWave} color="#059669"                    suffix="ج.م" sub={`هذا الشهر: ${fmt(s.thisMonthRevenue)} ج.م`} delay={0.06} />
        <KpiCard title="إجمالي المصروفات" value={s.expenses}                   icon={FaChartLine}     color="#d97706"                    suffix="ج.م" sub={`هذا الشهر: ${fmt(s.thisMonthExpenses)} ج.م`} delay={0.12} />
        <KpiCard title="صافي الربح"        value={Math.abs(s.netProfit || 0)}   icon={FaArrowTrendUp}  color={s.netProfit >= 0 ? '#059669' : '#dc2626'} suffix="ج.م" sub={s.netProfit >= 0 ? 'ربح صافي' : 'خسارة صافية'} delay={0.18} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border p-5 xl:col-span-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>الإيرادات مقابل المصروفات</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>آخر 12 شهر</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}>
              تقرير مفصل <FaArrowLeft className="text-[9px]" />
            </Link>
          </div>
          <ChartBoundary>
            <ReactApexChart
              options={areaOptions}
              series={[{ name: 'الإيرادات', data: revData }, { name: 'المصروفات', data: expData }]}
              type="area" height={200}
            />
          </ChartBoundary>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-dark)' }}>حالة الوحدات</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>توزيع الوحدات بالحالة</p>
          {unitData.some(v => v > 0) ? (
            <ChartBoundary>
              <ReactApexChart options={donutOptions} series={unitData} type="donut" height={200} />
            </ChartBoundary>
          ) : (
            <div className="space-y-2 mt-2">
              {unitStatuses.map((st, i) => (
                <div key={st} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: `${unitColors[i]}10` }}>
                  <div className="flex items-center gap-2">
                    <FaCircle className="text-[8px]" style={{ color: unitColors[i] }} />
                    <span className="text-sm font-medium" style={{ color: unitColors[i] }}>{unitLabels[st]}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: unitColors[i] }}>0</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent contracts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border overflow-hidden xl:col-span-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <FaFileContract className="text-sm" style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>آخر العقود</h3>
            </div>
            <Link to="/contracts" className="text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}>
              عرض الكل
            </Link>
          </div>
          {!s.recentContracts?.length ? (
            <div className="px-5 py-12 text-center">
              <FaFileContract className="text-3xl mx-auto mb-3 opacity-10" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>لا توجد عقود بعد</p>
            </div>
          ) : (
            <div>
              {s.recentContracts.map((c, i) => (
                <div key={c._id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:opacity-90"
                  style={{ borderBottom: i < s.recentContracts.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <Avatar name={c.customerId?.name || '؟'} size={36} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-dark)' }}>
                      {c.customerId?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {c.propertyId?.name} — وحدة {c.unitId?.unitNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-dark)' }}>
                      {fmt(c.totalPrice)} <span className="text-xs font-normal opacity-50">ج.م</span>
                    </p>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="rounded-2xl border p-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
              إجراءات سريعة
            </p>
            <div className="grid grid-cols-3 gap-2">
              <QuickBtn label="عقد جديد"   icon={FaFileContract}  to="/contracts"  color="#c8161d" />
              <QuickBtn label="عميل جديد"  icon={FaUserTie}       to="/customers"  color="#2563eb" />
              <QuickBtn label="دفعة"        icon={FaMoneyBillWave} to="/payments"   color="#059669" />
              <QuickBtn label="فاتورة"      icon={FaFileInvoice}   to="/invoices"   color="#7c3aed" />
              <QuickBtn label="وحدة"        icon={FaBuilding}      to="/units"      color="#d97706" />
              <QuickBtn label="تقارير"      icon={FaChartBar}      to="/reports"    color="#0891b2" />
            </div>
          </motion.div>

          {/* Upcoming installments */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border overflow-hidden flex-1"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <FaCalendarDays className="text-sm" style={{ color: '#2563eb' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>أقساط قادمة</h3>
              </div>
              <Link to="/installments" className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                الكل
              </Link>
            </div>
            {!s.upcomingInstallments?.length ? (
              <div className="px-4 py-8 text-center">
                <FaCircleCheck className="text-2xl mx-auto mb-2 opacity-30" style={{ color: '#059669' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>لا أقساط خلال 30 يوم</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-64">
                {s.upcomingInstallments.map((inst, i) => {
                  const days = daysUntil(inst.installments?.dueDate);
                  const dotColor = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#22c55e';
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-dark)' }}>
                          {inst.customer?.[0]?.name}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          وحدة {inst.unit?.[0]?.unitNumber}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold" style={{ color: 'var(--color-text-dark)' }}>
                          {fmt(inst.installments?.amount)} ج.م
                        </p>
                        <p className="text-[10px] font-semibold" style={{ color: dotColor }}>
                          {days <= 0 ? 'اليوم' : days === 1 ? 'غداً' : `${days} يوم`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Top Properties */}
      {s.topProperties?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>أعلى المشاريع إيراداً</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>مرتبة حسب إجمالي الإيرادات</p>
            </div>
            <Link to="/properties" className="text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}>
              كل المشاريع
            </Link>
          </div>
          <div className="space-y-4">
            {s.topProperties.map((p, i) => {
              const max = s.topProperties[0]?.revenue || 1;
              const pct = Math.round((p.revenue / max) * 100);
              return (
                <div key={p._id || i} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{
                      background: i === 0 ? '#fef3c7' : 'var(--color-bg)',
                      color: i === 0 ? '#b45309' : 'var(--color-text-muted)',
                    }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-dark)' }}>
                        {p.name || 'غير محدد'}
                      </span>
                      <span className="text-sm font-black mr-4" style={{ color: 'var(--color-primary)' }}>
                        {fmt(p.revenue)} <span className="text-xs font-normal opacity-50">ج.م</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-border)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
