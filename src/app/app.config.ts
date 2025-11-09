import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideRuntimeConfig } from './core/config/load-app-config';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { mockApiInterceptor, provideMockApiFeature } from './core/mocking/mock-api.provider';
import { GlobalErrorHandler } from './core/errors/global-error.handler';
import { APP_CONFIG } from './core/config/app-config.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRuntimeConfig(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, mockApiInterceptor])),
    provideAnimations(),
    provideMockApiFeature(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Apply dark mode if configured post-initialization
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        return () => {
          const cfg = inject(APP_CONFIG);
          if (cfg?.theme?.darkMode && typeof document !== 'undefined') {
            document.documentElement.classList.add('dark');
          }
        };
      }
    }
  ]
};
