/**
 * AdminTasks — migrated to TanStack Query + shared UI components
 * Preserves: Kanban DnD, list view, bulk actions, department stats
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaTrash, FaPen, FaCircleCheck, FaClock, FaTriangleExclamation,
  FaLayerGroup, FaFlag, FaUser, FaMagnifyingGlass, FaXmark, FaBars,
  FaTableColumns, FaChartBar, FaSpinner,
} from "react-icons/fa6";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable,
} from "@dnd-kit/core";

import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, usePatchTask } from "../../hooks/queries/useTasks";
import { useUsers } from "../../hooks/queries/useUsers";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useForm } from "../../hooks/useForm";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, SelectField, TextareaField } from "../../Components/UI/FormField";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { DEPARTMENTS, STATUS_LABELS, ROLE_LABELS, Countdown } from "../tasks/TasksPage";

// ── Constants ──────────────────────────────────────────────────────────────
const PRIORITY_LABELS = { low: "منخفض", medium: "متوسط", high: "عالي" };
const STATUS_COLORS = {
  pending:     "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100  text-blue-700",
  done:        "bg-green-100 text-green-700",
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
const KANBAN_COLS = [
  { key: "in_progress", label: "قيد التنفيذ", color: "border-blue-300 bg-blue-50/40" },
  { key: "pending",     label: "للمراجعة",    color: "border-amber-300 bg-amber-50/40" },
  { key: "done",        label: "مكتمل",        color: "border-green-300 bg-green-50/40" },
];
const PRIORITY_BORDER = { high: "border-r-red-500", medium: "border-r-amber-400", low: "border-r-green-400" };

const emptyForm = {
  title: "", description: "", dueDate: "", priority: "medium",
  assignedTo: [], notes: "", department: "",
};

// ── Kanban Card ──────────────────────────────────────────────────────────
function DraggableCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined;
  const isOverdue = task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-900 rounded-xl border-r-4 border border-gray-100 dark:border-gray-700 p-3 shadow-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${isDragging ? "shadow-lg opacity-80" : "hover:shadow-md"} ${PRIORITY_BORDER[task.priority] || "border-r-gray-300"} ${isOverdue ? "ring-1 ring-red-300" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium leading-snug ${isOverdue ? "text-red-700" : "text-gray-900 dark:text-white"}`}>
          {task.title}
        </p>
        <div className="flex gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-blue-50 text-blue-500">
            <FaPen className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-1 rounded hover:bg-red-50 text-red-400">
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">متأخرة</span>}
      </div>
      {task.assignedTo?.length > 0 && (
        <div className="flex -space-x-1 space-x-reverse mt-2">
          {task.assignedTo.slice(0, 3).map((u) => (
            <div key={u._id} title={u.name}
              className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "var(--primary)" }}>
              {u.name?.[0]?.toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DroppableColumn({ colKey, label, color, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: colKey });
  return (
    <div className={`flex-1 min-w-[240px] rounded-2xl border-2 ${color} ${isOver ? "ring-2 ring-[color:var(--primary)]/40" : ""} transition-all`}>
      <div className="px-3 py-2.5 border-b border-current/10">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{label}</span>
        <span className="mr-2 text-xs text-gray-400 bg-white/60 dark:bg-gray-900/40 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="p-3 space-y-2.5 min-h-[200px]">
        {tasks.map((t) => <DraggableCard key={t._id} task={t} onEdit={onEdit} onDelete={onDelete} />)}
        {tasks.length === 0 && <p className="text-xs text-gray-400 text-center py-6">لا توجد مهام هنا</p>}
      </div>
    </div>
  );
}

// ── Task Form ──────────────────────────────────────────────────────────────
function TaskForm({ form, setForm, users, userRole }) {
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
      <FormField label="عنوان المهمة" required>
        <input value={form.title} onChange={(e) => f("title", e.target.value)}
          placeholder="عنوان المهمة..." className={inputCls} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="القسم" required>
          <SelectField value={form.department} onChange={(e) => f("department", e.target.value)}
            disabled={userRole === "manager"}>
            <option value="">— اختر القسم —</option>
            {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </SelectField>
        </FormField>
        <FormField label="الأولوية">
          <SelectField value={form.priority} onChange={(e) => f("priority", e.target.value)}>
            <option value="low">منخفض</option>
            <option value="medium">متوسط</option>
            <option value="high">عالي</option>
          </SelectField>
        </FormField>
      </div>
      <FormField label="التاريخ والوقت" required>
        <input type="datetime-local" value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)} className={inputCls} />
      </FormField>
      <FormField label="الوصف">
        <TextareaField value={form.description} onChange={(e) => f("description", e.target.value)} rows={3} placeholder="وصف المهمة..." />
      </FormField>
      {deptUsers.length > 0 && (
        <FormField label="تعيين إلى">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
            {deptUsers.map((u) => (
              <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  form.assignedTo.includes(u._id)
                    ? "text-white border-transparent"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                }`}
                style={form.assignedTo.includes(u._id) ? { background: "var(--primary)" } : {}}>
                {u.name}
                <span className="opacity-60">({ROLE_LABELS[u.role] || u.role})</span>
              </button>
            ))}
          </div>
        </FormField>
      )}
      <FormField label="ملاحظات">
        <TextareaField value={form.notes} onChange={(e) => f("notes", e.target.value)} rows={2} placeholder="ملاحظات..." />
      </FormField>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminTasks() {
  const { user }  = useAuth();
  const toast     = useToast();

  const [form,         setForm]         = useState(emptyForm);
  const [editItem,     setEditItem]     = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [search,       setSearch]       = useState("");
  const [deptFilter,   setDeptFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected,     setSelected]     = useState(new Set());
  const [viewMode,     setViewMode]     = useState("list");

  const confirmDelete = useDisclosure();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const canManage = ["admin", "supervisor", "manager"].includes(user?.role);
  const canSeeAll = ["admin", "supervisor"].includes(user?.role);

  // Queries
  const { data: tasksData, isLoading } = useTasks();
  const { data: usersData }            = useUsers({ limit: 200 }, { enabled: canManage });

  const tasks = tasksData?.tasks ?? [];
  const users = usersData?.users ?? [];

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const patchMutation  = usePatchTask();

  // ── Derived ──
  const now   = new Date();
  const total = tasks.length;
  const completedCount  = tasks.filter((t) => t.status === "done").length;
  const pendingCount    = tasks.filter((t) => t.status !== "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const overdueCount    = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length;

  const deptStats = useMemo(() => Object.keys(DEPARTMENTS).reduce((acc, d) => {
    const tot  = tasks.filter((t) => t.department === d).length;
    const done = tasks.filter((t) => t.department === d && t.status === "done").length;
    acc[d] = { total: tot, done, pct: tot ? Math.round((done / tot) * 100) : 0 };
    return acc;
  }, {}), [tasks]);

  const filtered = useMemo(() => tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || t.title.toLowerCase().includes(q) || t.assignedTo?.some((u) => u.name?.toLowerCase().includes(q))) &&
      (deptFilter === "all" || t.department === deptFilter) &&
      (statusFilter === "all" || t.status === statusFilter)
    );
  }), [tasks, search, deptFilter, statusFilter]);

  const depts = [...new Set(tasks.map((t) => t.department))].filter(Boolean);

  // ── Handlers ──
  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm, department: user?.role === "manager" ? (user?.department || "") : "" });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditItem(task);
    setForm({
      ...task,
      dueDate:    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      assignedTo: (task.assignedTo || []).map((u) => u._id || u),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.dueDate || !form.department) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem._id, data: form });
        toast.success("تم تحديث المهمة");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("تم إنشاء المهمة");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "حدث خطأ");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data);
      toast.success("تم حذف المهمة");
      confirmDelete.close();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const handleStatusChange = (id, status) => {
    patchMutation.mutate({ id, data: { status } });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const newStatus = over.id;
    const task = tasks.find((t) => t._id === active.id);
    if (!task || task.status === newStatus) return;
    patchMutation.mutate({ id: active.id, data: { status: newStatus } });
  };

  const toggleSelect    = (id) => setSelected((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleSelectAll = () => selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map((t) => t._id)));

  const bulkStatus = async (status) => {
    const ids = [...selected];
    if (!ids.length) return;
    await Promise.all(ids.map((id) => patchMutation.mutateAsync({ id, data: { status } })));
    setSelected(new Set());
    toast.success(`تم تحديث ${ids.length} مهمة`);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ──
  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <PageHeader
        title={canManage ? "إدارة المهام" : "مهامي"}
        subtitle={`${total} مهمة إجمالي`}
        icon={<FaLayerGroup />}
        loading={isLoading}
        actions={
          <>
            {/* View toggle */}
            <div className="flex border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
              {[
                { key: "list",   icon: <FaBars className="w-3.5 h-3.5" />,         label: "قائمة" },
                { key: "kanban", icon: <FaTableColumns className="w-3.5 h-3.5" />, label: "كانبان" },
              ].map((v) => (
                <button key={v.key} onClick={() => setViewMode(v.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                    viewMode === v.key ? "text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  style={viewMode === v.key ? { background: "var(--primary)" } : {}}>
                  {v.icon}{v.label}
                </button>
              ))}
            </div>
            {canManage && (
              <PrimaryButton icon={<FaPlus />} onClick={openCreate}>مهمة جديدة</PrimaryButton>
            )}
          </>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <FaLayerGroup />,  label: "الإجمالي",    value: total,          color: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300", filter: "all" },
            { icon: <FaClock />,       label: "معلقة",       value: pendingCount,   color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400", filter: "pending" },
            { icon: <FaChartBar />,    label: "قيد التنفيذ", value: inProgressCount,color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400", filter: "in_progress" },
            { icon: <FaCircleCheck />, label: "مكتملة",      value: completedCount, color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400", filter: "done" },
          ].map(({ icon, label, value, color, filter }) => (
            <button key={label} onClick={() => setStatusFilter(filter)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm text-right ${color} ${statusFilter === filter ? "ring-2 ring-[color:var(--primary)]/30" : ""}`}>
              <div className="flex-1">
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs opacity-70 mt-0.5">{label}</p>
              </div>
              <span className="opacity-40 text-lg">{icon}</span>
            </button>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueCount > 0 && (
          <button onClick={() => setStatusFilter("pending")}
            className="w-full flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors">
            <FaTriangleExclamation className="w-4 h-4 flex-shrink-0" />
            تنبيه: {overdueCount} مهمة متأخرة عن موعدها — اضغط للمراجعة
          </button>
        )}

        {/* Dept stats for admin/supervisor */}
        {canSeeAll && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(DEPARTMENTS).map(([k, v]) => (
              <button key={k} onClick={() => setDeptFilter(deptFilter === k ? "all" : k)}
                className={`bg-white dark:bg-gray-900 rounded-xl border p-3 text-center transition-all ${
                  deptFilter === k ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20" : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{deptStats[k]?.total || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{v}</p>
                {deptStats[k]?.total > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${deptStats[k].pct}%` }} />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{deptStats[k].pct}%</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-48 relative">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المهام..."
              className={`${inputCls} pr-9`} />
          </div>
          <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto">
            <option value="all">كل الحالات</option>
            <option value="pending">معلق</option>
            <option value="in_progress">جارٍ</option>
            <option value="done">مكتمل</option>
          </SelectField>
          {canSeeAll && depts.length > 1 && (
            <SelectField value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-auto">
              <option value="all">كل الأقسام</option>
              {depts.map((d) => <option key={d} value={d}>{DEPARTMENTS[d] || d}</option>)}
            </SelectField>
          )}
        </div>

        {/* Bulk actions */}
        {canManage && selected.size > 0 && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap border"
            style={{ background: "var(--primary)/5", borderColor: "var(--primary)/20" }}>
            <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>تم تحديد {selected.size} مهمة</span>
            <div className="mr-auto flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">تغيير الحالة:</span>
              {[
                { s: "pending",     label: "معلق",  cls: "bg-amber-100 hover:bg-amber-200 text-amber-700" },
                { s: "in_progress", label: "جارٍ",  cls: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
                { s: "done",        label: "مكتمل", cls: "bg-green-100 hover:bg-green-200 text-green-700" },
              ].map(({ s, label, cls }) => (
                <button key={s} onClick={() => bulkStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${cls}`}>
                  {label}
                </button>
              ))}
              <button onClick={() => setSelected(new Set())}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Kanban */}
        {viewMode === "kanban" && !isLoading && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLS.map((col) => (
                <DroppableColumn key={col.key} colKey={col.key} label={col.label} color={col.color}
                  tasks={filtered.filter((t) => t.status === col.key)}
                  onEdit={openEdit} onDelete={(id) => confirmDelete.open(id)} />
              ))}
            </div>
          </DndContext>
        )}

        {/* List view */}
        {viewMode === "list" && (
          isLoading ? (
            <div className="flex items-center justify-center h-48">
              <FaSpinner className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 py-16 text-center">
              <FaCircleCheck className="w-12 h-12 mx-auto text-gray-200 dark:text-gray-600 mb-3" />
              <p className="text-gray-400">لا توجد مهام</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {canManage && (
                        <th className="text-right px-3 py-3 w-10">
                          <input type="checkbox"
                            checked={filtered.length > 0 && selected.size === filtered.length}
                            onChange={toggleSelectAll} className="rounded cursor-pointer accent-[color:var(--primary)]" />
                        </th>
                      )}
                      {["المهمة", "القسم", "الحالة", "الأولوية", "المكلفون", "الموعد", ""].map((h, i) => (
                        <th key={i} className="text-right px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    <AnimatePresence>
                      {filtered.map((task) => {
                        const isOverdue = task.status !== "done" && task.dueDate && new Date(task.dueDate) < now;
                        return (
                          <motion.tr key={task._id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                              selected.has(task._id) ? "bg-[color:var(--primary)]/5" :
                              isOverdue ? "bg-red-50/30 dark:bg-red-900/5" : ""
                            }`}>
                            {canManage && (
                              <td className="px-3 py-3 w-10">
                                <input type="checkbox" checked={selected.has(task._id)}
                                  onChange={() => toggleSelect(task._id)} className="rounded cursor-pointer accent-[color:var(--primary)]" />
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900 dark:text-white leading-tight">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{task.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-semibold ${DEPT_COLORS[task.department] || "bg-gray-100 text-gray-600"}`}>
                                {DEPARTMENTS[task.department] || task.department}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[task.status]}`}>
                                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                  <option key={k} value={k}>{v}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={task.priority} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex -space-x-1 space-x-reverse">
                                {(task.assignedTo || []).slice(0, 3).map((u) => (
                                  <div key={u._id} title={u.name}
                                    className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: "var(--primary)" }}>
                                    {u.name?.[0]?.toUpperCase()}
                                  </div>
                                ))}
                                {task.assignedTo?.length > 3 && (
                                  <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                                    +{task.assignedTo.length - 3}
                                  </div>
                                )}
                                {!task.assignedTo?.length && <span className="text-xs text-gray-400">—</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {new Date(task.dueDate).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                              </p>
                              <Countdown dueDate={task.dueDate} compact />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {canManage && (
                                  <>
                                    <button onClick={() => openEdit(task)}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                                      <FaPen className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => confirmDelete.open(task._id)}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "تعديل المهمة" : "إضافة مهمة جديدة"}
        icon={<FaLayerGroup className="w-4 h-4" />}
        size="xl"
        footer={
          <>
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
              إلغاء
            </button>
            <button onClick={handleSave} disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary)" }}>
              {isPending && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
              {editItem ? "تحديث المهمة" : "إنشاء المهمة"}
            </button>
          </>
        }
      >
        <TaskForm form={form} setForm={setForm} users={users} userRole={user?.role} />
      </AdminModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        onConfirm={handleDelete}
        title="حذف المهمة"
        message="هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
