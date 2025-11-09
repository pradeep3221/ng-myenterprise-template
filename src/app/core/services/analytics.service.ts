import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config.token';

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private config = inject(APP_CONFIG);

  track(event: string, params?: Record<string, unknown>) {
    if (!this.config.analytics?.enabled) return;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, params || {});
    }
  }
}
