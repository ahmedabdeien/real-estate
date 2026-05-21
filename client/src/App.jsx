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
const AdminAccountingBeniSuef = lazy(() => import("./pages/admin/AdminAccountingBeniSuef"));
const AdminAccountingRecords = lazy(() => import("./pages/admin/AdminAccountingRecords"));
const AdminAccountingRecordsBeniSuef = lazy(() => import("./pages/admin/AdminAccountingRecordsBeniSuef"));
const AdminChangelog = lazy(() => import("./pages/admin/AdminChangelog"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminClientReg = lazy(() => import("./pages/admin/AdminClientReg"));
const AdminWarehouse = lazy(() => import("./pages/admin/AdminWarehouse"));
const AdminPurchasing = lazy(() => import("./pages/admin/AdminPurchasing"));
const AdminLegal = lazy(() => import("./pages/admin/AdminLegal"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminWhatsApp = lazy(() => import("./pages/admin/AdminWhatsApp"));

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
  // Custom role users → redirect to first allowed page or tasks
  if (user.customRoleKey) {
    const pages = user.allowedPages || [];
    if (pages.includes("tasks")) return <Navigate to="/admin/tasks" replace />;
    if (pages.includes("accounting")) return <Navigate to="/admin/accounting" replace />;
    if (pages.includes("accounting-beni-suef")) return <Navigate to="/admin/accounting-beni-suef" replace />;
    if (pages.length > 0) return <Navigate to={`/admin/${pages[0]}`} replace />;
  }
  return <Navigate to="/" replace />;
}

// Guard: tasks route — only non-viewer authenticated users
function TasksRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  const isStandard = ["admin", "supervisor", "manager", "employee", "sales"].includes(user.role);
  const isCustom = !!user.customRoleKey;
  if (!isStandard && !isCustom) return <Navigate to="/" replace />;
  return <TasksPage />;
}

// Guard: only users whose allowedPages includes the given pageKey (or admin)
function PageGuard({ pageKey, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role === "admin") return children;
  if (user.allowedPages?.includes("*")) return children;
  if (pageKey && user.allowedPages?.includes(pageKey)) return children;
  // Redirect to their first allowed page
  const pages = user.allowedPages || [];
  if (pages.includes("tasks")) return <Navigate to="/admin/tasks" replace />;
  return <Navigate to="/admin" replace />;
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
                <Route path="client-reg" element={<AdminClientReg />} />
              </Route>

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardRoute />} />
                <Route path="projects"      element={<PageGuard pageKey="projects"><AdminProjects /></PageGuard>} />
                <Route path="units"         element={<PageGuard pageKey="units"><AdminUnits /></PageGuard>} />
                <Route path="leads"         element={<PageGuard pageKey="leads"><AdminLeads /></PageGuard>} />
                <Route path="blogs"         element={<PageGuard pageKey="blogs"><AdminBlogs /></PageGuard>} />
                <Route path="client-reg"    element={<PageGuard pageKey="client-reg"><AdminClientReg /></PageGuard>} />
                <Route path="content"       element={<AdminOnlyRoute><AdminContent /></AdminOnlyRoute>} />
                <Route path="media"         element={<AdminOnlyRoute><AdminMedia /></AdminOnlyRoute>} />
                <Route path="careers"       element={<AdminOnlyRoute><AdminCareers /></AdminOnlyRoute>} />
                <Route path="users"         element={<AdminOnlyRoute><AdminUsers /></AdminOnlyRoute>} />
                <Route path="settings"      element={<AdminOnlyRoute><AdminSettings /></AdminOnlyRoute>} />
                <Route path="activity"      element={<AdminOnlyRoute><AdminActivity /></AdminOnlyRoute>} />
                <Route path="tasks"         element={<PageGuard pageKey="tasks"><TasksPage embedded={true} /></PageGuard>} />
                <Route path="accounting"         element={<PageGuard pageKey="accounting"><AdminAccounting /></PageGuard>} />
                <Route path="accounting-records" element={<PageGuard pageKey="accounting-records"><AdminAccountingRecords /></PageGuard>} />
                <Route path="accounting-beni-suef" element={<PageGuard pageKey="accounting-beni-suef"><AdminAccountingBeniSuef /></PageGuard>} />
                <Route path="accounting-records-beni-suef" element={<PageGuard pageKey="accounting-records-beni-suef"><AdminAccountingRecordsBeniSuef /></PageGuard>} />
                <Route path="profile"       element={<PageGuard pageKey="profile"><StaffProfile /></PageGuard>} />
                <Route path="changelog"     element={<PageGuard pageKey="changelog"><AdminChangelog /></PageGuard>} />
                <Route path="notifications" element={<PageGuard pageKey="notifications"><AdminNotifications /></PageGuard>} />
                <Route path="warehouse"     element={<PageGuard pageKey="warehouse"><AdminWarehouse /></PageGuard>} />
                <Route path="purchasing"    element={<PageGuard pageKey="purchasing"><AdminPurchasing /></PageGuard>} />
                <Route path="legal"         element={<PageGuard pageKey="legal"><AdminLegal /></PageGuard>} />
                <Route path="roles"         element={<AdminOnlyRoute><AdminRoles /></AdminOnlyRoute>} />
                <Route path="whatsapp"     element={<AdminOnlyRoute><AdminWhatsApp /></AdminOnlyRoute>} />
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
