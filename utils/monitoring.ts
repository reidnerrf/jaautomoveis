
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class MonitoringService {
  private performanceMetrics: PerformanceMetric[] = [];
  private errorLogs: ErrorLog[] = [];
  private maxMetrics = 100;
  private maxErrors = 50;

  // Track performance metrics
  trackPerformance(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.performanceMetrics.push(metric);
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetrics);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${name} - ${value.toFixed(2)}ms`, metadata);
    }
  }

  // Track errors
  trackError(error: Error, metadata?: Record<string, any>) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : metadata?.url,
      userId: metadata?.userId
    };

    this.errorLogs.push(errorLog);
    
    // Keep only recent errors
    if (this.errorLogs.length > this.maxErrors) {
      this.errorLogs = this.errorLogs.slice(-this.maxErrors);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error tracked:', error.message, metadata);
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService('error', errorLog);
    }
  }

  // Track API calls
  async trackApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      this.trackPerformance(`API: ${name}`, duration, { success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackPerformance(`API: ${name}`, duration, { success: false });
      this.trackError(error as Error, { apiCall: name });
      throw error;
    }
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number) {
    this.trackPerformance(`Component: ${componentName}`, renderTime);
  }

  // Get performance summary
  getPerformanceSummary() {
    const metrics = this.performanceMetrics;
    if (metrics.length === 0) return null;

    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groupedMetrics).map(([name, values]) => ({
      name,
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    }));
  }

  // Send data to external monitoring service
  private async sendToExternalService(type: 'error' | 'performance', data: any) {
    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() })
      });
    } catch (error) {
      // Silently fail - don't let monitoring break the app
      console.warn('Failed to send monitoring data:', error);
    }
  }

  // Get error summary
  getErrorSummary() {
    return {
      total: this.errorLogs.length,
      recent: this.errorLogs.slice(-10),
      byType: this.errorLogs.reduce((acc, error) => {
        const type = error.message.split(':')[0] || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// React hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    return () => {
      const renderTime = performance.now() - startTime.current;
      monitoring.trackComponentRender(componentName, renderTime);
    };
  }, [componentName]);
};

// Utility for measuring operations
export const measureOperation = async <T>(
  name: string, 
  operation: () => Promise<T>
): Promise<T> => {
  return monitoring.trackApiCall(name, operation);
};

export default monitoring;
