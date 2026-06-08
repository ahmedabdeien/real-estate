import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import {
  FaBuilding,
  FaHouse,
  FaUsers,
  FaListCheck,
  FaArrowUpRightFromSquare,
  FaPlus,
  FaPhone,
  FaClock,
  FaCircleCheck,
  FaCircleExclamation,
} from "react-icons/fa6";
import {
  useDashboardStats,
  useRecentLeads,
  usePendingTasks,
  useLeadsChartData,
  useLeadsStatusData,
} from "../../hooks/queries/useDashboard";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";

// ─── helpers ───────────────────────────────────────────────────────────────

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "الآن";
  if (s < 3600) return `${Math.floor(s / 60)} د`;
  if (s < 86400) return `${Math.floor(s / 3600)} س`;
  return new Date(d).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

const STATUS_STYLES = {
  جديد: { bg: "#fef3c7", color: "#92400e" },
  "تم التواصل": { bg: "#dbeafe", color: "#1e40af" },
  مهتم: { bg: "#dcfce7", color: "#166534" },
  "غير مهتم": { bg: "#fee2e2", color: "#991b1b" },
  "تم البيع": { bg: "#ede9fe", color: "#5b21b6" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{ backgroundColor: style.bg, color: style.color }}
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      {status}
    </span>
  );
}

const PRIORITY_STYLES = {
  عالية: { bg: "#fee2e2", color: "#991b1b" },
  متوسطة: { bg: "#fef3c7", color: "#92400e" },
  منخفضة: { bg: "#dcfce7", color: "#166534" },
};

function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{ backgroundColor: style.bg, color: style.color }}
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      {priority}
    </span>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconBg, to, delay = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg || "var(--primary)" }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {to && (
          <FaArrowUpRightFromSquare className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[color:var(--primary)] transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
        {value ?? "—"}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );

  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads = [], isLoading: leadsLoading } = useRecentLeads();
  const { data: pendingTasks = [], isLoading: tasksLoading } = usePendingTasks();
  const { data: chartData = [], isLoading: chartLoading } = useLeadsChartData();
  const { data: statusData = [], isLoading: statusLoading } = useLeadsStatusData();

  // ── Bar chart config ──
  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      dir: "rtl",
      fontFamily: "Cairo, sans-serif",
    },
    colors: ["var(--primary, #8A6924)"],
    plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.map((d) => d.label),
      labels: { style: { fontFamily: "Cairo, sans-serif", fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { fontFamily: "Cairo, sans-serif", fontSize: "12px" } },
    },
    grid: { borderColor: "#e5e7eb" },
    tooltip: {
      y: { formatter: (v) => `${v} عميل` },
      style: { fontFamily: "Cairo, sans-serif" },
    },
  };
  const barSeries = [{ name: "عملاء", data: chartData.map((d) => d.count) }];

  // ── Donut chart config ──
  const donutOptions = {
    chart: { type: "donut", fontFamily: "Cairo, sans-serif" },
    labels: statusData.map((d) => d.name),
    colors: statusData.map((d) => d.color),
    legend: {
      position: "bottom",
      fontFamily: "Cairo, sans-serif",
      fontSize: "13px",
    },
    dataLabels: { enabled: true, style: { fontFamily: "Cairo, sans-serif" } },
    plotOptions: { pie: { donut: { size: "65%" } } },
    tooltip: { style: { fontFamily: "Cairo, sans-serif" } },
  };
  const donutSeries = statusData.map((d) => d.value);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            لوحة التحكم
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            نظرة عامة على المشاريع والعملاء والمهام
          </p>
        </div>
        <Link
          to="/admin/leads/new"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          عميل جديد
        </Link>
      </motion.div>

      {/* ── Stats row ── */}
      {statsLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={FaBuilding}
            label="المشاريع"
            value={stats?.projectsCount}
            iconBg="var(--primary)"
            to="/admin/projects"
            delay={0}
          />
          <StatCard
            icon={FaHouse}
            label="الوحدات"
            value={stats?.unitsCount}
            iconBg="var(--secondary)"
            to="/admin/units"
            delay={0.05}
          />
          <StatCard
            icon={FaUsers}
            label="العملاء"
            value={stats?.leadsCount}
            iconBg="var(--accent)"
            to="/admin/leads"
            delay={0.1}
          />
          <StatCard
            icon={FaListCheck}
            label="المهام المعلقة"
            value={stats?.tasksCount}
            iconBg="#6366f1"
            to="/admin/tasks"
            delay={0.15}
          />
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-4">
            العملاء الجدد بالشهر
          </h2>
          {chartLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : (
            <ReactApexChart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={260}
            />
          )}
        </motion.div>

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-4">
            توزيع حالة العملاء
          </h2>
          {statusLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : donutSeries.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-sm">لا توجد بيانات</p>
          ) : (
            <ReactApexChart
              options={donutOptions}
              series={donutSeries}
              type="donut"
              height={260}
            />
          )}
        </motion.div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
              آخر العملاء
            </h2>
            <Link
              to="/admin/leads"
              className="text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              عرض الكل
            </Link>
          </div>
          {leadsLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">لا يوجد عملاء</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {recentLeads.map((lead, i) => (
                <div
                  key={lead._id || i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {lead.name?.charAt(0) || "؟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaPhone className="w-2.5 h-2.5" />
                      {lead.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FaClock className="w-2.5 h-2.5" />
                      {timeAgo(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
              المهام المعلقة
            </h2>
            <Link
              to="/admin/tasks"
              className="text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              عرض الكل
            </Link>
          </div>
          {tasksLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : pendingTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">لا توجد مهام معلقة</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {pendingTasks.map((task, i) => (
                <div
                  key={task._id || i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <FaCircleExclamation
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--accent)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <FaClock className="w-2.5 h-2.5" />
                        {new Date(task.dueDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  {task.priority && <PriorityBadge priority={task.priority} />}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
