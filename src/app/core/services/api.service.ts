import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '../config/app-config.token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<T>(this.buildUrl(path), { params: params as any });
  }
  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.buildUrl(path), body);
  }
  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.buildUrl(path), body);
  }
  delete<T>(path: string) {
    return this.http.delete<T>(this.buildUrl(path));
  }

  private buildUrl(path: string): string {
    return `${this.config.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
