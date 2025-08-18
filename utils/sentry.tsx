import * as Sentry from '@sentry/react';
import React from 'react';

// Configuração do Sentry para o frontend
export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project',
      integrations: [
        new Sentry.BrowserTracing({
          // Configurar rotas para tracking
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            (history) => history.listen
          ),
        }),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% das transações
      replaysSessionSampleRate: 0.1, // 10% das sessões
      replaysOnErrorSampleRate: 1.0, // 100% dos erros
      
      // Configurações de ambiente
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION || '1.0.0',
      
      // Filtrar erros
      beforeSend(event) {
        // Filtrar erros de rede que não são críticos
        if (event.exception) {
          const exception = event.exception.values?.[0];
          if (exception?.type === 'NetworkError' && 
              exception?.value?.includes('Failed to fetch')) {
            return null;
          }
        }
        return event;
      },
      
      // Configurações de contexto
      initialScope: {
        tags: {
          app: 'ja-automoveis',
          version: process.env.APP_VERSION || '1.0.0'
        }
      }
    });
  }
};

// Função para capturar erros
export const captureError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context?.component || 'unknown',
        action: context?.action || 'unknown'
      }
    });
  } else {
    console.error('Error captured:', error, context);
  }
};

// Função para capturar mensagens
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, {
      level,
      extra: context,
      tags: {
        component: context?.component || 'unknown',
        action: context?.action || 'unknown'
      }
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};

// Função para adicionar contexto do usuário
export const setUserContext = (user: any) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      ip_address: user.ip
    });
  }
};

// Função para adicionar tags customizadas
export const setTag = (key: string, value: string) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setTag(key, value);
  }
};

// Função para adicionar contexto extra
export const setContext = (name: string, context: any) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setContext(name, context);
  }
};

// HOC para envolver componentes com error boundary
export const withSentryErrorBoundary = (Component: React.ComponentType<any>) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, componentStack, resetError }) => (
      <div className="error-boundary">
        <h2>Algo deu errado</h2>
        <p>Desculpe, ocorreu um erro inesperado.</p>
        <button onClick={resetError}>Tentar novamente</button>
        {process.env.NODE_ENV === 'development' && (
          <details>
            <summary>Detalhes do erro</summary>
            <pre>{error?.toString()}</pre>
            <pre>{componentStack}</pre>
          </details>
        )}
      </div>
    ),
    onError: (error, componentStack, eventId) => {
      captureError(error, {
        component: Component.name,
        componentStack,
        eventId
      });
    }
  });
};

// Função para monitorar performance
export const startTransaction = (name: string, operation: string) => {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startTransaction({
      name,
      op: operation
    });
  }
  return null;
};

// Função para monitorar métricas customizadas
export const captureMetric = (name: string, value: number, unit: string = 'millisecond') => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.metrics.increment(name, value, {
      unit,
      tags: {
        environment: process.env.NODE_ENV
      }
    });
  }
};

export default {
  initSentry,
  captureError,
  captureMessage,
  setUserContext,
  setTag,
  setContext,
  withSentryErrorBoundary,
  startTransaction,
  captureMetric
};