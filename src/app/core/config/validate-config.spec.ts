import { validateAndNormalizeConfig } from './validate-config';

describe('validateAndNormalizeConfig', () => {
  it('fills defaults and preserves provided values', () => {
    const cfg = validateAndNormalizeConfig({
      appName: 'Test',
      apiBaseUrl: '/api',
      logLevel: 'debug',
      http: { timeoutMs: 5000 }
    });
    expect(cfg.appName).toBe('Test');
    expect(cfg.apiBaseUrl).toBe('/api');
    expect(cfg.logLevel).toBe('debug');
    expect(cfg.http?.timeoutMs).toBe(5000);
    expect(cfg.http?.retry).toBe(0); // default
    expect(cfg.features?.enableMockApi).toBe(false);
  });

  it('throws on missing required fields', () => {
    expect(() => validateAndNormalizeConfig({ appName: 'X' })).toThrow();
  });

  it('throws on invalid log level', () => {
    // @ts-expect-error invalid log level for test
    expect(() => validateAndNormalizeConfig({ appName: 'X', apiBaseUrl: '/', logLevel: 'verbose' })).toThrow();
  });
});
