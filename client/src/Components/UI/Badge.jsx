import { cn } from "@/lib/utils";

const variants = {
  default:     "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  primary:     "bg-[#2d5d89]/10 text-[#2d5d89] dark:bg-[#2d5d89]/20",
  success:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger:      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  info:        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  outline:     "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400",
};

export default function Badge({ children, variant = "default", className }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
}

export function statusBadge(status) {
  const map = {
    available:   { label: "متاح",     variant: "success" },
    sold:        { label: "مباع",      variant: "danger" },
    reserved:    { label: "محجوز",     variant: "warning" },
    coming_soon: { label: "قريباً",    variant: "info" },
    active:      { label: "نشط",      variant: "success" },
    inactive:    { label: "غير نشط",  variant: "default" },
    featured:    { label: "مميز",     variant: "primary" },
  };
  return map[status] || { label: status || "—", variant: "default" };
}
