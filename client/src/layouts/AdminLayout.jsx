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
  // viewer → home
  if (!["admin", "supervisor", "manager", "employee", "sales"].includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950" dir="rtl">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />
      <Topbar onMenuClick={() => setSidebarCollapsed((p) => !p)} collapsed={sidebarCollapsed} />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "mr-0 lg:mr-16" : "mr-0 lg:mr-64"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
