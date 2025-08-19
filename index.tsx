
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles.css';

// Inicializar Sentry
import { initSentry, withSentryErrorBoundary } from './utils/sentry';
initSentry();

// Inicializar Web Vitals monitoring
import { initWebVitalsMonitoring } from './utils/webVitals';
if (import.meta.env.MODE === 'production') {
  initWebVitalsMonitoring((metric) => {
    console.log('Web Vital:', metric.name, metric.value);
  });
}

// Inicializar PWA
if (import.meta.env.MODE === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const SafeApp = withSentryErrorBoundary(App);
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SafeApp />
  </React.StrictMode>
);