import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './hooks/useVehicleData.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import ErrorBoundary from './components/ErrorBoundary'; // Assuming ErrorBoundary is in this path

// Lazy load all pages for better performance
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const InventoryPage = lazy(() => import('./pages/InventoryPage.tsx'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage.tsx'));
const FinancingPage = lazy(() => import('./pages/FinancingPage.tsx'));
const ConsortiumPage = lazy(() => import('./pages/ConsortiumPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.tsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.tsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.tsx'));
const AdminVehicleListPage = lazy(() => import('./pages/AdminVehicleListPage.tsx'));
const AdminVehicleFormPage = lazy(() => import('./pages/AdminVehicleFormPage.tsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.tsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.tsx'));
const MainLayout = lazy(() => import('./components/MainLayout.tsx'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute.tsx'));
const AdminLayout = lazy(() => import('./components/AdminLayout.tsx'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <VehicleProvider>
          <HashRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes with MainLayout */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="vehicle/:id" element={<VehicleDetailPage />} />
                  <Route path="financing" element={<FinancingPage />} />
                  <Route path="consortium" element={<ConsortiumPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="terms-of-service" element={<TermsOfServicePage />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin/reset-password/:token" element={<ResetPasswordPage />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="vehicles" element={<AdminVehicleListPage />} />
                    <Route path="vehicles/new" element={<AdminVehicleFormPage />} />
                    <Route path="vehicles/edit/:id" element={<AdminVehicleFormPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </VehicleProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;