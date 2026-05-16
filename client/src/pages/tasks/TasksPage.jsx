import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogOut, CheckCircle2, Clock, AlertCircle, Trash2, Edit2,
  User, Flag, X, ChevronDown, AlignLeft, Layers, Building2,
  ChevronUp, MoreVertical, ArrowRight, Check,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEPARTMENTS = {
  accounts:       "الحسابات",
  legal:          "الشئون القانونية",
  marketing:      "التسويق",
  administrative: "اداري",
  projects:       "مشروعات",
  warehouse:      "المخازن",
  purchasing:     "المشتريات",
};

const DEPT_COLORS = {
  accounts:       "bg-blue-50   text-blue-700   border-blue-200",
  legal:          "bg-purple-50 text-purple-700 border-purple-200",
  marketing:      "bg-pink-50   text-pink-700   border-pink-200",
  administrative: "bg-gray-50   text-gray-700   border-gray-200",
  projects:       "bg-green-50  text-green-700  border-green-200",
  warehouse:      "bg-orange-50 text-orange-700 border-orange-200",
  purchasing:     "bg-red-50    text-red-700    border-red-200",
};

export const STATUS_LABELS = { pending: "معلق", in_progress: "جارٍ", done: "مكتمل" };
const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100   text-blue-700   border-blue-200",
  done:        "bg-green-100  text-green-700  border-green-200",
};
const PRIORITY_LABELS = { low: "منخفضة", medium: "متوسطة", high: "عالية" };
const PRIORITY_COLORS = {
  low:    "bg-green-100  text-green-700  border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high:   "bg-red-100    text-red-700    border-red-200",
};
export const ROLE_LABELS = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

// ─── Countdown ───────────────────────────────────────────────────────────────

