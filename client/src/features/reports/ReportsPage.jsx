import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import ReactApexChart from 'react-apexcharts';
import { reportsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import {
  FaMoneyBillWave, FaChartLine, FaArrowTrendUp, FaFileExport, FaFilePdf,
  FaChartBar, FaCircleCheck, FaArrowDown, FaArrowUp,
} from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import { exportFinancialReportPDF } from '../../utils/pdfExport';

const fmt    = (n) => Number(n || 0).toLocaleString('ar-EG');
const fmtCur = (n) => `${fmt(n)} ج.م`;
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const ReportsPage = () => {
  const company  = useSelector(s => s.auth.company);
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', startDate, endDate],
    queryFn: () => reportsAPI.getFinancial({ startDate, endDate }).then(r => r.data.data),
  });

  /* ── Build chart data from API revenueByMonth ── */
  const chartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: ARABIC_MONTHS[d.getMonth()] };
    });

    const expByMonth = {};
    (data?.expenses || []).forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      expByMonth[key] = (expByMonth[key] || 0) + (e.amount || 0);
    });

    return {
      categories: months.map(m => m.label),
      revenue:    months.map(m => data?.revenueByMonth?.[m.key] || 0),
      expenses:   months.map(m => expByMonth[m.key] || 0),
    };
  }, [data]);

  /* ── Expense by category ── */
  const expByCategory = useMemo(() => {
    const map = {};
    (data?.expenses || []).forEach(e => {
      map[e.category] = (map[e.category] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([cat, amt]) => ({ cat, amt })).sort((a, b) => b.amt - a.amt).slice(0, 6);
  }, [data]);

  /* ── Exports ── */
  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((data.payments || []).map(p => ({
      'رقم الإيصال': p.receiptNumber || '—',
      'العميل': p.customerId?.name || '—',
      'رقم العقد': p.contractId?.contractNumber || '—',
      'المبلغ': p.amount,
      'التاريخ': p.date ? new Date(p.date).toLocaleDateString('ar-EG') : '—',
      'طريقة الدفع': p.method || '—',
    }))), 'المدفوعات');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet((data.expenses || []).map(e => ({
      'التصنيف': e.category, 'الوصف': e.description || '—', 'المبلغ': e.amount,
      'التاريخ': e.date ? new Date(e.date).toLocaleDateString('ar-EG') : '—',
    }))), 'المصروفات');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      'إجمالي الإيرادات': data.totalRevenue, 'إجمالي المصروفات': data.totalExpenses, 'صافي الربح': data.netProfit,
    }]), 'ملخص');
    XLSX.writeFile(wb, `تقرير-مالي-${Date.now()}.xlsx`);
  };

  /* ── Chart configs ── */
  const chartFont = { fontFamily: 'Tajawal, sans-serif' };
  const barOpts = {
    chart: { type: 'bar', toolbar: { show: false }, ...chartFont },
    colors: ['#059669', '#c8161d'],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '55%', borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, labels: { style: { ...chartFont, fontSize: '11px' } } },
    yaxis: { labels: { formatter: fmt, style: { ...chartFont, fontSize: '11px' } } },
    legend: { position: 'top', ...chartFont, fontSize: '12px' },
    grid: { borderColor: '#f0ece8', strokeDashArray: 4 },
    tooltip: { y: { formatter: fmtCur } },
  };

  const areaOpts = {
    chart: { type: 'area', toolbar: { show: false }, ...chartFont },
    colors: ['#059669'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } },
    stroke: { curve: 'smooth', width: 2.5 },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories, labels: { style: { ...chartFont, fontSize: '11px' } } },
    yaxis: { labels: { formatter: fmt, style: { ...chartFont, fontSize: '11px' } } },
    grid: { borderColor: '#f0ece8', strokeDashArray: 4 },
    tooltip: { y: { formatter: fmtCur } },
  };

  const donutOpts = {
    chart: { type: 'donut', ...chartFont },
    colors: ['#c8161d', '#fbb140', '#059669', '#2563eb', '#7c3aed', '#0891b2'],
    labels: expByCategory.map(e => e.cat),
    legend: { position: 'bottom', ...chartFont },
    plotOptions: { pie: { donut: { size: '65%' } } },
    tooltip: { y: { formatter: fmtCur } },
  };

  const profit = data?.netProfit || 0;
  const profitPositive = profit >= 0;

  const TABS = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'payments', label: `المدفوعات (${data?.payments?.length || 0})` },
    { id: 'expenses', label: `المصروفات (${data?.expenses?.length || 0})` },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="التقارير المالية"
        subtitle="تحليل شامل للأداء المالي"
        stats={[
          { label: 'إيرادات', value: fmtCur(data?.totalRevenue), icon: FaArrowUp,   color: '#059669' },
          { label: 'مصروفات', value: fmtCur(data?.totalExpenses), icon: FaArrowDown, color: '#c8161d' },
          { label: 'صافي',    value: fmtCur(Math.abs(profit)),    icon: FaChartBar, color: profitPositive ? '#059669' : '#c8161d' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}><FaFileExport /> Excel</Button>
            <Button variant="outline" size="sm" onClick={() => exportFinancialReportPDF(data || {}, startDate && endDate ? { start: startDate, end: endDate } : null, company)}>
              <FaFilePdf className="text-red-600" /> PDF
            </Button>
          </div>
        }
      />

      {/* Date filter */}
      <div className="card p-4 mb-5 flex flex-wrap gap-4 items-end">
        <Input label="من تاريخ" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-48" />
        <Input label="إلى تاريخ" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-48" />
        {(startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); }}>مسح الفلتر</Button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard title="إجمالي الإيرادات"  value={data?.totalRevenue  || 0} icon={<FaArrowUp  />} color="success" suffix="ج.م" delay={0}    />
        <StatCard title="إجمالي المصروفات" value={data?.totalExpenses || 0} icon={<FaArrowDown />} color="primary" suffix="ج.م" delay={0.07} />
        <StatCard title="صافي الربح"        value={Math.abs(profit)}        icon={profitPositive ? <FaArrowTrendUp /> : <FaChartLine />} color={profitPositive ? 'success' : 'primary'} suffix="ج.م" sub={profitPositive ? 'ربح' : 'خسارة'} delay={0.14} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2.5 text-sm font-semibold transition-colors relative"
            style={{ color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            {t.label}
            {activeTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--color-primary)' }} />}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-text-dark)' }}>مقارنة الإيرادات والمصروفات — آخر 6 أشهر</h3>
            <ReactApexChart options={barOpts} series={[{ name: 'الإيرادات', data: chartData.revenue }, { name: 'المصروفات', data: chartData.expenses }]} type="bar" height={280} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-text-dark)' }}>منحنى الإيرادات</h3>
              <ReactApexChart options={areaOpts} series={[{ name: 'الإيرادات', data: chartData.revenue }]} type="area" height={220} />
            </div>
            <div className="card p-5">
              <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-text-dark)' }}>المصروفات حسب التصنيف</h3>
              {expByCategory.length > 0
                ? <ReactApexChart options={donutOpts} series={expByCategory.map(e => e.amt)} type="donut" height={220} />
                : <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--color-text-faint)' }}>لا توجد مصروفات في هذه الفترة</div>
              }
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b font-semibold text-sm flex items-center gap-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dark)' }}>
              <FaCircleCheck className="text-green-600 text-xs" /> أحدث المدفوعات
            </div>
            <table className="table text-sm">
              <thead><tr><th>العميل</th><th>رقم العقد</th><th>المبلغ</th><th>التاريخ</th></tr></thead>
              <tbody>
                {(data?.payments || []).slice(0, 6).map(p => (
                  <tr key={p._id}>
                    <td className="font-medium">{p.customerId?.name || '—'}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-primary)' }}>{p.contractId?.contractNumber || '—'}</td>
                    <td className="font-bold text-green-700">{fmtCur(p.amount)}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{p.date ? new Date(p.date).toLocaleDateString('ar-EG') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text-dark)' }}>جميع المدفوعات ({data?.payments?.length || 0})</span>
            <Button variant="outline" size="sm" onClick={exportExcel}><FaFileExport /> تصدير</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="table text-sm">
              <thead><tr><th>رقم الإيصال</th><th>العميل</th><th>رقم العقد</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th></tr></thead>
              <tbody>
                {(data?.payments || []).map(p => (
                  <tr key={p._id}>
                    <td className="font-mono text-xs">{p.receiptNumber || '—'}</td>
                    <td className="font-medium">{p.customerId?.name || '—'}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--color-primary)' }}>{p.contractId?.contractNumber || '—'}</td>
                    <td className="font-bold text-green-700">{fmtCur(p.amount)}</td>
                    <td><Badge color="info">{{ cash: 'كاش', bank: 'تحويل بنكي', check: 'شيك', installments: 'تقسيط' }[p.method] || p.method || '—'}</Badge></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{p.date ? new Date(p.date).toLocaleDateString('ar-EG') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {expByCategory.map(({ cat, amt }, i) => (
              <div key={i} className="card p-4">
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{cat}</p>
                <p className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>{fmtCur(amt)}</p>
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <div className="h-full rounded-full" style={{ background: 'var(--color-primary)', width: `${Math.min(100, (amt / (data?.totalExpenses || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="table text-sm">
              <thead><tr><th>التصنيف</th><th>الوصف</th><th>المبلغ</th><th>التاريخ</th></tr></thead>
              <tbody>
                {(data?.expenses || []).map(e => (
                  <tr key={e._id}>
                    <td><Badge color="warning">{e.category}</Badge></td>
                    <td style={{ color: 'var(--color-text-medium)' }}>{e.description || '—'}</td>
                    <td className="font-bold text-red-700">{fmtCur(e.amount)}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{e.date ? new Date(e.date).toLocaleDateString('ar-EG') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
