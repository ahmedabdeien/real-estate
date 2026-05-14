import { useEffect, useState } from "react";
import { Building2, Home, TrendingUp, FileText, ArrowUpRight, Clock, CheckCircle2, XCircle, CalendarDays, Plus, Pencil, Trash2, LogIn, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useAuth } from "../../context/AuthContext";

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

function UnitStatusBar({ available = 0, sold = 0, reserved = 0 }) {
  const total = available + sold + reserved || 1;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">حالة الوحدات</h3>
        <Link to="/admin/units" className="text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
          عرض الكل <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {[
          { label: "متاحة", value: available, total, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
          { label: "مباعة",  value: sold,      total, color: "bg-red-400",    text: "text-red-500 dark:text-red-400" },
          { label: "محجوزة", value: reserved,  total, color: "bg-amber-400",  text: "text-amber-600 dark:text-amber-400" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className={`font-semibold ${item.text}`}>{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.total) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`${item.color} h-2 rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setData(r.data)).finally(() => setLoading(false));
    api.get("/activity", { params: { limit: 8 } }).then((r) => setActivities(r.data.activities || [])).catch(() => {});
  }, []);

  if (loading) return <LoadingSpinner className="h-64" size="lg" />;
  if (!data) return null;

  const { stats, recentLeads, leadsByStatus: leadsArr } = data;
  const unitsByStatus = stats.unitsByStatus || {};
  // Convert leadsByStatus array [{_id, count}] → object {new: N, ...}
  const leadsByStatus = (leadsArr || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="المشاريع" value={stats.totalProjects}
          color="bg-[#2d5d89]" to="/admin/projects" delay={0} />
        <StatCard icon={Home} label="الوحدات" value={stats.totalUnits}
          color="bg-emerald-500" sub={`${unitsByStatus.available || 0} متاح`}
          to="/admin/units" delay={0.05} />
        <StatCard icon={TrendingUp} label="العملاء" value={stats.totalLeads}
          color="bg-amber-500" sub={`${stats.newLeads || 0} جديد هذا الشهر`}
          to="/admin/leads" delay={0.1} />
        <StatCard icon={FileText} label="المقالات" value={stats.totalBlogs}
          color="bg-purple-500" to="/admin/blogs" delay={0.15} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Unit status bar */}
        <UnitStatusBar
          available={unitsByStatus.available}
          sold={unitsByStatus.sold}
          reserved={unitsByStatus.reserved}
        />

        {/* Quick actions */}
        <QuickActions />

        {/* Mini lead status */}
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
              { label: "محوّل",     key: "converted",      icon: CheckCircle2,  color: "text-emerald-500" },
              { label: "غير مهتم", key: "not_interested",  icon: XCircle,       color: "text-red-400" },
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

      {/* Recent Leads */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">آخر العملاء المحتملين</h2>
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
                className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
    </div>
  );
}
