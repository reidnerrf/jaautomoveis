
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './hooks/useVehicleData.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

import HomePage from './pages/HomePage.tsx';
import InventoryPage from './pages/InventoryPage.tsx';
import VehicleDetailPage from './pages/VehicleDetailPage.tsx';
import FinancingPage from './pages/FinancingPage.tsx';
import ConsortiumPage from './pages/ConsortiumPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfServicePage from './pages/TermsOfServicePage.tsx';
import AdminLoginPage from './pages/AdminLoginPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import AdminVehicleListPage from './pages/AdminVehicleListPage.tsx';
import AdminVehicleFormPage from './pages/AdminVehicleFormPage.tsx';
import MainLayout from './components/MainLayout.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import AdminLayout from './components/AdminLayout.tsx';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <VehicleProvider>
          <HashRouter>
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
          </HashRouter>
        </VehicleProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;