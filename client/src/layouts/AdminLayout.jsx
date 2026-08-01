import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { MantineProvider, AppShell, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../Components/admin/Sidebar";
import Topbar from "../Components/admin/Topbar";
import { PageLoader } from "../Components/UI/LoadingSpinner";
import { mantineTheme } from "../mantineTheme";
import { selectSidebarCollapsed } from "../store";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const collapsed = useSelector(selectSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;

  const isStandardRole = ["admin", "supervisor", "manager", "employee", "sales"].includes(user.role);
  const isCustomRole = !!user.customRoleKey;
  if (!isStandardRole && !isCustomRole) return <Navigate to="/" replace />;

  return (
    <MantineProvider theme={mantineTheme}>
      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 76 : 260,
          breakpoint: "lg",
          collapsed: { mobile: !mobileOpen, desktop: false },
        }}
        padding={0}
        dir="rtl"
      >
        <AppShell.Header style={{ background: "#0f172a", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Topbar navbarOpened={mobileOpen} onMenuClick={() => setMobileOpen((o) => !o)} />
        </AppShell.Header>

        <AppShell.Navbar style={{ border: "none" }}>
          <Sidebar />
        </AppShell.Navbar>

        <AppShell.Main bg="gray.0">
          <Box p={{ base: "sm", sm: "md", lg: "lg" }}><Outlet /></Box>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
