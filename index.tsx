
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles.css';

// Inicializar Sentry
import { initSentry } from './utils/sentry';
initSentry();

// Inicializar Web Vitals monitoring
import { initWebVitalsMonitoring } from './utils/webVitals';
initWebVitalsMonitoring((metric) => {
  // Callback para métricas de Web Vitals
  console.log('Web Vital:', metric.name, metric.value);
});

// Inicializar PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);