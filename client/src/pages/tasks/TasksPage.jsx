import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogOut, CheckCircle2, Clock, AlertCircle, Trash2, Edit2,
  User, Flag, X, ChevronDown, AlignLeft, Layers, Building2,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = {
  accounts:       "الحسابات",
  legal:          "الشئون القانونية",
  marketing:      "التسويق",
  administrative: "اداري",
  projects:       "مشروعات",
  warehouse:      "المخازن",
  purchasing:     "المشتريات",
};

const statusLabel = { pending: "معلق", in_progress: "جارٍ", done: "مكتمل" };
const statusColor  = {
  pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100  text-blue-700   border-blue-200",
  done:        "bg-green-100 text-green-700  border-green-200",
};
const priorityLabel = { low: "منخفض", medium: "متوسط", high: "عالي" };
const priorityColor  = {
  low:    "bg-gray-100   text-gray-600",
  medium: "bg-orange-100 text-orange-600",
  high:   "bg-red-100    text-red-600",
};
const roleLabel = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ dueDate }) {
  const [text, setText]       = useState("");
  const [urgent, setUrgent]   = useState(false);
  const [overdue, setOverdue] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(dueDate) - Date.now();
      if (diff <= 0) {
        const abs = Math.abs(diff);
        const h = Math.floor(abs / 3600000);
        const m = Math.floor((abs % 3600000) / 60000);
        setText(`متأخر ${h}س ${m}د`);
        setOverdue(true);
        setUrgent(false);
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setOverdue(false);
        setUrgent(diff < 86400000);
        if (d > 0) setText(`${d}ي ${h}س ${m}د`);
        else       setText(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDate]);

  return (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
      overdue ? "bg-red-100 text-red-600" :
      urgent  ? "bg-orange-100 text-orange-600" :
                "bg-gray-100 text-gray-600"
    }`}>
      {text}
    </span>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, canManage, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const dept = DEPARTMENTS[task.department] || task.department;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{task.title}</h3>
          <span className="inline-flex items-center gap-1 mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            <Building2 className="w-3 h-3" />{dept}
          </span>
        </div>
        {canManage && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(task)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(task._id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[task.status]}`}>
          {statusLabel[task.status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
          <Flag className="w-3 h-3 inline ml-0.5" />{priorityLabel[task.priority]}
        </span>
        <Countdown dueDate={task.dueDate} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        {new Date(task.dueDate).toLocaleString("ar-EG", {
          month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </div>

      {task.assignedTo?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <User className="w-3.5 h-3.5 text-gray-400" />
          {task.assignedTo.map((u) => (
            <span key={u._id}
              className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">
              {u.name}
              <span className="text-gray-400">({roleLabel[u.role] || u.role})</span>
            </span>
          ))}
        </div>
      )}

      {task.createdBy && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <AlignLeft className="w-3 h-3" />
          بواسطة: <span className="text-gray-600 font-medium">{task.createdBy.name}</span>
        </div>
      )}

      {task.notes && (
        <div className="text-xs bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl px-3 py-2">
          📝 {task.notes}
        </div>
      )}

      {/* Status selector */}
      <div className="relative">
        <button onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <span>تغيير الحالة</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute bottom-full mb-1 right-0 left-0 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden"
            >
              {Object.entries(statusLabel).map(([k, v]) => (
                <button key={k}
                  onClick={() => { onStatusChange(task._id, k); setOpen(false); }}
                  className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    task.status === k ? "font-bold text-[#2d5d89]" : "text-gray-700"
                  }`}>
                  {v}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── TaskModal ────────────────────────────────────────────────────────────────

const emptyForm = {
  title: "", description: "", dueDate: "", priority: "medium",
  assignedTo: [], notes: "", department: "",
};

function TaskModal({ open, onClose, onSave, editItem, users, userRole, userDept }) {
  const [form, setForm]   = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editItem) {
        setForm({
          ...editItem,
          dueDate: editItem.dueDate
            ? new Date(editItem.dueDate).toISOString().slice(0, 16)
            : "",
          assignedTo: (editItem.assignedTo || []).map((u) => u._id || u),
        });
      } else {
        setForm({
          ...emptyForm,
          department: (userRole === "manager" && userDept) ? userDept : "",
        });
      }
    }
  }, [open, editItem, userRole, userDept]);

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const toggleUser = (id) => {
    setForm((p) => ({
      ...p,
      assignedTo: p.assignedTo.includes(id)
        ? p.assignedTo.filter((x) => x !== id)
        : [...p.assignedTo, id],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate || !form.department) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  // Show users who belong to the selected dept, plus admin/supervisor (global roles)
  const deptUsers = form.department
    ? users.filter(
        (u) => u.department === form.department ||
               u.role === "admin" ||
               u.role === "supervisor"
      )
    : users;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{editItem ? "تعديل المهمة" : "مهمة جديدة"}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المهمة *</label>
            <input value={form.title} onChange={(e) => f("title", e.target.value)}
              placeholder="أدخل عنوان المهمة"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القسم *</label>
            <select value={form.department} onChange={(e) => f("department", e.target.value)}
              disabled={userRole === "manager"}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] disabled:opacity-60 bg-white">
              <option value="">— اختر القسم —</option>
              {Object.entries(DEPARTMENTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
              rows={3} placeholder="وصف المهمة..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
          </div>

          {/* Due + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ والوقت *</label>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
              <select value={form.priority} onChange={(e) => f("priority", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] bg-white">
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
              </select>
            </div>
          </div>

          {/* Assign users */}
          {deptUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعيين إلى
                {form.department && (
                  <span className="text-xs text-gray-400 mr-2">
                    (موظفو {DEPARTMENTS[form.department] || form.department})
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {deptUsers.map((u) => (
                  <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      form.assignedTo.includes(u._id)
                        ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]"
                    }`}>
                    {u.name}
                    <span className="opacity-60">({roleLabel[u.role] || u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)}
              rows={2} placeholder="ملاحظات إضافية..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave}
            disabled={saving || !form.title || !form.dueDate || !form.department}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  const canManage = ["admin", "supervisor", "manager"].includes(user?.role);
  const canSeeDepts = user?.role === "admin" || user?.role === "supervisor";

  const loadTasks = useCallback(async () => {
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

  // Filtered tasks
  const filtered = tasks.filter((t) => {
    const statusOk = statusTab === "all" || t.status === statusTab;
    const deptOk   = deptFilter === "all" || t.department === deptFilter;
    return statusOk && deptOk;
  });

  const counts = {
    all:         tasks.length,
    pending:     tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done:        tasks.filter((t) => t.status === "done").length,
  };

  // Unique departments across all tasks visible to this user
  const depts = [...new Set(tasks.map((t) => t.department))].filter(Boolean);

  const handleSave = async (form) => {
    try {
      if (editItem) {
        const r = await api.put(`/tasks/${editItem._id}`, form);
        setTasks((p) => p.map((t) => t._id === editItem._id ? r.data.task : t));
      } else {
        const r = await api.post("/tasks", form);
        setTasks((p) => [...p, r.data.task]);
      }
      setModalOpen(false);
      setEditItem(null);
    } catch { /* modal handles UI */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
    await api.delete(`/tasks/${id}`);
    setTasks((p) => p.filter((t) => t._id !== id));
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await api.put(`/tasks/${id}`, { status });
      setTasks((p) => p.map((t) => t._id === id ? r.data.task : t));
    } catch { /* silent */ }
  };

  const openEdit   = (task) => { setEditItem(task);  setModalOpen(true); };
  const openCreate = ()     => { setEditItem(null);  setModalOpen(true); };
  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  const statusTabs = [
    { key: "all",         label: "الكل",    icon: Layers,        color: "text-gray-600" },
    { key: "pending",     label: "معلق",    icon: Clock,         color: "text-yellow-600" },
    { key: "in_progress", label: "جارٍ",    icon: AlertCircle,   color: "text-blue-600" },
    { key: "done",        label: "مكتمل",   icon: CheckCircle2,  color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d5d89] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">إدارة المهام</p>
              <p className="text-xs text-gray-400">
                {roleLabel[user?.role] || user?.role} — {user?.name}
                {user?.department && ` — ${DEPARTMENTS[user.department] || user.department}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button onClick={openCreate}
                className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">مهمة جديدة</span>
              </button>
            )}
            <button onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              title="تسجيل الخروج">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Status tabs */}
        <div className="grid grid-cols-4 gap-3">
          {statusTabs.map(({ key, label, icon: Icon, color }) => (
            <button key={key} onClick={() => setStatusTab(key)}
              className={`bg-white rounded-2xl border p-3 sm:p-4 text-center transition-all ${
                statusTab === key
                  ? "border-[#2d5d89] ring-2 ring-[#2d5d89]/20 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              }`}>
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <p className="text-xl font-bold text-gray-900">{counts[key]}</p>
              <p className="text-xs text-gray-500 hidden sm:block">{label}</p>
            </button>
          ))}
        </div>

        {/* Department filter — only for admin/supervisor */}
        {canSeeDepts && depts.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setDeptFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                deptFilter === "all"
                  ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]"
              }`}>
              كل الأقسام
            </button>
            {depts.map((d) => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  deptFilter === d
                    ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#2d5d89]"
                }`}>
                {DEPARTMENTS[d] || d}
              </button>
            ))}
          </div>
        )}

        {/* Tasks grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">لا توجد مهام</p>
            {canManage && (
              <button onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 bg-[#2d5d89] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
                <Plus className="w-4 h-4" />إضافة أول مهمة
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Create/Edit Modal */}
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
