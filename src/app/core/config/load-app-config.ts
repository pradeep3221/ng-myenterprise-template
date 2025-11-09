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
    // Determine config source based on environment (client vs SSR)
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // On the server (SSR) we can use a dynamic require to avoid bundler resolution of node builtins
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs: typeof import('fs') = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path: typeof import('path') = require('path');
      const filePath = path.join(process.cwd(), 'public', 'config.json');
      try {
        const rawJson = fs.readFileSync(filePath, 'utf-8');
        const raw = JSON.parse(rawJson);
        return validateAndNormalizeConfig(raw);
      } catch (e) {
        console.warn('[config] SSR local file read failed, falling back to fetch:', e);
        // Fallback to fetch through dev server (may still trigger original issue if present)
      }
    }

    // In the browser, fetch from the public root
    const r = await fetch('/config.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('Failed to load runtime config');
    const raw = await r.json();
    return validateAndNormalizeConfig(raw);
  } catch (err) {
    console.error('[config] Failed to load runtime config:', err);
    return DEFAULT_CONFIG;
  }
}

export function provideRuntimeConfig(): Provider[] {
  let configPromise: Promise<AppConfig> | null = null;
  
  return [
    { 
      provide: APP_CONFIG, 
      useFactory: () => {
        // Return default config synchronously, will be replaced after fetch
        return DEFAULT_CONFIG;
      }
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        return async () => {
          // Block app initialization until config is loaded
          console.log('[config] Loading runtime config...');
          const loadedConfig = await fetchRuntimeConfig();
          console.log('[config] Loaded runtime config:', loadedConfig);
          
          // Update the config object in place
          Object.keys(loadedConfig).forEach(key => {
            (config as any)[key] = (loadedConfig as any)[key];
          });
          
          console.log('[config] Updated APP_CONFIG with runtime values');
        };
      }
    }
  ];
}
