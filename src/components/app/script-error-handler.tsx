'use client';

import { useEffect } from 'react';

export function ScriptErrorHandler() {
  useEffect(() => {
    const isSuppressed = (msg?: string, filename?: string, target?: any) => {
      const str = String(msg || '').toLowerCase();
      if (!str || str.includes('script error') || str.includes('resizeobserver')) return true;
      const file = String(filename || (target && (target.src || target.href)) || '').toLowerCase();
      if (file && (
        file.includes('tradingview') ||
        file.includes('hotmart') ||
        file.includes('youtube') ||
        file.includes('spline') ||
        file.includes('widget')
      )) return true;
      return false;
    };

    const handleGlobalError = (event: ErrorEvent) => {
      if (isSuppressed(event.message, event.filename, event.target)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
      if (isSuppressed(msg)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
