import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../Components/admin/Sidebar";
import Topbar from "../Components/admin/Topbar";
import { PageLoader } from "../Components/UI/LoadingSpinner";
export default function AdminLayout() {
  const { user, loading } = useAuth();
  // Start collapsed on mobile, expanded on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  // viewer → home; custom roles (customRoleKey) are allowed if they have any allowedPages
  const isStandardRole = ["admin", "supervisor", "manager", "employee", "sales"].includes(user.role);
  const isCustomRole = !!user.customRoleKey;
  if (!isStandardRole && !isCustomRole) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-gray-950" dir="rtl">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />
      <Topbar onMenuClick={() => setSidebarCollapsed((p) => !p)} collapsed={sidebarCollapsed} />

      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarCollapsed ? "mr-0 lg:mr-16" : "mr-0 lg:mr-64"
        }`}
      >
        <div className="min-h-[calc(100vh-3.5rem)] overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
