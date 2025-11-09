import { inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private config = inject(APP_CONFIG);
  private tokenSignal = signal<string | null>(this.readToken());

  get token() { return this.tokenSignal(); }
  isAuthenticated() { return !!this.tokenSignal(); }

  login(token: string) {
    localStorage.setItem(this.config.auth?.tokenStorageKey || 'auth_token', token);
    this.tokenSignal.set(token);
  }

  logout() {
    localStorage.removeItem(this.config.auth?.tokenStorageKey || 'auth_token');
    this.tokenSignal.set(null);
  }

  private readToken(): string | null {
    return localStorage.getItem(this.config.auth?.tokenStorageKey || 'auth_token');
  }
}
