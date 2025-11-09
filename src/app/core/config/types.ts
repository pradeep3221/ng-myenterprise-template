export interface AnalyticsConfig {
  enabled: boolean;
  provider?: 'gtag';
  measurementId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface AuthConfig {
  tokenStorageKey: string;
}

export interface AppConfig {
  appName: string;
  apiBaseUrl: string;
  logLevel: LogLevel;
  analytics?: AnalyticsConfig;
  auth?: AuthConfig;
}
