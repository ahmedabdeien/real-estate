import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaPlus, FaTrash, FaPen, FaShieldHalved, FaLock, FaCheck,
  FaGauge, FaBell, FaBuilding, FaHouseChimney, FaChartLine,
  FaUserPlus, FaFileLines, FaSquareCheck, FaCalculator,
  FaBookOpen, FaBox, FaCartShopping, FaScaleBalanced,
  FaWandMagicSparkles, FaImage, FaBriefcase, FaUsers,
  FaGear, FaCircleUser, FaClockRotateLeft, FaStore,
} from "react-icons/fa6";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import FormField, { inputCls } from "../../Components/UI/FormField";
import EmptyState from "../../Components/UI/EmptyState";

const ALL_PAGES = [
  { key: "dashboard",                           label: "لوحة التحكم",           Icon: FaGauge },
  { key: "notifications",                       label: "الإشعارات",              Icon: FaBell },
  { key: "projects",                            label: "المشاريع",               Icon: FaBuilding },
  { key: "units",                               label: "الوحدات",                Icon: FaHouseChimney },
  { key: "leads",                               label: "العملاء",                Icon: FaChartLine },
  { key: "client-reg",                          label: "تسجيل العملاء",          Icon: FaUserPlus },
  { key: "blogs",                               label: "المقالات",               Icon: FaFileLines },
  { key: "tasks",                               label: "المهام",                 Icon: FaSquareCheck },
  { key: "accounting",                          label: "الحسابات",               Icon: FaCalculator },
  { key: "accounting-beni-suef",                label: "حسابات فرع بني سويف",   Icon: FaStore },
  { key: "accounting-records",                  label: "السجلات المحاسبية",      Icon: FaBookOpen },
  { key: "accounting-records-beni-suef",        label: "سجلات فرع بني سويف",    Icon: FaBookOpen },
  { key: "warehouse",                           label: "المخازن",                Icon: FaBox },
  { key: "purchasing",                          label: "المشتريات",              Icon: FaCartShopping },
  { key: "legal",                               label: "الشئون القانونية",       Icon: FaScaleBalanced },
  { key: "content",                             label: "المحتوى",                Icon: FaWandMagicSparkles },
  { key: "media",                               label: "المكتبة",                Icon: FaImage },
  { key: "careers",                             label: "الوظائف",                Icon: FaBriefcase },
  { key: "users",                               label: "المستخدمين",             Icon: FaUsers },
  { key: "roles",                               label: "إدارة الأدوار",          Icon: FaShieldHalved },
  { key: "activity",                            label: "سجل النشاط",             Icon: FaChartLine },
  { key: "settings",                            label: "الإعدادات",              Icon: FaGear },
  { key: "profile",                             label: "الملف الشخصي",           Icon: FaCircleUser },
  { key: "changelog",                           label: "التحديثات",              Icon: FaClockRotateLeft },
];

const emptyForm = { roleKey: "", label: "", branch: "", allowedPages: [] };

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteId}`);
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
      <PageHeader
        title="إدارة الأدوار والصلاحيات"
        subtitle={`${roles.length} دور`}
        icon={<FaShieldHalved />}
        loading={loading}
        actions={
          <PrimaryButton icon={<FaPlus className="w-4 h-4" />} onClick={openCreate}>
            إضافة دور
          </PrimaryButton>
        }
      />

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">جاري التحميل...</div>
        ) : roles.length === 0 ? (
          <EmptyState
            icon={FaShieldHalved}
            title="لا توجد أدوار"
            description="أضف أول دور للنظام"
            action={
              <PrimaryButton icon={<FaPlus className="w-4 h-4" />} onClick={openCreate}>
                إضافة دور
              </PrimaryButton>
            }
          />
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
                        <FaShieldHalved className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
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
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: "var(--primary)", opacity: 0.1, color: "var(--primary)" }}
                        >
                          كل الصفحات
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{r.allowedPages?.length || 0} صفحة</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {r.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                          <FaLock className="w-3 h-3" /> أساسي
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
                          <FaPen className="w-4 h-4" />
                        </button>
                        {!r.isSystem && (
                          <button
                            onClick={() => setDeleteId(r._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                            title="حذف"
                          >
                            <FaTrash className="w-4 h-4" />
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
      <AdminModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editItem ? `تعديل: ${editItem.label}` : "إضافة دور جديد"}
        size="2xl"
        footer={
          <>
            <button
              onClick={() => setModal(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <PrimaryButton onClick={handleSave} loading={saving}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="مفتاح الدور" required>
              <input
                value={form.roleKey}
                onChange={(e) => setForm((p) => ({ ...p, roleKey: e.target.value }))}
                disabled={editItem?.isSystem}
                placeholder="مثال: branch_accounts_cairo"
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {editItem?.isSystem && (
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <FaLock className="w-3 h-3" /> لا يمكن تغيير مفتاح الأدوار الأساسية
                </p>
              )}
            </FormField>
            <FormField label="الاسم (عربي)" required>
              <input
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="مثال: محاسب فرع بني سويف"
                className={inputCls}
              />
            </FormField>
            <FormField label="الفرع (اختياري)">
              <input
                value={form.branch}
                onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                placeholder="مثال: بني سويف"
                className={inputCls}
              />
            </FormField>
          </div>

          {/* Allowed Pages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الصفحات المسموح بها</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs hover:underline"
                  style={{ color: "var(--primary)" }}
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
                        ? "border-[color:var(--primary)]/40 text-[color:var(--primary)]"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[color:var(--primary)]/30 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    style={checked ? { background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePage(pg.key)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? "border-[color:var(--primary)]" : "border-gray-300 dark:border-gray-500"
                      }`}
                      style={checked ? { background: "var(--primary)" } : {}}
                    >
                      {checked && <FaCheck className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {pg.Icon && <pg.Icon className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate text-xs">{pg.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {form.allowedPages.length} صفحة محددة
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="حذف الدور"
        message="هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}
