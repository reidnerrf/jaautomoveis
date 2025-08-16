// Performance monitoring utilities

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
    this.measureLoadTime();
  }

  private initObservers() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            this.logMetric('First Contentful Paint', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          this.logMetric('Largest Contentful Paint', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        this.logMetric('Cumulative Layout Shift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.logMetric('First Input Delay', this.metrics.firstInputDelay);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  private measureLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      this.logMetric('Page Load Time', loadTime);
    });
  }

  private logMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${name}: ${value.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(name: string, value: number) {
    // Send performance metrics to your analytics service
    try {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: name,
          value,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if analytics endpoint is not available
      });
    } catch (error) {
      // Silently fail if fetch is not available
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    return operation().finally(() => {
      const duration = performance.now() - startTime;
      this.logMetric(`Async Operation: ${name}`, duration);
    });
  }

  public measureSyncOperation<T>(name: string, operation: () => T): T {
    const startTime = performance.now();
    try {
      return operation();
    } finally {
      const duration = performance.now() - startTime;
      this.logMetric(`Sync Operation: ${name}`, duration);
    }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render time
export const usePerformanceMeasure = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.logMetric(`Component Render: ${componentName}`, duration);
  };
};

// Utility for measuring API calls
export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsyncOperation(name, apiCall);
};

// Utility for measuring expensive operations
export const measureOperation = <T>(
  name: string,
  operation: () => T
): T => {
  return performanceMonitor.measureSyncOperation(name, operation);
};