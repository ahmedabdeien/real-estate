import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Home, Users, FileText, Image,
  Settings, Briefcase, ChevronLeft, LogOut, TrendingUp, Activity,
  CheckSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const navItems = [
  { to: "/admin",          label: "لوحة التحكم",  icon: LayoutDashboard, exact: true, roles: ["admin"] },
  { to: "/admin/projects", label: "المشاريع",      icon: Building2 },
  { to: "/admin/units",    label: "الوحدات",       icon: Home },
  { to: "/admin/leads",    label: "العملاء",       icon: TrendingUp },
  { to: "/admin/blogs",    label: "المقالات",      icon: FileText },
  { to: "/admin/content",  label: "المحتوى",       icon: FileText,  roles: ["admin"] },
  { to: "/admin/media",    label: "المكتبة",       icon: Image,     roles: ["admin"] },
  { to: "/admin/careers",  label: "الوظائف",       icon: Briefcase, roles: ["admin"] },
  { to: "/admin/users",    label: "المستخدمين",    icon: Users,     roles: ["admin"] },
  { to: "/admin/activity", label: "سجل النشاط",   icon: Activity,  roles: ["admin"] },
  { to: "/admin/settings", label: "الإعدادات",     icon: Settings,  roles: ["admin"] },
  // Tasks — shown to all panel roles except viewer
  { to: "/tasks",          label: "المهام",        icon: CheckSquare, roles: ["admin", "manager", "employee", "sales"], external: true },
];

const roleLabels = {
  admin:    "مدير",
  manager:  "مشرف",
  employee: "موظف",
  sales:    "مبيعات",
  viewer:   "مشاهد",
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const filtered = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 right-0 h-full bg-[#2d5d89] text-white z-40 flex flex-col transition-all duration-300
          ${collapsed ? "-right-64 lg:right-0 lg:w-16" : "right-0 w-64"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 min-h-[64px]">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="font-bold text-sm leading-tight whitespace-nowrap">الصرح للعقارات</p>
                <p className="text-white/50 text-xs whitespace-nowrap">لوحة الإدارة</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="mr-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filtered.map(({ to, label, icon: Icon, exact, external }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive && !external
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.name?.[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{roleLabels[user?.role] || user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
