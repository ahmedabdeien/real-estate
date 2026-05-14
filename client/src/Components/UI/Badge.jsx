const variants = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  primary: "bg-primary/10 text-primary",
};

export default function Badge({ children, variant = "gray", className = "" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export const statusBadge = (status) => {
  const map = {
    available: { label: "متاح", variant: "success" },
    sold: { label: "مباع", variant: "error" },
    reserved: { label: "محجوز", variant: "warning" },
    under_construction: { label: "قيد الإنشاء", variant: "info" },
    ready: { label: "جاهز", variant: "success" },
    sold_out: { label: "نفذت الوحدات", variant: "error" },
    coming_soon: { label: "قريباً", variant: "gray" },
    new: { label: "جديد", variant: "info" },
    contacted: { label: "تم التواصل", variant: "primary" },
    interested: { label: "مهتم", variant: "success" },
    not_interested: { label: "غير مهتم", variant: "gray" },
    converted: { label: "تم التحويل", variant: "success" },
    lost: { label: "خسارة", variant: "error" },
    draft: { label: "مسودة", variant: "gray" },
    published: { label: "منشور", variant: "success" },
    hidden: { label: "مخفي", variant: "warning" },
    admin: { label: "مدير", variant: "primary" },
    manager: { label: "مشرف", variant: "warning" },
    employee: { label: "موظف", variant: "info" },
    sales: { label: "مبيعات", variant: "success" },
    viewer: { label: "مشاهد", variant: "gray" },
  };
  return map[status] || { label: status, variant: "gray" };
};
