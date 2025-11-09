import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { APP_CONFIG } from '../config/app-config.token';

describe('ApiService', () => {
  let service: ApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ApiService,
        { provide: APP_CONFIG, useValue: { apiBaseUrl: 'https://example.test', appName: 'Test', logLevel: 'error' } }
      ]
    });
    service = TestBed.inject(ApiService);
  });

  it('builds correct URL', () => {
    expect((service as any).buildUrl('/items')).toBe('https://example.test/items');
  });
});
