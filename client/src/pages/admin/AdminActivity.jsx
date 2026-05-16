import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Pencil, Trash2, LogIn, RefreshCw, Download, Printer } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import EmptyState from "../../Components/UI/EmptyState";
import Pagination from "../../Components/UI/Pagination";
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : activities.length === 0 ? (
          <EmptyState icon={Activity} title="لا يوجد نشاط بعد" description="ستظهر هنا كل العمليات التي يقوم بها المستخدمون" />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {activities.map((act) => {
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

                  {/* User avatar + time */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] text-xs font-bold">
                      {act.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs text-gray-400 min-w-[32px] text-left">{timeAgo(act.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} />
    </div>
  );
}
