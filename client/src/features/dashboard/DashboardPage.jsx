import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { reportsAPI } from '../../api/services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FaCity, FaBuilding, FaUserTie, FaFileContract,
  FaMoneyBillWave, FaChartLine, FaArrowTrendUp, FaArrowTrendDown,
  FaTriangleExclamation, FaCalendarDays, FaArrowLeft,
  FaChartBar, FaUsers, FaCircle, FaArrowRight,
  FaFileInvoice, FaPlus, FaCircleCheck,
} from 'react-icons/fa6';

const fmt = (n) => Number(n || 0).toLocaleString('ar-EG');
const fmtDate = (d) => new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

/* ── Live Clock ── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="tabular-nums font-bold text-2xl" style={{ color: 'var(--color-text-dark)', fontVariantNumeric: 'tabular-nums' }}>
      {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

/* ── Animated Number ── */
const AnimNum = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value || 0);
    if (target === 0) return;
    let start = 0;
    const step = target / 30;
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setDisplay(Math.floor(start));
      if (start >= target) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [value]);
  return <>{fmt(display)}{suffix && <span className="text-sm font-medium mr-1 opacity-60">{suffix}</span>}</>;
};

/* ── KPI Card ── */
const KPI = ({ title, value, sub, icon: Icon, color, suffix = '', trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="card p-5 flex items-start gap-4 card-hover relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 right-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, ${color}80 0%, transparent 100%)` }} />
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}15` }}>
      <Icon className="text-xl" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold mb-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
      <p className="text-2xl font-black leading-none" style={{ color: 'var(--color-text-dark)' }}>
        <AnimNum value={value} suffix={suffix} />
      </p>
      {sub && <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-xl flex-shrink-0 ${
        trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}>
        {trend >= 0 ? <FaArrowTrendUp className="text-[10px]" /> : <FaArrowTrendDown className="text-[10px]" />}
        {Math.abs(trend)}%
      </div>
    )}
  </motion.div>
);

/* ── Quick Action ── */
const QuickBtn = ({ label, icon: Icon, to, color }) => (
  <Link to={to}
    className="group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    style={{ backgroundColor: `${color}08`, borderColor: `${color}22` }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
      style={{ backgroundColor: `${color}18` }}>
      <Icon className="text-sm" style={{ color }} />
    </div>
    <span className="text-[11px] font-bold text-center leading-tight" style={{ color: 'var(--color-text-dark)' }}>
      {label}
    </span>
  </Link>
);

const DashboardPage = () => {
  const { user } = useSelector(s => s.auth);
  const company  = useSelector(s => s.auth.company);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const s = stats || {};

  /* ── Chart: Revenue vs Expenses ── */
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 11 + i);
    return { y: d.getFullYear(), m: d.getMonth() + 1, label: d.toLocaleDateString('ar-EG', { month: 'short' }) };
  });
  const revData = months.map(({ y, m }) => s.monthlyRevenue?.find(r => r._id?.year === y && r._id?.month === m)?.total || 0);
  const expData = months.map(({ y, m }) => s.monthlyExpenses?.find(r => r._id?.year === y && r._id?.month === m)?.total || 0);

  const areaOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Tajawal', background: 'transparent', animations: { enabled: true, easing: 'easeinout', speed: 600 } },
    colors: ['#da1f27', '#94a3b8'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 100] } },
    stroke: { curve: 'smooth', width: [2.5, 2] },
    xaxis: { categories: months.map(m => m.label), labels: { style: { fontFamily: 'Tajawal', fontSize: '10px', colors: Array(12).fill('#9ca3af') } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: v => `${(v / 1000).toFixed(0)}k`, style: { fontFamily: 'Tajawal', fontSize: '10px', colors: ['#9ca3af'] } } },
    tooltip: { y: { formatter: v => `${fmt(v)} ج.م` }, style: { fontFamily: 'Tajawal' } },
    legend: { position: 'top', fontFamily: 'Tajawal', fontSize: '12px', labels: { colors: ['#da1f27', '#6b7280'] } },
    grid: { borderColor: '#f0ece8', strokeDashArray: 4, padding: { left: 0, right: 0 } },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
  };

  /* ── Chart: Unit status donut ── */
  const unitStatuses = ['available', 'sold', 'reserved', 'rented'];
  const unitLabels   = { available: 'متاحة', sold: 'مباعة', reserved: 'محجوزة', rented: 'مؤجرة' };
  const unitColors   = ['#15803d', '#da1f27', '#b45309', '#2563eb'];
  const unitData     = unitStatuses.map(st => s.unitsByProperty?.find(u => u._id === st)?.count || 0);

  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'Tajawal', animations: { enabled: true, easing: 'easeinout', speed: 600 } },
    colors: unitColors,
    labels: unitStatuses.map(st => unitLabels[st]),
    legend: { position: 'bottom', fontFamily: 'Tajawal', fontSize: '12px' },
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'الإجمالي', fontFamily: 'Tajawal', fontSize: '12px', color: '#6b7280', formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0) } } } } },
    dataLabels: { enabled: false },
    tooltip: { style: { fontFamily: 'Tajawal' }, y: { formatter: v => `${v} وحدة` } },
    stroke: { width: 0 },
  };

  if (isLoading) return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card p-5 h-28">
          <div className="shimmer h-4 w-1/2 rounded mb-3" />
          <div className="shimmer h-8 w-3/4 rounded mb-2" />
          <div className="shimmer h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  })();

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F0E0E 0%, #231f20 60%, #3d1214 100%)' }}
      >
        <div className="relative p-6">
          {/* BG Pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm mb-1">{greeting}،</p>
              <h1 className="text-2xl font-black text-white mb-1">{user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-white/40 text-xs">
                {company?.name && <span className="text-white/60 font-semibold ml-2">{company.name}</span>}
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <LiveClock />
              <p className="text-white/30 text-xs mt-1">التوقيت الحالي</p>
            </div>
          </div>
          {s.overdueCount > 0 && (
            <div className="relative mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold w-fit"
              style={{ backgroundColor: 'rgba(185,28,28,0.25)', border: '1px solid rgba(252,165,165,0.3)', color: '#fca5a5' }}>
              <FaTriangleExclamation className="text-sm" />
              <span>{s.overdueCount} قسط متأخر — </span>
              <Link to="/installments" className="underline underline-offset-2 text-xs">عرض التفاصيل</Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── KPIs Row 1 ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <KPI title="إجمالي المشاريع"   value={s.properties}       icon={FaCity}         color="#da1f27" sub={`${s.units?.total || 0} وحدة إجمالاً`}     delay={0} />
        <KPI title="الوحدات المتاحة"   value={s.units?.available}  icon={FaBuilding}     color="#15803d" sub={`من ${s.units?.total || 0} وحدة`}          delay={0.06} />
        <KPI title="إجمالي العملاء"    value={s.customers}         icon={FaUsers}        color="#2563eb" sub="مسجلون في النظام"                          delay={0.12} />
        <KPI title="العقود النشطة"     value={s.activeContracts}   icon={FaFileContract} color="#7c3aed" sub={`${s.draftContracts || 0} مسودة`}           delay={0.18} />
      </div>

      {/* ── KPIs Row 2 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        <KPI title="إجمالي الإيرادات"  value={s.revenue}          icon={FaMoneyBillWave} color="#15803d" suffix="ج.م" sub={`هذا الشهر: ${fmt(s.thisMonthRevenue)} ج.م`} delay={0} />
        <KPI title="إجمالي المصروفات" value={s.expenses}          icon={FaChartLine}     color="#b45309" suffix="ج.م" sub={`هذا الشهر: ${fmt(s.thisMonthExpenses)} ج.م`} delay={0.06} />
        <KPI title="صافي الربح"        value={Math.abs(s.netProfit || 0)} icon={FaArrowTrendUp} color={s.netProfit >= 0 ? '#15803d' : '#b91c1c'} suffix="ج.م"
          sub={s.netProfit >= 0 ? 'ربح صافي' : 'خسارة صافية'} delay={0.12} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>الإيرادات مقابل المصروفات</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>آخر 12 شهر</p>
            </div>
            <Link to="/reports"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-50"
              style={{ color: 'var(--color-primary)' }}>
              تقرير مفصل <FaArrowLeft className="text-[10px]" />
            </Link>
          </div>
          <ReactApexChart options={areaOptions} series={[
            { name: 'الإيرادات', data: revData },
            { name: 'المصروفات', data: expData },
          ]} type="area" height={220} />
        </motion.div>

        {/* Donut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="card p-5">
          <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-dark)' }}>حالة الوحدات</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>توزيع الوحدات بالحالة</p>
          {unitData.some(v => v > 0) ? (
            <ReactApexChart options={donutOptions} series={unitData} type="donut" height={210} />
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              {unitStatuses.map((st, i) => (
                <div key={st} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ backgroundColor: `${unitColors[i]}10` }}>
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

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent contracts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <FaFileContract className="text-sm" style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>آخر العقود</h3>
            </div>
            <Link to="/contracts"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}>
              عرض الكل <FaArrowLeft className="text-[10px]" />
            </Link>
          </div>
          {!s.recentContracts?.length ? (
            <div className="px-5 py-12 text-center">
              <FaFileContract className="text-3xl mx-auto mb-3 opacity-10" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>لا توجد عقود بعد</p>
              <Link to="/contracts" className="text-xs font-semibold mt-2 inline-flex items-center gap-1"
                style={{ color: 'var(--color-primary)' }}>
                <FaPlus className="text-[10px]" /> إنشاء أول عقد
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ divideColor: 'var(--color-border)' }}>
              {s.recentContracts.map((c, ri) => (
                <motion.div key={c._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + ri * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))` }}>
                    {c.customerId?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-dark)' }}>{c.customerId?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {c.propertyId?.name} — وحدة {c.unitId?.unitNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-dark)' }}>
                      {fmt(c.totalPrice)} <span className="text-xs font-normal opacity-50">ج.م</span>
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'active'    ? 'bg-green-50 text-green-700' :
                      c.status === 'draft'     ? 'bg-gray-100 text-gray-500'  :
                      c.status === 'completed' ? 'bg-blue-50 text-blue-700'   :
                      'bg-red-50 text-red-600'
                    }`}>
                      {c.status === 'active' ? 'نشط' : c.status === 'draft' ? 'مسودة' : c.status === 'completed' ? 'مكتمل' : c.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="card p-4">
            <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <QuickBtn label="عقد جديد"    icon={FaFileContract}  to="/contracts"    color="#da1f27" />
              <QuickBtn label="عميل جديد"   icon={FaUserTie}       to="/customers"    color="#2563eb" />
              <QuickBtn label="دفعة جديدة"  icon={FaMoneyBillWave} to="/payments"     color="#15803d" />
              <QuickBtn label="فاتورة"       icon={FaFileInvoice}   to="/invoices"     color="#7c3aed" />
              <QuickBtn label="وحدة جديدة"  icon={FaBuilding}      to="/units"        color="#b45309" />
              <QuickBtn label="التقارير"    icon={FaChartBar}      to="/reports"      color="#0891b2" />
            </div>
          </motion.div>

          {/* Upcoming installments */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="card overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <FaCalendarDays className="text-sm" style={{ color: 'var(--color-accent)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>أقساط قادمة</h3>
              </div>
              <Link to="/installments"
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                الكل
              </Link>
            </div>
            {!s.upcomingInstallments?.length ? (
              <div className="px-4 py-8 text-center">
                <FaCircleCheck className="text-2xl mx-auto mb-2" style={{ color: '#15803d', opacity: 0.3 }} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>لا توجد أقساط خلال 30 يوم</p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto max-h-[280px]" style={{ borderColor: 'var(--color-border)' }}>
                {s.upcomingInstallments.map((inst, i) => {
                  const days = daysUntil(inst.installments?.dueDate);
                  const dotColor = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#22c55e';
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
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
                          {days === 0 ? 'اليوم' : days === 1 ? 'غداً' : `${days} يوم`}
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

      {/* ── Top Properties ── */}
      {s.topProperties?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-dark)' }}>أعلى المشاريع إيراداً</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>مرتبة حسب إجمالي الإيرادات</p>
            </div>
            <Link to="/properties"
              className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: 'var(--color-primary)' }}>
              كل المشاريع <FaArrowLeft className="text-[10px]" />
            </Link>
          </div>
          <div className="space-y-4">
            {s.topProperties.map((p, i) => {
              const max = s.topProperties[0]?.revenue || 1;
              const pct = Math.round((p.revenue / max) * 100);
              const ordinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
              return (
                <div key={p._id || i} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? '#fef3c7' : 'var(--color-background)', color: i === 0 ? '#b45309' : 'var(--color-text-muted)' }}>
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
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? 'linear-gradient(90deg, var(--color-primary), #ff7b82)' : 'var(--color-border)' }}
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
};

export default DashboardPage;
