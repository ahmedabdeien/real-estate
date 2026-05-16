/**
 * AdminTasks — full task management inside the admin panel.
 * Accessible to: admin, supervisor, manager
 */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, CheckCircle2, Clock, AlertCircle,
  Layers, Flag, User, Building2, Search, X, Filter,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Modal from "../../Components/UI/Modal";
import {
  DEPARTMENTS, STATUS_LABELS, ROLE_LABELS, Countdown,
} from "../tasks/TasksPage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRIORITY_LABELS = { low: "منخفض", medium: "متوسط", high: "عالي" };
const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100   text-blue-700",
  done:        "bg-green-100  text-green-700",
};
const PRIORITY_COLORS = {
  low:    "bg-gray-100   text-gray-500",
  medium: "bg-orange-100 text-orange-600",
  high:   "bg-red-100    text-red-600",
};
const DEPT_COLORS = {
  accounts:       "bg-blue-50   text-blue-700",
  legal:          "bg-purple-50 text-purple-700",
  marketing:      "bg-pink-50   text-pink-700",
  administrative: "bg-gray-100  text-gray-600",
  projects:       "bg-green-50  text-green-700",
  warehouse:      "bg-orange-50 text-orange-700",
  purchasing:     "bg-red-50    text-red-600",
};

const emptyForm = {
  title: "", description: "", dueDate: "", priority: "medium",
  assignedTo: [], notes: "", department: "",
};

// ─── TaskForm (inside Modal) ──────────────────────────────────────────────────

