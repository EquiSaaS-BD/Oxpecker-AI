/**
 * Sentry & Production Error Tracker Utility
 * Free-tier optimized error tracking & client-side exception capture
 */

export function captureException(error: any, context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    console.error("[Sentry Error Tracking Captured]:", error, context);
  } else {
    console.warn("[Development Error Warning]:", error, context);
  }

  // If window.Sentry is initialized dynamically, relay the event
  if (typeof window !== "undefined" && (window as any).Sentry) {
    try {
      (window as any).Sentry.captureException(error, { extra: context });
    } catch (e) {
      // Fallback silent handle
    }
  }
}

export function logPerformanceMetric(name: string, value: number) {
  if (typeof window !== "undefined" && window.performance) {
    try {
      performance.mark(`${name}-${value}`);
    } catch (e) {
      // Silent handle
    }
  }
}
