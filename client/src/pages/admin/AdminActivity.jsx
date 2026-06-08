import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Pencil, Trash2, LogIn, RefreshCw, Download, Printer, X, Search } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import EmptyState from "../../Components/UI/EmptyState";
import Pagination from "../../Components/UI/Pagination";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const actionMeta = {
  create: { label: "أضاف",  icon: Plus,    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  update: { label: "عدّل",  icon: Pencil,  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  delete: { label: "حذف",   icon: Trash2,  color: "bg-red-100 dark:bg-red-900/30 text-red-500" },
  login:  { label: "دخل",   icon: LogIn,   color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  logout: { label: "خرج",   icon: LogIn,   color: "bg-gray-100 dark:bg-gray-700 text-gray-500" },
};

const entityAr = {
  project: "مشروع", unit: "وحدة", lead: "عميل", blog: "مقال",
  career: "وظيفة", media: "صورة", user: "مستخدم", auth: "نظام",
  accounting: "حسابات", task: "مهمة", content: "محتوى", setting: "إعداد",
  notification: "إشعار", accounting_record: "سجل محاسبي",
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return "الآن";
  if (diff < 3600)  return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return new Date(date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

export default function AdminActivity() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/activity", { params: { page, limit: 30 } });
      setActivities(res.data.activities);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل سجل النشاط");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const filteredActivities = useMemo(() => {
    let list = activities;
    if (actionFilter !== "all") list = list.filter((a) => a.action === actionFilter);
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      list = list.filter((a) => a.user?.name?.toLowerCase().includes(q));
    }
    return list;
  }, [activities, actionFilter, userSearch]);

  const exportCSV = () => {
    const rows = [
      ["المستخدم", "الإجراء", "الكيان", "التفاصيل", "التاريخ"],
      ...activities.map((a) => [
        a.user?.name || "—",
        a.action,
        a.entity || "—",
        a.details || "—",
        new Date(a.createdAt).toLocaleString("ar-EG"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "activity_log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/activity/${id}`);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      toast.error("فشل حذف السجل");
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await api.delete("/activity/all");
      toast.success("تم مسح سجل النشاط");
      setActivities([]);
      setTotal(0);
      setConfirmClearAll(false);
    } catch {
      toast.error("فشل مسح السجل");
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سجل النشاط</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} حدث مسجّل</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button onClick={() => { setPage(1); load(); }}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
          <button onClick={() => setConfirmClearAll(true)}
            className="flex items-center gap-2 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
            <Trash2 className="w-4 h-4" />
            مسح الكل
          </button>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
        ملاحظة: السجل يُحذف تلقائياً بعد ٧ أيام
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action type chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: "all", label: "الكل" },
            { key: "create", label: "أضاف" },
            { key: "update", label: "عدّل" },
            { key: "delete", label: "حذف" },
            { key: "login", label: "دخل" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActionFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                actionFilter === key
                  ? "bg-[#2d5d89] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {label}
              {key !== "all" && (
                <span className="mr-1 opacity-70">
                  ({activities.filter((a) => a.action === key).length})
                </span>
              )}
            </button>
          ))}
        </div>
        {/* User search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="بحث باسم المستخدم..."
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]/30"
          />
          {userSearch && (
            <button onClick={() => setUserSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : filteredActivities.length === 0 ? (
          <EmptyState icon={Activity} title="لا يوجد نشاط بعد" description="ستظهر هنا كل العمليات التي يقوم بها المستخدمون" />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {filteredActivities.map((act) => {
              const meta = actionMeta[act.action] || actionMeta.update;
              const Icon = meta.icon;
              return (
                <motion.div key={act._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Action icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold">{act.user?.name || "مجهول"}</span>
                      {" "}<span className="text-gray-500">{meta.label}</span>{" "}
                      {act.entityName && (
                        <span className="font-medium text-[#2d5d89]">«{act.entityName}»</span>
                      )}
                      {act.entity && entityAr[act.entity] && (
                        <span className="text-gray-400"> ({entityAr[act.entity]})</span>
                      )}
                    </p>
                    {act.details && (
                      <p className="text-xs text-gray-400 mt-0.5">{act.details}</p>
                    )}
                  </div>

                  {/* User avatar + time + delete */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] text-xs font-bold">
                      {act.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs text-gray-400 min-w-[32px] text-left">{timeAgo(act.createdAt)}</span>
                    <button onClick={() => handleDeleteActivity(act._id)}
                      title="حذف"
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} />

      <ConfirmModal
        open={confirmClearAll}
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClearAll(false)}
        loading={clearingAll}
        title="مسح سجل النشاط"
        message="هل تريد مسح جميع سجلات النشاط؟ لا يمكن التراجع."
      />
    </div>
  );
}
