import type { AppConfig, LogLevel } from './types';

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

const defaults = {
  logLevel: 'info' as LogLevel,
  auth: { tokenStorageKey: 'auth_token' },
  http: { timeoutMs: 15000, retry: 0 },
  theme: { darkMode: false },
  features: { enableMockApi: false, enableDebugTools: false },
  envName: 'local'
};

export function validateAndNormalizeConfig(cfg: Partial<AppConfig>): AppConfig {
  if (!cfg) throw new Error('Empty runtime config.');

  if (!cfg.appName || !cfg.apiBaseUrl) {
    throw new Error('Missing required config: appName or apiBaseUrl');
  }

  const logLevel = (cfg.logLevel ?? defaults.logLevel);
  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`Invalid logLevel: ${cfg.logLevel}`);
  }

  return {
    appName: cfg.appName,
    apiBaseUrl: cfg.apiBaseUrl,
    logLevel,
    analytics: cfg.analytics ?? undefined,
    auth: { ...defaults.auth, ...(cfg.auth ?? {}) },
    http: { ...defaults.http, ...(cfg.http ?? {}) },
    theme: { ...defaults.theme, ...(cfg.theme ?? {}) },
    features: { ...defaults.features, ...(cfg.features ?? {}) },
    envName: cfg.envName ?? defaults.envName
  };
}

export function getDefaultConfig(): AppConfig {
  return validateAndNormalizeConfig({ appName: 'App', apiBaseUrl: '/' });
}
