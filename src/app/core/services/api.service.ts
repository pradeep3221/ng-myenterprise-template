import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry, throwError, timeout } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);

  private getMockApiUrl(path: string): string {
    // If mock API is enabled, route to localhost:3000
    if (this.config?.features?.enableMockApi) {
      const mockBase = 'http://localhost:3000';
      return `${mockBase}/${path.replace(/^\//, '')}`;
    }
    // Otherwise use real API base URL
    return this.buildUrl(path);
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http
      .get<T>(this.getMockApiUrl(path), { params: params as any })
      .pipe(
        timeout(this.config.http?.timeoutMs ?? 15000),
        retry(this.config.http?.retry ?? 0),
        catchError(err => throwError(() => err))
      );
  }
  post<T>(path: string, body: unknown) {
    return this.http
      .post<T>(this.getMockApiUrl(path), body)
      .pipe(timeout(this.config.http?.timeoutMs ?? 15000), catchError(err => throwError(() => err)));
  }
  put<T>(path: string, body: unknown) {
    return this.http
      .put<T>(this.getMockApiUrl(path), body)
      .pipe(timeout(this.config.http?.timeoutMs ?? 15000), catchError(err => throwError(() => err)));
  }
  delete<T>(path: string) {
    return this.http
      .delete<T>(this.getMockApiUrl(path))
      .pipe(timeout(this.config.http?.timeoutMs ?? 15000), catchError(err => throwError(() => err)));
  }

  private buildUrl(path: string): string {
    return `${this.config.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