export function Countdown({ dueDate, compact = false }) {
  const [text, setText]       = useState("");
  const [state, setState]     = useState("normal"); // normal | urgent | overdue

  useEffect(() => {
    const tick = () => {
      const diff = new Date(dueDate) - Date.now();
      if (diff <= 0) {
        const abs = Math.abs(diff);
        const h = Math.floor(abs / 3600000);
        const m = Math.floor((abs % 3600000) / 60000);
        setText(compact ? `متأخر ${h}س` : `متأخر ${h}س ${m}د`);
        setState("overdue");
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setState(diff < 86400000 ? "urgent" : "normal");
        if (d > 0)        setText(compact ? `${d}ي ${h}س` : `${d}ي ${h}س ${m}د`);
        else              setText(`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDate, compact]);

  const cls = {
    normal:  "bg-gray-100   text-gray-600",
    urgent:  "bg-orange-100 text-orange-600",
    overdue: "bg-red-100    text-red-600",
  }[state];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${cls}`}>
      <Clock className="w-3 h-3" />{text}
    </span>
  );
}

// ─── TaskCard (mobile-first) ──────────────────────────────────────────────────

function TaskCard({ task, canManage, onEdit, onDelete, onStatusChange }) {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const dept = DEPARTMENTS[task.department] || task.department;
  const deptCls = DEPT_COLORS[task.department] || "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
    >
      {/* Card top strip (priority color) */}
      <div className={`h-1 rounded-t-2xl ${
        task.priority === "high" ? "bg-red-400" :
        task.priority === "medium" ? "bg-orange-300" : "bg-gray-200"
      }`} />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-snug">{task.title}</h3>
            <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${deptCls}`}>
              <Building2 className="w-3 h-3 flex-shrink-0" />{dept}
            </span>
          </div>

          {/* Actions menu (3 dots) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    className="absolute left-0 top-9 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-36"
                  >
                    {/* Status sub-menu */}
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-50">تغيير الحالة</div>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <button key={k}
                        onClick={() => { onStatusChange(task._id, k); setMenuOpen(false); }}
                        className={`w-full text-right px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center gap-2 ${
                          task.status === k ? "font-bold text-[#2d5d89]" : "text-gray-700"
                        }`}>
                        {task.status === k && <CheckCircle2 className="w-3.5 h-3.5 text-[#2d5d89]" />}
                        {v}
                      </button>
                    ))}
                    {canManage && (
                      <>
                        <div className="border-t border-gray-50" />
                        <button onClick={() => { onEdit(task); setMenuOpen(false); }}
                          className="w-full text-right px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                          <Edit2 className="w-3.5 h-3.5" />تعديل
                        </button>
                        <button onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                          className="w-full text-right px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" />حذف
                        </button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
        )}

        {/* Status + Priority + Countdown */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${PRIORITY_COLORS[task.priority]}`}>
            <Flag className="w-3 h-3" />{PRIORITY_LABELS[task.priority]}
          </span>
          <Countdown dueDate={task.dueDate} compact />
          {task.status !== "done" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, "done"); }}
              className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 transition-colors active:scale-95"
              title="إنجاز سريع"
            >
              <Check className="w-3 h-3" />إنجاز
            </button>
          )}
        </div>

        {/* Due date */}
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleString("ar-EG", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </div>

        {/* Assigned users */}
        {task.assignedTo?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {task.assignedTo.map((u) => (
              <span key={u._id}
                className="text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                {u.name}
              </span>
            ))}
          </div>
        )}

        {/* Creator */}
        {task.createdBy && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <AlignLeft className="w-3 h-3" />
            <span className="text-gray-600">{task.createdBy.name}</span>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="text-xs bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-3 py-2">
            📝 {task.notes}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── TaskModal (full-screen on mobile) ───────────────────────────────────────

const emptyForm = {
  title: "", description: "", dueDate: "", priority: "medium",
  assignedTo: [], notes: "", department: "",
};

function TaskModal({ open, onClose, onSave, editItem, users, userRole, userDept }) {
  const [form,   setForm]   = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({
        ...editItem,
        dueDate: editItem.dueDate
          ? new Date(editItem.dueDate).toISOString().slice(0, 16)
          : "",
        assignedTo: (editItem.assignedTo || []).map((u) => u._id || u),
      });
    } else {
      setForm({ ...emptyForm, department: userRole === "manager" ? (userDept || "") : "" });
    }
  }, [open, editItem, userRole, userDept]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleUser = (id) =>
    setForm((p) => ({
      ...p,
      assignedTo: p.assignedTo.includes(id)
        ? p.assignedTo.filter((x) => x !== id)
        : [...p.assignedTo, id],
    }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate || !form.department) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const deptUsers = form.department
    ? users.filter((u) => u.department === form.department || u.role === "admin" || u.role === "supervisor")
    : users;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative mt-auto sm:m-auto sm:mt-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92dvh] overflow-hidden flex flex-col"
      >
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{editItem ? "تعديل المهمة" : "مهمة جديدة"}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان المهمة *</label>
            <input value={form.title} onChange={(e) => f("title", e.target.value)}
              placeholder="أدخل عنوان المهمة..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] focus:border-transparent" />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">القسم *</label>
            <select value={form.department} onChange={(e) => f("department", e.target.value)}
              disabled={userRole === "manager"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] bg-white disabled:opacity-60">
              <option value="">— اختر القسم —</option>
              {Object.entries(DEPARTMENTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف</label>
            <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
              rows={3} placeholder="وصف المهمة..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
          </div>

          {/* Due + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">التاريخ والوقت *</label>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الأولوية</label>
              <select value={form.priority} onChange={(e) => f("priority", e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] bg-white">
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
              </select>
            </div>
          </div>

          {/* Assign users */}
          {deptUsers.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تعيين إلى
                {form.department && (
                  <span className="text-xs text-gray-400 font-normal mr-1">({DEPARTMENTS[form.department]})</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {deptUsers.map((u) => (
                  <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all active:scale-95 ${
                      form.assignedTo.includes(u._id)
                        ? "bg-[#2d5d89] text-white border-[#2d5d89] shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]"
                    }`}>
                    <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {u.name[0]}
                    </span>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)}
              rows={2} placeholder="ملاحظات إضافية..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave}
            disabled={saving || !form.title || !form.dueDate || !form.department}
            className="flex-1 py-3 rounded-xl bg-[#2d5d89] text-white text-sm font-bold transition-colors disabled:opacity-50 active:scale-95">
            {saving ? "جاري الحفظ..." : editItem ? "تحديث" : "إضافة"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main TasksPage ───────────────────────────────────────────────────────────

export default function TasksPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks,      setTasks]      = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [statusTab,  setStatusTab]  = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const canManage  = ["admin", "supervisor", "manager"].includes(user?.role);
  const canSeeAll  = ["admin", "supervisor"].includes(user?.role);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/tasks");
      setTasks(r.data.tasks || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!canManage) return;
    try {
      const r = await api.get("/tasks/users");
      setUsers(r.data.users || []);
    } catch { /* silent */ }
  }, [canManage]);

  useEffect(() => { loadTasks(); loadUsers(); }, [loadTasks, loadUsers]);

  const filtered = tasks.filter((t) => {
    const statusOk   = statusTab === "all" || t.status === statusTab;
    const deptOk     = deptFilter === "all" || t.department === deptFilter;
    const priorityOk = priorityFilter === "all" || t.priority === priorityFilter;
    return statusOk && deptOk && priorityOk;
  });

  const doneCount  = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const donePct    = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const counts = {
    all:         tasks.length,
    pending:     tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
  };

  const depts = [...new Set(tasks.map((t) => t.department))].filter(Boolean);

  const handleSave = async (form) => {
    try {
      if (editItem) {
        const r = await api.put(`/tasks/${editItem._id}`, form);
        setTasks((p) => p.map((t) => t._id === editItem._id ? r.data.task : t));
      } else {
        const r = await api.post("/tasks", form);
        setTasks((p) => [r.data.task, ...p]);
      }
      setModalOpen(false);
      setEditItem(null);
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((p) => p.filter((t) => t._id !== id));
    } catch { /* silent */ }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await api.put(`/tasks/${id}`, { status });
      setTasks((p) => p.map((t) => t._id === id ? r.data.task : t));
    } catch { /* silent */ }
  };

  const openEdit   = (task) => { setEditItem(task); setModalOpen(true); };
  const openCreate = ()     => { setEditItem(null); setModalOpen(true); };
  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  const statusTabs = [
    { key: "all",         label: "الكل",   count: counts.all,         icon: Layers,       cls: "text-gray-500" },
    { key: "pending",     label: "معلق",   count: counts.pending,     icon: Clock,        cls: "text-yellow-500" },
    { key: "in_progress", label: "جارٍ",   count: counts.in_progress, icon: AlertCircle,  cls: "text-blue-500" },
    { key: "done",        label: "مكتمل",  count: counts.done,        icon: CheckCircle2, cls: "text-green-500" },
  ];

  return (
    <div className="min-h-dvh bg-[#f0f4f8]" dir="rtl">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Back to admin (admin/supervisor only) */}
          <div className="flex items-center gap-2 min-w-0">
            {canManage && (
              <Link to="/admin" className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 flex-shrink-0 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight">إدارة المهام</p>
              <p className="text-xs text-gray-400 truncate">
                {ROLE_LABELS[user?.role]} — {user?.name}
                {user?.department && ` · ${DEPARTMENTS[user.department] || ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {canManage && (
              <button onClick={openCreate}
                className="flex items-center gap-1.5 bg-[#2d5d89] hover:bg-[#245079] active:scale-95 text-white px-3 py-2 sm:px-4 rounded-xl text-sm font-semibold transition-all">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">مهمة جديدة</span>
              </button>
            )}
            <button onClick={handleLogout} title="تسجيل الخروج"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* ── Progress bar ── */}
        {totalCount > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-bold text-gray-900">{doneCount} من {totalCount} مهمة مكتملة</span>
              <span className="text-[#2d5d89] font-bold">{donePct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-[#2d5d89] rounded-full transition-all duration-500"
                style={{ width: `${donePct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Status tabs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {statusTabs.map(({ key, label, count, icon: Icon, cls }) => (
            <button key={key} onClick={() => setStatusTab(key)}
              className={`bg-white rounded-2xl border p-3 text-center transition-all active:scale-95 ${
                statusTab === key
                  ? "border-[#2d5d89] ring-2 ring-[#2d5d89]/20 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${cls}`} />
              <p className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">{count}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* ── Priority filter ── */}
        <div className="flex flex-wrap gap-2 pb-1 items-center">
          <span className="text-xs text-gray-400 font-medium">الأولوية:</span>
          {[
            ["all", "الكل", "bg-gray-100 text-gray-600 border-gray-200"],
            ["high", "عالية", "bg-red-100 text-red-700 border-red-200"],
            ["medium", "متوسطة", "bg-yellow-100 text-yellow-700 border-yellow-200"],
            ["low", "منخفضة", "bg-green-100 text-green-700 border-green-200"],
          ].map(([k, v, cls]) => (
            <button key={k} onClick={() => setPriorityFilter(k)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                priorityFilter === k
                  ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                  : cls
              }`}>
              {v}
            </button>
          ))}
        </div>

        {/* ── Department filter (admin/supervisor + multiple depts) ── */}
        {canSeeAll && depts.length > 1 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {[["all", "كل الأقسام"], ...depts.map((d) => [d, DEPARTMENTS[d] || d])].map(([k, v]) => (
              <button key={k} onClick={() => setDeptFilter(k)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all active:scale-95 whitespace-nowrap ${
                  deptFilter === k
                    ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                    : "bg-white text-gray-600 border-gray-200"
                }`}>
                {v}
              </button>
            ))}
          </div>
        )}

        {/* ── Tasks ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium mb-1">لا توجد مهام</p>
            <p className="text-xs text-gray-300">
              {statusTab !== "all" ? "جرب تغيير الفلتر" : canManage ? "ابدأ بإضافة أول مهمة" : ""}
            </p>
            {canManage && statusTab === "all" && (
              <button onClick={openCreate}
                className="mt-5 flex items-center gap-2 bg-[#2d5d89] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#245079] active:scale-95 transition-all">
                <Plus className="w-4 h-4" />إضافة مهمة
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  canManage={canManage}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal
            open={modalOpen}
            onClose={() => { setModalOpen(false); setEditItem(null); }}
            onSave={handleSave}
            editItem={editItem}
            users={users}
            userRole={user?.role}
            userDept={user?.department}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
