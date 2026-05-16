import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { useAuth } from "./context/AuthContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

// Public Pages
import HomePage from "./pages/public/Home";
import ProjectsPage from "./pages/public/Projects";
import ProjectDetailPage from "./pages/public/ProjectDetail";
import UnitsPage from "./pages/public/Units";
import AboutPage from "./pages/public/About";
import BlogPage from "./pages/public/Blog";
import BlogDetailPage from "./pages/public/BlogDetail";
import ContactPage from "./pages/public/Contact";
import CareersPage from "./pages/public/Careers";
import ProfilePage from "./pages/public/Profile";

// Admin Login (not lazy — small, needed immediately)
import AdminLogin from "./pages/admin/AdminLogin";

// Loading fallback
import { PageLoader } from "./Components/UI/LoadingSpinner";

// Admin Pages — lazy loaded for code splitting (faster initial page load)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminUnits = lazy(() => import("./pages/admin/AdminUnits"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCareers"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminAccounting = lazy(() => import("./pages/admin/AdminAccounting"));
const AdminAccountingRecords = lazy(() => import("./pages/admin/AdminAccountingRecords"));
const AdminChangelog = lazy(() => import("./pages/admin/AdminChangelog"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));

// Tasks
const TasksPage = lazy(() => import("./pages/tasks/TasksPage"));

// Staff
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

// Guard: admin-only routes — non-admins are redirected to a sensible default page
function AdminOnlyRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/tasks" replace />;
  return children;
}

// Dashboard route — admin + supervisor see overview; others redirected to tasks
function DashboardRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role === "admin" || user.role === "supervisor") return <AdminDashboard />;
  if (user.role === "manager" || user.role === "employee" || user.role === "sales") {
    return <Navigate to="/admin/tasks" replace />;
  }
  return <Navigate to="/" replace />;
}

// Guard: tasks route — only non-viewer authenticated users
function TasksRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!["admin", "supervisor", "manager", "employee", "sales"].includes(user.role)) return <Navigate to="/" replace />;
  return <TasksPage />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]" dir="rtl">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-200">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">الصفحة غير موجودة</h1>
        <a href="/" className="text-[#2d5d89] font-semibold hover:underline">العودة للرئيسية</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <SiteSettingsProvider>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/units" element={<Navigate to="/projects" replace />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Tasks — standalone page (not inside admin layout) */}
              <Route path="/tasks" element={<TasksRoute />} />

              {/* Staff dashboard — for supervisor/manager/employee/sales */}
              <Route path="/staff" element={<StaffLayout />}>
                <Route index element={<Navigate to="/admin" replace />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="accounting" element={<AdminAccounting />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="units" element={<AdminUnits />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="blogs" element={<AdminBlogs />} />
              </Route>

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardRoute />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="units" element={<AdminUnits />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="content" element={<AdminOnlyRoute><AdminContent /></AdminOnlyRoute>} />
                <Route path="media" element={<AdminOnlyRoute><AdminMedia /></AdminOnlyRoute>} />
                <Route path="careers" element={<AdminOnlyRoute><AdminCareers /></AdminOnlyRoute>} />
                <Route path="users" element={<AdminOnlyRoute><AdminUsers /></AdminOnlyRoute>} />
                <Route path="settings" element={<AdminOnlyRoute><AdminSettings /></AdminOnlyRoute>} />
                <Route path="activity" element={<AdminOnlyRoute><AdminActivity /></AdminOnlyRoute>} />
                {/* Tasks inside admin panel — admin/supervisor/manager */}
                <Route path="tasks" element={<TasksPage embedded={true} />} />
                {/* Accounting — admin + accounts dept */}
                <Route path="accounting" element={<AdminAccounting />} />
                <Route path="accounting-records" element={<AdminAccountingRecords />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="changelog" element={<AdminChangelog />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </SiteSettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
