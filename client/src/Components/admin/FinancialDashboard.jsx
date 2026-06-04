import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, BookOpen, Plus, FileText, Upload,
  RefreshCw, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

const CHART_COLORS = ["#2d5d89","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16"];

function KpiCard({ title, value, icon: Icon, iconBg, trend, trendLabel, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatArabic(num) {
  if (num === undefined || num === null) return "—";
  return Number(num).toLocaleString("ar-EG") + " ج";
}

const MONTH_NAMES_AR = {
  "01": "يناير","02": "فبراير","03": "مارس","04": "أبريل","05": "مايو","06": "يونيو",
  "07": "يوليو","08": "أغسطس","09": "سبتمبر","10": "أكتوبر","11": "نوفمبر","12": "ديسمبر",
};

export default function FinancialDashboard({ branch, onNewLedger, onImportExcel, onOpenLedger }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/accounting/financial-summary${branch ? `?branch=${branch}` : ""}`);
      setSummary(r.data);
    } catch (e) {
      setError("فشل تحميل الملخص المالي");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [branch]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-[#2d5d89] text-white rounded-xl text-sm">إعادة المحاولة</button>
      </div>
    </div>
  );

  const { totalIncome=0, totalExpense=0, netBalance=0, ledgerCount=0, monthlyTrend=[], byCategory=[], recentRows=[] } = summary || {};

  const barData = monthlyTrend.map(m => ({
    name: MONTH_NAMES_AR[m.month?.split("-")[1]] || m.month,
    الإيرادات: m.income,
    المصروفات: m.expense,
  }));

  return (
    <div className="flex-1 overflow-auto p-5 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">لوحة التحكم المالية</h2>
          <p className="text-sm text-gray-400">نظرة عامة على الأداء المالي</p>
        </div>
        <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="تحديث">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي الإيرادات"
          value={formatArabic(totalIncome)}
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          title="إجمالي المصروفات"
          value={formatArabic(totalExpense)}
          icon={TrendingDown}
          iconBg="bg-red-50 text-red-500"
        />
        <KpiCard
          title="صافي الرصيد"
          value={formatArabic(netBalance)}
          icon={DollarSign}
          iconBg={netBalance >= 0 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-500"}
          sub={netBalance >= 0 ? "فائض" : "عجز"}
        />
        <KpiCard
          title="عدد الدفاتر"
          value={ledgerCount.toLocaleString("ar-EG")}
          icon={BookOpen}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">الإيرادات مقابل المصروفات</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => (v/1000).toFixed(0) + "ك"} />
                <Tooltip formatter={(v) => formatArabic(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="الإيرادات" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="المصروفات" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">لا توجد بيانات شهرية</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">توزيع الإنفاق بالفئات</h3>
          {byCategory.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatArabic(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 overflow-auto max-h-[220px]">
                {byCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="flex-1 text-gray-700 truncate">{cat.name}</span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">{formatArabic(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">لا توجد فئات</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">أحدث الإدخالات</h3>
        </div>
        {recentRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-2.5 text-right font-semibold">الدفتر</th>
                  <th className="px-4 py-2.5 text-right font-semibold">الجدول</th>
                  <th className="px-4 py-2.5 text-right font-semibold">البيان</th>
                  <th className="px-4 py-2.5 text-right font-semibold">المبلغ</th>
                  <th className="px-4 py-2.5 text-right font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-2.5 text-gray-700 font-medium truncate max-w-[120px]">{row.ledgerName}</td>
                    <td className="px-4 py-2.5 text-gray-500 truncate max-w-[100px]">{row.sheetName}</td>
                    <td className="px-4 py-2.5 text-gray-700 truncate max-w-[150px]">{row.description || "—"}</td>
                    <td className="px-4 py-2.5 font-semibold text-[#2d5d89] whitespace-nowrap">{formatArabic(row.amount)}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                      {row.date ? new Date(row.date).toLocaleDateString("ar-EG") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-300 text-sm">لا توجد إدخالات حتى الآن</div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onNewLedger}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-semibold hover:bg-[#245079] shadow transition-colors">
          <Plus className="w-4 h-4" /> إضافة دفتر جديد
        </button>
        <button onClick={onImportExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38] shadow transition-colors">
          <Upload className="w-4 h-4" /> استيراد Excel
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors">
          <FileText className="w-4 h-4" /> تقرير مالي
        </button>
      </div>
    </div>
  );
}
