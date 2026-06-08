import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars, FaBell, FaSun, FaMoon, FaArrowUpRightFromSquare,
  FaMagnifyingGlass, FaXmark, FaCircleUser, FaGear, FaRightFromBracket,
  FaCircle,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleDarkMode, selectDarkMode, toggleSidebar } from "../../store/slices/uiSlice";
import { fetchNotifications, markAllRead } from "../../store/slices/notificationsSlice";
import { selectNotifications, selectUnreadCount } from "../../store";
import api from "../../api/axios";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins}د`;
  if (hours < 24) return `${hours}س`;
  return `${days}ي`;
}

const notifTypeIcon = (type) => {
  const map = { lead: "🏠", task: "✅", system: "⚙️", warning: "⚠️", info: "ℹ️" };
  return map[type] || "🔔";
};

function NotificationPanel({ onClose }) {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const loading = useSelector((s) => s.notifications.loading);
  const ref = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleMarkAll = () => dispatch(markAllRead());

  const markOne = async (id) => {
    try { await api.put(`/notifications/${id}/read`); } catch {}
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/60 z-50 overflow-hidden"
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FaBell className="w-3.5 h-3.5 text-[color:var(--primary)]" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">الإشعارات</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleMarkAll} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
            تحديد الكل كمقروء
          </button>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors">
            <FaXmark className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            جاري التحميل...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FaBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markOne(n._id)}
              className={`w-full text-right px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-3 items-start
                ${!n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{notifTypeIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs leading-snug ${!n.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                {n.body && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{n.body}</p>}
              </div>
              {!n.read && <FaCircle className="w-1.5 h-1.5 text-blue-500 flex-shrink-0 mt-1.5" />}
            </button>
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-center">
        <Link to="/admin/notifications" onClick={onClose}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          عرض كل الإشعارات
        </Link>
      </div>
    </motion.div>
  );
}

function QuickSearch({ onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const ref = useRef(null);
  const inputRef = useRef(null);

  const pages = [
    { label: "لوحة التحكم", path: "/admin", icon: "📊" },
    { label: "المشاريع", path: "/admin/projects", icon: "🏗️" },
    { label: "الوحدات", path: "/admin/units", icon: "🏠" },
    { label: "العملاء", path: "/admin/leads", icon: "👥" },
    { label: "الإشعارات", path: "/admin/notifications", icon: "🔔" },
    { label: "الواتساب", path: "/admin/whatsapp", icon: "💬" },
    { label: "الإعدادات", path: "/admin/settings", icon: "⚙️" },
    { label: "المقالات", path: "/admin/blogs", icon: "📝" },
    { label: "الوظائف", path: "/admin/careers", icon: "💼" },
    { label: "المستخدمون", path: "/admin/users", icon: "👤" },
    { label: "المهام", path: "/admin/tasks", icon: "✅" },
    { label: "المخازن", path: "/admin/warehouse", icon: "📦" },
  ];

  const filtered = query
    ? pages.filter((p) => p.label.includes(query) || p.path.includes(query))
    : pages;

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-start justify-center pt-20"
      dir="rtl"
    >
      <motion.div
        ref={ref}
        initial={{ y: -20, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -20, scale: 0.97 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <FaMagnifyingGlass className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الصفحات..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose}>
            <FaXmark className="w-4 h-4 text-gray-400 hover:text-gray-700" />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
          {filtered.map((p) => (
            <button
              key={p.path}
              onClick={() => { navigate(p.path); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-right transition-colors"
            >
              <span className="text-base">{p.icon}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>
              <span className="mr-auto text-[10px] text-gray-400 font-mono">{p.path}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center gap-3 text-[10px] text-gray-400">
          <span><kbd className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> للفتح</span>
          <span><kbd className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> للإغلاق</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Topbar({ onMenuClick, collapsed }) {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const dark = useSelector(selectDarkMode);
  const unreadCount = useSelector(selectUnreadCount);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleToggleDark = () => dispatch(toggleDarkMode());

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/admin/login");
  };

  // Keyboard shortcut: Ctrl+K = search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        dir="rtl"
        className={`fixed top-0 h-14 bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/5 z-20 flex items-center gap-3 px-4 transition-all duration-300
          ${collapsed ? "right-[72px] left-0" : "right-64 left-0"}`}
      >
        {/* Menu toggle (mobile) */}
        <button
          onClick={onMenuClick ?? (() => dispatch(toggleSidebar()))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors lg:hidden"
        >
          <FaBars className="w-3.5 h-3.5" />
        </button>

        {/* Quick Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-1.5 border border-white/10 text-white/30 hover:text-white/60 transition-colors text-xs hidden md:flex"
        >
          <FaMagnifyingGlass className="w-3 h-3" />
          <span>بحث سريع...</span>
          <kbd className="mr-auto font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md">⌘K</kbd>
        </button>

        <div className="mr-auto flex items-center gap-1">
          {/* Visit site */}
          <Link to="/" target="_blank"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="عرض الموقع">
            <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={handleToggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title={dark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {dark ? <FaSun className="w-3.5 h-3.5" /> : <FaMoon className="w-3.5 h-3.5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setPanelOpen((p) => !p); setProfileOpen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors relative"
            >
              <FaBell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border border-[#0f172a]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
            </AnimatePresence>
          </div>

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((p) => !p); setPanelOpen(false); }}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors group"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white border border-white/10 flex-shrink-0"
                style={{ background: "var(--primary)" }}
              >
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="hidden md:block text-white/60 group-hover:text-white text-xs transition-colors truncate max-w-[80px]">
                {user?.name?.split(" ")[0] || "مدير"}
              </span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-10 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden z-50"
                  dir="rtl"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/admin/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <FaCircleUser className="w-3.5 h-3.5 text-gray-400" />
                      الملف الشخصي
                    </Link>
                    <Link to="/admin/settings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <FaGear className="w-3.5 h-3.5 text-gray-400" />
                      الإعدادات
                    </Link>
                  </div>
                  <div className="py-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
                    >
                      <FaRightFromBracket className="w-3.5 h-3.5" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && <QuickSearch onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
