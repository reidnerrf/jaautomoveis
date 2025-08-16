
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './hooks/useVehicleData.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';

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
const MainLayout = lazy(() => import('./components/MainLayout.tsx'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute.tsx'));
const AdminLayout = lazy(() => import('./components/AdminLayout.tsx'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <VehicleProvider>
        <HashRouter>
          <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Carregando...</div>}>
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
  );
};

export default App;