interface WebVitalsMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fmp: number; // First Meaningful Paint
}

interface WebVitalsCallback {
  (metric: { name: string; value: number; id: string }): void;
}

class WebVitalsMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private callback?: WebVitalsCallback;

  constructor(callback?: WebVitalsCallback) {
    this.callback = callback;
  }

  startMonitoring() {
    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
    this.observeFMP();
  }

  private observeFCP() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint");
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.reportMetric("FCP", fcpEntry.startTime, fcpEntry.entryType);
        }
      });

      observer.observe({ entryTypes: ["paint"] });
      this.observers.push(observer);
    }
  }

  private observeLCP() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1] as any;
        if (lcpEntry && lcpEntry.startTime) {
          this.metrics.lcp = lcpEntry.startTime;
          this.reportMetric("LCP", lcpEntry.startTime, lcpEntry.entryType);
        }
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(observer);
    }
  }

  private observeFID() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            this.reportMetric("FID", fid, entry.entryType);
          }
        });
      });

      observer.observe({ entryTypes: ["first-input"] });
      this.observers.push(observer);
    }
  }

  private observeCLS() {
    if ("PerformanceObserver" in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
        this.reportMetric("CLS", clsValue, "layout-shift");
      });

      observer.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(observer);
    }
  }

  private observeTTFB() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigationEntry = entries.find((entry) => entry.entryType === "navigation") as any;
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.metrics.ttfb = ttfb;
          this.reportMetric("TTFB", ttfb, "navigation");
        }
      });

      observer.observe({ entryTypes: ["navigation"] });
      this.observers.push(observer);
    }
  }

  private observeFMP() {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fmpEntry = entries.find((entry) => entry.name === "first-meaningful-paint");
        if (fmpEntry) {
          this.metrics.fmp = fmpEntry.startTime;
          this.reportMetric("FMP", fmpEntry.startTime, fmpEntry.entryType);
        }
      });

      observer.observe({ entryTypes: ["paint"] });
      this.observers.push(observer);
    }
  }

  private reportMetric(name: string, value: number, type: string) {
    const metric = {
      name,
      value,
      id: `${name}-${Date.now()}`,
      type,
    };

    // Enviar para callback se fornecido
    if (this.callback) {
      this.callback(metric);
    }

    // Enviar para analytics
    this.sendToAnalytics(metric);

    // Logging opcional controlado por env (desativado por padrão)
    const shouldLog = ((import.meta as any)?.env?.VITE_LOG_WEB_VITALS as string) === "true";
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.log(`Web Vital: ${name} = ${value.toFixed(2)}ms`);
    }
  }

  private sendToAnalytics(metric: any) {
    // Enviar para Google Analytics 4
    // @ts-expect-error gtag may not be defined in all environments
    if (typeof (window as any).gtag !== "undefined") {
      // @ts-expect-error gtag may not be defined in all environments
      (window as any).gtag("event", "web_vitals", {
        event_category: "Web Vitals",
        event_label: metric.name,
        value: Math.round(metric.value),
        non_interaction: true,
      });
    }

    // Enviar para servidor (somente em produção) com amostragem e deduplicação por sessão
    try {
      const isProd = (() => {
        try {
          return ((import.meta as any)?.env?.MODE as string) === "production";
        } catch {
          return false;
        }
      })();
      if (isProd) {
        const sampleRate = 0.2; // 20% das sessões
        const sessionKey = "webVitalsSampleV1";
        let sampled = false;
        try {
          const existing = sessionStorage.getItem(sessionKey);
          if (existing === null) {
            sampled = Math.random() < sampleRate;
            sessionStorage.setItem(sessionKey, sampled ? "1" : "0");
          } else {
            sampled = existing === "1";
          }
        } catch {}

        if (!sampled) return;

        const sentSetKey = "webVitalsSentSetV1";
        let sent: Record<string, true> = {};
        try {
          sent = JSON.parse(sessionStorage.getItem(sentSetKey) || "{}");
        } catch {}
        const key = metric?.name ? String(metric.name) : "unknown";
        if (sent[key]) return;

        fetch("/api/analytics/web-vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metric),
        })
          .then(() => {
            try {
              sent[key] = true;
              sessionStorage.setItem(sentSetKey, JSON.stringify(sent));
            } catch {}
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  getScore(metric: keyof WebVitalsMetrics): "good" | "needs-improvement" | "poor" {
    const value = this.metrics[metric];
    if (!value) return "needs-improvement";

    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
      fmp: { good: 2000, poor: 4000 },
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  getOverallScore(): "good" | "needs-improvement" | "poor" {
    const scores = ["fcp", "lcp", "fid", "cls"] as const;
    const metricScores = scores.map((metric) => this.getScore(metric));

    if (metricScores.every((score) => score === "good")) return "good";
    if (metricScores.some((score) => score === "poor")) return "poor";
    return "needs-improvement";
  }

  stopMonitoring() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  // Função para otimizar imagens baseado em LCP
  optimizeLCPImage() {
    const lcpElement = this.getLCPElement();
    if (lcpElement && lcpElement.tagName === "IMG") {
      const img = lcpElement as HTMLImageElement;

      // Adicionar loading="eager" para LCP image
      img.loading = "eager";

      // Adicionar fetchpriority="high"
      img.setAttribute("fetchpriority", "high");

      // Preload se for imagem crítica
      if (img.src) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = img.src;
        document.head.appendChild(link);
      }
    }
  }

  private getLCPElement(): Element | null {
    // Evita usar propriedades potencialmente deprecadas do LCP entry
    return null;
  }

  // Função para otimizar fontes
  optimizeFonts() {
    // Preload fontes críticas
    const criticalFonts = [] as string[];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.href = font;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Adicionar font-display: swap
    // Rely on Google Fonts CSS; avoid injecting non-existent local font files
  }

  // Função para otimizar recursos críticos
  optimizeCriticalResources() {
    // Preload JavaScript crítico
    const criticalJS = document.createElement("link");
    criticalJS.rel = "preload";
    criticalJS.as = "script";
    criticalJS.href = "/critical.js";
    document.head.appendChild(criticalJS);
  }
}

// Instância global
export const webVitalsMonitor = new WebVitalsMonitor();

// Função para inicializar monitoramento
export const initWebVitalsMonitoring = (callback?: WebVitalsCallback) => {
  if (callback) {
    // expose setter to avoid private access error in TS
    (webVitalsMonitor as any).callback = callback;
  }

  webVitalsMonitor.startMonitoring();

  // Otimizações automáticas
  webVitalsMonitor.optimizeFonts();
  webVitalsMonitor.optimizeCriticalResources();

  // Otimizar LCP image após carregamento
  window.addEventListener("load", () => {
    setTimeout(() => {
      webVitalsMonitor.optimizeLCPImage();
    }, 100);
  });
};

export default webVitalsMonitor;
