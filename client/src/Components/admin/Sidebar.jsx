import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Home, Users, FileText, Image,
  Settings, Briefcase, ChevronLeft, LogOut, TrendingUp, Activity,
  CheckSquare, Calculator, History, UserCircle, Edit3, BookOpen, Bell, UserPlus,
  Package, ShoppingCart, Scale, ShieldCheck, MessageCircle,
  BarChart2, Layers, Search, Globe, ChevronDown, ChevronRight,
} from "lucide-react";
import LogoSvg from "../../assets/images/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";

// ─── Nav groups ──────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { to: "/admin",               label: "لوحة التحكم",   icon: LayoutDashboard, exact: true, pageKey: "dashboard" },
      { to: "/admin/notifications", label: "الإشعارات",     icon: Bell,            pageKey: "notifications" },
      { to: "/admin/tasks",         label: "المهام",        icon: CheckSquare,     pageKey: "tasks" },
    ],
  },
  {
    label: "العقارات",
    items: [
      { to: "/admin/projects",      label: "المشاريع",      icon: Building2,       pageKey: "projects" },
      { to: "/admin/units",         label: "الوحدات",       icon: Home,            pageKey: "units" },
      { to: "/admin/leads",         label: "العملاء",       icon: TrendingUp,      pageKey: "leads" },
      { to: "/admin/client-reg",    label: "تسجيل العملاء", icon: UserPlus,        pageKey: "client-reg" },
    ],
  },
  {
    label: "الحسابات",
    items: [
      { to: "/admin/accounting",                   label: "الحسابات الرئيسية",  icon: Calculator, pageKey: "accounting" },
      { to: "/admin/accounting-beni-suef",         label: "حسابات بني سويف",   icon: Calculator, pageKey: "accounting-beni-suef" },
      { to: "/admin/accounting-records",           label: "السجلات المحاسبية", icon: BookOpen,   pageKey: "accounting-records" },
      { to: "/admin/accounting-records-beni-suef", label: "سجلات بني سويف",    icon: BookOpen,   pageKey: "accounting-records-beni-suef" },
    ],
  },
  {
    label: "المخازن",
    items: [
      { to: "/admin/warehouse",     label: "المخازن",       icon: Package,         pageKey: "warehouse" },
      { to: "/admin/purchasing",    label: "المشتريات",     icon: ShoppingCart,    pageKey: "purchasing" },
      { to: "/admin/legal",         label: "الشئون القانونية", icon: Scale,        pageKey: "legal" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { to: "/admin/blogs",         label: "المقالات",      icon: FileText,        pageKey: "blogs" },
      { to: "/admin/content",       label: "المحتوى",       icon: Edit3,           pageKey: "content" },
      { to: "/admin/media",         label: "مكتبة الصور",   icon: Image,           pageKey: "media" },
      { to: "/admin/careers",       label: "الوظائف",       icon: Briefcase,       pageKey: "careers" },
    ],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/whatsapp",      label: "الواتساب",      icon: MessageCircle,   pageKey: "whatsapp" },
      { to: "/admin/users",         label: "المستخدمون",    icon: Users,           pageKey: "users" },
      { to: "/admin/roles",         label: "إدارة الأدوار", icon: ShieldCheck,     pageKey: "roles" },
      { to: "/admin/activity",      label: "سجل النشاط",    icon: Activity,        pageKey: "activity" },
      { to: "/admin/settings",      label: "الإعدادات",     icon: Settings,        pageKey: "settings" },
      { to: "/admin/profile",       label: "الملف الشخصي",  icon: UserCircle,      pageKey: "profile" },
      { to: "/admin/changelog",     label: "التحديثات",     icon: History,         pageKey: "changelog" },
    ],
  },
];

const canSee = (user, pageKey) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.allowedPages?.includes("*")) return true;
  return user.allowedPages?.includes(pageKey) ?? false;
};

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [openGroups, setOpenGroups] = useState({});

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

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onToggle();
  };

  const handleLogout = async () => {
    try { await logout(); navigate("/admin/login"); }
    catch { toast.error("حدث خطأ أثناء تسجيل الخروج"); }
  };

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 right-0 h-full z-40 flex flex-col transition-all duration-300
        bg-[#0f172a] text-white
        ${collapsed ? "translate-x-full lg:translate-x-0 w-64 lg:w-16" : "translate-x-0 w-64"}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 min-h-[60px] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#2d5d89] flex items-center justify-center flex-shrink-0 overflow-hidden shadow">
            <img src={LogoSvg} alt="الصرح" className="w-7 h-7 object-contain" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden flex-1 min-w-0">
                <p className="font-bold text-sm text-white leading-tight whitespace-nowrap truncate">الصرح للتطوير العقاري</p>
                <p className="text-white/30 text-[10px] whitespace-nowrap">لوحة الإدارة</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={onToggle}
            className="mr-auto w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-white/40 hover:text-white flex-shrink-0">
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canSee(user, item.pageKey));
            if (!visibleItems.length) return null;
            const isOpen = openGroups[group.label] !== false; // default open

            return (
              <div key={group.label}>
                {/* Group label */}
                {!collapsed && (
                  <button onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest hover:text-white/50 transition-colors mt-2">
                    <span>{group.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  </button>
                )}
                {collapsed && <div className="my-2 mx-2 h-px bg-white/5" />}

                <AnimatePresence initial={false}>
                  {(isOpen || collapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {visibleItems.map(({ to, label, icon: Icon, exact, pageKey }) => {
                        const isNotifications = to === "/admin/notifications";
                        const showBadge = isNotifications && unreadCount > 0;
                        return (
                          <NavLink key={to} to={to} end={exact} onClick={handleNavClick}
                            className={({ isActive }) =>
                              `group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium relative ${
                                isActive
                                  ? "bg-[#2d5d89] text-white shadow-sm"
                                  : "text-white/50 hover:bg-white/5 hover:text-white"
                              }`
                            }>
                            <span className="relative flex-shrink-0">
                              <Icon className="w-4 h-4" />
                              {showBadge && collapsed && (
                                <span className="absolute -top-1.5 -left-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                  {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                              )}
                            </span>
                            <AnimatePresence>
                              {!collapsed && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  className="overflow-hidden whitespace-nowrap text-xs">
                                  {label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {showBadge && !collapsed && (
                              <span className="mr-auto bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                            {/* Tooltip on collapsed */}
                            {collapsed && (
                              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10">
                                {label}
                              </div>
                            )}
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-2 pb-3 pt-2 border-t border-white/5 flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg bg-white/5">
                <div className="w-7 h-7 rounded-full bg-[#2d5d89] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user?.name?.[0] || "A"}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{roleLabels[user?.role] || user?.customRoleKey || user?.role}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-medium group relative">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
            {collapsed && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10">
                تسجيل الخروج
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
