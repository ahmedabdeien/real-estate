import { useEffect, useMemo, useState } from "react";
import { Bell, Briefcase, Check, CheckCheck, CheckSquare, ClipboardList, RefreshCw, Trash2, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "all",                label: "الكل" },
  { value: "unread",             label: "غير المقروءة" },
  { value: "new_lead",           label: "عملاء جدد" },
  { value: "new_job_application",label: "وظائف" },
  { value: "task_assigned",      label: "مهام مسندة" },
  { value: "task_updated",       label: "مهام محدثة" },
];

const TYPE_ICON = {
  new_lead:            { Icon: Users,        bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-600" },
  new_job_application: { Icon: Briefcase,    bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600" },
  task_assigned:       { Icon: ClipboardList,bg: "bg-purple-100 dark:bg-purple-900/30",text: "text-purple-600" },
  task_updated:        { Icon: CheckSquare,  bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600" },
  default:             { Icon: Bell,         bg: "bg-gray-100 dark:bg-gray-700",       text: "text-gray-500" },
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleString("ar-EG", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

export default function AdminNotifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setItems(res.data.notifications || []);
    } catch {
      toast.error("فشل تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      toast.error("فشل تحديد الإشعار");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("تم تحديد الكل كمقروء");
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setItems((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("فشل حذف الإشعار");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setItems([]);
      toast.success("تم مسح جميع الإشعارات");
    } catch {
      toast.error("فشل مسح الإشعارات");
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) await markRead(n._id);
    if (n.link) navigate(n.link);
  };

  const unreadCount = items.filter((n) => !n.read).length;

  const typeCounts = useMemo(() => {
    const counts = {};
    items.forEach((n) => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return counts;
  }, [items]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {items.length} إشعار · {unreadCount} غير مقروء
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            تحديد الكل كمقروء
          </button>
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            مسح الكل
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((ft) => {
          const count = ft.value === "all" ? items.length
            : ft.value === "unread" ? unreadCount
            : (typeCounts[ft.value] || 0);
          return (
            <button
              key={ft.value}
              onClick={() => setFilter(ft.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === ft.value
                  ? "bg-[#2d5d89] text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {ft.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  filter === ft.value ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : pageItems.length === 0 ? (
          <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر إشعاراتك هنا" />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {pageItems.map((n) => {
              const { Icon, bg, text } = TYPE_ICON[n.type] || TYPE_ICON.default;
              return (
                <motion.li
                  key={n._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 flex items-start gap-3 transition-colors ${
                    !n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                  } ${n.link ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" : ""}`}
                  onClick={() => n.link && handleNotificationClick(n)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !n.read ? `bg-[#2d5d89] text-white` : `${bg} ${text}`
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2d5d89] flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                    </div>
                    {n.body && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.body}</p>}
                    {n.link && (
                      <span className="text-xs text-[#2d5d89] mt-1 inline-block">اضغط للفتح ←</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        title="تحديد كمقروء"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n._id)}
                      title="حذف الإشعار"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination page={page} pages={pages} onPage={setPage} />
      )}
    </div>
  );
}
