import { APP_INITIALIZER, Provider } from '@angular/core';
import { APP_CONFIG } from './app-config.token';
import type { AppConfig } from './types';
import { validateAndNormalizeConfig } from './validate-config';

// Default config used immediately (allows paint before network)
const DEFAULT_CONFIG: AppConfig = validateAndNormalizeConfig({ 
  appName: 'App', 
  apiBaseUrl: '/' 
});

async function fetchRuntimeConfig(): Promise<AppConfig> {
  try {
    // Determine config URL based on environment (client vs SSR)
    const isServer = typeof window === 'undefined';
    const configUrl = isServer ? 'http://localhost:4200/config.json' : '/config.json';
    
    const r = await fetch(configUrl, { cache: 'no-cache' });
    if (!r.ok) throw new Error('Failed to load runtime config');
    const raw = await r.json();
    return validateAndNormalizeConfig(raw);
  } catch (err) {
    console.error('[config] Failed to load runtime config:', err);
    return DEFAULT_CONFIG;
  }
}

export function provideRuntimeConfig(): Provider[] {
  // Provide default config immediately to avoid blocking paint
  // Fetch real config asynchronously after app renders
  return [
    { 
      provide: APP_CONFIG, 
      useValue: DEFAULT_CONFIG 
    },
    // Optional: Load real config in background after paint
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        return () => {
          // Non-blocking: fetch config after app initializes
          if (typeof window !== 'undefined') {
            fetchRuntimeConfig().then(cfg => {
              // In a real app, you'd dispatch this to a store/service
              // to update the app state after first paint
              console.log('[config] Loaded real config:', cfg);
            }).catch(err => console.error('[config] Background load failed:', err));
          }
        };
      }
    }
  ];
}
