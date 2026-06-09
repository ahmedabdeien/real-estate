import { useState, useEffect, useRef } from "react";
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaBuilding, FaRightFromBracket, FaUser, FaSquareCheck, FaBars, FaXmark, FaCalculator,
  FaBell, FaHouseChimney, FaChartLine, FaFileLines, FaLayerGroup,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageLoader } from "../Components/UI/LoadingSpinner";
import api from "../api/axios";

const STAFF_ROLES = ["supervisor", "manager", "employee", "sales"];

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${days} ي`;
}

function NotificationPanel({ onClose, onChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/notifications");
        setNotifications(r.data.notifications || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onChange && onChange();
    } catch { /* silent */ }
  };

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      onChange && onChange();
    } catch { /* silent */ }
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">الإشعارات</h3>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-xs text-[var(--primary)] hover:underline font-medium">
            تحديد الكل كمقروء
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">لا توجد إشعارات</div>
        ) : (
          notifications.slice(0, 20).map((n) => (
            <button
              key={n._id}
              onClick={() => markOne(n._id)}
              className={`w-full text-right px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                !n.read ? "bg-blue-50/50" : ""
              }`}
            >
              {!n.read && (
                <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)]" />
              )}
              <div className={`flex-1 min-w-0 ${n.read ? "pr-5" : ""}`}>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{typeof n.title === "object" ? (n.title?.ar ?? n.title?.en ?? "—") : (n.title ?? "—")}</p>
                {n.body && <p className="text-xs text-gray-500 mt-0.5 truncate">{typeof n.body === "object" ? (n.body?.ar ?? n.body?.en ?? "") : n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function StaffLayout() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAccounting = location.pathname.startsWith("/staff/accounting");
  const isSalesPage = ["/staff/projects", "/staff/units", "/staff/leads", "/staff/blogs"]
    .some((p) => location.pathname.startsWith(p));
  const fullWidth = isAccounting || isSalesPage;

  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  // Poll unread count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const r = await api.get("/notifications/unread-count");
        setUnread(r.data.count || 0);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshUnread = async () => {
    try {
      const r = await api.get("/notifications/unread-count");
      setUnread(r.data.count || 0);
    } catch { /* silent */ }
  };

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!STAFF_ROLES.includes(user.role)) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const navLinks = [
    { to: "/staff/tasks",   label: "مهامي",        icon: FaSquareCheck },
    { to: "/staff/profile", label: "الملف الشخصي", icon: FaUser },
    ...(user?.department === "accounts"
      ? [{ to: "/staff/accounting", label: "الحسابات", icon: FaCalculator }]
      : []),
    ...(user?.role === "sales"
      ? [
          { to: "/staff/projects", label: "المشاريع", icon: FaHouseChimney },
          { to: "/staff/units",    label: "الوحدات",  icon: FaLayerGroup },
          { to: "/staff/leads",    label: "العملاء",  icon: FaChartLine },
          { to: "/staff/blogs",    label: "المقالات", icon: FaFileLines },
        ]
      : []),
    ...(["manager", "supervisor"].includes(user?.role)
      ? [{ to: "/admin/tasks", label: "إدارة المهام", icon: FaSquareCheck }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className={`${fullWidth ? "max-w-none" : "max-w-5xl"} mx-auto px-4 h-16 flex items-center justify-between gap-4`}>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <FaBuilding className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight hidden sm:block">
              الصرح للتطوير العقاري
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setPanelOpen((p) => !p)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors relative"
                title="الإشعارات"
              >
                <FaBell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>
              {panelOpen && (
                <NotificationPanel onClose={() => setPanelOpen(false)} onChange={refreshUnread} />
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-400">{roleLabels[user?.role]}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <FaRightFromBracket className="w-4 h-4" />
            </button>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {menuOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-400">{roleLabels[user?.role]}</p>
              </div>
            </div>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className={
        isAccounting
          ? "h-[calc(100vh-64px)] overflow-hidden"
          : fullWidth
            ? "px-4 py-6"
            : "max-w-5xl mx-auto px-4 py-6"
      }>
        <Outlet />
      </main>
    </div>
  );
}
