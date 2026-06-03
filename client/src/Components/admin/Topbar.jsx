import { useState, useEffect, useRef } from "react";
import { Menu, Bell, Sun, Moon, ExternalLink, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

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

function NotificationPanel({ onClose }) {
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
    } catch { /* silent */ }
  };

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 sm:left-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">الإشعارات</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs text-[#2d5d89] hover:underline font-medium"
          >
            تحديد الكل كمقروء
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto" id="notif-list">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">لا توجد إشعارات</div>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markOne(n._id)}
              className={`w-full text-right px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-3 items-start ${
                !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
              }`}
            >
              {!n.read && (
                <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-[#2d5d89]" />
              )}
              <div className={`flex-1 min-w-0 ${n.read ? "pr-5" : ""}`}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
        <Link
          to="/admin/notifications"
          onClick={onClose}
          className="text-xs text-[#2d5d89] hover:underline font-medium"
        >
          عرض كل الإشعارات
        </Link>
      </div>
    </div>
  );
}

export default function Topbar({ onMenuClick, collapsed }) {
  const { user } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Poll unread count every 30 seconds
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const r = await api.get("/notifications/unread-count");
        setUnread(r.data.count || 0);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 h-14 bg-[#0f172a] border-b border-white/5 z-20 flex items-center gap-3 px-4 transition-all duration-300
        ${collapsed ? "right-0 lg:right-16" : "right-0 lg:right-64"}`}
    >
      <button onClick={onMenuClick}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
        <Menu className="w-4 h-4" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
          <Search className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/30 text-xs">بحث سريع...</span>
        </div>
      </div>

      <div className="mr-auto flex items-center gap-1">
        <Link to="/" target="_blank"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="الموقع">
          <ExternalLink className="w-4 h-4" />
        </Link>
        <button onClick={toggleDark}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button onClick={() => setPanelOpen((p) => !p)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors relative">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
          {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
        </div>
        <div className="w-7 h-7 rounded-full bg-[#2d5d89] flex items-center justify-center text-white text-xs font-bold cursor-pointer border-2 border-white/20">
          {user?.name?.[0] || "A"}
        </div>
      </div>
    </header>
  );
}
