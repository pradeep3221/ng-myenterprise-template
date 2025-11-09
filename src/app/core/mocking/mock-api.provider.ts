import { inject, Provider, InjectionToken } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONFIG } from '../config/app-config.token';

export const MOCK_API_ENABLED = new InjectionToken<boolean>('MOCK_API_ENABLED');

/**
 * Placeholder interceptor for mock API responses.
 * When features.enableMockApi is true, this interceptor can intercept HTTP requests
 * and return mock responses. Implement actual mock logic here as needed.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const isMockEnabled = inject(MOCK_API_ENABLED);

  if (!isMockEnabled) {
    return next(req);
  }

  // Mock API interception point—add custom mock logic here
  console.log('[mock-api] Intercepted request:', req.url);

  // For now, pass through to real API
  return next(req);
};

/**
 * Provides mock API feature flag based on runtime config.
 * If features.enableMockApi is enabled in public/config.json, mocking is active.
 */
export function provideMockApiFeature(): Provider[] {
  return [
    {
      provide: MOCK_API_ENABLED,
      useFactory: () => {
        const cfg = inject(APP_CONFIG);
        return cfg?.features?.enableMockApi ?? false;
      }
    }
  ];
}
