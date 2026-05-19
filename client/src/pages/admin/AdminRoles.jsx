import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, X, ShieldCheck, Lock, Check,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const ALL_PAGES = [
  { key: "dashboard",           label: "لوحة التحكم",        icon: "📊" },
  { key: "notifications",       label: "الإشعارات",           icon: "🔔" },
  { key: "projects",            label: "المشاريع",            icon: "🏗" },
  { key: "units",               label: "الوحدات",             icon: "🏠" },
  { key: "leads",               label: "العملاء",             icon: "👥" },
  { key: "client-reg",          label: "تسجيل العملاء",       icon: "✍" },
  { key: "blogs",               label: "المقالات",            icon: "📝" },
  { key: "tasks",               label: "المهام",              icon: "✅" },
  { key: "accounting",          label: "الحسابات",              icon: "💰" },
  { key: "accounting-beni-suef", label: "حسابات فرع بني سويف", icon: "🏢" },
  { key: "accounting-records",  label: "السجلات المحاسبية",   icon: "📒" },
  { key: "warehouse",           label: "المخازن",             icon: "📦" },
  { key: "purchasing",          label: "المشتريات",           icon: "🛒" },
  { key: "legal",               label: "الشئون القانونية",    icon: "⚖" },
  { key: "content",             label: "المحتوى",             icon: "✏" },
  { key: "media",               label: "المكتبة",             icon: "🖼" },
  { key: "careers",             label: "الوظائف",             icon: "💼" },
  { key: "users",               label: "المستخدمين",          icon: "👤" },
  { key: "roles",               label: "إدارة الأدوار",       icon: "🔑" },
  { key: "activity",            label: "سجل النشاط",          icon: "📈" },
  { key: "settings",            label: "الإعدادات",           icon: "⚙" },
  { key: "profile",             label: "الملف الشخصي",        icon: "👤" },
  { key: "changelog",           label: "التحديثات",           icon: "📋" },
];

const emptyForm = { roleKey: "", label: "", branch: "", allowedPages: [] };

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

export default function AdminRoles() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/roles");
      setRoles(res.data.roles || []);
    } catch {
      toast.error("فشل تحميل الأدوار");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (r) => {
    setEditItem(r);
    setForm({
      roleKey: r.roleKey,
      label: r.label,
      branch: r.branch || "",
      allowedPages: r.allowedPages || [],
    });
    setModal(true);
  };

  const togglePage = (key) => {
    setForm((prev) => {
      const pages = prev.allowedPages.includes(key)
        ? prev.allowedPages.filter((p) => p !== key)
        : [...prev.allowedPages, key];
      return { ...prev, allowedPages: pages };
    });
  };

  const selectAll = () => setForm((p) => ({ ...p, allowedPages: ALL_PAGES.map((pg) => pg.key) }));
  const clearAll = () => setForm((p) => ({ ...p, allowedPages: [] }));

  const handleSave = async () => {
    if (!form.label?.trim()) return toast.error("اسم الدور مطلوب");
    if (!editItem && !form.roleKey?.trim()) return toast.error("مفتاح الدور مطلوب");
    setSaving(true);
    try {
      if (editItem) {
        const payload = { label: form.label, branch: form.branch, allowedPages: form.allowedPages };
        // Can only change roleKey if not a system role
        if (!editItem.isSystem) payload.roleKey = form.roleKey;
        await api.put(`/roles/${editItem._id}`, payload);
        toast.success("تم تحديث الدور");
      } else {
        await api.post("/roles", form);
        toast.success("تم إضافة الدور");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/roles/${id}`);
      toast.success("تم حذف الدور");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الأدوار والصلاحيات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{roles.length} دور</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة دور
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">جاري التحميل...</div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
            <ShieldCheck className="w-8 h-8 opacity-30" />
            <p>لا توجد أدوار</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الاسم</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المفتاح</th>
                  <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الفرع</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الصفحات</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">النوع</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {roles.map((r) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2d5d89] flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{r.label}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                        {r.roleKey}
                      </code>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {r.branch || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {r.allowedPages?.includes("*") ? (
                        <span className="text-xs bg-[#2d5d89]/10 text-[#2d5d89] px-2 py-1 rounded-full font-medium">كل الصفحات</span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{r.allowedPages?.length || 0} صفحة</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {r.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                          <Lock className="w-3 h-3" /> أساسي
                        </span>
                      ) : (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">مخصص</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!r.isSystem && (
                          <button
                            onClick={() => setDeleteId(r._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? `تعديل: ${editItem.label}` : "إضافة دور جديد"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                مفتاح الدور <span className="text-red-500">*</span>
              </label>
              <input
                value={form.roleKey}
                onChange={(e) => setForm((p) => ({ ...p, roleKey: e.target.value }))}
                disabled={editItem?.isSystem}
                placeholder="مثال: branch_accounts_cairo"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {editItem?.isSystem && (
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> لا يمكن تغيير مفتاح الأدوار الأساسية
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الاسم (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="مثال: محاسب فرع بني سويف"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفرع (اختياري)</label>
              <input
                value={form.branch}
                onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                placeholder="مثال: بني سويف"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm"
              />
            </div>
          </div>

          {/* Allowed Pages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الصفحات المسموح بها</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-[#2d5d89] hover:underline"
                >
                  تحديد الكل
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:underline"
                >
                  إلغاء الكل
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
              {ALL_PAGES.map((pg) => {
                const checked = form.allowedPages.includes(pg.key);
                return (
                  <label
                    key={pg.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-sm ${
                      checked
                        ? "bg-[#2d5d89]/10 border-[#2d5d89]/40 text-[#2d5d89]"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#2d5d89]/30 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePage(pg.key)}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? "bg-[#2d5d89] border-[#2d5d89]" : "border-gray-300 dark:border-gray-500"
                    }`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="text-base leading-none">{pg.icon}</span>
                    <span className="truncate text-xs">{pg.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {form.allowedPages.length} صفحة محددة
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setModal(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">حذف الدور</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {deleting ? "جاري الحذف..." : "حذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
