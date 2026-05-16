import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Home, Users, FileText, Image,
  Settings, Briefcase, ChevronLeft, LogOut, TrendingUp, Activity,
  CheckSquare, Calculator, History, UserCircle, Edit3, BookOpen, Bell
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";

const navItems = [
  // Admin only - full dashboard
  { to: "/admin",               label: "لوحة التحكم",      icon: LayoutDashboard, exact: true, show: (u) => u?.role === "admin" },

  // Notifications - near top for visibility (all authenticated roles except viewer)
  { to: "/admin/notifications", label: "الإشعارات",         icon: Bell,            show: (u) => u?.role !== "viewer" },

  // Admin sees everything below too
  { to: "/admin/projects",      label: "المشاريع",          icon: Building2,       show: (u) => ["admin","sales"].includes(u?.role) },
  { to: "/admin/units",         label: "الوحدات",           icon: Home,            show: (u) => ["admin","sales"].includes(u?.role) },
  { to: "/admin/leads",         label: "العملاء",           icon: TrendingUp,      show: (u) => ["admin","sales"].includes(u?.role) },
  { to: "/admin/blogs",         label: "المقالات",          icon: FileText,        show: (u) => ["admin","supervisor","sales"].includes(u?.role) },

  // Tasks - label differs by role
  { to: "/admin/tasks",         label: "إدارة المهام",      icon: CheckSquare,     show: (u) => ["admin","supervisor"].includes(u?.role) },
  { to: "/admin/tasks",         label: "مهامي",             icon: CheckSquare,     show: (u) => !["admin","supervisor"].includes(u?.role) && u?.role !== "viewer" },

  // Accounting - admin OR accounts dept
  { to: "/admin/accounting",    label: "الحسابات",          icon: Calculator,      show: (u) => u?.role === "admin" || u?.department === "accounts" },
  { to: "/admin/accounting-records", label: "السجلات المحاسبية", icon: BookOpen,    show: (u) => u?.role === "admin" || u?.department === "accounts" },

  // Admin only
  { to: "/admin/content",       label: "المحتوى",           icon: Edit3,           show: (u) => u?.role === "admin" },
  { to: "/admin/media",         label: "المكتبة",           icon: Image,           show: (u) => u?.role === "admin" },
  { to: "/admin/careers",       label: "الوظائف",           icon: Briefcase,       show: (u) => u?.role === "admin" },
  { to: "/admin/users",         label: "المستخدمين",        icon: Users,           show: (u) => u?.role === "admin" },
  { to: "/admin/activity",      label: "سجل النشاط",        icon: Activity,        show: (u) => u?.role === "admin" },
  { to: "/admin/settings",      label: "الإعدادات",         icon: Settings,        show: (u) => u?.role === "admin" },

  // All authenticated roles
  { to: "/admin/profile",       label: "الملف الشخصي",     icon: UserCircle,      show: (u) => u?.role !== "viewer" },
  { to: "/admin/changelog",     label: "التحديثات",         icon: History,         show: (u) => u?.role !== "viewer" },
];

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role === "viewer") return;
    const fetchCount = () => {
      api.get("/notifications/unread-count")
        .then((r) => setUnreadCount(r.data.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close sidebar on mobile when nav link is clicked
  const handleNavClick = () => {
    if (window.innerWidth < 1024) onToggle();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const filtered = navItems.filter((item) => item.show ? item.show(user) : true);

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
          ${collapsed
            ? "translate-x-full lg:translate-x-0 w-64 lg:w-16"
            : "translate-x-0 w-64"
          }`}
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
                <p className="font-bold text-sm leading-tight whitespace-nowrap">الصرح للتطوير العقاري</p>
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
          {filtered.map(({ to, label, icon: Icon, exact, external }, idx) => {
            const isNotifications = to === "/admin/notifications";
            const showBadge = isNotifications && unreadCount > 0;
            return (
              <NavLink
                key={`${to}-${idx}`}
                to={to}
                end={exact}
                onClick={handleNavClick}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative ${
                    isActive && !external
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {showBadge && collapsed && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
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
                {showBadge && !collapsed && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
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
