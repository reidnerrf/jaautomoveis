import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";

// Providers
import { AuthProvider } from "./hooks/useAuth";
import { VehicleProvider } from "./hooks/useVehicleData";
import { ThemeProvider } from "./contexts/ThemeContext";

// Inicializar Sentry
import { initSentry, withSentryErrorBoundary } from "./utils/sentry";
initSentry();

// Inicializar Web Vitals monitoring
import { initWebVitalsMonitoring } from "./utils/webVitals";
if (import.meta.env.MODE === "production") {
  initWebVitalsMonitoring((metric) => {
    console.log("Web Vital:", metric.name, metric.value);
  });
}

// Inicializar PWA
if (import.meta.env.MODE === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const SafeApp = withSentryErrorBoundary(App);
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <VehicleProvider>
        <ThemeProvider>
          {typeof window !== "undefined" && <SafeApp />}
        </ThemeProvider>
      </VehicleProvider>
    </AuthProvider>
  </React.StrictMode>
);

