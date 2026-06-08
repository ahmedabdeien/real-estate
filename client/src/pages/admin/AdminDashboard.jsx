import { useEffect, useState } from "react";
import {
  Building2, Home, TrendingUp, FileText, ArrowUpRight, Clock,
  CheckCircle2, XCircle, CalendarDays, Plus, Pencil, Trash2, LogIn,
  Activity, Users, Target, BarChart2, Layers, AlertTriangle, Zap,
  RefreshCw, UserPlus, CalendarCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Funnel, FunnelChart, LabelList
} from "recharts";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useAuth } from "../../context/AuthContext";
import InlineAiChat from "../../Components/UI/InlineAiChat";

const actionMeta = {
  create: { label: "أضاف",  icon: Plus,   color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" },
  update: { label: "عدّل",  icon: Pencil, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/30" },
  delete: { label: "حذف",   icon: Trash2, color: "text-red-500 bg-red-50 dark:bg-red-900/30" },
  login:  { label: "دخل",   icon: LogIn,  color: "text-purple-500 bg-purple-50 dark:bg-purple-900/30" },
};
const entityAr = { project: "مشروع", unit: "وحدة", lead: "عميل", blog: "مقال", career: "وظيفة", auth: "نظام" };

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "الآن";
  if (s < 3600) return `${Math.floor(s/60)} د`;
  if (s < 86400) return `${Math.floor(s/3600)} س`;
  return new Date(d).toLocaleDateString("ar-EG", { month:"short", day:"numeric" });
}

function StatCard({ icon: Icon, label, value, color, sub, to, delay = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {to && (
          <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#2d5d89] transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function QuickActions() {
  const actions = [
    { to: "/admin/projects", label: "مشروع جديد", icon: Building2, color: "bg-[#2d5d89]/10 text-[#2d5d89]" },
    { to: "/admin/units",    label: "وحدة جديدة",  icon: Home,      color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
    { to: "/admin/leads",    label: "عميل جديد",   icon: TrendingUp,color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
    { to: "/admin/blogs",    label: "مقال جديد",   icon: FileText,  color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-2.5 p-3 rounded-xl ${color} hover:opacity-80 transition-opacity`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Donut chart for units availability
const DONUT_COLORS = ["#10b981", "#ef4444", "#f59e0b"];
function UnitsDonut({ available = 0, sold = 0, reserved = 0 }) {
  const total = available + sold + reserved || 1;
  const data = [
    { name: "متاح", value: available },
    { name: "مباع", value: sold },
    { name: "محجوز", value: reserved },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">توزيع الوحدات</h3>
        <Link to="/admin/units" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
          عرض الكل <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: 110, height: 110 }}>
          <PieChart width={110} height={110}>
            <Pie data={data} cx={50} cy={50} innerRadius={32} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
              {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-400">وحدة</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
                <span className="text-gray-400 text-xs">({Math.round((d.value/total)*100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sales funnel: leads by status
const FUNNEL_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];
function SalesFunnelChart({ leadsByStatus }) {
  const steps = [
    { key: "new",       label: "جديد",         fill: "#3b82f6" },
    { key: "contacted", label: "تم التواصل",    fill: "#f59e0b" },
    { key: "interested",label: "مهتم",          fill: "#10b981" },
    { key: "converted", label: "تحويل",         fill: "#2d5d89" },
  ];
  const data = steps.map((s) => ({ name: s.label, value: leadsByStatus[s.key] || 0, fill: s.fill }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">قمع المبيعات</h3>
        <Link to="/admin/leads" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
          العملاء <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip formatter={(v) => [v, "عميل"]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Revenue vs Target bar chart
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
function RevenueChart({ financialData }) {
  // Build last 6 months labels
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { month: MONTHS_AR[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()+1}` };
  });

  const revenueMap = {};
  if (financialData?.monthlyRevenue) {
    financialData.monthlyRevenue.forEach((r) => { revenueMap[`${r._id?.year}-${r._id?.month}`] = r.total; });
  }

  const data = months.map((m) => ({
    name: m.month,
    "الإيرادات الفعلية": revenueMap[m.key] || 0,
    "الهدف": financialData?.monthlyTarget || 500000,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">الإيرادات مقابل الهدف (6 أشهر)</h3>
        <Link to="/admin/accounting" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
          المحاسبة <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
          <Tooltip formatter={(v) => [v.toLocaleString("ar-EG") + " ج.م", undefined]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="الإيرادات الفعلية" fill="#2d5d89" radius={[4,4,0,0]} />
          <Bar dataKey="الهدف" fill="#e5e7eb" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Recent sales table (converted leads)
function RecentSalesTable({ leads }) {
  const converted = (leads || []).filter((l) => l.status === "converted").slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">آخر المبيعات المحوّلة</h3>
        <Link to="/admin/leads" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
          عرض الكل <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {converted.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">لا توجد مبيعات محوّلة بعد</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                {["الاسم","المشروع","التاريخ","الحالة"].map((h) => (
                  <th key={h} className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {converted.map((l) => {
                const { label, variant } = statusBadge(l.status);
                return (
                  <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{l.name}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{l.interestedProject?.name?.ar || "—"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(l.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td className="px-5 py-3"><Badge variant={variant}>{label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Performance cards
function PerformanceCards({ stats, recentLeads, leadsByStatus }) {
  // Top project: count converted leads per project
  const projectCounts = {};
  (recentLeads || []).forEach((l) => {
    if (l.interestedProject?.name?.ar) {
      const name = l.interestedProject.name.ar;
      projectCounts[name] = (projectCounts[name] || 0) + 1;
    }
  });
  const topProject = Object.entries(projectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // Conversion rate
  const total = Object.values(leadsByStatus || {}).reduce((a, b) => a + b, 0) || 1;
  const converted = leadsByStatus?.converted || 0;
  const convRate = Math.round((converted / total) * 100);

  const cards = [
    { label: "أعلى مشروع مبيعاً", value: topProject, icon: Building2, color: "bg-[#2d5d89]" },
    { label: "نسبة التحويل", value: `${convRate}%`, icon: Target, color: "bg-emerald-500" },
    { label: "عملاء هذا الشهر", value: stats?.newLeads ?? "—", icon: Users, color: "bg-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
            <c.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [financial, setFinancial] = useState(null);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setData(r.data)).finally(() => setLoading(false));
    api.get("/activity", { params: { limit: 8 } }).then((r) => setActivities(r.data.activities || [])).catch(() => {});
    api.get("/accounting/financial-summary", { params: { branch: "main" } }).then((r) => setFinancial(r.data)).catch(() => {});
  }, []);

  if (loading) return <LoadingSpinner className="h-64" size="lg" />;
  if (!data) return null;

  const { stats, recentLeads, leadsByStatus: leadsArr } = data;
  const unitsByStatus = stats.unitsByStatus || {};
  const leadsByStatus = (leadsArr || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Today stats (computed from recentLeads)
  const todayStr = new Date().toLocaleDateString("ar-EG");
  const todayLeads = (recentLeads || []).filter((l) =>
    new Date(l.createdAt).toLocaleDateString("ar-EG") === todayStr
  ).length;
  const overdueFollowUps = (recentLeads || []).filter((l) =>
    l.followUpDate && new Date(l.followUpDate) < new Date() && l.status !== "converted" && l.status !== "lost"
  ).length;

  // Build 6 stat cards
  const totalSales = financial?.totalRevenue ?? 0;
  const pendingTasks = financial?.pendingTasks ?? stats?.pendingTasks ?? "—";
  const convRate = (() => {
    const total = Object.values(leadsByStatus).reduce((a, b) => a + b, 0) || 1;
    return Math.round(((leadsByStatus.converted || 0) / total) * 100) + "%";
  })();

  const statCards = [
    { icon: Building2, label: "المشاريع",           value: stats.totalProjects,          color: "bg-[#2d5d89]",   to: "/admin/projects", delay: 0 },
    { icon: Home,      label: "الوحدات المتاحة",     value: unitsByStatus.available || 0, color: "bg-emerald-500", to: "/admin/units",    delay: 0.05 },
    { icon: Users,     label: "عملاء هذا الشهر",     value: stats.newLeads || 0,          color: "bg-amber-500",   to: "/admin/leads",    delay: 0.1 },
    { icon: TrendingUp,label: "إجمالي المبيعات",     value: totalSales ? totalSales.toLocaleString("ar-EG") + " ج" : "—", color: "bg-purple-500",  to: "/admin/accounting", delay: 0.15 },
    { icon: Clock,     label: "المهام المعلقة",       value: pendingTasks,                 color: "bg-rose-500",    to: "/admin/tasks",    delay: 0.2 },
    { icon: BarChart2, label: "نسبة التحويل",        value: convRate,                     color: "bg-teal-500",    delay: 0.25 },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}، {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" />
          {now.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Today at a glance */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3">
        {[
          {
            icon: UserPlus, label: "عميل جديد اليوم", value: todayLeads,
            color: todayLeads > 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500",
            to: "/admin/leads"
          },
          {
            icon: AlertTriangle, label: "متابعة متأخرة", value: overdueFollowUps,
            color: overdueFollowUps > 0 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400",
            to: "/admin/leads"
          },
          {
            icon: Zap, label: "وحدات متاحة", value: unitsByStatus.available || 0,
            color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400",
            to: "/admin/units"
          },
        ].map(({ icon: Icon, label, value, color, to }) => (
          <Link key={label} to={to}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:shadow-sm ${color}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs opacity-75">{label}:</span>
            <span className="font-bold text-base">{value}</span>
          </Link>
        ))}
        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-400 mr-auto">
          <RefreshCw className="w-3.5 h-3.5" />
          آخر تحديث: {now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </motion.div>

      {/* 6-card Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesFunnelChart leadsByStatus={leadsByStatus} />
        <RevenueChart financialData={financial} />
      </div>

      {/* Donut + Quick Actions + Lead status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UnitsDonut
          available={unitsByStatus.available}
          sold={unitsByStatus.sold}
          reserved={unitsByStatus.reserved}
        />
        <QuickActions />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">حالة العملاء</h3>
            <Link to="/admin/leads" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
              عرض الكل <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { label: "جديد",      key: "new",            icon: Clock,         color: "text-blue-500" },
              { label: "تم التواصل",key: "contacted",       icon: Activity,      color: "text-amber-500" },
              { label: "مهتم",      key: "interested",      icon: TrendingUp,    color: "text-purple-500" },
              { label: "محوّل",     key: "converted",       icon: CheckCircle2,  color: "text-emerald-500" },
              { label: "غير مهتم", key: "not_interested",   icon: XCircle,       color: "text-red-400" },
            ].map(({ label, key, icon: Icon, color }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {leadsByStatus[key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <PerformanceCards stats={stats} recentLeads={recentLeads} leadsByStatus={leadsByStatus} />

      {/* Recent Sales Table */}
      <RecentSalesTable leads={recentLeads} />

      {/* Recent Leads */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">آخر العملاء المحتملين</h2>
          <Link to="/admin/leads" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
            عرض الكل <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {!recentLeads?.length && (
            <p className="text-center text-gray-400 py-8 text-sm">لا توجد عملاء بعد</p>
          )}
          {recentLeads?.map((lead) => {
            const { label, variant } = statusBadge(lead.status);
            return (
              <motion.div key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-bold text-sm flex-shrink-0">
                  {lead.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{lead.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{lead.phone}</p>
                </div>
                <div className="text-left shrink-0">
                  <Badge variant={variant}>{label}</Badge>
                  {lead.interestedProject && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">
                      {lead.interestedProject.name?.ar}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">آخر نشاط الفريق</h2>
            </div>
            <Link to="/admin/activity" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
              السجل كامل <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {activities.map((act) => {
              const meta = actionMeta[act.action] || actionMeta.update;
              const Icon = meta.icon;
              return (
                <div key={act._id} className="flex items-center gap-3 px-6 py-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                    <span className="font-medium text-gray-900 dark:text-white">{act.user?.name}</span>
                    {" "}{meta.label}{" "}
                    {act.entityName && <span className="text-[#2d5d89]">«{act.entityName}»</span>}
                    {act.entity && entityAr[act.entity] && <span> ({entityAr[act.entity]})</span>}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(act.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <InlineAiChat context="general" />
    </div>
  );
}
