import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export function initializeSentry(app: Express): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const sentryDsn = process.env.SENTRY_DSN;

  // Only initialize Sentry if DSN is provided
  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not found. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
    
    // Profiling
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      
      // Enable Profiling
      new ProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.SENTRY_RELEASE || 'canary@1.0.0',

    // Ignore certain errors
    ignoreErrors: [
      // Browser errors
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      // Network errors
      'NetworkError',
      'Network request failed',
      // Common bot errors
      'cancelled',
    ],

    // Before sending to Sentry, sanitize sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from error contexts
      if (event.request) {
        delete event.request.cookies;
        
        // Sanitize headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
        // Sanitize query parameters
        if (event.request.query_string) {
          event.request.query_string = event.request.query_string
            .replace(/password=[^&]*/gi, 'password=[REDACTED]')
            .replace(/token=[^&]*/gi, 'token=[REDACTED]');
        }
      }

      // Remove sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.refreshToken;
      }

      return event;
    },

    // Add custom tags
    initialScope: {
      tags: {
        service: 'backend',
        version: '1.0.0',
      },
    },
  });

  console.log('✅ Sentry error tracking initialized');
}

/**
 * Express middleware to attach Sentry request handler
 */
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Express middleware to attach Sentry tracing handler
 */
export function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Express error handler middleware for Sentry
 * This should be added AFTER all controllers but BEFORE other error handlers
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 4xx and 5xx errors
      if (error.status && error.status >= 400) {
        return true;
      }
      return true;
    },
  });
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add user context to Sentry events
 */
export function setUser(user: { id: number; email?: string; name?: string }): void {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.name,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

export default Sentry;
