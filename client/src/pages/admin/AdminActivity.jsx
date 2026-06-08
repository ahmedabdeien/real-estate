/**
 * AdminActivity — migrated to TanStack Query + shared UI components + FA6 icons
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaClockRotateLeft, FaPlus, FaPen, FaTrash, FaArrowRightToBracket,
  FaArrowsRotate, FaDownload, FaPrint, FaMagnifyingGlass, FaXmark, FaSpinner,
} from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import PageHeader, { SecondaryButton, DangerButton } from "../../Components/UI/PageHeader";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { inputCls } from "../../Components/UI/FormField";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useTableState } from "../../hooks/useTableState";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/axios";
import { t } from "../../lib/t";

// ── Constants ──────────────────────────────────────────────────────────────
const ACTION_META = {
  create: { label: "أضاف",  Icon: FaPlus,                color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  update: { label: "عدّل",  Icon: FaPen,                 color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  delete: { label: "حذف",   Icon: FaTrash,               color: "bg-red-100 dark:bg-red-900/30 text-red-500" },
  login:  { label: "دخل",   Icon: FaArrowRightToBracket, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  logout: { label: "خرج",   Icon: FaArrowRightToBracket, color: "bg-gray-100 dark:bg-gray-700 text-gray-500" },
};

const ENTITY_AR = {
  project: "مشروع", unit: "وحدة", lead: "عميل", blog: "مقال",
  career: "وظيفة", media: "صورة", user: "مستخدم", auth: "نظام",
  accounting: "حسابات", task: "مهمة", content: "محتوى", setting: "إعداد",
  notification: "إشعار", accounting_record: "سجل محاسبي",
};

const ACTION_FILTERS = [
  { key: "all",    label: "الكل" },
  { key: "create", label: "أضاف" },
  { key: "update", label: "عدّل" },
  { key: "delete", label: "حذف" },
  { key: "login",  label: "دخل" },
];

const ACT_KEY = "activity";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return "الآن";
  if (diff < 3600)  return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return new Date(date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminActivity() {
  const toast = useToast();
  const qc    = useQueryClient();

  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch,   setUserSearch]   = useState("");
  const table       = useTableState({ defaultPageSize: 30 });
  const confirmClear = useDisclosure();

  // ── Query ──
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [ACT_KEY, table.queryParams],
    queryFn: () => apiClient.get("/activity", { params: { page: table.queryParams.page, limit: 30 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const activities = data?.activities ?? [];
  const total      = data?.total ?? 0;
  const pages      = data?.pages ?? 1;

  // ── Mutations ──
  const deleteOneMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/activity/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [ACT_KEY] });
      const prev = qc.getQueriesData({ queryKey: [ACT_KEY] });
      qc.setQueriesData({ queryKey: [ACT_KEY] }, (old) => {
        if (!old?.activities) return old;
        return { ...old, activities: old.activities.filter((a) => a._id !== id), total: (old.total || 0) - 1 };
      });
      return { prev };
    },
    onError: (_, __, ctx) => ctx?.prev?.forEach(([k, v]) => qc.setQueryData(k, v)),
    onSettled: () => qc.invalidateQueries({ queryKey: [ACT_KEY] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => apiClient.delete("/activity/all"),
    onSuccess: () => {
      qc.setQueriesData({ queryKey: [ACT_KEY] }, (old) => ({ ...old, activities: [], total: 0 }));
      toast.success("تم مسح سجل النشاط");
      confirmClear.close();
    },
    onError: () => toast.error("فشل مسح السجل"),
  });

  // ── Filtering ──
  const filtered = useMemo(() => {
    let list = activities;
    if (actionFilter !== "all") list = list.filter((a) => a.action === actionFilter);
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter((a) => (a.user?.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [activities, actionFilter, userSearch]);

  // ── Export CSV ──
  const exportCSV = () => {
    const rows = [
      ["المستخدم", "الإجراء", "الكيان", "التفاصيل", "التاريخ"],
      ...activities.map((a) => [
        a.user?.name || "—", a.action, a.entity || "—",
        a.details || "—", new Date(a.createdAt).toLocaleString("ar-EG"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "activity_log.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <PageHeader
        title="سجل النشاط"
        subtitle={`${total} حدث مسجّل`}
        icon={<FaClockRotateLeft />}
        loading={isFetching && !isLoading}
        actions={
          <>
            <SecondaryButton icon={<FaDownload className="w-3.5 h-3.5" />} onClick={exportCSV}>تصدير CSV</SecondaryButton>
            <SecondaryButton icon={<FaPrint className="w-3.5 h-3.5" />} onClick={() => window.print()}>طباعة</SecondaryButton>
            <SecondaryButton icon={<FaArrowsRotate className="w-3.5 h-3.5" />} onClick={refetch}>تحديث</SecondaryButton>
            <DangerButton icon={<FaTrash className="w-3.5 h-3.5" />} onClick={confirmClear.open} disabled={total === 0}>
              مسح الكل
            </DangerButton>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action type chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ACTION_FILTERS.map(({ key, label }) => {
              const count = key !== "all" ? activities.filter((a) => a.action === key).length : null;
              return (
                <button key={key} onClick={() => { setActionFilter(key); table.resetPage(); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    actionFilter === key ? "text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                  style={actionFilter === key ? { background: "var(--primary)" } : {}}>
                  {label}
                  {count !== null && count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${actionFilter === key ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* User search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
              placeholder="بحث باسم المستخدم..." className={`${inputCls} pr-9 py-2`} />
            {userSearch && (
              <button onClick={() => setUserSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <FaXmark className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Info banner */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <FaClockRotateLeft className="w-3.5 h-3.5 flex-shrink-0" />
          السجل يُحذف تلقائياً بعد ٧ أيام من تاريخ الحدث
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <FaSpinner className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <FaClockRotateLeft className="w-10 h-10 opacity-20" />
              <p className="text-sm">لا يوجد نشاط</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((act) => {
                const meta = ACTION_META[act.action] || ACTION_META.update;
                const { Icon } = meta;
                const entityName = typeof act.entityName === "object"
                  ? t(act.entityName)
                  : act.entityName;
                return (
                  <motion.div key={act._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{act.user?.name || "مجهول"}</span>
                        {" "}<span className="text-gray-500">{meta.label}</span>{" "}
                        {entityName && (
                          <span className="font-medium" style={{ color: "var(--primary)" }}>«{entityName}»</span>
                        )}
                        {act.entity && ENTITY_AR[act.entity] && (
                          <span className="text-gray-400"> ({ENTITY_AR[act.entity]})</span>
                        )}
                      </p>
                      {act.details && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{t(act.details, "ar", "")}</p>
                      )}
                    </div>

                    {/* Avatar + time + delete */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "var(--primary)" }}>
                        {(act.user?.name || "?")[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(act.createdAt)}</span>
                      <button onClick={() => deleteOneMutation.mutate(act._id)}
                        disabled={deleteOneMutation.isPending}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <FaXmark className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 30 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>صفحة {table.queryParams.page} من {pages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => table.handlePageChange(table.queryParams.page - 1)} disabled={table.queryParams.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">السابق</button>
              <span className="px-3 font-semibold">{table.queryParams.page}</span>
              <button onClick={() => table.handlePageChange(table.queryParams.page + 1)} disabled={table.queryParams.page >= pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm clear all */}
      <ConfirmDialog
        isOpen={confirmClear.isOpen} onClose={confirmClear.close}
        onConfirm={() => clearAllMutation.mutate()}
        title="مسح سجل النشاط"
        message="هل تريد مسح جميع سجلات النشاط؟ لا يمكن التراجع."
        confirmLabel="مسح الكل"
        variant="danger"
        loading={clearAllMutation.isPending}
      />
    </div>
  );
}
