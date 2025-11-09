import { APP_INITIALIZER, inject, Provider } from '@angular/core';
import { APP_CONFIG } from './app-config.token';
import type { AppConfig } from './types';

function fetchRuntimeConfig(): Promise<AppConfig> {
  return fetch('/config.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('Failed to load runtime config');
      return r.json();
    });
}

export function provideRuntimeConfig(): Provider[] {
  let loadedConfig: AppConfig | undefined;

  const initializer = () => fetchRuntimeConfig().then(cfg => { loadedConfig = cfg; });

  return [
    { provide: APP_INITIALIZER, multi: true, useValue: initializer },
    { provide: APP_CONFIG, useFactory: () => loadedConfig, deps: [] }
  ];
}
