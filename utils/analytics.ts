
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.trackPageView();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Track page views
  trackPageView(page?: string) {
    const currentPage = page || window.location.pathname;
    this.trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: currentPage
    });
  }

  // Track user interactions
  trackUserAction(action: string, category: string, label?: string, value?: number) {
    this.trackEvent({
      event: 'user_action',
      category,
      action,
      label,
      value
    });
  }

  // Track business events
  trackBusinessEvent(eventType: 'vehicle_view' | 'financing_simulation' | 'contact_form' | 'phone_call', data: any) {
    this.trackEvent({
      event: eventType,
      category: 'business',
      action: eventType,
      label: JSON.stringify(data)
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.trackEvent({
      event: 'error',
      category: 'error',
      action: error.name,
      label: `${context || 'unknown'}: ${error.message}`
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, context?: string) {
    this.trackEvent({
      event: 'performance',
      category: 'performance',
      action: metric,
      label: context,
      value: Math.round(value)
    });
  }

  private async trackEvent(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  setUserId(id: string) {
    this.userId = id;
  }
}

export const analytics = new AnalyticsService();

// React hook for component analytics
export const useAnalytics = (componentName: string) => {
  React.useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      analytics.trackPerformance('component_render', renderTime, componentName);
    };
  }, [componentName]);

  return {
    trackAction: (action: string, label?: string) => 
      analytics.trackUserAction(action, componentName, label),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics)
  };
};
