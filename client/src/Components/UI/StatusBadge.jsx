/**
 * StatusBadge — Unified status/badge display component
 * Replaces all scattered inline status styling
 */

const PRESETS = {
  // Lead statuses
  "جديد":          "bg-[color:var(--primary)]/10 text-[color:var(--primary)] border-[color:var(--primary)]/20",
  "تم التواصل":    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "مهتم":          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  "غير مهتم":      "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  "تم البيع":      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  "متابعة":        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",

  // Unit statuses
  "متاحة":         "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  "محجوزة":        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
  "مباعة":         "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",

  // Project statuses
  "قيد الإنشاء":   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
  "جاهز":          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  "مكتمل":         "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
  "متوقف":         "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",

  // Task statuses
  "pending":       "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
  "in_progress":   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
  "done":          "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  "cancelled":     "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",

  // Task priorities
  "low":    "bg-gray-100 text-gray-600 border-gray-200",
  "medium": "bg-blue-50 text-blue-700 border-blue-200",
  "high":   "bg-orange-50 text-orange-700 border-orange-200",
  "urgent": "bg-red-50 text-red-600 border-red-200",

  // Roles
  "admin":      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  "supervisor": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  "manager":    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  "employee":   "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300",
  "sales":      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  "viewer":     "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",

  // Generic
  "active":    "bg-green-50 text-green-700 border-green-200",
  "inactive":  "bg-gray-100 text-gray-600 border-gray-200",
  "published": "bg-green-50 text-green-700 border-green-200",
  "draft":     "bg-gray-100 text-gray-500 border-gray-200",
};

const LABELS = {
  pending: "قيد الانتظار", in_progress: "جاري", done: "منجز", cancelled: "ملغي",
  low: "منخفض", medium: "متوسط", high: "عالي", urgent: "عاجل",
  admin: "مدير عام", supervisor: "مشرف عام", manager: "مدير قسم",
  employee: "موظف", sales: "مبيعات", viewer: "مشاهد",
  active: "نشط", inactive: "غير نشط",
  published: "منشور", draft: "مسودة",
};

export default function StatusBadge({ status, label, size = "sm", dot = false }) {
  if (!status) return null;
  const classes = PRESETS[status] || "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  const text = label ?? LABELS[status] ?? status;
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border ${classes} ${sizeClass}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />}
      {text}
    </span>
  );
}
