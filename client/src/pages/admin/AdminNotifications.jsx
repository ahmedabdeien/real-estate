import { useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Pagination from "../../Components/UI/Pagination";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "all", label: "الكل" },
  { value: "unread", label: "غير المقروءة" },
  { value: "task_assigned", label: "مهام مسندة" },
  { value: "task_updated", label: "مهام محدثة" },
];

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

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {items.length} إشعار · {unreadCount} غير مقروء
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          تحديد الكل كمقروء
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((ft) => (
          <button
            key={ft.value}
            onClick={() => setFilter(ft.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === ft.value
                ? "bg-[#2d5d89] text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {ft.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : pageItems.length === 0 ? (
          <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر إشعاراتك هنا" />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {pageItems.map((n) => (
              <motion.li
                key={n._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 flex items-start gap-3 ${!n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !n.read ? "bg-[#2d5d89] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                  </div>
                  {n.body && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.body}</p>}
                  {n.link && (
                    <a href={n.link} className="text-xs text-[#2d5d89] hover:underline mt-1 inline-block">
                      فتح الرابط
                    </a>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n._id)}
                    title="تحديد كمقروء"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination page={page} pages={pages} onPage={setPage} />
      )}
    </div>
  );
}
