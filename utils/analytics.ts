import React from 'react';
import { io, Socket } from 'socket.io-client';

interface AnalyticsEventPayload {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  page: string;
}

class AnalyticsService {
  private socket: Socket | null = null;

  constructor() {
    this.connectSocket();
    this.trackPageView();
    (window as any).trackBusinessEvent = this.trackBusinessEvent.bind(this);
  }

  private connectSocket() {
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? '' : 'http://localhost:5000';
    this.socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });
    this.socket.on('connect', () => {
      // console.log('Analytics socket connected:', this.socket?.id);
    });
    this.socket.on('disconnect', () => {
      // console.log('Analytics socket disconnected');
    });
  }

  // Track page views
  trackPageView(page?: string) {
    const currentPage = page || window.location.pathname;
    this.emitPageView(currentPage);
  }

  private emitPageView(page: string) {
    if (!this.socket) return;
    this.socket.emit('page-view', {
      page,
      userAgent: navigator.userAgent
    });
  }

  // Track user interactions
  trackUserAction(action: string, category: string, label?: string, page?: string) {
    const payload: AnalyticsEventPayload = {
      event: 'user_action',
      category,
      action,
      label,
      page: page || window.location.pathname,
    };
    this.emitUserAction(payload);
  }

  // Track business events
  trackBusinessEvent(eventType: 'vehicle_view' | 'financing_simulation' | 'contact_form' | 'phone_call' | 'whatsapp_click' | 'instagram_click', data: any, page?: string) {
    const payload: AnalyticsEventPayload = {
      event: eventType,
      category: 'business',
      action: eventType,
      label: JSON.stringify(data),
      page: page || window.location.pathname,
    };
    this.emitUserAction(payload);
  }

  private emitUserAction(payload: AnalyticsEventPayload) {
    if (!this.socket) return;
    this.socket.emit('user-action', {
      action: payload.action,
      category: payload.category,
      label: payload.label,
      page: payload.page,
    });
  }
}

export const analytics = new AnalyticsService();

export const useAnalytics = (componentName: string) => {
  React.useEffect(() => {
    const startTime = Date.now();
    return () => {
      const renderTime = Date.now() - startTime;
      // Use user-action for perf metric
      analytics.trackUserAction('component_render', 'performance', `${componentName}:${renderTime}ms`);
    };
  }, [componentName]);

  return {
    trackAction: (action: string, label?: string) =>
      analytics.trackUserAction(action, componentName, label),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics)
  };
};