import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTableColumns, FaBuilding, FaHouse, FaUsers, FaFileLines,
  FaImage, FaGear, FaBriefcase, FaRightFromBracket,
  FaChartLine, FaWaveSquare, FaSquareCheck, FaCalculator, FaClockRotateLeft,
  FaCircleUser, FaPenToSquare, FaBook, FaBell, FaUserPlus,
  FaBoxesStacked, FaCartShopping, FaScaleBalanced, FaShieldHalved,
  FaCommentDots, FaChevronDown, FaChevronUp,
  FaAnglesLeft, FaAnglesRight,
} from "react-icons/fa6";
import LogoSvg from "../../assets/images/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchUnreadCount } from "../../store/slices/notificationsSlice";
import { toggleSidebar, selectSidebarCollapsed } from "../../store/slices/uiSlice";
import { selectUnreadCount } from "../../store";

// ─── Nav groups ──────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { to: "/admin",               label: "لوحة التحكم",      icon: FaTableColumns, exact: true, pageKey: "dashboard" },
      { to: "/admin/notifications", label: "الإشعارات",         icon: FaBell,         pageKey: "notifications", badge: true },
      { to: "/admin/tasks",         label: "المهام",            icon: FaSquareCheck,  pageKey: "tasks" },
    ],
  },
  {
    label: "العقارات",
    items: [
      { to: "/admin/projects",      label: "المشاريع",          icon: FaBuilding,     pageKey: "projects" },
      { to: "/admin/units",         label: "الوحدات",           icon: FaHouse,        pageKey: "units" },
      { to: "/admin/leads",         label: "العملاء",           icon: FaChartLine,    pageKey: "leads" },
      { to: "/admin/client-reg",    label: "تسجيل العملاء",     icon: FaUserPlus,     pageKey: "client-reg" },
    ],
  },
  {
    label: "الحسابات",
    items: [
      { to: "/admin/accounting",                   label: "الحسابات الرئيسية",   icon: FaCalculator, pageKey: "accounting" },
      { to: "/admin/accounting-beni-suef",         label: "حسابات بني سويف",    icon: FaCalculator, pageKey: "accounting-beni-suef" },
      { to: "/admin/accounting-records",           label: "السجلات المحاسبية",  icon: FaBook,       pageKey: "accounting-records" },
      { to: "/admin/accounting-records-beni-suef", label: "سجلات بني سويف",     icon: FaBook,       pageKey: "accounting-records-beni-suef" },
    ],
  },
  {
    label: "المخازن",
    items: [
      { to: "/admin/warehouse",  label: "المخازن",              icon: FaBoxesStacked,  pageKey: "warehouse" },
      { to: "/admin/purchasing", label: "المشتريات",            icon: FaCartShopping,  pageKey: "purchasing" },
      { to: "/admin/legal",      label: "الشئون القانونية",     icon: FaScaleBalanced, pageKey: "legal" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { to: "/admin/blogs",    label: "المقالات",               icon: FaFileLines,    pageKey: "blogs" },
      { to: "/admin/content",  label: "المحتوى",                icon: FaPenToSquare,  pageKey: "content" },
      { to: "/admin/media",    label: "مكتبة الصور",            icon: FaImage,        pageKey: "media" },
      { to: "/admin/careers",  label: "الوظائف",                icon: FaBriefcase,    pageKey: "careers" },
    ],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/whatsapp",   label: "الواتساب",             icon: FaCommentDots,     pageKey: "whatsapp" },
      { to: "/admin/users",      label: "المستخدمون",           icon: FaUsers,           pageKey: "users" },
      { to: "/admin/roles",      label: "إدارة الأدوار",        icon: FaShieldHalved,    pageKey: "roles" },
      { to: "/admin/activity",   label: "سجل النشاط",           icon: FaWaveSquare,      pageKey: "activity" },
      { to: "/admin/settings",   label: "الإعدادات",            icon: FaGear,            pageKey: "settings" },
      { to: "/admin/profile",    label: "الملف الشخصي",         icon: FaCircleUser,      pageKey: "profile" },
      { to: "/admin/changelog",  label: "التحديثات",            icon: FaClockRotateLeft, pageKey: "changelog" },
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
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const reduxCollapsed = useSelector(selectSidebarCollapsed);
  const [openGroups, setOpenGroups] = useState({});

  const isCollapsed = collapsed ?? reduxCollapsed;
  const handleToggle = onToggle ?? (() => dispatch(toggleSidebar()));

  useEffect(() => {
    if (!user || user.role === "viewer") return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/admin/login");
  };

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="h-screen flex flex-col bg-[#0f1e2e] border-l border-white/5 overflow-hidden relative select-none"
      dir="rtl"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 flex-shrink-0">
        <img src={LogoSvg} alt="logo" className="w-8 h-8 flex-shrink-0 rounded-lg" />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="text-white font-bold text-sm leading-tight whitespace-nowrap flex-1"
            >
              الصـرح للعقارات
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? <FaAnglesRight className="w-3 h-3" /> : <FaAnglesLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 no-scrollbar">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canSee(user, item.pageKey));
          if (!visibleItems.length) return null;
          const isOpen = openGroups[group.label] !== false;

          return (
            <div key={group.label} className="mb-1">
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
                >
                  {group.label}
                  {isOpen ? <FaChevronUp className="w-2 h-2" /> : <FaChevronDown className="w-2 h-2" />}
                </button>
              ) : (
                <div className="my-1 mx-4 border-t border-white/5" />
              )}

              <AnimatePresence initial={false}>
                {(isOpen || isCollapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    {visibleItems.map((item) => (
                      <SidebarItem
                        key={item.to}
                        item={item}
                        collapsed={isCollapsed}
                        unreadCount={item.badge ? unreadCount : 0}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-white/5 p-3 flex-shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-xs font-semibold truncate">{user?.name || "مدير النظام"}</p>
                <p className="text-white/40 text-[10px] truncate">{roleLabels[user?.role] || "مستخدم"}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <FaRightFromBracket className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function SidebarItem({ item, collapsed, unreadCount }) {
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        `relative flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-xl text-sm transition-all group
        ${isActive
          ? "bg-white/10 text-white font-semibold"
          : "text-white/45 hover:bg-white/5 hover:text-white/75"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l-full"
              style={{ background: "var(--primary)" }}
            />
          )}
          <item.icon
            className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive ? "text-[color:var(--primary)]" : ""}`}
          />
          {!collapsed && (
            <span className="flex-1 truncate text-[12px]">{item.label}</span>
          )}
          {unreadCount > 0 && (
            <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none
              ${collapsed ? "absolute -top-1 -left-1 min-w-[16px] text-center" : ""}`}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {collapsed && (
            <span className="absolute right-full mr-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg
              whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] shadow-xl border border-white/10">
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
