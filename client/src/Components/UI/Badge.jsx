import { MantineProvider, Badge as MantineBadge } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

const COLORS = {
  default: "gray",
  primary: "brand",
  success: "green",
  warning: "yellow",
  danger: "red",
  info: "blue",
  outline: "gray",
};

export default function Badge({ children, variant = "default" }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <MantineBadge variant={variant === "outline" ? "outline" : "light"} color={COLORS[variant] || "gray"}>
        {children}
      </MantineBadge>
    </MantineProvider>
  );
}

export function statusBadge(status) {
  const map = {
    available:          { label: "متاح",         variant: "success" },
    sold:                { label: "مباع",          variant: "danger" },
    reserved:            { label: "محجوز",         variant: "warning" },
    coming_soon:         { label: "قريباً",         variant: "info" },
    under_construction:  { label: "قيد الإنشاء",   variant: "warning" },
    ready:               { label: "جاهز للتسليم",  variant: "success" },
    active:              { label: "نشط",           variant: "success" },
    inactive:            { label: "غير نشط",       variant: "default" },
    featured:            { label: "مميز",          variant: "primary" },
  };
  return map[status] || { label: status || "—", variant: "default" };
}
