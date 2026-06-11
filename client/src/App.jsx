import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AbilityProvider } from './casl/AbilityContext';
import { useQuery } from '@tanstack/react-query';
import { setTheme, applyTheme } from './store/themeSlice';
import { themeAPI } from './api/services';
import { initSocket, destroySocket } from './hooks/useSocket';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './features/auth/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import LandingPage from './features/landing/LandingPage';
import DashboardPage from './features/dashboard/DashboardPage';
import PropertiesPage from './features/properties/PropertiesPage';
import PropertyDetailPage from './features/properties/PropertyDetailPage';
import UnitsPage from './features/units/UnitsPage';
import CustomersPage from './features/customers/CustomersPage';
import CustomerDetailPage from './features/customers/CustomerDetailPage';
import ContractsPage from './features/contracts/ContractsPage';
import InvoicesPage from './features/invoices/InvoicesPage';
import PaymentsPage from './features/payments/PaymentsPage';
import ExpensesPage from './features/expenses/ExpensesPage';
import ReportsPage from './features/reports/ReportsPage';
import UsersPage from './features/users/UsersPage';
import RolesPage from './features/roles/RolesPage';
import ThemePage from './features/theme/ThemePage';
import SettingsPage from './features/settings/SettingsPage';
import CompaniesPage from './features/companies/CompaniesPage';
import AuditPage from './features/audit/AuditPage';
import ChatPage from './features/chat/ChatPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import PlansPage from './features/plans/PlansPage';
import InstallmentsPage from './features/installments/InstallmentsPage';
import AdminChangelogPage from './features/pages/ChangelogPage';
import DocumentsPage from './features/documents/DocumentsPage';
// Lazy-loaded to keep main bundle small
const BlogsPage        = lazy(() => import('./features/marketing/BlogsPage'));
const CmsEditorPage    = lazy(() => import('./features/marketing/CmsEditorPage'));
const MediaLibraryPage = lazy(() => import('./features/marketing/MediaLibraryPage'));
const BlogListPage     = lazy(() => import('./features/public/BlogListPage'));
const BlogPostPage     = lazy(() => import('./features/public/BlogPostPage'));
const TermsPage        = lazy(() => import('./features/public/TermsPage'));
const PrivacyPage      = lazy(() => import('./features/public/PrivacyPage'));
const HelpPage         = lazy(() => import('./features/public/HelpPage'));
const CareersPage      = lazy(() => import('./features/public/CareersPage'));
const ApiDocsPage      = lazy(() => import('./features/public/ApiDocsPage'));
const ChangelogPage    = lazy(() => import('./features/public/ChangelogPage'));
const FeaturesPage     = lazy(() => import('./features/public/FeaturesPage'));
const PricingPage      = lazy(() => import('./features/public/PricingPage'));
const AboutPage        = lazy(() => import('./features/public/AboutPage'));
const ContactPage      = lazy(() => import('./features/public/ContactPage'));
const RoadmapPage      = lazy(() => import('./features/public/RoadmapPage'));
const StatusPage       = lazy(() => import('./features/public/StatusPage'));
const PartnersPage     = lazy(() => import('./features/public/PartnersPage'));
const IntegrationsPage = lazy(() => import('./features/public/IntegrationsPage'));

const ThemeLoader = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && token) initSocket(token);
    else destroySocket();
  }, [isAuthenticated, token]);

  const { data: themeData } = useQuery({
    queryKey: ['theme-app'],
    queryFn: () => themeAPI.get().then(r => r.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (themeData) { dispatch(setTheme(themeData)); applyTheme(themeData); }
  }, [themeData, dispatch]);

  return null;
};

const App = () => {
  const { isAuthenticated } = useSelector(s => s.auth);

  return (
    <BrowserRouter>
      <AbilityProvider>
      <ThemeLoader />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{borderColor:'#da1f27',borderTopColor:'transparent'}}></div></div>}>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/blog"        element={<BlogListPage />} />
        <Route path="/blog/:slug"  element={<BlogPostPage />} />
        <Route path="/terms"       element={<TermsPage />} />
        <Route path="/privacy"     element={<PrivacyPage />} />
        <Route path="/help"        element={<HelpPage />} />
        <Route path="/careers"     element={<CareersPage />} />
        <Route path="/api-docs"    element={<ApiDocsPage />} />
        <Route path="/changelog"   element={<ChangelogPage />} />
        <Route path="/features"    element={<FeaturesPage />} />
        <Route path="/pricing"     element={<PricingPage />} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/contact"     element={<ContactPage />} />
        <Route path="/roadmap"       element={<RoadmapPage />} />
        <Route path="/status"        element={<StatusPage />} />
        <Route path="/partners"      element={<PartnersPage />} />
        <Route path="/integrations"  element={<IntegrationsPage />} />
        <Route path="/login"         element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />

        {/* App — all protected routes under AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/properties"    element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/units"         element={<UnitsPage />} />
          <Route path="/customers"     element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/contracts"     element={<ContractsPage />} />
          <Route path="/invoices"      element={<InvoicesPage />} />
          <Route path="/payments"      element={<PaymentsPage />} />
          <Route path="/expenses"      element={<ExpensesPage />} />
          <Route path="/reports"       element={<ReportsPage />} />
          <Route path="/users"         element={<UsersPage />} />
          <Route path="/roles"         element={<RolesPage />} />
          <Route path="/theme"         element={<ThemePage />} />
          <Route path="/settings"      element={<SettingsPage />} />
          <Route path="/profile"       element={<SettingsPage />} />
          <Route path="/audit"         element={<AuditPage />} />
          <Route path="/documents"     element={<DocumentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chat"          element={<ChatPage />} />
          <Route path="/installments"  element={<InstallmentsPage />} />
          <Route path="/marketing/blogs"  element={<BlogsPage />} />
          <Route path="/marketing/cms"    element={<CmsEditorPage />} />
          <Route path="/marketing/media"  element={<MediaLibraryPage />} />
          <Route path="/super/companies" element={<CompaniesPage />} />
          <Route path="/super/plans"      element={<PlansPage />} />
          <Route path="/updates"          element={<AdminChangelogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
      </AbilityProvider>
    </BrowserRouter>
  );
};

export default App;