function TaskForm({ form, setForm, users, userRole, userDept }) {
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleUser = (id) =>
    setForm((p) => ({
      ...p,
      assignedTo: p.assignedTo.includes(id)
        ? p.assignedTo.filter((x) => x !== id)
        : [...p.assignedTo, id],
    }));

  const deptUsers = form.department
    ? users.filter((u) => u.department === form.department || u.role === "admin" || u.role === "supervisor")
    : users;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان المهمة *</label>
          <input value={form.title} onChange={(e) => f("title", e.target.value)}
            placeholder="عنوان المهمة..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم *</label>
          <select value={form.department} onChange={(e) => f("department", e.target.value)}
            disabled={userRole === "manager"}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] disabled:opacity-60">
            <option value="">— اختر القسم —</option>
            {Object.entries(DEPARTMENTS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأولوية</label>
          <select value={form.priority} onChange={(e) => f("priority", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
            <option value="low">منخفض</option>
            <option value="medium">متوسط</option>
            <option value="high">عالي</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ والوقت *</label>
          <input type="datetime-local" value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
          <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
            rows={3} placeholder="وصف المهمة..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
        </div>

        {/* Users */}
        {deptUsers.length > 0 && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تعيين إلى
              {form.department && <span className="text-xs text-gray-400 mr-1">({DEPARTMENTS[form.department]})</span>}
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {deptUsers.map((u) => (
                <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    form.assignedTo.includes(u._id)
                      ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#2d5d89]"
                  }`}>
                  {u.name}
                  <span className="opacity-60">({ROLE_LABELS[u.role] || u.role})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
          <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)}
            rows={2} placeholder="ملاحظات..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminTasks ──────────────────────────────────────────────────────────

export default function AdminTasks() {
  const { user } = useAuth();
  const toast = useToast();

  const [tasks,      setTasks]      = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected,   setSelected]   = useState(new Set());

  const canManage = ["admin", "supervisor", "manager"].includes(user?.role);
  const canSeeAll = ["admin", "supervisor"].includes(user?.role);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, ur] = await Promise.all([
        api.get("/tasks"),
        canManage ? api.get("/tasks/users") : Promise.resolve({ data: { users: [] } }),
      ]);
      setTasks(tr.data.tasks || []);
      setUsers(ur.data.users || []);
    } catch {
      toast.error("فشل تحميل المهام");
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filters
  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) ||
      t.assignedTo?.some((u) => u.name?.toLowerCase().includes(q));
    const matchDept   = deptFilter === "all" || t.department === deptFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  // Stats by dept — include completion percentage
  const deptStats = Object.keys(DEPARTMENTS).reduce((acc, d) => {
    const total = tasks.filter((t) => t.department === d).length;
    const done  = tasks.filter((t) => t.department === d && t.status === "done").length;
    acc[d] = { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
    return acc;
  }, {});

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t._id)));
  };

  const bulkStatus = async (status) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => api.put(`/tasks/${id}`, { status })));
      setTasks((p) => p.map((t) => ids.includes(t._id) ? { ...t, status } : t));
      setSelected(new Set());
      toast.success(`تم تحديث ${ids.length} مهمة`);
    } catch {
      toast.error("فشل التحديث المجمّع");
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm, department: user?.role === "manager" ? (user?.department || "") : "" });
    setModal(true);
  };
  const openEdit = (task) => {
    setEditItem(task);
    setForm({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      assignedTo: (task.assignedTo || []).map((u) => u._id || u),
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.dueDate || !form.department) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        const r = await api.put(`/tasks/${editItem._id}`, form);
        setTasks((p) => p.map((t) => t._id === editItem._id ? r.data.task : t));
        toast.success("تم تحديث المهمة");
      } else {
        const r = await api.post("/tasks", form);
        setTasks((p) => [r.data.task, ...p]);
        toast.success("تم إنشاء المهمة");
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteId}`);
      setTasks((p) => p.filter((t) => t._id !== deleteId));
      setDeleteId(null);
      toast.success("تم حذف المهمة");
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await api.put(`/tasks/${id}`, { status });
      setTasks((p) => p.map((t) => t._id === id ? r.data.task : t));
      toast.success("تم تحديث الحالة");
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const depts = [...new Set(tasks.map((t) => t.department))].filter(Boolean);

  return (
    <div className="space-y-5" dir="rtl">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{canManage ? "إدارة المهام" : "مهامي"}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} مهمة إجمالي</p>
        </div>
        {canManage && (
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">مهمة جديدة</span>
            <span className="sm:hidden">إضافة</span>
          </button>
        )}
      </div>

      {/* ── Dept stats (admin/supervisor) ── */}
      {canSeeAll && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(DEPARTMENTS).map(([k, v]) => (
            <button key={k} onClick={() => setDeptFilter(deptFilter === k ? "all" : k)}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-3 text-center transition-all ${
                deptFilter === k ? "border-[#2d5d89] ring-2 ring-[#2d5d89]/20" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
              }`}>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{deptStats[k]?.total || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{v}</p>
              {deptStats[k]?.total > 0 && (
                <div className="mt-1.5">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${deptStats[k].pct}%` }} />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{deptStats[k].pct}%</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Filters row ── */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المهام..."
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="all">كل الحالات</option>
          <option value="pending">معلق</option>
          <option value="in_progress">جارٍ</option>
          <option value="done">مكتمل</option>
        </select>

        {/* Dept filter (if not already filtering by dept stats) */}
        {canSeeAll && depts.length > 1 && (
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
            <option value="all">كل الأقسام</option>
            {depts.map((d) => (
              <option key={d} value={d}>{DEPARTMENTS[d] || d}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Bulk actions ── */}
      {canManage && selected.size > 0 && (
        <div className="bg-[#2d5d89]/5 border border-[#2d5d89]/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-[#2d5d89]">
            تم تحديد {selected.size} مهمة
          </span>
          <div className="mr-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">تغيير الحالة:</span>
            <button onClick={() => bulkStatus("pending")}
              className="px-3 py-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium">
              معلق
            </button>
            <button onClick={() => bulkStatus("in_progress")}
              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium">
              جارٍ
            </button>
            <button onClick={() => bulkStatus("done")}
              className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium">
              مكتمل
            </button>
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ── Tasks list ── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-16 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-gray-200 dark:text-gray-600 mb-3" />
          <p className="text-gray-400 dark:text-gray-500">لا توجد مهام</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {canManage && (
                    <th className="text-right px-3 py-3 w-10">
                      <input type="checkbox"
                        checked={filtered.length > 0 && selected.size === filtered.length}
                        onChange={toggleSelectAll}
                        className="rounded accent-[#2d5d89] cursor-pointer" />
                    </th>
                  )}
                  <th className="text-right px-4 py-3">المهمة</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">القسم</th>
                  <th className="text-right px-4 py-3">الحالة</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">الأولوية</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">المكلفون</th>
                  <th className="text-right px-4 py-3">الموعد</th>
                  <th className="text-right px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                <AnimatePresence>
                  {filtered.map((task) => (
                    <motion.tr key={task._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                        selected.has(task._id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}>
                      {canManage && (
                        <td className="px-3 py-3 w-10">
                          <input type="checkbox" checked={selected.has(task._id)}
                            onChange={() => toggleSelect(task._id)}
                            className="rounded accent-[#2d5d89] cursor-pointer" />
                        </td>
                      )}
                      {/* Title */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{task.description}</p>
                        )}
                      </td>

                      {/* Dept */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[task.department] || "bg-gray-100 text-gray-600"}`}>
                          {DEPARTMENTS[task.department] || task.department}
                        </span>
                      </td>

                      {/* Status — clickable dropdown */}
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2d5d89] ${STATUS_COLORS[task.status]}`}>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${PRIORITY_COLORS[task.priority]}`}>
                          <Flag className="w-3 h-3" />{PRIORITY_LABELS[task.priority]}
                        </span>
                      </td>

                      {/* Assigned */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex -space-x-1 space-x-reverse">
                          {(task.assignedTo || []).slice(0, 3).map((u) => (
                            <div key={u._id} title={u.name}
                              className="w-7 h-7 rounded-full bg-[#2d5d89]/10 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-[#2d5d89]">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                          ))}
                          {task.assignedTo?.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-500">
                              +{task.assignedTo.length - 3}
                            </div>
                          )}
                          {!task.assignedTo?.length && <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>

                      {/* Due date + countdown */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(task.dueDate).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                          </p>
                          <Countdown dueDate={task.dueDate} compact />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {canManage && (
                            <button onClick={() => openEdit(task)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManage && (
                            <button onClick={() => setDeleteId(task._id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editItem ? "تعديل المهمة" : "إضافة مهمة جديدة"}>
        <TaskForm form={form} setForm={setForm} users={users} userRole={user?.role} userDept={user?.department} />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setModal(false)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : editItem ? "تحديث" : "إنشاء"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="حذف المهمة"
        message="هل أنت متأكد من حذف هذه المهمة؟"
      />
    </div>
  );
}
