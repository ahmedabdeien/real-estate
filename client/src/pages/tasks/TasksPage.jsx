import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogOut, CheckCircle2, Clock, AlertCircle, Trash2, Edit2,
  User, Flag, X, ChevronDown, AlignLeft,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusLabel = { pending: "معلق", in_progress: "جارٍ", done: "مكتمل" };
const statusColor = {
  pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100  text-blue-700   border-blue-200",
  done:        "bg-green-100 text-green-700  border-green-200",
};
const priorityLabel = { low: "منخفض", medium: "متوسط", high: "عالي" };
const priorityColor = {
  low:    "bg-gray-100   text-gray-600",
  medium: "bg-orange-100 text-orange-600",
  high:   "bg-red-100    text-red-600",
};
const roleLabel = { admin: "مدير", manager: "مشرف", employee: "موظف", sales: "مبيعات", viewer: "مشاهد" };

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ dueDate }) {
  const [text, setText] = useState("");
  const calc = useCallback(() => {
    const diff = new Date(dueDate) - Date.now();
    if (diff <= 0) return setText("متأخر");
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setText(d > 0 ? `${d}ي ${h}س` : h > 0 ? `${h}س ${m}د` : `${m}د`);
  }, [dueDate]);

  useEffect(() => { calc(); const t = setInterval(calc, 30000); return () => clearInterval(t); }, [calc]);

  const diff = new Date(dueDate) - Date.now();
  const cls = diff <= 0 ? "text-red-500 font-bold" : diff < 86400000 ? "text-orange-500 font-semibold" : "text-gray-500";
  return <span className={cls}><Clock className="inline w-3.5 h-3.5 mr-0.5 mb-0.5" />{text}</span>;
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, role, onEdit, onDelete, onStatusChange }) {
  const canManage = ["admin", "manager"].includes(role);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900 leading-snug flex-1">{task.title}</p>
        <div className="flex gap-1 shrink-0">
          {canManage && (
            <>
              <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#2d5d89] transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[task.status]}`}>
          {statusLabel[task.status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
          <Flag className="inline w-3 h-3 mr-0.5 mb-0.5" />
          {priorityLabel[task.priority]}
        </span>
        <span className="text-xs"><Countdown dueDate={task.dueDate} /></span>
      </div>

      {/* Assigned avatars */}
      {task.assignedTo?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.assignedTo.map((u) => (
            <span key={u._id} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5 text-xs text-gray-600 border border-gray-100">
              {u.avatar
                ? <img src={u.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                : <User className="w-3.5 h-3.5 text-gray-400" />}
              {u.name}
            </span>
          ))}
        </div>
      )}

      {/* Employee notes */}
      {task.notes && (
        <p className="text-xs text-gray-400 italic border-t border-gray-50 pt-2">{task.notes}</p>
      )}

      {/* Status selector */}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task._id, e.target.value)}
        className="mt-auto text-xs rounded-xl border border-gray-200 px-2 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] cursor-pointer"
      >
        <option value="pending">معلق</option>
        <option value="in_progress">جارٍ</option>
        <option value="done">مكتمل</option>
      </select>
    </motion.div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({ initial, users, onSave, onClose }) {
  const empty = { title: "", description: "", assignedTo: [], dueDate: "", priority: "medium", notes: "" };
  const [form, setForm] = useState(initial ? {
    ...initial,
    dueDate: initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 16) : "",
    assignedTo: initial.assignedTo?.map((u) => u._id || u) || [],
  } : empty);
  const [saving, setSaving] = useState(false);

  const toggle = (id) => setForm((f) => ({
    ...f,
    assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter((x) => x !== id) : [...f.assignedTo, id],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{initial ? "تعديل المهمة" : "مهمة جديدة"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">عنوان المهمة *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
              placeholder="اكتب عنوان المهمة..." />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">التفاصيل</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
              placeholder="تفاصيل اختيارية..." />
          </div>

          {/* Due Date + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">الموعد النهائي *</label>
              <input required type="datetime-local" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">الأولوية</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
              </select>
            </div>
          </div>

          {/* Assigned users */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">تعيين لـ</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {users.map((u) => {
                const sel = form.assignedTo.includes(u._id);
                return (
                  <button type="button" key={u._id} onClick={() => toggle(u._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      sel ? "bg-[#2d5d89] text-white border-[#2d5d89]" : "bg-white text-gray-700 border-gray-200 hover:border-[#2d5d89]"}`}>
                    {u.avatar
                      ? <img src={u.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      : <User className="w-3.5 h-3.5" />}
                    {u.name}
                    <span className="opacity-60">({roleLabel[u.role]})</span>
                  </button>
                );
              })}
              {users.length === 0 && <p className="text-xs text-gray-400">لا يوجد موظفون</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#2d5d89] hover:bg-[#1f4a70] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {saving ? "جاري الحفظ..." : initial ? "حفظ التعديلات" : "إنشاء المهمة"}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",         label: "الكل" },
  { key: "pending",     label: "معلق" },
  { key: "in_progress", label: "جارٍ" },
  { key: "done",        label: "مكتمل" },
];

export default function TasksPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("all");
  const [modal, setModal]     = useState(null); // null | "create" | task-object

  const canManage = ["admin", "manager"].includes(user?.role);

  const load = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    if (!canManage) return;
    try {
      const res = await api.get("/tasks/users");
      setUsers(res.data.users || []);
    } catch {}
  };

  useEffect(() => { load(); loadUsers(); }, []);

  const handleSave = async (form) => {
    if (modal && modal._id) {
      await api.put(`/tasks/${modal._id}`, form);
    } else {
      await api.post("/tasks", form);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف المهمة نهائياً؟")) return;
    await api.delete(`/tasks/${id}`);
    load();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    setTasks((prev) => prev.map((t) => t._id === id ? { ...t, status } : t));
  };

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  const filtered = tab === "all" ? tasks : tasks.filter((t) => t.status === tab);

  // Stats
  const counts = { all: tasks.length, pending: 0, in_progress: 0, done: 0 };
  tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2d5d89] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">إدارة المهام</p>
              <p className="text-xs text-gray-400">{roleLabel[user?.role]} — {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button onClick={() => setModal("create")}
                className="flex items-center gap-1.5 bg-[#2d5d89] hover:bg-[#1f4a70] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> مهمة جديدة
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 text-sm px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`rounded-2xl p-3 text-center transition-all border ${
                tab === key ? "bg-[#2d5d89] text-white border-[#2d5d89] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:border-[#2d5d89]/30"
              }`}>
              <p className="text-2xl font-black">{counts[key]}</p>
              <p className="text-xs mt-0.5 opacity-80">{label}</p>
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">لا توجد مهام</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  role={user?.role}
                  onEdit={(t) => setModal(t)}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <TaskModal
            initial={modal === "create" ? null : modal}
            users={users}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
