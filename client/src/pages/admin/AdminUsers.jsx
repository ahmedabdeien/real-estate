import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Eye } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useToast } from "../../context/ToastContext";

const DEPARTMENTS = {
  accounts:       "الحسابات",
  legal:          "الشئون القانونية",
  marketing:      "التسويق",
  administrative: "اداري",
  projects:       "مشروعات",
  warehouse:      "المخازن",
  purchasing:     "المشتريات",
};

const ROLES_NEED_DEPT = ["manager", "employee", "sales"];
const STAFF_ROLES = ["admin", "supervisor", "manager", "employee", "sales"];
const VIEWER_ROLES = ["viewer"];

const emptyUser = { name: "", email: "", password: "", role: "employee", department: "", phone: "" };

// User is "online" if lastSeen within the last 5 minutes
function isOnline(lastSeen) {
  return lastSeen && Date.now() - new Date(lastSeen) < 5 * 60 * 1000;
}

function UserAvatar({ name, lastSeen, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-8 h-8 sm:w-9 sm:h-9 text-sm";
  return (
    <div className="relative flex-shrink-0">
      <div className={`${dim} rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-bold`}>
        {name?.[0]?.toUpperCase() || "?"}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isOnline(lastSeen) ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
        title={isOnline(lastSeen) ? "متصل الآن" : "غير متصل"}
      />
    </div>
  );
}

function LastSeenCell({ lastSeen, lastLogin }) {
  if (isOnline(lastSeen)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        متصل الآن
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-400">
      {lastSeen
        ? new Date(lastSeen).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : lastLogin
        ? new Date(lastLogin).toLocaleDateString("ar-EG")
        : "لم يدخل بعد"}
    </span>
  );
}

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("staff"); // "staff" | "viewers"
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch {
      toast.error("فشل تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const staff = users.filter((u) => STAFF_ROLES.includes(u.role));
  const viewers = users.filter((u) => VIEWER_ROLES.includes(u.role));

  const openCreate = () => { setEditItem(null); setForm(emptyUser); setModal(true); };
  const openEdit = (u) => { setEditItem(u); setForm({ ...u, password: "" }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/users/${editItem._id}`, form);
        toast.success("تم تحديث المستخدم");
      } else {
        await api.post("/users", form);
        toast.success("تم إضافة المستخدم");
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
      await api.delete(`/users/${deleteId}`);
      toast.success("تم حذف المستخدم");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const TABS = [
    { key: "staff",   label: "الموظفون",      icon: Users, count: staff.length },
    { key: "viewers", label: "زوار الموقع",   icon: Eye,   count: viewers.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المستخدمون</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{users.length} مستخدم</p>
        </div>
        {tab === "staff" && (
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة موظف</span>
            <span className="sm:hidden">إضافة</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-[#2d5d89]/10 text-[#2d5d89]" : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Staff Tab */}
      {tab === "staff" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? <LoadingSpinner className="h-64" size="lg" /> : staff.length === 0 ? (
            <EmptyState icon={Users} title="لا يوجد موظفون" description="أضف موظفاً جديداً من خلال زر الإضافة أعلاه" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الموظف</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الدور</th>
                    <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الحالة</th>
                    <th className="hidden md:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">القسم</th>
                    <th className="hidden lg:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">آخر نشاط</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {staff.map((u) => {
                    const { label, variant } = statusBadge(u.role);
                    return (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <UserAvatar name={u.name} lastSeen={u.lastSeen} />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
                              <p className="text-gray-400 text-xs truncate max-w-[120px] sm:max-w-none">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4"><Badge variant={variant}>{label}</Badge></td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                          <Badge variant={u.isActive ? "success" : "error"}>{u.isActive ? "نشط" : "معطل"}</Badge>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {u.department ? (DEPARTMENTS[u.department] || u.department) : "—"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                          <LastSeenCell lastSeen={u.lastSeen} lastLogin={u.lastLogin} />
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(u._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Viewers Tab — read-only */}
      {tab === "viewers" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs text-gray-400">هؤلاء هم زوار الموقع الذين سجّلوا حسابات. لا يملكون صلاحيات لوحة التحكم.</p>
          </div>
          {loading ? <LoadingSpinner className="h-64" size="lg" /> : viewers.length === 0 ? (
            <EmptyState icon={Eye} title="لا يوجد زوار مسجّلون" description="ستظهر هنا حسابات الزوار الذين أنشأوا حسابات على الموقع" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المستخدم</th>
                    <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الهاتف</th>
                    <th className="hidden md:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">تاريخ التسجيل</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">آخر نشاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {viewers.map((u) => (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <UserAvatar name={u.name} lastSeen={u.lastSeen} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[120px] sm:max-w-none">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{u.phone || "—"}</span>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-EG") : "—"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <LastSeenCell lastSeen={u.lastSeen} lastLogin={u.lastLogin} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Staff Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل موظف" : "إضافة موظف"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
            <input value={form.name} onChange={(e) => f("name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={(e) => f("email", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {editItem ? "كلمة مرور جديدة (اتركها فارغة للإبقاء)" : "كلمة المرور"}
            </label>
            <input type="password" value={form.password} onChange={(e) => f("password", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
            <select value={form.role} onChange={(e) => {
              const role = e.target.value;
              f("role", role);
              if (role === "sales") f("department", "marketing");
              else if (!ROLES_NEED_DEPT.includes(role)) f("department", "");
            }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              <option value="admin">مدير عام</option>
              <option value="supervisor">مشرف عام</option>
              <option value="manager">مدير قسم</option>
              <option value="employee">موظف</option>
              <option value="sales">مبيعات</option>
            </select>
          </div>
          {ROLES_NEED_DEPT.includes(form.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم</label>
              <select value={form.department || ""} onChange={(e) => f("department", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
                <option value="">— اختر القسم —</option>
                {Object.entries(DEPARTMENTS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهاتف</label>
            <input value={form.phone} onChange={(e) => f("phone", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive !== false} onChange={(e) => f("isActive", e.target.checked)}
                className="w-4 h-4 rounded accent-[#2d5d89]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">الحساب نشط</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setModal(false)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting}
        title="حذف الموظف" message="هل أنت متأكد من حذف هذا الموظف؟" />
    </div>
  );
}
