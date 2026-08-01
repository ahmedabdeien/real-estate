/**
 * StatusBadge — Unified status/badge display component (Mantine)
 */
import { MantineProvider, Badge } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

const COLORS = {
  // Lead statuses
  "جديد": "brand",
  "تم التواصل": "blue",
  "مهتم": "green",
  "غير مهتم": "red",
  "تم البيع": "grape",
  "متابعة": "yellow",

  // Unit statuses
  "متاحة": "green",
  "محجوزة": "yellow",
  "مباعة": "gray",

  // Project statuses
  "قيد الإنشاء": "blue",
  "جاهز": "green",
  "مكتمل": "grape",
  "متوقف": "gray",

  // Task statuses
  pending: "yellow",
  in_progress: "blue",
  done: "green",
  cancelled: "gray",

  // Task priorities
  low: "gray",
  medium: "blue",
  high: "orange",
  urgent: "red",

  // Roles
  admin: "red",
  supervisor: "grape",
  manager: "blue",
  employee: "gray",
  sales: "green",
  viewer: "gray",

  // Generic
  active: "green",
  inactive: "gray",
  published: "green",
  draft: "gray",
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
  const color = COLORS[status] || "gray";
  const text = label ?? LABELS[status] ?? status;

  return (
    <MantineProvider theme={mantineTheme}>
      <Badge variant="light" color={color} size={size === "xs" ? "xs" : "sm"} leftSection={dot ? "●" : undefined}>
        {text}
      </Badge>
    </MantineProvider>
  );
}
