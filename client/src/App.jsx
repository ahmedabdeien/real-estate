import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { useAuth } from "./context/AuthContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

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

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUnits from "./pages/admin/AdminUnits";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminContent from "./pages/admin/AdminContent";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminActivity from "./pages/admin/AdminActivity";

// Tasks
import TasksPage from "./pages/tasks/TasksPage";
import AdminTasks from "./pages/admin/AdminTasks";

// Guard: admin-only routes redirect non-admins to /admin/projects
function AdminOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/admin/projects" replace />;
  return children;
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
            <Routes>
              {/* Public Website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/units" element={<UnitsPage />} />
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

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOnlyRoute><AdminDashboard /></AdminOnlyRoute>} />
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
                <Route path="tasks" element={<AdminTasks />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SiteSettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
