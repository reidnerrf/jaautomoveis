import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VehicleProvider } from "./hooks/useVehicleData";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { createLazyComponentWithRetry } from "./utils/dynamicImports";

// Lazy load all pages for better performance with retry mechanism
const HomePage = createLazyComponentWithRetry(() => import("./pages/HomePage"));
const InventoryPage = createLazyComponentWithRetry(() => import("./pages/InventoryPage"));
const VehicleDetailPage = createLazyComponentWithRetry(() => import("./pages/VehicleDetailPage"));
const FinancingPage = createLazyComponentWithRetry(() => import("./pages/FinancingPage"));
const ConsignadoPage = createLazyComponentWithRetry(() => import("./pages/ConsignadoPage"));
const ConsortiumPage = createLazyComponentWithRetry(() => import("./pages/ConsortiumPage"));
const AboutPage = createLazyComponentWithRetry(() => import("./pages/AboutPage"));
const ContactPage = createLazyComponentWithRetry(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = createLazyComponentWithRetry(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = createLazyComponentWithRetry(() => import("./pages/TermsOfServicePage"));
// Temporarily use regular import for AdminLoginPage to debug
import AdminLoginPage from "./pages/AdminLoginPage";
const AdminDashboardPage = createLazyComponentWithRetry(() => import("./pages/AdminDashboardPage"));
const AdminVehicleListPage = createLazyComponentWithRetry(
  () => import("./pages/AdminVehicleListPage")
);
const AdminVehicleFormPage = createLazyComponentWithRetry(
  () => import("./pages/AdminVehicleFormPage")
);
const AdminSellerListPage = createLazyComponentWithRetry(
  () => import("./pages/AdminSellerListPage")
);
const AdminSellerFormPage = createLazyComponentWithRetry(
  () => import("./pages/AdminSellerFormPage")
);
const ForgotPasswordPage = createLazyComponentWithRetry(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = createLazyComponentWithRetry(() => import("./pages/ResetPasswordPage"));
const MainLayout = createLazyComponentWithRetry(() => import("./components/MainLayout"));
const PrivateRoute = createLazyComponentWithRetry(() => import("./components/PrivateRoute"));
const AdminLayout = createLazyComponentWithRetry(() => import("./components/AdminLayout"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red"></div>
  </div>
);

const App: React.FC = () => {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const hasBrowserSupport =
      "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    if (!hasBrowserSupport) return;

    const alreadyPrompted = localStorage.getItem("notificationsPromptShown") === "1";
    if (alreadyPrompted) return;

    const urlBase64ToUint8Array = (base64String: string) => {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    const attemptSubscribe = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Permita as notificações no navegador");
          localStorage.setItem("notificationsPromptShown", "1");
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const resp = await fetch("/api/push/vapid-public-key");
        const { publicKey } = await resp.json();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
        toast.success("Notificações ativadas!");
        localStorage.setItem("notificationsPromptShown", "1");
      } catch (e) {
        toast.error("Não foi possível ativar notificações");
        localStorage.setItem("notificationsPromptShown", "1");
      }
    };

    const showPrompt = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (Notification.permission === "granted" && existing) return;

        const id = toast.custom(
          (t) => (
            <div className="rounded-xl shadow-lg bg-gray-800 text-white p-4 flex items-center gap-3">
              <div className="flex-1 text-sm">Quer receber notificações de novos veículos?</div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  attemptSubscribe();
                }}
                className="bg-main-red hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md"
              >
                Ativar
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("notificationsPromptShown", "1");
                  toast.dismiss(t.id);
                }}
                className="text-gray-300 hover:text-white text-sm px-2 py-1"
              >
                Agora não
              </button>
            </div>
          ),
          { duration: 10000 }
        );
      } catch {
        // ignore
      }
    };

    showPrompt();
  }, []);
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <VehicleProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public routes with MainLayout */}
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="vehicle/:id" element={<VehicleDetailPage />} />
                      <Route path="financing" element={<FinancingPage />} />
                      <Route path="consignado" element={<ConsignadoPage />} />
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
                        <Route path="sellers" element={<AdminSellerListPage />} />
                        <Route path="sellers/new" element={<AdminSellerFormPage />} />
                        <Route path="sellers/edit/:id" element={<AdminSellerFormPage />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
                {/* 🔔 Toaster global para mensagens */}
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    style: {
                      background: "#1f2937", // cinza escuro
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "14px",
                    },
                    success: {
                      style: { background: "#16a34a", color: "#fff" },
                      iconTheme: { primary: "#fff", secondary: "#16a34a" },
                    },
                    error: {
                      style: { background: "#dc2626", color: "#fff" },
                      iconTheme: { primary: "#fff", secondary: "#dc2626" },
                    },
                  }}
                />
              </BrowserRouter>
            </VehicleProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
