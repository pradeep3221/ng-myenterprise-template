export interface AnalyticsConfig {
  enabled: boolean;
  provider?: 'gtag';
  measurementId?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface AzureADConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  scopes: string[];
  protectedResources?: {
    [key: string]: {
      endpoint: string;        // base URL or full endpoint to match prefix
      scopes: string[];        // scopes required for this resource
    };
  };
}

export interface AuthConfig {
  tokenStorageKey: string;
  azureAD?: AzureADConfig;
}

export interface HttpConfig {
  timeoutMs?: number; // request timeout in ms
  retry?: number;     // number of automatic retries for idempotent GETs
}

export interface ThemeConfig {
  darkMode?: boolean;            // prefer dark theme
  primaryColorHex?: string;      // overrides Material primary palette if provided
}

export interface FeatureFlags {
  enableMockApi?: boolean;
  enableDebugTools?: boolean;
}

export interface AppConfig {
  appName: string;
  apiBaseUrl: string;
  logLevel: LogLevel;
  analytics?: AnalyticsConfig;
  auth?: AuthConfig;
  http?: HttpConfig;
  theme?: ThemeConfig;
  features?: FeatureFlags;
  envName?: string; // e.g. 'local' | 'dev' | 'qa' | 'prod'
}
