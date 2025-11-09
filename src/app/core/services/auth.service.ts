import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { APP_CONFIG } from '../config/app-config.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private config = inject(APP_CONFIG);
  private platformId = inject(PLATFORM_ID);
  private tokenSignal = signal<string | null>(this.readToken());

  get token() { return this.tokenSignal(); }
  isAuthenticated() { return !!this.tokenSignal(); }

  login(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', token);
    }
    this.tokenSignal.set(token);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.config.auth?.tokenStorageKey || 'auth_token');
    }
    this.tokenSignal.set(null);
  }

  private readToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.config.auth?.tokenStorageKey || 'auth_token');
  }
}
