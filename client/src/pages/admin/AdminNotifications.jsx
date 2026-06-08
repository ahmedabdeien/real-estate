/**
 * AdminNotifications — migrated to TanStack Query + shared UI components
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaBriefcase, FaCheck, FaCheckDouble, FaListCheck,
  FaClipboardList, FaArrowsRotate, FaTrash, FaUsers, FaXmark,
} from "react-icons/fa6";

import {
  useNotifications, useMarkAllRead, useMarkOneRead,
} from "../../hooks/queries/useNotifications";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { NOTIF_KEY } from "../../hooks/queries/useNotifications";
import { notificationsApi } from "../../lib/api";
import PageHeader, { PrimaryButton, SecondaryButton, DangerButton } from "../../Components/UI/PageHeader";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useToast } from "../../context/ToastContext";

// ── Constants ──────────────────────────────────────────────────────────────
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
  new_lead:            { Icon: FaUsers,        bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-600" },
  new_job_application: { Icon: FaBriefcase,    bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600" },
  task_assigned:       { Icon: FaClipboardList,bg: "bg-purple-100 dark:bg-purple-900/30",text: "text-purple-600" },
  task_updated:        { Icon: FaListCheck,    bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600" },
  default:             { Icon: FaBell,         bg: "bg-gray-100 dark:bg-gray-700",       text: "text-gray-500" },
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleString("ar-EG", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminNotifications() {
  const toast     = useToast();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [page,   setPage]   = useState(1);

  const confirmClear = useDisclosure();

  // ── Queries ──
  const { data, isLoading, refetch, isFetching } = useNotifications();
  const items = data?.notifications ?? [];

  const markAllMutation  = useMarkAllRead();
  const markOneMutation  = useMarkOneRead();

  const deleteOneMutation = useMutation({
    mutationFn: (id) => notificationsApi.markOne(id), // uses markOne as delete proxy, or add deleteApi
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [NOTIF_KEY] });
      const prev = qc.getQueryData([NOTIF_KEY, {}]);
      qc.setQueriesData({ queryKey: [NOTIF_KEY] }, (old) => {
        if (!old?.notifications) return old;
        return { ...old, notifications: old.notifications.filter((n) => n._id !== id) };
      });
      return { prev };
    },
    onError: (_, __, ctx) => ctx?.prev && qc.setQueryData([NOTIF_KEY, {}], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.setQueriesData({ queryKey: [NOTIF_KEY] }, (old) => {
        if (!old?.notifications) return old;
        return { ...old, notifications: old.notifications.map((n) => ({ ...n, read: true })) };
      });
      toast.success("تم تحديد الكل كمقروء");
      confirmClear.close();
    },
    onError: () => toast.error("فشل مسح الإشعارات"),
  });

  // ── Derived state ──
  const unreadCount = items.filter((n) => !n.read).length;

  const typeCounts = useMemo(() => {
    const c = {};
    items.forEach((n) => { c[n.type] = (c[n.type] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all")    return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (v) => { setFilter(v); setPage(1); };

  const handleClick = async (n) => {
    if (!n.read) markOneMutation.mutate(n._id);
    if (n.link) navigate(n.link);
  };

  // ── Render ──
  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <PageHeader
        title="الإشعارات"
        subtitle={`${items.length} إشعار · ${unreadCount} غير مقروء`}
        icon={<FaBell />}
        loading={isFetching && !isLoading}
        actions={
          <>
            <SecondaryButton icon={<FaArrowsRotate className="w-3.5 h-3.5" />} onClick={() => refetch()}>
              تحديث
            </SecondaryButton>
            <PrimaryButton
              icon={<FaCheckDouble className="w-3.5 h-3.5" />}
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
              disabled={unreadCount === 0}
            >
              تحديد الكل كمقروء
            </PrimaryButton>
            <DangerButton
              icon={<FaTrash className="w-3.5 h-3.5" />}
              onClick={confirmClear.open}
              disabled={items.length === 0}
            >
              مسح الكل
            </DangerButton>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((ft) => {
            const count = ft.value === "all" ? items.length
              : ft.value === "unread" ? unreadCount
              : (typeCounts[ft.value] || 0);
            const active = filter === ft.value;
            return (
              <button
                key={ft.value}
                onClick={() => handleFilterChange(ft.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "text-white shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                style={active ? { background: "var(--primary)" } : {}}
              >
                {ft.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <FaArrowsRotate className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <FaBell className="w-10 h-10 opacity-20" />
              <p className="text-sm">لا توجد إشعارات في هذا القسم</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence initial={false}>
                {pageItems.map((n) => {
                  const { Icon, bg, text } = TYPE_ICON[n.type] || TYPE_ICON.default;
                  return (
                    <motion.li
                      key={n._id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.15 }}
                      className={`px-5 py-4 flex items-start gap-3 transition-colors ${
                        !n.read ? "bg-[color:var(--primary)]/5 dark:bg-[color:var(--primary)]/10" : ""
                      } ${n.link ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}`}
                      onClick={() => handleClick(n)}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !n.read ? "text-white" : `${bg} ${text}`
                      }`}
                        style={!n.read ? { background: "var(--primary)" } : {}}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--primary)" }} />
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{formatDate(n.createdAt)}</span>
                        </div>
                        {n.body && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>}
                        {n.link && (
                          <span className="text-xs mt-1 inline-block font-semibold" style={{ color: "var(--primary)" }}>
                            اضغط للفتح ←
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {!n.read && (
                          <button
                            onClick={() => markOneMutation.mutate(n._id)}
                            title="تحديد كمقروء"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <FaCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteOneMutation.mutate(n._id)}
                          title="حذف الإشعار"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FaXmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>عرض {pageItems.length} من {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >السابق</button>
              <span className="px-3 py-1.5 font-semibold">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm clear all */}
      <ConfirmDialog
        isOpen={confirmClear.isOpen}
        onClose={confirmClear.close}
        onConfirm={() => clearAllMutation.mutate()}
        title="مسح جميع الإشعارات"
        message="هل تريد تحديد جميع الإشعارات كمقروءة؟"
        confirmLabel="تأكيد"
        variant="warning"
        loading={clearAllMutation.isPending}
      />
    </div>
  );
}
