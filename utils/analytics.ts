import React from "react";
import { io, Socket } from "socket.io-client";

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
      console.error("Analytics init error", e);
    }
  }

  private connectSocket() {
    // Conecta em dev e prod; servidor já permite CORS para origens locais
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
      // @ts-ignore
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        this.gaInitialized = true;
      }
    } catch {}
  }

  private async initSentry() {
    if (this.sentryInitialized) return;
    try {
      const consent = getConsent();
      if (!consent.analytics) return;
      const Sentry = await import("@sentry/browser");
      const Tracing = await import("@sentry/tracing");
      Sentry.init({
        dsn: (window as any).SENTRY_DSN || "",
        integrations: [new Tracing.BrowserTracing({ tracePropagationTargets: [/.*/] })],
        tracesSampleRate: 0.1,
        environment: (window as any).SENTRY_ENV || "production",
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
      const { onCLS, onFID, onLCP, onINP, onTTFB } = await import("web-vitals");
      const report = (name: string, value: number) => {
        this.trackUserAction("web_vital", "performance", `${name}:${Math.round(value)}`);
      };
      onCLS((m) => report("CLS", m.value));
      onFID((m) => report("FID", m.value));
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
    const payload: AnalyticsEventPayload = {
      event: "user_action",
      category,
      action,
      label,
      page: page || window.location.pathname,
    };
    this.emitUserAction(payload);
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
    const payload: AnalyticsEventPayload = {
      event: eventType,
      category: "business",
      action: eventType,
      label: data ? JSON.stringify(data) : undefined,
      page: page || window.location.pathname,
    };
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
