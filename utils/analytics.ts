import React from 'react';
import { io, Socket } from 'socket.io-client';

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
  private socket: Socket | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.connectSocket();
    this.trackPageView();
  }

  private connectSocket() {
    this.socket = io(window.location.origin); // Connect to the same origin
    this.socket.on('connect', () => {
      console.log('Analytics socket connected:', this.socket?.id);
    });
    this.socket.on('disconnect', () => {
      console.log('Analytics socket disconnected');
    });
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
  trackBusinessEvent(eventType: 'vehicle_view' | 'financing_simulation' | 'contact_form' | 'phone_call' | 'whatsapp_click' | 'instagram_click', data: any) {
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
    const payload = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      deviceType: this.getDeviceType(),
      location: await this.getLocation()
    };

    if (this.socket) {
      this.socket.emit('analytics_event', payload);
    } else {
      // Fallback to fetch if socket is not available (e.g., during initial load before connection)
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'iOS';
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    if (/linux/i.test(ua)) return 'Linux';
    if (/win/i.test(ua)) return 'Windows';
    if (/mac/i.test(ua)) return 'MacOS';
    return 'Unknown';
  }

  private async getLocation(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.region_name}, ${data.country_name}`;
    } catch (error) {
      console.warn('Location tracking failed:', error);
      return 'Unknown Location';
    }
  }

  setUserId(id: string) {
    this.userId = id;
  }

  // Method to disconnect socket when no longer needed, e.g., on component unmount in a global context
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
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