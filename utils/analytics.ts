import React from "react";
import type { Socket } from "socket.io-client";

interface AnalyticsEventPayload {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  page: string;
}

const getConsent = () => {
  try {
    const raw = localStorage.getItem("cookieConsentV1");
    if (!raw) return { analytics: false, personalization: false };
    const parsed = JSON.parse(raw);
    return { analytics: !!parsed.analytics, personalization: !!parsed.personalization };
  } catch {
    return { analytics: false, personalization: false };
  }
};

class AnalyticsService {
  private socket: Socket | null = null;
  private gaInitialized = false;
  private sentryInitialized = false;

  constructor() {
    try {
      this.connectSocket();
      // Page views are emitted from MainLayout to avoid double counting here
      (window as any).trackBusinessEvent = this.trackBusinessEvent.bind(this);
      this.initGA();
      this.initSentry();
      this.initWebVitals();
    } catch (e) {
      if ((import.meta as any)?.env?.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.error("Analytics init error", e);
      }
    }
  }

  private async connectSocket() {
    // Conecta em dev e prod; servidor já permite CORS para origens locais
    const { io } = await import("socket.io-client");
    this.socket = io("", {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    this.socket.on("connect", () => {
      // console.log('Analytics socket connected:', this.socket?.id);
    });
    this.socket.on("disconnect", () => {
      // console.log('Analytics socket disconnected');
    });
  }

  // Track page views (respeita consentimento)
  trackPageView(page?: string) {
    const consent = getConsent();
    if (!consent.analytics) return;
    const currentPage = page || window.location.pathname;
    this.emitPageView(currentPage);
  }

  private emitPageView(page: string) {
    if (!this.socket) return;
    this.socket.emit("page-view", {
      page,
    });
  }

  private initGA() {
    if (this.gaInitialized) return;
    try {
      // @ts-expect-error gtag may not be defined in non-browser environments
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        try {
          const raw = localStorage.getItem("cookieConsentV1");
          const parsed = raw ? JSON.parse(raw) : { analytics: false, personalization: false };
          // Initialize default consent (Consent Mode v2)
          // @ts-ignore
          window.gtag('consent', 'default', {
            'ad_storage': parsed.personalization ? 'granted' : 'denied',
            'ad_user_data': parsed.personalization ? 'granted' : 'denied',
            'ad_personalization': parsed.personalization ? 'granted' : 'denied',
            'analytics_storage': parsed.analytics ? 'granted' : 'denied'
          });
        } catch {}
        this.gaInitialized = true;
      }
    } catch {}
  }

  private async initSentry() {
    if (this.sentryInitialized) return;
    try {
      const consent = getConsent();
      if (!consent.analytics) return;
      const Sentry = await import("@sentry/react");
      Sentry.init({
        dsn: (window as any).SENTRY_DSN || "",
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.1,
        environment: (window as any).SENTRY_ENV || (import.meta as any)?.env?.MODE || "production",
        release:
          (window as any).SENTRY_RELEASE ||
          ((import.meta as any)?.env?.VITE_APP_VERSION
            ? `app@${(import.meta as any).env.VITE_APP_VERSION}`
            : undefined),
      });
      this.sentryInitialized = true;
    } catch {
      // ignore
    }
  }

  private async initWebVitals() {
    try {
      const consent = getConsent();
      if (!consent.analytics) return;
      // Dynamically import web-vitals to avoid bundle bloat
      const { onCLS, onLCP, onINP, onTTFB } = await import("web-vitals");
      const report = (name: string, value: number) => {
        this.trackUserAction("web_vital", "performance", `${name}:${Math.round(value)}`);
        try {
          const metric = name.toUpperCase();
          const v = Math.round(value);
          const thresholds: Record<string, number> = { LCP: 2500, CLS: 0.1, INP: 200, TTFB: 800 };
          const exceed = (metric === "CLS" ? value : v) > thresholds[metric]!
            ? "exceeded"
            : "ok";
          if (exceed === "exceeded") {
            // Send simple alert event (could be routed to backend later)
            this.trackBusinessEvent("performance", { metric, value: v, page: window.location.pathname });
          }
        } catch {}
      };
      onCLS((m) => report("CLS", m.value));
      onLCP((m) => report("LCP", m.value));
      // onINP may not exist in older versions; guard optional chaining
      try {
        onINP?.((m: any) => report("INP", m.value));
      } catch {}
      onTTFB((m) => report("TTFB", m.value));
    } catch {
      // ignore
    }
  }

  // Track user interactions (respeita consentimento)
  trackUserAction(action: string, category: string, label?: string, page?: string) {
    const consent = getConsent();
    if (!consent.analytics) return;
    const labelWithVariant = (() => {
      try {
        const variant = localStorage.getItem("ab_variant") || "";
        const base = label ? (() => { try { return JSON.parse(label); } catch { return { raw: label }; } })() : {};
        return JSON.stringify({ ...base, variant });
      } catch {
        return label;
      }
    })();
    const payload: AnalyticsEventPayload = {
      event: "user_action",
      category,
      action,
      label: labelWithVariant,
      page: page || window.location.pathname,
    };
    try {
      const Sentry: any = (window as any).Sentry || (await import("@sentry/react"));
      Sentry?.addBreadcrumb?.({ category, message: action, data: { label: labelWithVariant } });
    } catch {}
    this.emitUserAction(payload);
  }

  // Sampled client-side click heatmap sender
  sendClickHeatmap(eventName: string, extra?: Record<string, any>) {
    try {
      const consent = getConsent();
      if (!consent.analytics) return;
      if (Math.random() > 0.1) return; // 10% sampling
      const payload = {
        action: "click_heatmap",
        label: JSON.stringify({ eventName, path: location.pathname, ...extra }),
        timestamp: Date.now(),
      };
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      } else {
        fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true as any });
      }
    } catch {}
  }

  // Track business events (respeita consentimento)
  trackBusinessEvent(
    eventType:
      | "vehicle_view"
      | "financing_simulation"
      | "contact_form"
      | "phone_call"
      | "whatsapp_click"
      | "instagram_click"
      | "like_vehicle",
    data: any,
    page?: string
  ) {
    const consent = getConsent();
    if (!consent.analytics) return;
    const labelWithVariant = (() => {
      try {
        const variant = localStorage.getItem("ab_variant") || "";
        const base = data ? data : {};
        return JSON.stringify({ ...base, variant });
      } catch {
        return data ? JSON.stringify(data) : undefined;
      }
    })();
    const payload: AnalyticsEventPayload = {
      event: eventType,
      category: "business",
      action: eventType,
      label: labelWithVariant,
      page: page || window.location.pathname,
    };
    try {
      const Sentry: any = (window as any).Sentry || (await import("@sentry/react"));
      Sentry?.addBreadcrumb?.({ category: "business", message: eventType, data: { label: labelWithVariant } });
    } catch {}
    this.emitUserAction(payload);
  }

  private emitUserAction(payload: AnalyticsEventPayload) {
    if (!this.socket) return;
    this.socket.emit("user-action", {
      action: payload.action,
      category: payload.category,
      label: payload.label,
      page: payload.page,
    });
  }

  // Allow components to reuse the same socket connection
  on<T = any>(event: string, handler: (data: T) => void) {
    if (!this.socket) return () => {};
    this.socket.on(event, handler as any);
    return () => this.socket?.off(event, handler as any);
  }

  emit(event: string, payload?: any) {
    this.socket?.emit(event, payload);
  }
}

export const analytics = new AnalyticsService();

export const useAnalytics = (componentName: string) => {
  React.useEffect(() => {
    const startTime = Date.now();
    return () => {
      const renderTime = Date.now() - startTime;
      // Use user-action for perf metric (real-time only)
      analytics.trackUserAction(
        "component_render",
        "performance",
        `${componentName}:${renderTime}ms`
      );
    };
  }, [componentName]);

  return {
    trackAction: (action: string, label?: string) =>
      analytics.trackUserAction(action, componentName, label),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
  };
};
