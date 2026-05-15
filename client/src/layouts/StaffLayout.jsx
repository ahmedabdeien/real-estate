import { useState } from "react";
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Building2, LogOut, User, CheckSquare, Menu, X, Calculator } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageLoader } from "../Components/UI/LoadingSpinner";

const STAFF_ROLES = ["supervisor", "manager", "employee", "sales"];

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

export default function StaffLayout() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAccounting = location.pathname.startsWith("/staff/accounting");
  const [menuOpen, setMenuOpen] = useState(false);

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
    { to: "/staff/tasks",      label: "مهامي",          icon: CheckSquare },
    { to: "/staff/profile",    label: "الملف الشخصي",   icon: User },
    ...(user?.department === "accounts"
      ? [{ to: "/staff/accounting", label: "الحسابات", icon: Calculator }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2d5d89] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight hidden sm:block">
              الصرح للتطوير العقاري
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#2d5d89] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side: user info + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-bold text-sm">
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
              <LogOut className="w-4 h-4" />
            </button>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-bold text-sm">
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
                      ? "bg-[#2d5d89] text-white"
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

      <main className={isAccounting ? "h-[calc(100vh-64px)] overflow-hidden" : "max-w-5xl mx-auto px-4 py-6"}>
        <Outlet />
      </main>
    </div>
  );
}
