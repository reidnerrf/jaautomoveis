// Proper logging utility to replace console statements

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  page?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const errorDetails = error ? ` | ${error.message} | ${error.stack}` : '';
    const logMessage = this.formatMessage('ERROR', message + errorDetails, context);
    
    if (this.isDevelopment) {
      console.error(logMessage);
    } else {
      // In production, you might want to send to a logging service
      console.error(logMessage);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const logMessage = this.formatMessage('WARN', message, context);
    
    if (this.isDevelopment) {
      console.warn(logMessage);
    } else {
      console.warn(logMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const logMessage = this.formatMessage('INFO', message, context);
    
    if (this.isDevelopment) {
      console.info(logMessage);
    } else {
      console.info(logMessage);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const logMessage = this.formatMessage('DEBUG', message, context);
    
    if (this.isDevelopment) {
      console.debug(logMessage);
    }
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    const message = `${operation} took ${duration}ms`;
    this.info(message, { ...context, duration, operation });
  }

  // Cache logging
  cacheHit(key: string, context?: LogContext): void {
    this.debug(`Cache hit for key: ${key}`, { ...context, cacheKey: key, cacheResult: 'hit' });
  }

  cacheMiss(key: string, context?: LogContext): void {
    this.debug(`Cache miss for key: ${key}`, { ...context, cacheKey: key, cacheResult: 'miss' });
  }

  // Database logging
  dbQuery(operation: string, collection: string, duration: number, context?: LogContext): void {
    this.debug(`DB ${operation} on ${collection} took ${duration}ms`, {
      ...context,
      operation,
      collection,
      duration,
    });
  }

  // API logging
  apiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, { ...context, method, url, statusCode, duration });
    } else {
      this.info(message, { ...context, method, url, statusCode, duration });
    }
  }

  // Security logging
  security(event: string, details: Record<string, unknown>, context?: LogContext): void {
    this.warn(`Security event: ${event}`, { ...context, securityEvent: event, ...details });
  }

  // User activity logging
  userActivity(userId: string, action: string, details?: Record<string, unknown>, context?: LogContext): void {
    this.info(`User activity: ${action}`, {
      ...context,
      userId,
      action,
      ...details,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logError = (message: string, error?: Error, context?: LogContext) => 
  logger.error(message, error, context);

export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);

export const logPerformance = (operation: string, duration: number, context?: LogContext) => 
  logger.performance(operation, duration, context);

export const logCacheHit = (key: string, context?: LogContext) => 
  logger.cacheHit(key, context);

export const logCacheMiss = (key: string, context?: LogContext) => 
  logger.cacheMiss(key, context);

export const logDbQuery = (operation: string, collection: string, duration: number, context?: LogContext) => 
  logger.dbQuery(operation, collection, duration, context);

export const logApiRequest = (method: string, url: string, statusCode: number, duration: number, context?: LogContext) => 
  logger.apiRequest(method, url, statusCode, duration, context);

export const logSecurity = (event: string, details: Record<string, unknown>, context?: LogContext) => 
  logger.security(event, details, context);

export const logUserActivity = (userId: string, action: string, details?: Record<string, unknown>, context?: LogContext) => 
  logger.userActivity(userId, action, details, context);